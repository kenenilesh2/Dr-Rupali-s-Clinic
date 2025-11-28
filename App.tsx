import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Patients from './components/Patients';
import PatientDetails from './components/PatientDetails';
import Appointments from './components/Appointments';
import OnlineBooking from './components/OnlineBooking';
import { Menu } from 'lucide-react';

// Wrapper to conditionally render Sidebar
const AppContent: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isPublicPage = location.pathname === '/book-appointment';

  if (isPublicPage) {
    return (
      <Routes>
        <Route path="/book-appointment" element={<OnlineBooking />} />
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
            <Route path="/" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/new-visit" element={<Navigate to="/patients" replace />} />
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