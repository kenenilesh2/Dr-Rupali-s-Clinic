import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, MapPin, Stethoscope, ArrowRight, Award } from 'lucide-react';
import { CLINIC_NAME, DOCTOR_NAME, DOCTOR_DEGREE } from '../constants';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-200 flex items-center justify-center p-4 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-500 hover:shadow-3xl">
        
        {/* Left Side - Hero Section */}
        <div className="md:w-5/12 bg-teal-700 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Abstract Background Shape */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-600 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-800 opacity-50 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-lg">
              <Stethoscope size={36} className="text-teal-50" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Holistic <br/>
              <span className="text-teal-200">Healing.</span>
            </h1>
            <p className="text-teal-100 text-lg leading-relaxed opacity-90">
              Welcome to our advanced clinic management portal. Secure, efficient, and patient-centric.
            </p>
          </div>

          <div className="relative z-10 mt-12">
            <div className="flex items-center gap-3 text-sm font-medium text-teal-200/80">
              <Award size={18} />
              <span>Excellence in Homeopathy</span>
            </div>
          </div>
        </div>

        {/* Right Side - Details & Action */}
        <div className="md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">{CLINIC_NAME}</h2>
            <div className="h-1.5 w-24 bg-teal-500 rounded-full"></div>
          </div>

          <div className="space-y-8 mb-12">
            {/* Doctor Info */}
            <div className="flex items-start gap-5 group">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-100 transition-colors">
                <Activity size={28} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Doctor In-Charge</p>
                <p className="text-xl font-bold text-slate-800">{DOCTOR_NAME}</p>
                <p className="text-slate-500 font-medium">{DOCTOR_DEGREE} (Mumbai University)</p>
              </div>
            </div>

            {/* Address Info */}
            <div className="flex items-start gap-5 group">
               <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-100 transition-colors">
                <MapPin size={28} />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Clinic Address</p>
                <p className="text-base text-slate-700 leading-relaxed font-medium">
                  Opp. Manpasand Mithaiwala,<br/>
                  Bapgaon Naka, Bhiwandi,<br/>
                  Thane 421302
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/dashboard')}
            className="group w-full bg-slate-900 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-teal-600 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3"
          >
            Go to Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-center text-slate-400 text-xs mt-6">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;