import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Patient, Visit, PrescriptionItem } from '../types';
import { GeminiService } from '../services/geminiService';
import { ArrowLeft, Calendar, FileText, Pill, Plus, Save, Sparkles, MessageCircle, AlertTriangle } from 'lucide-react';
import { PRESET_DOSAGES, DOCTOR_MOBILE, CLINIC_NAME } from '../constants';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [showVisitForm, setShowVisitForm] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [fees, setFees] = useState<number>(0);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');

  useEffect(() => {
    if (id) {
      const p = StorageService.getPatients().find(p => p.id === id);
      if (p) {
        setPatient(p);
        setVisits(StorageService.getVisits(id));
      } else {
        navigate('/patients');
      }
    }
  }, [id, navigate]);

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicineName: '', dosage: PRESET_DOSAGES[0], duration: '3 days', instruction: 'After food' }]);
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setPrescriptions(newPrescriptions);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleGenerateAdvice = async () => {
    if (!symptoms || !diagnosis) return;
    setAiLoading(true);
    const advice = await GeminiService.getHealthAdvice(symptoms, diagnosis);
    setAiAdvice(advice);
    setNotes(prev => prev ? prev + '\n\nAI Advice: ' + advice : 'AI Advice: ' + advice);
    setAiLoading(false);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const newVisit: Visit = {
      id: Date.now().toString(),
      patientId: patient.id,
      date: visitDate,
      symptoms,
      diagnosis,
      prescription: prescriptions,
      notes,
      fees
    };

    StorageService.addVisit(newVisit);
    setVisits(StorageService.getVisits(patient.id));
    setShowVisitForm(false);
    // Reset form
    setSymptoms('');
    setDiagnosis('');
    setNotes('');
    setPrescriptions([]);
    setFees(0);
    setAiAdvice('');
  };

  const sendWhatsAppReceipt = (visit: Visit) => {
    if (!patient) return;
    const medicines = visit.prescription.map(p => `${p.medicineName} (${p.dosage})`).join(', ');
    const message = `
*${CLINIC_NAME}*
Dr. Rupali Nilesh Kene (BHMS)

Hi ${patient.name},
Here is your visit summary for ${visit.date}.

*Diagnosis:* ${visit.diagnosis}
*Medicines:* ${medicines}
*Fees Paid:* ₹${visit.fees}

Take care!
    `.trim();
    
    const url = `https://wa.me/91${patient.mobile}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!patient) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to Patients
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
            <span>{patient.age} Years</span>
            <span>•</span>
            <span>{patient.gender}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Pill size={14} className="text-red-400"/> {patient.bloodGroup || 'N/A'}</span>
            <span>•</span>
            <span>{patient.mobile}</span>
          </div>
          {(patient.allergies || patient.chronicConditions) && (
            <div className="mt-3 flex gap-2">
              {patient.allergies && <span className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-100">Allergy: {patient.allergies}</span>}
              {patient.chronicConditions && <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs font-bold border border-orange-100">{patient.chronicConditions}</span>}
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowVisitForm(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
        >
          <Plus size={20} /> Add New Visit
        </button>
      </div>

      {/* New Visit Form */}
      {showVisitForm && (
        <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <StethoscopeIcon className="text-teal-600" /> New Consultation
            </h3>
            <button onClick={() => setShowVisitForm(false)} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20}/></button>
          </div>

          <form onSubmit={handleSaveVisit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                 <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
                 <input value={symptoms} onChange={e => setSymptoms(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. Fever, Headache, Cold" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
              <div className="flex gap-2">
                <input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="e.g. Viral Fever" />
                <button 
                  type="button" 
                  onClick={handleGenerateAdvice} 
                  disabled={aiLoading || !diagnosis}
                  className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg border border-purple-100 hover:bg-purple-100 flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles size={16} /> {aiLoading ? 'Thinking...' : 'AI Advice'}
                </button>
              </div>
            </div>

            {/* Prescriptions */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div className="flex justify-between items-center mb-4">
                 <h4 className="font-semibold text-slate-700">Rx Prescription</h4>
                 <button type="button" onClick={addPrescriptionRow} className="text-sm text-teal-600 font-medium hover:underline">+ Add Medicine</button>
               </div>
               
               {prescriptions.length === 0 && <p className="text-sm text-slate-400 italic text-center py-2">No medicines added yet.</p>}

               <div className="space-y-3">
                 {prescriptions.map((p, idx) => (
                   <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-4">
                        <input placeholder="Medicine Name" value={p.medicineName} onChange={e => updatePrescription(idx, 'medicineName', e.target.value)} className="w-full p-2 text-sm border rounded" />
                      </div>
                      <div className="md:col-span-3">
                        <select value={p.dosage} onChange={e => updatePrescription(idx, 'dosage', e.target.value)} className="w-full p-2 text-sm border rounded">
                           {PRESET_DOSAGES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                         <input placeholder="Duration" value={p.duration} onChange={e => updatePrescription(idx, 'duration', e.target.value)} className="w-full p-2 text-sm border rounded" />
                      </div>
                       <div className="md:col-span-2">
                         <input placeholder="Instruction" value={p.instruction} onChange={e => updatePrescription(idx, 'instruction', e.target.value)} className="w-full p-2 text-sm border rounded" />
                      </div>
                      <div className="md:col-span-1 text-center">
                        <button type="button" onClick={() => removePrescription(idx)} className="text-red-400 hover:text-red-600"><XIcon /></button>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes / Advice</label>
                <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded-lg" placeholder="Private notes..." />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fees (₹)</label>
                 <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full p-2 border rounded-lg text-lg font-semibold text-slate-800" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
               <button type="button" onClick={() => setShowVisitForm(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
               <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg flex items-center gap-2">
                 <Save size={18} /> Save Record
               </button>
            </div>
          </form>
        </div>
      )}

      {/* History Timeline */}
      <h3 className="text-lg font-bold text-slate-800 mb-4">Visit History</h3>
      <div className="space-y-6">
        {visits.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
             <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
             <p className="text-slate-500">No previous visits recorded.</p>
          </div>
        ) : (
          visits.map(visit => (
            <div key={visit.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
                      <Calendar size={14} /> {visit.date}
                    </div>
                    <h4 className="text-lg font-bold text-slate-800">{visit.diagnosis || 'Routine Checkup'}</h4>
                 </div>
                 <div className="text-right">
                    <span className="block text-xl font-bold text-slate-800">₹{visit.fees}</span>
                    <button 
                      onClick={() => sendWhatsAppReceipt(visit)}
                      className="mt-2 text-green-600 text-xs font-medium flex items-center gap-1 hover:underline"
                    >
                      <MessageCircle size={12} /> Send WhatsApp
                    </button>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <h5 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Symptoms & Notes</h5>
                    <p className="text-sm text-slate-700 mb-2"><span className="font-semibold">Symptoms:</span> {visit.symptoms}</p>
                    {visit.notes && <p className="text-sm text-slate-600 bg-yellow-50 p-2 rounded border border-yellow-100 whitespace-pre-line">{visit.notes}</p>}
                 </div>
                 <div>
                    <h5 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Prescription</h5>
                    <ul className="space-y-2">
                      {visit.prescription.map((p, i) => (
                        <li key={i} className="text-sm text-slate-700 flex justify-between border-b border-slate-50 pb-1 last:border-0">
                          <span><span className="font-medium">{p.medicineName}</span> <span className="text-slate-400 text-xs">({p.dosage})</span></span>
                          <span className="text-slate-500 text-xs">{p.duration}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const StethoscopeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 0 0 5 2h14a.3.3 0 0 0 .2.3v3.3a.3.3 0 0 0-.2.3v0a.3.3 0 0 0-.2.3c-.5.1-1 .3-1.4.7l-.1.1c-1 1.2-2.3 1.9-3.7 2.1V12h0v0c0 1.1-.9 2-2 2h0a2 2 0 0 1-2-2v0-2.8c-1.4-.2-2.7-.9-3.7-2.1l-.1-.1a2.8 2.8 0 0 1-1.4-.7.3.3 0 0 0-.2-.3v0a.3.3 0 0 0-.2-.3V2.3zM8 14v1a4 4 0 0 0 8 0v-1"/><circle cx="12" cy="19" r="2"/></svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default PatientDetails;