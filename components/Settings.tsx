
import React, { useState } from 'react';
import { Lock, Save, CheckCircle, AlertTriangle } from 'lucide-react';

const Settings: React.FC = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Validate Current PIN
    const storedPin = localStorage.getItem('clinic_pin') || '1234';
    if (currentPin !== storedPin) {
      setMessage({ type: 'error', text: 'Current PIN is incorrect.' });
      return;
    }

    // 2. Validate New PIN Format
    if (newPin.length < 4 || isNaN(Number(newPin))) {
      setMessage({ type: 'error', text: 'New PIN must be at least 4 digits.' });
      return;
    }

    // 3. Match Confirmation
    if (newPin !== confirmPin) {
      setMessage({ type: 'error', text: 'New PIN and Confirmation do not match.' });
      return;
    }

    // 4. Save
    localStorage.setItem('clinic_pin', newPin);
    setMessage({ type: 'success', text: 'Access PIN updated successfully!' });
    
    // Reset fields
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 text-sm">Manage security and application preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden max-w-lg">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Security</h3>
            <p className="text-xs text-slate-500">Change your login access PIN</p>
          </div>
        </div>

        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdatePin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current PIN</label>
              <input 
                type="password" 
                inputMode="numeric"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter current PIN"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New PIN</label>
                <input 
                  type="password" 
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="New PIN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New PIN</label>
                <input 
                  type="password" 
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Confirm PIN"
                />
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Save size={18} /> Update PIN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
