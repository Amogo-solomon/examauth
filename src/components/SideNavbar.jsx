import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaFileAlt, FaUserShield, FaUserCircle, FaPowerOff } from 'react-icons/fa';

const SideNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('userSession');
    // Redirect to login page
    navigate('/');
  };

  return (
    <div className="bg-gray-800 text-white h-16 px-4 flex flex-row items-center justify-between">
      {/* Left: Title */}
      <h2 className="text-xl font-bold">Exam Auth System</h2>

      {/* Middle: Navigation Links */}
      <ul className="flex space-x-8">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-300 ${isActive ? 'bg-blue-500' : ''}`
            }
          >
            <FaTachometerAlt className="mr-2" />
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/exam-registration"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-300 ${isActive ? 'bg-blue-500' : ''}`
            }
          >
            <FaFileAlt className="mr-2" />
            Register for Exam
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/admin-dashboard"
            className={({ isActive }) =>
              `flex items-center p-2 rounded-lg hover:bg-gray-700 transition duration-300 ${isActive ? 'bg-blue-500' : ''}`
            }
          >
            <FaUserShield className="mr-2" />
            Admin Dashboard
          </NavLink>
        </li>
      </ul>

      {/* Right: Profile Icon and Logout Button */}
      <div className="flex items-center space-x-4">
        <FaUserCircle className="text-2xl" />
        <button
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300"
          onClick={handleLogout}
        >
          <FaPowerOff className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideNavbar;
