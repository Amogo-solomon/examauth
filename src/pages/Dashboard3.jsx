// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import SideNavbar from '../components/SideNavbar';
import AuthContext from '../context/AuthContext';
import { FaUser, FaClipboardList, FaBell } from 'react-icons/fa';
import { getCandidate } from '../services/indexedDB';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [candidateData, setCandidateData] = useState(null);

  useEffect(() => {
    const fetchCandidateData = async () => {
      if (user?.email) {
        const data = await getCandidate(user.email);
        setCandidateData(data);
      }
    };

    fetchCandidateData();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SideNavbar />
      <div className="flex-1 p-6 bg-white shadow-md">
        {/* User Profile Section */}
        <div className="flex items-center mb-6">
          <FaUser className="text-4xl text-blue-500 mr-4" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}</h1>
            <p className="text-gray-600">Role: {user?.role}</p>
            {candidateData && (
              <>
                <p className="text-gray-600">Candidate Number: {candidateData.candidateNumber}</p>
                <p className="text-gray-600">Course: {candidateData.course}</p>
              </>
            )}
          </div>
        </div>

        {/* Notifications/Reminders */}
        <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center">
          <FaBell className="text-xl mr-3" />
          <p>Reminder: You have an upcoming exam on [Date]. Don't forget to prepare!</p>
        </div>

        {/* Registered Exams Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Registered Exams</h2>
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
                {candidateData?.subjects?.length > 0 ? (
                  candidateData.subjects.map((subject, index) => (
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
                      You have no registered exams.
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
    </div>
  );
};

export default Dashboard;
