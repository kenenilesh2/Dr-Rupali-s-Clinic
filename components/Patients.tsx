import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Patient, Gender } from '../types';
import { Plus, Search, Phone, MapPin, ChevronRight, X, Loader2, Pencil, Trash2, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BLOOD_GROUPS } from '../constants';

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Edit State
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  // Dictation State
  const [listeningField, setListeningField] = useState<string | null>(null);

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
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getPatients();
      setPatients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value.toLowerCase());
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(search) || 
    p.mobile.includes(search)
  );

  const resetForm = () => {
    setFormData({ name: '', mobile: '', age: 0, gender: Gender.Male, address: '', bloodGroup: '', allergies: '', chronicConditions: '' });
    setEditingPatientId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setFormData({
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      address: patient.address,
      bloodGroup: patient.bloodGroup || '',
      allergies: patient.allergies || '',
      chronicConditions: patient.chronicConditions || ''
    });
    setEditingPatientId(patient.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete patient "${name}"? This will also delete all their visit history. This action cannot be undone.`)) {
      setLoading(true);
      await StorageService.deletePatient(id);
      await fetchPatients();
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) return;
    
    setSubmitting(true);
    
    if (editingPatientId) {
      // Update existing
      await StorageService.updatePatient(editingPatientId, formData);
    } else {
      // Create new
      await StorageService.savePatient(formData);
    }

    await fetchPatients(); // Refresh list
    setSubmitting(false);
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Voice Dictation Logic ---
  const startListening = (fieldName: keyof Patient) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    
    setListeningField(fieldName);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Can be changed to 'en-IN' if needed

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => {
        const currentValue = prev[fieldName] as string || '';
        // Append if value exists, else set
        return {
          ...prev,
          [fieldName]: currentValue ? `${currentValue} ${transcript}` : transcript
        };
      });
      setListeningField(null);
    };

    recognition.onerror = () => {
      setListeningField(null);
    };

    recognition.onend = () => {
      setListeningField(null);
    };

    recognition.start();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Patient Records</h2>
          <p className="text-slate-500 text-sm">
             {loading ? 'Syncing...' : `${patients.length} total patients`}
          </p>
        </div>
        <button 
          onClick={openAddModal}
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
          {loading ? (
             <div className="flex justify-center items-center h-48">
               <Loader2 className="animate-spin text-teal-600" size={32} />
             </div>
          ) : filteredPatients.length === 0 ? (
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
                  <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
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
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          to={`/patients/${patient.id}`}
                          title="View Details"
                          className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <ChevronRight size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(patient)}
                          title="Edit Patient"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                         <button
                          onClick={() => handleDelete(patient.id, patient.name)}
                          title="Delete Patient"
                          className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Patient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingPatientId ? 'Edit Patient Details' : 'Register New Patient'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <input 
                      required 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="w-full p-2 pr-10 border rounded-lg" 
                      placeholder="e.g. Rahul Sharma" 
                    />
                    <button 
                      type="button" 
                      onClick={() => startListening('name')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'name' ? 'text-red-500 animate-pulse' : ''}`}
                      title="Speak to type"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
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
                  <div className="relative">
                    <input 
                      name="allergies" 
                      value={formData.allergies} 
                      onChange={handleInputChange} 
                      className="w-full p-2 pr-10 border rounded-lg" 
                      placeholder="e.g. Peanuts, Penicillin" 
                    />
                    <button 
                      type="button" 
                      onClick={() => startListening('allergies')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'allergies' ? 'text-red-500 animate-pulse' : ''}`}
                      title="Speak to type"
                    >
                      <Mic size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                <div className="relative">
                  <textarea 
                    name="address" 
                    rows={2} 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    className="w-full p-2 pr-10 border rounded-lg" 
                  />
                  <button 
                      type="button" 
                      onClick={() => startListening('address')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'address' ? 'text-red-500 animate-pulse' : ''}`}
                      title="Speak to type"
                    >
                      <Mic size={16} />
                    </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chronic Conditions / Medical History</label>
                <div className="relative">
                  <textarea 
                    name="chronicConditions" 
                    rows={2} 
                    value={formData.chronicConditions} 
                    onChange={handleInputChange} 
                    className="w-full p-2 pr-10 border rounded-lg" 
                    placeholder="e.g. Diabetes, previous surgeries, heart condition" 
                  />
                  <button 
                      type="button" 
                      onClick={() => startListening('chronicConditions')}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'chronicConditions' ? 'text-red-500 animate-pulse' : ''}`}
                      title="Speak to type"
                    >
                      <Mic size={16} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Include any significant past medical history here.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={submitting} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-sm flex items-center gap-2">
                  {submitting && <Loader2 className="animate-spin" size={16} />}
                  {editingPatientId ? 'Update Record' : 'Register Patient'}
                </button>
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