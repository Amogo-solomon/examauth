// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../services/indexedDB';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('activeUser'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = async (email, password) => {
    const adminUsers = [
      { name: 'Admin1', email: 'admin1@wootlab.ng', password: 'admin123', role: 'admin' },
      { name: 'Admin2', email: 'admin2@wootlab.ng', password: 'admin123', role: 'admin' }
    ];

    const adminUser = adminUsers.find(user => user.email === email && user.password === password);
    if (adminUser) {
      setUser(adminUser);
      localStorage.setItem('activeUser', JSON.stringify(adminUser));
      navigate('/admin-dashboard');
      return;
    }

    const storedUser = await getUser(email);
    if (storedUser && storedUser.password === password) {
      setUser({ ...storedUser, role: 'user' });
      localStorage.setItem('activeUser', JSON.stringify({ ...storedUser, role: 'user' }));
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
