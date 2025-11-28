import React, { useState } from 'react';
import { StorageService } from '../services/storageService';
import { AppointmentStatus } from '../types';
import { CLINIC_NAME, DOCTOR_NAME } from '../constants';
import { CalendarCheck, Clock, CheckCircle } from 'lucide-react';

const OnlineBooking: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    date: '',
    time: '',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await StorageService.saveAppointment({
      patientName: formData.name,
      mobile: formData.mobile,
      date: formData.date,
      time: formData.time,
      status: AppointmentStatus.Pending,
      type: 'Online',
      notes: formData.notes
    });

    setLoading(false);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-teal-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Sent!</h2>
          <p className="text-slate-600">
            Thank you, {formData.name}. Your appointment request for {formData.date} at {formData.time} has been sent to {DOCTOR_NAME}.
          </p>
          <p className="mt-4 text-sm text-slate-400">We will confirm via phone shortly.</p>
          <button 
             onClick={() => { setSubmitted(false); setFormData({ name: '', mobile: '', date: '', time: '', notes: '' }); }}
             className="mt-6 text-teal-600 font-medium hover:underline"
          >
            Book Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-teal-800">{CLINIC_NAME}</h1>
        <p className="text-slate-500 mt-1">{DOCTOR_NAME}</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <CalendarCheck className="text-teal-600" /> Book Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
            <input required name="name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="Full Name" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
            <input required name="mobile" type="tel" value={formData.mobile} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="10 Digit Mobile" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
              <input required name="date" type="date" value={formData.date} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
              <input required name="time" type="time" value={formData.time} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reason / Symptoms (Optional)</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" rows={3} placeholder="Briefly describe your issue..." />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-teal-600 text-white font-bold py-3 rounded-lg hover:bg-teal-700 transition-colors shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Request Appointment'}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs text-center">
        Powered by ClinicManager &bull; Secure Data Privacy
      </p>
    </div>
  );
};

export default OnlineBooking;