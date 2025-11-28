import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Patient, Gender } from '../types';
import { Plus, Search, Phone, MapPin, ChevronRight, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOOD_GROUPS } from '../constants';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    mobile: '',
    age: 0,
    gender: Gender.Male,
    address: '',
    bloodGroup: '',
    allergies: '',
    chronicConditions: ''
  });

  useEffect(() => {
    setPatients(StorageService.getPatients());
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search) || 
    p.mobile.includes(search)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;

    const newPatient: Patient = {
      id: Date.now().toString(),
      registeredDate: new Date().toISOString(),
      ...formData as Patient
    };

    StorageService.savePatient(newPatient);
    setPatients(StorageService.getPatients());
    setIsModalOpen(false);
    setFormData({ name: '', mobile: '', age: 0, gender: Gender.Male, address: '', bloodGroup: '', allergies: '', chronicConditions: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patient Records</h2>
          <p className="text-slate-500 text-sm">{patients.length} total patients</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add New Patient
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or mobile number..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {filteredPatients.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-64 text-slate-400">
               <UsersIcon className="w-16 h-16 mb-4 text-slate-200" />
               <p>No patients found.</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Info</th>
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{patient.name}</div>
                      <div className="md:hidden text-xs text-slate-500 mt-1">{patient.mobile}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {patient.mobile}
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="text-sm text-slate-600">
                        {patient.age} Y / {patient.gender} 
                        {patient.bloodGroup && <span className="ml-2 px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-bold">{patient.bloodGroup}</span>}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">{patient.address}</div>
                    </td>
                    <td className="p-4">
                      <Link 
                        to={`/patients/${patient.id}`}
                        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 text-sm font-medium"
                      >
                        View Record <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">Register New Patient</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="e.g. Rahul Sharma" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                  <input required name="mobile" type="tel" value={formData.mobile} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="10 digit number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                  <input name="age" type="number" value={formData.age} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full p-2 border rounded-lg">
                    {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full p-2 border rounded-lg">
                    <option value="">Select...</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Known Allergies</label>
                  <input name="allergies" value={formData.allergies} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="e.g. Peanuts, Penicillin" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} className="w-full p-2 border rounded-lg" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chronic Conditions</label>
                <textarea name="chronicConditions" rows={2} value={formData.chronicConditions} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="e.g. Diabetes, Hypertension" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm">Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default Patients;