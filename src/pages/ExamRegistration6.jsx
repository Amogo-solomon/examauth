import React, { useState, useEffect, useRef } from 'react';
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
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const subjectsList = ['Maths', 'Physics', 'Chemistry', 'Biology', 'Agric', 'GST'];
  const cameraSound = new Audio('/sounds/camera-shutter.wav');  // Ensure this path is correct

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
    if (videoRef.current) {
      videoRef.current.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvasRef.current.append(canvas);
        faceapi.matchDimensions(canvas, { width: videoRef.current.width, height: videoRef.current.height });

        const detectFace = async () => {
          try {
            const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detections) {
              setFaceDetected(true);
              const resizedDetections = faceapi.resizeResults(detections, { width: videoRef.current.width, height: videoRef.current.height });
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections.landmarks);
              faceapi.draw.drawFaceDescriptor(canvas, resizedDetections.descriptor);
            } else {
              setFaceDetected(false);
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
          } catch (error) {
            console.error('Error detecting face:', error);
          }
        };

        const intervalId = setInterval(detectFace, 100);
        return () => clearInterval(intervalId);  // Cleanup interval on component unmount
      });
    }
  }, [videoRef.current]);

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setVideo(videoRef.current);
      })
      .catch(err => {
        console.error('Error accessing webcam:', err);
        alert('Error accessing webcam. Please check your camera settings.');
      });
  };

  const handleCapture = async () => {
    if (!videoRef.current) {
      alert('Video stream not available.');
      return;
    }

    try {
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        cameraSound.play();  // Play camera shutter sound
        console.log(detections);
        // Save face descriptors to IndexedDB or process them as needed
      } else {
        alert('No face detected. Please make sure your face is clearly visible in the video.');
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
    <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Exam Registration</h2>
        <form onSubmit={handleRegister} className="space-y-6">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="Course of Study"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="State of Residence"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text"
            placeholder="University/Institution"
            value={university}
            onChange={(e) => setUniversity(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <div className="space-y-2">
            <h3 className="text-lg font-medium mb-2">Select exactly four subjects:</h3>
            {subjectsList.map((subject) => (
              <div key={subject} className="flex items-center">
                <input
                  type="checkbox"
                  id={subject}
                  value={subject}
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                  disabled={!selectedSubjects.includes(subject) && selectedSubjects.length === 4}
                />
                <label htmlFor={subject} className="ml-2 text-gray-700">{subject}</label>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <button
              type="button"
              onClick={startVideo}
              className="w-full bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Start Facial Recognition
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Capture Face
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Register
            </button>
          </div>
        </form>
        <div className="flex justify-center mt-8">
          <div className="relative">
            <video ref={videoRef} width="640" height="480" autoPlay muted className="border border-gray-300 rounded-lg" />
            <canvas ref={canvasRef} className="absolute top-0 left-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamRegistration;
