import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getAllCandidates } from '../services/indexedDB';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchCandidates = async () => {
      const candidatesList = await getAllCandidates();
      setCandidates(candidatesList);
    };

    fetchCandidates();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        const videoElement = document.getElementById('video');
        videoElement.srcObject = stream;
        videoElement.play();
        setVideo(videoElement);
      })
      .catch(err => console.error(err));
  };

  const handleVerify = async (candidate) => {
    if (!video) return;

    try {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        const candidateDescriptors = candidate.faceDescriptors || [];
        const labeledFaceDescriptors = candidateDescriptors.map(desc => new faceapi.LabeledFaceDescriptors(candidate.email, [new Float32Array(desc)]));
        
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
        const bestMatch = faceMatcher.findBestMatch(detections.descriptor);
        
        if (bestMatch.label === candidate.email) {
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

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
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
    </div>
  );
};

export default AdminDashboard;
