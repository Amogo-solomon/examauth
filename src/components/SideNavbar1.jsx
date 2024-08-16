// src/components/SideNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const SideNavbar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Exam Auth System</h2>
      <ul>
        <li className="mb-2">
          <Link to="/dashboard" className="hover:bg-gray-700 p-2 rounded block">Dashboard</Link>
        </li>
        <li className="mb-2">
          <Link to="/exam-registration" className="hover:bg-gray-700 p-2 rounded block">Register for Exam</Link>
        </li>
        <li className="mb-2">
          <Link to="/admin-dashboard" className="hover:bg-gray-700 p-2 rounded block">Admin Dashboard</Link>
        </li>
        {/* Add more links as needed */}
      </ul>
    </div>
  );
};

export default SideNavbar;
