import React, { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { getAllCandidates } from '../services/indexedDB';
import SideNavbar from '../components/SideNavbar';
import { FaSearch, FaUserCheck, FaUserTimes } from 'react-icons/fa';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      setFilteredCandidates(candidatesList); // Initialize filtered candidates
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

  // Handle candidate search
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (term) {
      const filtered = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(term) || 
        candidate.email.toLowerCase().includes(term)
      );
      setFilteredCandidates(filtered);
    } else {
      setFilteredCandidates(candidates);
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
      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

        {loading ? (
          <p>Loading face recognition models...</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={startVideo}
                className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600 flex items-center"
              >
                <FaUserCheck className="mr-2" />
                Start Facial Recognition
              </button>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search candidates..."
                  className="p-2 rounded-md border border-gray-300"
                />
                <FaSearch className="absolute top-2 right-2 text-gray-500" />
              </div>
            </div>

            <video id="video" width="640" height="480" autoPlay muted className="mt-4 mb-8 mx-auto shadow-lg rounded-md" />

            <div className="w-full overflow-x-auto">
              <table className="table-auto w-full bg-white rounded-md shadow-md">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Verification Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map(candidate => (
                      <tr key={candidate.email} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6 text-left">{candidate.name}</td>
                        <td className="py-3 px-6 text-left">{candidate.email}</td>
                        <td className="py-3 px-6 text-left">
                          {candidate.verified ? (
                            <span className="text-green-500">Verified</span>
                          ) : (
                            <span className="text-red-500">Unverified</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => handleVerify(candidate)}
                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-3 px-6 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
