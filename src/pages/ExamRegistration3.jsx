import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { addUser } from '../services/indexedDB';

const ExamRegistration = () => {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [state, setState] = useState('');
  const [university, setUniversity] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const subjectsList = ['Maths', 'Physics', 'Chemistry', 'Biology', 'Agric', 'GST'];

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

  const handleCapture = async () => {
    if (!video) return;

    try {
      const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        // Save face descriptors to IndexedDB or process them as needed
        console.log(detections);
        // Assuming saveFaceDescriptors is a function to handle saving face data
      } else {
        alert('No face detected. Please try again.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Error capturing face. Please try again.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length !== 4) {
      alert('Please select exactly four subjects.');
      return;
    }
    const registrationData = { name, course, state, university, subjects: selectedSubjects };
    await addUser(registrationData);
    navigate('/dashboard');
  };

  const handleSubjectChange = (subject) => {
    const alreadySelected = selectedSubjects.includes(subject);

    if (alreadySelected) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
    } else if (selectedSubjects.length < 4) {
      setSelectedSubjects([...selectedSubjects, subject]);
    } else {
      alert('You can only select up to four subjects.');
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-2xl font-bold mb-4">Exam Registration</h2>
      <form onSubmit={handleRegister} className="space-y-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          placeholder="University"
          value={university}
          onChange={(e) => setUniversity(e.target.value)}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <div className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          <h3>Select exactly four subjects:</h3>
          {subjectsList.map((subject) => (
            <div key={subject}>
              <input
                type="checkbox"
                id={subject}
                value={subject}
                checked={selectedSubjects.includes(subject)}
                onChange={() => handleSubjectChange(subject)}
                disabled={!selectedSubjects.includes(subject) && selectedSubjects.length === 4}
              />
              <label htmlFor={subject} className="ml-2">{subject}</label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={startVideo}
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Start Facial Recognition
        </button>
        <button
          type="button"
          onClick={handleCapture}
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Capture Face
        </button>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Register
        </button>
      </form>

      <video id="video" width="640" height="480" autoPlay muted className="mt-4" />
    </div>
  );
};

export default ExamRegistration;
