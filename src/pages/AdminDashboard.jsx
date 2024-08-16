import React, { useContext, useEffect, useState } from 'react';
import SideNavbar from '../components/SideNavbar';
import { FaUser, FaClipboardList, FaBell } from 'react-icons/fa';
import * as faceapi from 'face-api.js';
import { getAllCandidates, getCandidate } from '../services/indexedDB';
import AuthContext from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [error, setError] = useState(null);

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
      setFilteredCandidates(candidatesList);
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

  // Handle viewing candidate details
  const handleViewDetails = async (candidate) => {
    try {
      const candidateDetails = await getCandidate(candidate.email);
      setSelectedCandidate(candidateDetails);

      // Fetch the profile image
      if (candidateDetails?.profileImage) {
        const imageBlob = new Blob([candidateDetails.profileImage]);
        const imageUrl = URL.createObjectURL(imageBlob);
        setProfileImageUrl(imageUrl);
      }
    } catch (err) {
      console.error("Failed to fetch candidate data:", err);
      setError('Failed to load candidate details. Please try again later.');
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
              </div>
            </div>

            <video id="video" width="640" height="480" autoPlay muted className="mt-4 mb-8 mx-auto shadow-lg rounded-md" />

            <div className="w-full overflow-x-auto">
              <table className="table-auto w-full bg-white rounded-md shadow-md">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Candidate No.</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-left">Email</th>
                    <th className="py-3 px-6 text-left">Course</th>
                    <th className="py-3 px-6 text-left">University</th>
                    <th className="py-3 px-6 text-left">Verification Status</th>
                    <th className="py-3 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map(candidate => (
                      <tr key={candidate.email} className="border-b border-gray-200 hover:bg-gray-100">
                        <td className="py-3 px-6 text-left">{candidate.examNumber}</td>
                        <td className="py-3 px-6 text-left">{candidate.name}</td>
                        <td className="py-3 px-6 text-left">{candidate.email}</td>
                        <td className="py-3 px-6 text-left">{candidate.course}</td>
                        <td className="py-3 px-6 text-left">{candidate.university}</td>
                        <td className="py-3 px-6 text-left">
                          {candidate.verified ? (
                            <span className="text-green-500">Verified</span>
                          ) : (
                            <span className="text-red-500">Unverified</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button
                            onClick={() => handleViewDetails(candidate)}
                            className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-3 px-6 text-center text-gray-500">
                        No candidates found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedCandidate && (
              <div className="mt-8 p-6 bg-white rounded-md shadow-md">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Candidate Details</h3>
                <div className="flex items-start mb-6">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={`${selectedCandidate.name}'s profile`}
                      className="w-32 h-32 rounded-md mr-6"
                    />
                  ) : (
                    <FaUser className="text-6xl text-blue-500 mr-6" />
                  )}
                  <div>
                    <p className="text-lg"><strong>Candidate Number:</strong> {selectedCandidate.examNumber}</p>
                    <p className="text-lg"><strong>Name:</strong> {selectedCandidate.name}</p>
                    <p className="text-lg"><strong>Email:</strong> {selectedCandidate.email}</p>
                    <p className="text-lg"><strong>Course:</strong> {selectedCandidate.course}</p>
                    <p className="text-lg"><strong>University:</strong> {selectedCandidate.university}</p>
                    <p className="text-lg"><strong>Verified:</strong> {selectedCandidate.verified ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                {/* Notifications/Reminders */}
                <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
                  <FaBell className="text-xl mr-3" />
                  <p>Reminder: You have an upcoming exam on [10th October, 2024]. Don't forget to prepare!</p>
                </div>

                {/* Registered Exams Section */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Registered Exams</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                      <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                          <th className="py-3 px-6 text-left">Exam Name</th>
                          <th className="py-3 px-6 text-left">Date</th>
                          <th className="py-3 px-6 text-left">Status</th>
                          <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600 text-sm font-light">
                        {selectedCandidate.subjects?.length > 0 ? (
                          selectedCandidate.subjects.map((subject, index) => (
                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                              <td className="py-3 px-6 text-left whitespace-nowrap">{subject}</td>
                              <td className="py-3 px-6 text-left">[Date]</td>
                              <td className="py-3 px-6 text-left">Registered</td>
                              <td className="py-3 px-6 text-center">
                                <button className="text-blue-500 hover:text-blue-700">View Details</button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-3 px-6 text-center text-gray-500">
                              No registered exams.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
                  <h3 className="text-lg font-bold">Important Information</h3>
                  <p>Please ensure that you arrive at your exam venue at least 30 minutes before the scheduled start time.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
