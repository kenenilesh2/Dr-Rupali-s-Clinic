
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, Stethoscope, Settings, X, Archive, LogOut } from 'lucide-react';
import { DOCTOR_NAME } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  
  const links = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/patients', icon: <Users size={20} />, label: 'Patients' },
    { to: '/appointments', icon: <Calendar size={20} />, label: 'Appointments' },
    { to: '/inventory', icon: <Archive size={20} />, label: 'Pharmacy / Stock' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-white z-30 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center border-b border-slate-800">
          <div>
            <h1 className="font-bold text-lg leading-tight text-teal-400">Shree Samarth<br/>Krupa Clinic</h1>
            <p className="text-xs text-slate-400 mt-1">{DOCTOR_NAME}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.to + link.label}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-red-400 px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors mb-2"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
          <div className="flex items-center gap-3 text-slate-400 px-4 py-2">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-2">v1.2.0 • Supabase Connected</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
