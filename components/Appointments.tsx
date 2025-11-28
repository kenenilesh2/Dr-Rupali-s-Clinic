import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Appointment, AppointmentStatus } from '../types';
import { DOCTOR_MOBILE, CLINIC_NAME } from '../constants';
import { Calendar, Phone, Clock, CheckCircle, XCircle, Share2, Link as LinkIcon, Loader2 } from 'lucide-react';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'All' | 'Today' | 'Pending'>('Today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, [filter]);

  const loadAppointments = async () => {
    setLoading(true);
    const all = await StorageService.getAppointments();
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (filter === 'Today') {
      setAppointments(all.filter(a => a.date === todayStr));
    } else if (filter === 'Pending') {
      setAppointments(all.filter(a => a.status === AppointmentStatus.Pending));
    } else {
      setAppointments(all);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: AppointmentStatus) => {
    await StorageService.updateAppointmentStatus(id, status);
    loadAppointments(); // Refresh
  };

  const getWhatsAppLink = () => {
    const text = `Hello Dr. Rupali, I would like to book an appointment at ${CLINIC_NAME}. Please let me know the available slots.`;
    return `https://wa.me/${DOCTOR_MOBILE}?text=${encodeURIComponent(text)}`;
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/#/book-appointment`;
    navigator.clipboard.writeText(link);
    alert('Booking Link Copied! Share this with your patients.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Appointments</h2>
           <p className="text-slate-500 text-sm">Manage bookings and schedule</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={copyBookingLink}
              className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium hover:bg-slate-50"
            >
               <LinkIcon size={16} /> Copy Online Booking URL
            </button>
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm font-medium"
            >
              <Share2 size={16} /> WhatsApp Link
            </a>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-1">
        {(['Today', 'Pending', 'All'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              filter === f ? 'bg-white text-teal-600 border-b-2 border-teal-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-teal-600" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.length === 0 ? (
           <div className="col-span-full text-center py-12 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
             <Calendar className="mx-auto h-12 w-12 mb-3 opacity-20" />
             <p>No appointments found for this filter.</p>
           </div>
        ) : (
          appointments.map(app => (
            <div key={app.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
               <div className="flex justify-between items-start mb-3">
                 <div>
                   <h3 className="font-bold text-slate-800 text-lg">{app.patientName}</h3>
                   <div className="flex items-center gap-1 text-slate-500 text-sm">
                     <Phone size={12} /> <a href={`tel:${app.mobile}`} className="hover:underline">{app.mobile}</a>
                   </div>
                 </div>
                 <div className="text-right">
                    <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{app.time.slice(0, 5)}</div>
                    <div className="text-xs text-slate-400 mt-1">{app.date}</div>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 mb-4 text-xs">
                 <span className={`px-2 py-1 rounded-full ${app.type === 'Online' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                   {app.type}
                 </span>
                 <span className={`px-2 py-1 rounded-full ${
                    app.status === AppointmentStatus.Confirmed ? 'bg-green-50 text-green-700' :
                    app.status === AppointmentStatus.Pending ? 'bg-yellow-50 text-yellow-700' : 
                    app.status === AppointmentStatus.Cancelled ? 'bg-red-50 text-red-700' : 'bg-slate-100'
                  }`}>
                    {app.status}
                  </span>
               </div>

               {app.notes && <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded italic">"{app.notes}"</p>}

               <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2 justify-end">
                 {app.status !== AppointmentStatus.Cancelled && (
                   <button 
                    onClick={() => updateStatus(app.id, AppointmentStatus.Cancelled)}
                    title="Cancel"
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                   >
                     <XCircle size={20} />
                   </button>
                 )}
                 {app.status === AppointmentStatus.Pending && (
                   <button 
                    onClick={() => updateStatus(app.id, AppointmentStatus.Confirmed)}
                    title="Confirm"
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                   >
                     <CheckCircle size={20} />
                   </button>
                 )}
                  <button className="text-xs text-teal-600 font-medium px-3 py-2 hover:bg-teal-50 rounded-lg">
                    Edit
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
      )}
      
      {/* Simulation of Booking Form */}
      <div className="mt-12 bg-teal-50 rounded-xl p-8 border border-teal-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-teal-900">Manual Booking</h3>
            <p className="text-teal-700 mt-2 max-w-xl">
              Add walk-in patients or manual phone bookings here.
            </p>
          </div>
          <button 
            onClick={async () => {
              // Add a dummy appointment for demo
              const newAppt: Partial<Appointment> = {
                patientName: "Manual Walk-in",
                mobile: "0000000000",
                date: new Date().toISOString().split('T')[0],
                time: "12:00",
                status: AppointmentStatus.Pending,
                type: 'Walk-in',
                notes: 'Reception booking'
              };
              await StorageService.saveAppointment(newAppt);
              loadAppointments();
            }}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-teal-700 font-medium"
          >
             + Add Walk-in
          </button>
        </div>
      </div>
    </div>
  );
};

export default Appointments;