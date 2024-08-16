import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ExamRegistration from './pages/ExamRegistration';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/Notfound';  // A page for handling 404 errors
import AuthContext from './context/AuthContext';  // Import AuthContext

function App() {
  const { user } = useContext(AuthContext);  // Get the current user from context

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={user?.role === 'user' ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/exam-registration" element={user?.role === 'user' ? <ExamRegistration /> : <Navigate to="/" />} />
      <Route path="/admin-dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
      <Route path="*" element={<NotFound />} />  {/* Catch-all route for 404 */}
    </Routes>
  );
}

export default App;
