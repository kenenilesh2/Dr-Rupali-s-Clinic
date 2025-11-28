import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storageService';
import { Patient, Visit, PrescriptionItem } from '../types';
import { GeminiService } from '../services/geminiService';
import { ArrowLeft, Calendar, FileText, Pill, Plus, Save, Sparkles, MessageCircle, AlertCircle, Loader2, History, Activity, Clock, Mic, Printer, FileCheck } from 'lucide-react';
import { PRESET_DOSAGES, DISEASE_PRESETS, CLINIC_NAME, DOCTOR_NAME, DOCTOR_DEGREE } from '../constants';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Visit Form State
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [fees, setFees] = useState<number>(0);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  
  // AI & Tools State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [listeningField, setListeningField] = useState<string | null>(null);
  
  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);
  const [certType, setCertType] = useState<'Sick' | 'Fitness'>('Sick');
  const [certDays, setCertDays] = useState(2);

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (patientId: string) => {
    setLoading(true);
    try {
      const allPatients = await StorageService.getPatients();
      const p = allPatients.find(p => p.id === patientId);
      
      if (p) {
        setPatient(p);
        const patientVisits = await StorageService.getVisits(patientId);
        setVisits(patientVisits);
      } else {
        navigate('/patients');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- Voice Dictation Logic ---
  const startListening = (fieldSetter: (val: string) => void, currentVal: string, fieldName: string) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }
    
    setListeningField(fieldName);
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // Can be changed to 'en-IN'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // Append to existing text
      const newVal = currentVal ? `${currentVal} ${transcript}` : transcript;
      fieldSetter(newVal);
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

  // --- Prescription Logic ---
  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicineName: '', dosage: PRESET_DOSAGES[0], duration: '3 days', instruction: 'After food' }]);
  };

  const applyPreset = (diseaseName: string) => {
    const presetMeds = DISEASE_PRESETS[diseaseName as keyof typeof DISEASE_PRESETS];
    if (presetMeds) {
      setPrescriptions([...prescriptions, ...presetMeds]);
    }
  };

  const updatePrescription = (index: number, field: keyof PrescriptionItem, value: string) => {
    const newPrescriptions = [...prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setPrescriptions(newPrescriptions);
  };

  const removePrescription = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // --- AI Advice ---
  const handleGenerateAdvice = async () => {
    if (!symptoms || !diagnosis) return;
    setAiLoading(true);
    const advice = await GeminiService.getHealthAdvice(symptoms, diagnosis);
    setAiAdvice(advice);
    setNotes(prev => prev ? prev + '\n\nAI Advice: ' + advice : 'AI Advice: ' + advice);
    setAiLoading(false);
  };

  // --- Save Visit ---
  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    setSaving(true);
    const newVisit: Partial<Visit> = {
      patientId: patient.id,
      date: visitDate,
      symptoms,
      diagnosis,
      prescription: prescriptions,
      notes,
      fees
    };

    await StorageService.addVisit(newVisit);
    
    // Refresh visits
    const updatedVisits = await StorageService.getVisits(patient.id);
    setVisits(updatedVisits);
    
    setSaving(false);
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
${DOCTOR_NAME} (${DOCTOR_DEGREE})

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

  const printCertificate = () => {
    window.print();
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;
  if (!patient) return null;

  const isReturningPatient = visits.length > 0;
  const lastVisit = isReturningPatient ? visits[0] : null;
  const uniquePastDiagnoses = Array.from(new Set(visits.map(v => v.diagnosis).filter(Boolean))).slice(0, 5);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 no-print">
        <button onClick={() => navigate('/patients')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={18} /> Back to Patients
        </button>
        <button 
          onClick={() => setShowCertModal(true)} 
          className="bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm"
        >
          <FileCheck size={16} /> Generate Certificate
        </button>
      </div>

      {/* Header Profile */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6 relative overflow-hidden no-print">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-slate-800">{patient.name}</h1>
                {isReturningPatient ? (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 flex items-center gap-1">
                    <History size={12} /> Returning Patient
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1">
                    <Sparkles size={12} /> New Patient
                  </span>
                )}
             </div>
            
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
              <span>{patient.age} Years</span>
              <span>•</span>
              <span>{patient.gender}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Pill size={14} className="text-red-400"/> {patient.bloodGroup || 'N/A'}</span>
              <span>•</span>
              <span>{patient.mobile}</span>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
               <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                 <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Total Visits</span>
                 <span className="text-slate-800 font-semibold text-sm">{visits.length}</span>
               </div>
               {lastVisit && (
                 <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs">
                    <span className="text-slate-400 block uppercase tracking-wider text-[10px] font-bold">Last Visited</span>
                    <span className="text-slate-800 font-semibold text-sm">{lastVisit.date}</span>
                 </div>
               )}
            </div>
          </div>

          <button 
            onClick={() => setShowVisitForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm flex items-center gap-2"
          >
            <Plus size={20} /> Add New Visit
          </button>
        </div>
      </div>

      {/* Medical Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 no-print">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <Activity size={16} /> Medical Profile
           </h3>
           <div className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Chronic Conditions</span>
                {patient.chronicConditions ? (
                  <p className="text-sm text-slate-800 bg-orange-50 p-2 rounded border border-orange-100">{patient.chronicConditions}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No chronic conditions recorded.</p>
                )}
              </div>
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Allergies</span>
                 {patient.allergies ? (
                  <p className="text-sm text-slate-800 bg-red-50 p-2 rounded border border-red-100">{patient.allergies}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No known allergies.</p>
                )}
              </div>
           </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
             <History size={16} /> Past Diagnoses Summary
           </h3>
           {uniquePastDiagnoses.length > 0 ? (
             <div className="flex flex-wrap gap-2">
               {uniquePastDiagnoses.map((diag, i) => (
                 <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                   {diag}
                 </span>
               ))}
             </div>
           ) : (
             <p className="text-sm text-slate-400 italic">No past diagnoses available.</p>
           )}
        </div>
      </div>

      {/* New Visit Form */}
      {showVisitForm && (
        <div className="bg-white rounded-xl shadow-lg border border-teal-100 p-6 mb-8 animate-in fade-in slide-in-from-top-4 no-print">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <StethoscopeIcon className="text-teal-600" /> New Consultation
            </h3>
            <button onClick={() => setShowVisitForm(false)} className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20}/></button>
          </div>

          {/* Context Alert for Doctor */}
          {lastVisit && (
            <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-blue-500 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-blue-800">Last Visit Context</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Patient last visited on <strong>{lastVisit.date}</strong> for <strong>{lastVisit.diagnosis}</strong>.
                  <br/>
                  <span className="text-xs opacity-80">Prescribed: {lastVisit.prescription.map(p => p.medicineName).join(', ')}</span>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSaveVisit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                 <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} className="w-full p-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2 relative">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Symptoms</label>
                 <div className="relative">
                   <input 
                     value={symptoms} 
                     onChange={e => setSymptoms(e.target.value)} 
                     className="w-full p-2 pr-10 border rounded-lg" 
                     placeholder="e.g. Fever, Headache, Cold" 
                   />
                   <button 
                    type="button" 
                    onClick={() => startListening(setSymptoms, symptoms, 'symptoms')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'symptoms' ? 'text-red-500 animate-pulse' : ''}`}
                    title="Speak to type"
                   >
                     <Mic size={18} />
                   </button>
                 </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <input 
                    value={diagnosis} 
                    onChange={e => setDiagnosis(e.target.value)} 
                    className="w-full p-2 pr-10 border rounded-lg" 
                    placeholder="e.g. Viral Fever" 
                  />
                  <button 
                    type="button" 
                    onClick={() => startListening(setDiagnosis, diagnosis, 'diagnosis')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${listeningField === 'diagnosis' ? 'text-red-500 animate-pulse' : ''}`}
                    title="Speak to type"
                   >
                     <Mic size={18} />
                   </button>
                </div>
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
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                 <h4 className="font-semibold text-slate-700">Rx Prescription</h4>
                 <div className="flex gap-2">
                    <select 
                      className="text-xs border border-slate-300 rounded p-1.5 bg-white text-slate-600"
                      onChange={(e) => { applyPreset(e.target.value); e.target.value = ''; }}
                    >
                      <option value="">Load Preset...</option>
                      {Object.keys(DISEASE_PRESETS).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                    <button type="button" onClick={addPrescriptionRow} className="text-xs bg-white border border-slate-300 px-2 py-1.5 rounded text-teal-600 font-medium hover:bg-teal-50">+ Add Medicine</button>
                 </div>
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
                <div className="relative">
                    <textarea 
                        rows={3} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        className="w-full p-2 border rounded-lg" 
                        placeholder="Private notes..." 
                    />
                    <button 
                    type="button" 
                    onClick={() => startListening(setNotes, notes, 'notes')}
                    className={`absolute right-2 bottom-2 text-slate-400 hover:text-teal-600 ${listeningField === 'notes' ? 'text-red-500 animate-pulse' : ''}`}
                    title="Speak to type"
                   >
                     <Mic size={18} />
                   </button>
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Consultation Fees (₹)</label>
                 <input type="number" value={fees} onChange={e => setFees(Number(e.target.value))} className="w-full p-2 border rounded-lg text-lg font-semibold text-slate-800" />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
               <button type="button" onClick={() => setShowVisitForm(false)} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
               <button type="submit" disabled={saving} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg flex items-center gap-2">
                 {saving ? <Loader2 className="animate-spin" /> : <Save size={18} />} Save Record
               </button>
            </div>
          </form>
        </div>
      )}

      {/* History Timeline */}
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 no-print">
        <Clock size={18} className="text-slate-500" /> Visit History
      </h3>
      <div className="space-y-6 no-print">
        {visits.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
             <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
             <p className="text-slate-500">No previous visits recorded.</p>
          </div>
        ) : (
          visits.map(visit => (
            <div key={visit.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden transition-all hover:shadow-md">
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

      {/* Certificate Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Generate Certificate</h3>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
            </div>
            <div className="p-6">
               <div className="flex gap-4 mb-6">
                  <div className={`flex-1 p-4 border rounded-lg cursor-pointer ${certType === 'Sick' ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`} onClick={() => setCertType('Sick')}>
                    <div className="font-bold text-slate-800">Sick Leave</div>
                    <div className="text-xs text-slate-500">For rest/absence from work</div>
                  </div>
                  <div className={`flex-1 p-4 border rounded-lg cursor-pointer ${certType === 'Fitness' ? 'border-teal-500 bg-teal-50' : 'border-slate-200'}`} onClick={() => setCertType('Fitness')}>
                    <div className="font-bold text-slate-800">Fitness Certificate</div>
                    <div className="text-xs text-slate-500">Fit to resume duties</div>
                  </div>
               </div>

               <div className="mb-4">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Number of Days / Rest Date</label>
                 <input type="number" value={certDays} onChange={(e) => setCertDays(Number(e.target.value))} className="w-full p-2 border rounded-lg" />
               </div>

               <button onClick={printCertificate} className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 flex items-center justify-center gap-2">
                 <Printer size={18} /> Print / Save PDF
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Only Section for Certificate */}
      <div className="hidden print:block fixed inset-0 bg-white z-[100] p-12 text-black">
        <div className="border-2 border-black p-8 h-full relative">
          <div className="text-center border-b-2 border-black pb-4 mb-8">
            <h1 className="text-4xl font-serif font-bold mb-2">{CLINIC_NAME}</h1>
            <h2 className="text-xl font-bold">{DOCTOR_NAME}</h2>
            <p className="text-sm">{DOCTOR_DEGREE} | Reg. No: 123456</p>
            <p className="text-sm mt-1">Mobile: {patient.mobile}</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold underline uppercase tracking-widest">Medical Certificate</h2>
          </div>

          <div className="text-lg leading-loose font-serif">
            <p className="mb-4">
              This is to certify that <strong>{patient.name}</strong>, aged <strong>{patient.age}</strong>, 
              is under my homeopathic treatment for <strong>{visits[0]?.diagnosis || 'Viral Affection'}</strong>.
            </p>
            
            {certType === 'Sick' ? (
              <p>
                He/She is advised rest for <strong>{certDays} days</strong> w.e.f <strong>{new Date().toLocaleDateString()}</strong>.
              </p>
            ) : (
              <p>
                He/She has recovered from illness and is fit to resume duties from <strong>{new Date().toLocaleDateString()}</strong>.
              </p>
            )}
          </div>

          <div className="absolute bottom-16 right-16 text-center">
             <p className="mb-8">__________________</p>
             <p className="font-bold">{DOCTOR_NAME}</p>
             <p className="text-sm">Signature</p>
          </div>

           <div className="absolute bottom-4 left-8 text-xs text-slate-500">
             Generated on {new Date().toLocaleDateString()}
          </div>
        </div>
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