import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getAllCandidates } from '../services/indexedDB';
import SideNavbar from '../components/SideNavbar';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load face-api models
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        setLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        alert('Error loading face recognition models. Please try again later.');
      }
    };

    loadFaceApi();
  }, []);

  // Fetch candidates
  useEffect(() => {
    const fetchCandidates = async () => {
      const candidatesList = await getAllCandidates();
      setCandidates(candidatesList);
    };

    fetchCandidates();
  }, []);

  // Start video stream
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      .then(stream => {
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        videoElement.play();
        setVideo(videoElement);
      })
      .catch(err => console.error('Error accessing webcam:', err));
  };

  // Verify candidate face
  const handleVerify = async (candidate) => {
    if (!video) {
      alert('Video stream is not available.');
      return;
    }

    try {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        console.log('Detected face descriptor:', detections.descriptor);

        // Create LabeledFaceDescriptors for each candidate
        const candidateDescriptors = candidate.faceDescriptors || [];
        console.log('Stored candidate descriptors:', candidateDescriptors);

        if (candidateDescriptors.length === 0) {
          alert('No face descriptors found for candidate.');
          return;
        }

        // Ensure candidate descriptors are in the correct format
        const labeledFaceDescriptors = candidateDescriptors.map(desc =>
          new faceapi.LabeledFaceDescriptors(candidate.email, [new Float32Array(desc)])
        );

        // Create FaceMatcher and find the best match
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(detections.descriptor);

        console.log('Best match:', bestMatch);

        // Verify face match
        if (bestMatch.label === candidate.email && bestMatch.distance < 0.6) {
          alert('Candidate verified successfully!');
        } else {
          alert('Candidate verification failed.');
        }
      } else {
        alert('No face detected. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying face:', error);
      alert('Error verifying face. Please try again.');
    }
  };

  // Clean up video stream on component unmount
  useEffect(() => {
    return () => {
      if (video) {
        const stream = video.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    };
  }, [video]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-6">
      <SideNavbar />
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {loading ? (
        <p>Loading face recognition models...</p>
      ) : (
        <>
          <button
            onClick={startVideo}
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Start Facial Recognition
          </button>
          <video id="video" width="640" height="480" autoPlay muted className="mt-4" />

          <div className="mt-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Candidates</h3>
            <ul>
              {candidates.map(candidate => (
                <li key={candidate.email} className="flex justify-between items-center p-2 border-b">
                  <span>{candidate.name}</span>
                  <button
                    onClick={() => handleVerify(candidate)}
                    className="bg-blue-500 text-white p-1 rounded-md hover:bg-blue-600"
                  >
                    Verify
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
