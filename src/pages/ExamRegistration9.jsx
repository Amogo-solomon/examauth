import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { addCandidate } from '../services/indexedDB';
import SideNavbar from '../components/SideNavbar';

const ExamRegistration = () => {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [state, setState] = useState('');
  const [university, setUniversity] = useState('');
  const [email, setEmail] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [faceDescriptors, setFaceDescriptors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false); // New state for capture success message
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const subjectsList = ['Maths', 'Physics', 'Chemistry', 'Biology', 'Agric', 'GST'];
  const cameraSound = new Audio('/sounds/camera-shutter.wav');

  // Load face-api models
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        console.log('Face recognition models loaded successfully');
        setLoading(false);
      } catch (error) {
        console.error('Error loading models:', error);
        alert('Error loading face recognition models. Please try again later.');
      }
    };

    loadFaceApi();
  }, []);

  // Handle video element setup and face detection
  useEffect(() => {
    const handleVideoReady = () => {
      if (videoRef.current && videoRef.current.readyState >= 3) {
        const canvas = faceapi.createCanvasFromMedia(videoRef.current);
        canvasRef.current.appendChild(canvas);
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        faceapi.matchDimensions(canvas, { width: videoWidth, height: videoHeight });

        const detectFace = async () => {
          try {
            const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detections) {
              setFaceDetected(true);
              setFaceDescriptors(detections.descriptor);
              const resizedDetections = faceapi.resizeResults(detections, { width: videoWidth, height: videoHeight });
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawFaceLandmarks(canvas, resizedDetections.landmarks);
              faceapi.draw.drawDetections(canvas, resizedDetections);
            } else {
              setFaceDetected(false);
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            }
          } catch (error) {
            console.error('Error detecting face:', error);
          }
        };

        const intervalId = setInterval(detectFace, 500);
        return () => clearInterval(intervalId);
      } else {
        console.warn('Video is not ready or not available.');
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', handleVideoReady); // Listen for 'loadeddata'
      return () => videoRef.current.removeEventListener('loadeddata', handleVideoReady);
    }
  }, [videoRef.current]);

  // Start video stream from webcam
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().then(() => {
            console.log('Video started successfully');
          }).catch(err => {
            console.error('Error playing video:', err);
          });
        }
      })
      .catch(err => {
        console.error('Error accessing webcam:', err);
        alert('Error accessing webcam. Please check your camera settings.');
      });
  };

  // Capture face when the user clicks "Capture Face"
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
        cameraSound.play();
        setFaceDescriptors(detections.descriptor);
        setCaptureSuccess(true);  // Set capture success to true
        console.log(detections);
      } else {
        alert('No face detected. Please make sure your face is clearly visible in the video.');
      }
    } catch (error) {
      console.error('Error capturing face:', error);
      alert('Error capturing face. Please try again.');
    }
  };

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length !== 4) {
      alert('Please select exactly four subjects.');
      return;
    }
    const candidateData = {
      name,
      course,
      state,
      university,
      email,
      subjects: selectedSubjects,
      faceDescriptors,
    };
    try {
      await addCandidate(candidateData);
      alert('Registration successful!'); // Show success alert
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Failed to register. Please try again.');
    }
  };

  // Handle subject selection
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
    <div className="min-h-screen bg-gray-100 flex flex-col ">
      <SideNavbar />
      <div class="flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg items-center justify-center">
    
        <h1 className="text-2xl font-bold mb-6">Exam Registration</h1>
        {loading && <p>Loading face recognition models...</p>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
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
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
                  checked={selectedSubjects.includes(subject)}
                  onChange={() => handleSubjectChange(subject)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={subject} className="ml-2 text-gray-700">{subject}</label>
              </div>
            ))}
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              type="button"
              onClick={startVideo}
              className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Start Video
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="w-full bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Capture Face
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition duration-300"
          >
            Register
          </button>
        </form>
        <div className="mt-6">
          <div ref={canvasRef} style={{ position: 'relative' }}>
            <video ref={videoRef} width="320" height="240" style={{ display: faceDetected ? 'block' : 'none' }} />
          </div>
          {!faceDetected && <p className="text-red-500 mt-2">Face not detected. Please position your face in the camera.</p>}
          {captureSuccess && <p className="text-green-500 mt-2">Face successfully captured!</p>} {/* Success message */}
        </div>
      </div>
      </div>

    </div>
  );
};

export default ExamRegistration;
