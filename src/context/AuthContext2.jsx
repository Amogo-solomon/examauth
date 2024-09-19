import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/indexedDB';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('/admin-credentials.json'); // Fetching from public folder
        const data = await response.json();
        setAdminUsers(data);
      } catch (error) {
        console.error("Failed to load admin users", error);
      }
    };

    const initializeAuth = async () => {
      await fetchAdmins();

      const storedUser = JSON.parse(localStorage.getItem('activeUser'));

      if (storedUser) {
        if (storedUser.role === 'admin') {
          setUser(storedUser);
        } else {
          const userFromDB = await getUser(storedUser.email);
          if (userFromDB && userFromDB.password === storedUser.password) {
            setUser({ ...userFromDB, role: 'user' });
          } else {
            localStorage.removeItem('activeUser');
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const adminUser = adminUsers.find(user => user.email === email && user.password === password);

    if (adminUser) {
      setUser(adminUser);
      localStorage.setItem('activeUser', JSON.stringify(adminUser));
      navigate('/admin-dashboard');
      return;
    }

    const storedUser = await getUser(email);
    if (storedUser && storedUser.password === password) {
      const userWithRole = { ...storedUser, role: 'user' };
      setUser(userWithRole);
      localStorage.setItem('activeUser', JSON.stringify(userWithRole));
      navigate('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('activeUser');
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading screen until user is set
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
