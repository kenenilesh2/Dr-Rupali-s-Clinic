
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import Appointments from './components/Appointments';
import OnlineBooking from './components/OnlineBooking';
import Inventory from './components/Inventory';
import Welcome from './components/Welcome';
import Login from './components/Login';
import { Menu } from 'lucide-react';

// Guard for protected routes
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Wrapper to conditionally render Sidebar
const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Pages that display without the sidebar
  const isPublicPage = ['/book-appointment', '/', '/login'].includes(location.pathname);

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/book-appointment" element={<OnlineBooking />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="font-bold text-teal-600">Shree Samarth Krupa</h1>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
            <Route path="/patients/:id" element={<PrivateRoute><PatientDetails /></PrivateRoute>} />
            <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
            <Route path="/inventory" element={<PrivateRoute><Inventory /></PrivateRoute>} />
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
