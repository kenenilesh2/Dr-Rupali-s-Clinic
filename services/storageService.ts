import { Patient, Visit, Appointment, AppointmentStatus } from '../types';

const KEYS = {
  PATIENTS: 'clinic_patients',
  VISITS: 'clinic_visits',
  APPOINTMENTS: 'clinic_appointments',
};

// Helper to simulate delay for realism if needed, but we'll keep it synchronous for UI responsiveness
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const StorageService = {
  // Patients
  getPatients: (): Patient[] => getFromStorage<Patient>(KEYS.PATIENTS),
  
  savePatient: (patient: Patient) => {
    const patients = getFromStorage<Patient>(KEYS.PATIENTS);
    const index = patients.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      patients[index] = patient;
    } else {
      patients.push(patient);
    }
    saveToStorage(KEYS.PATIENTS, patients);
  },

  deletePatient: (id: string) => {
    const patients = getFromStorage<Patient>(KEYS.PATIENTS).filter(p => p.id !== id);
    saveToStorage(KEYS.PATIENTS, patients);
    // Also cleanup visits
    const visits = getFromStorage<Visit>(KEYS.VISITS).filter(v => v.patientId !== id);
    saveToStorage(KEYS.VISITS, visits);
  },

  // Visits
  getVisits: (patientId?: string): Visit[] => {
    const visits = getFromStorage<Visit>(KEYS.VISITS);
    if (patientId) {
      return visits.filter(v => v.patientId === patientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return visits;
  },

  addVisit: (visit: Visit) => {
    const visits = getFromStorage<Visit>(KEYS.VISITS);
    visits.push(visit);
    saveToStorage(KEYS.VISITS, visits);
  },

  // Appointments
  getAppointments: (): Appointment[] => {
    return getFromStorage<Appointment>(KEYS.APPOINTMENTS).sort((a, b) => {
      // Sort by date then time
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  },

  saveAppointment: (appointment: Appointment) => {
    const appointments = getFromStorage<Appointment>(KEYS.APPOINTMENTS);
    const index = appointments.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      appointments[index] = appointment;
    } else {
      appointments.push(appointment);
    }
    saveToStorage(KEYS.APPOINTMENTS, appointments);
  },

  deleteAppointment: (id: string) => {
    const appointments = getFromStorage<Appointment>(KEYS.APPOINTMENTS).filter(a => a.id !== id);
    saveToStorage(KEYS.APPOINTMENTS, appointments);
  },

  // Stats
  getStats: () => {
    const patients = getFromStorage<Patient>(KEYS.PATIENTS);
    const visits = getFromStorage<Visit>(KEYS.VISITS);
    const appointments = getFromStorage<Appointment>(KEYS.APPOINTMENTS);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === todayStr && a.status !== AppointmentStatus.Cancelled).length;
    const totalRevenue = visits.reduce((sum, v) => sum + (Number(v.fees) || 0), 0);

    return {
      totalPatients: patients.length,
      totalVisits: visits.length,
      todayAppointments,
      totalRevenue
    };
  }
};