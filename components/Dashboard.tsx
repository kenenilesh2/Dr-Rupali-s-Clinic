import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storageService';
import { DashboardStats, Appointment, AppointmentStatus } from '../types';
import { Users, CalendarCheck, IndianRupee, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const dashboardStats = await StorageService.getStats();
        setStats(dashboardStats);

        const allAppts = await StorageService.getAppointments();
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayAppointments(allAppts.filter(a => a.date === todayStr).slice(0, 5));
      } catch (e) {
        console.error("Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="text-teal-600 font-medium animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  if (!stats) return <div className="p-8">Error loading data.</div>;

  const cards = [
    { 
      label: 'Total Patients', 
      value: stats.totalPatients, 
      icon: <Users className="text-blue-500" />, 
      bg: 'bg-blue-50',
      link: '/patients'
    },
    { 
      label: 'Today\'s Appts', 
      value: stats.todayAppointments, 
      icon: <CalendarCheck className="text-purple-500" />, 
      bg: 'bg-purple-50',
      link: '/appointments'
    },
    { 
      label: 'Total Visits', 
      value: stats.totalVisits, 
      icon: <Activity className="text-orange-500" />, 
      bg: 'bg-orange-50',
      link: '/patients' // Visits are part of patient history
    },
    { 
      label: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: <IndianRupee className="text-green-600" />, 
      bg: 'bg-green-50',
      link: '/appointments' // Revenue is tracked via appointments/visits
    },
  ];

  // Dummy chart data
  const chartData = [
    { name: 'Mon', visits: 4 },
    { name: 'Tue', visits: 7 },
    { name: 'Wed', visits: 5 },
    { name: 'Thu', visits: 8 },
    { name: 'Fri', visits: 12 },
    { name: 'Sat', visits: 15 },
    { name: 'Sun', visits: 3 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Welcome back, Dr. Rupali.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Link key={idx} to={card.link} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between transition-all duration-200 group-hover:shadow-md group-hover:border-teal-200 group-hover:-translate-y-1 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-teal-600 transition-colors">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${card.bg} group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments Today */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-slate-800">Today's Schedule</h3>
            <Link to="/appointments" className="text-sm text-teal-600 hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No appointments for today.</p>
            ) : (
              todayAppointments.map(app => (
                <Link to="/appointments" key={app.id} className="block">
                  <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 cursor-pointer">
                    <div className="bg-teal-100 text-teal-700 p-2 rounded-md font-bold text-xs text-center min-w-[50px]">
                      {app.time.slice(0, 5)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800">{app.patientName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={12} /> {app.type}
                      </p>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      app.status === AppointmentStatus.Confirmed ? 'bg-green-100 text-green-700' :
                      app.status === AppointmentStatus.Pending ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg text-slate-800">Weekly Visits</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="visits" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;