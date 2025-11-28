
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';
import { DOCTOR_NAME, CLINIC_NAME } from '../constants';

const Login: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get stored PIN or default to '1234'
    const storedPin = localStorage.getItem('clinic_pin') || '1234';

    if (pin === storedPin) {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-1">{CLINIC_NAME}</h2>
        <p className="text-slate-500 text-sm mb-8">{DOCTOR_NAME} &bull; Secure Portal</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enter Access PIN</label>
            <input 
              type="password" 
              inputMode="numeric"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              className={`w-full text-center text-3xl tracking-[0.5em] font-bold py-3 border-b-2 outline-none transition-colors ${error ? 'border-red-500 text-red-600' : 'border-slate-200 text-slate-800 focus:border-teal-500'}`}
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2">Incorrect PIN. Try again.</p>}
          </div>

          <button 
            type="submit" 
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            Access Dashboard <ChevronRight size={18} />
          </button>
        </form>

        <p className="text-slate-300 text-xs mt-8">Authorized Personnel Only</p>
      </div>
    </div>
  );
};

export default Login;
