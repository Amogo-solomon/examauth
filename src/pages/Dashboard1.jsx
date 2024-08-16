// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import SideNavbar from '../components/SideNavbar';
import AuthContext from '../context/AuthContext';
import { getAllCandidates } from '../services/indexedDB';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      const loadCandidates = async () => {
        const allCandidates = await getAllCandidates();
        setCandidates(allCandidates);
      };
      loadCandidates();
    }
  }, [user]);

  return (
    <div className="flex flex-col">
      <SideNavbar />
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Welcome, {user?.name}! You are logged in as {user?.role}.</p>

        {user?.role === 'admin' && (
          <>
            
            <table className="w-full mt-4">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Course</th>
                  <th className="border p-2">State</th>
                  <th className="border p-2">University</th>
                  <th className="border p-2">Subjects</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(candidate => (
                  <tr key={candidate.email}>
                    <td className="border p-2">{candidate.name}</td>
                    <td className="border p-2">{candidate.email}</td>
                    <td className="border p-2">{candidate.course}</td>
                    <td className="border p-2">{candidate.state}</td>
                    <td className="border p-2">{candidate.university}</td>
                    <td className="border p-2">{candidate.subjects.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
