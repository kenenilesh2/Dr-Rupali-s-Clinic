
import { supabase } from './supabaseClient';
import { Patient, Visit, Appointment, AppointmentStatus, InventoryItem, Expense } from '../types';

// Helper to map DB snake_case to app camelCase
const mapPatientFromDB = (p: any): Patient => ({
  id: p.id,
  name: p.name,
  mobile: p.mobile,
  age: p.age,
  gender: p.gender,
  bloodGroup: p.blood_group,
  address: p.address,
  allergies: p.allergies,
  chronicConditions: p.chronic_conditions,
  registeredDate: p.created_at,
});

const mapVisitFromDB = (v: any): Visit => ({
  id: v.id,
  patientId: v.patient_id,
  date: v.date,
  symptoms: v.symptoms,
  diagnosis: v.diagnosis,
  prescription: v.prescription || [],
  notes: v.notes,
  fees: Number(v.fees),
});

const mapAppointmentFromDB = (a: any): Appointment => ({
  id: a.id,
  patientName: a.patient_name,
  patientId: a.patient_id,
  mobile: a.mobile,
  date: a.date,
  time: a.time,
  status: a.status as AppointmentStatus,
  type: a.type as 'Online' | 'Walk-in',
  notes: a.notes,
});

const mapInventoryFromDB = (i: any): InventoryItem => ({
  id: i.id,
  name: i.name,
  potency: i.potency,
  type: i.type,
  quantity: i.quantity,
  minLevel: i.min_level,
  updatedAt: i.updated_at
});

const mapExpenseFromDB = (e: any): Expense => ({
  id: e.id,
  title: e.title,
  amount: e.amount,
  category: e.category,
  date: e.date,
  notes: e.notes
});

export const StorageService = {
  // Patients
  getPatients: async (): Promise<Patient[]> => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
    return data.map(mapPatientFromDB);
  },
  
  savePatient: async (patient: Partial<Patient>): Promise<Patient | null> => {
    const dbPayload = {
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.bloodGroup,
      address: patient.address,
      allergies: patient.allergies,
      chronic_conditions: patient.chronicConditions,
    };

    const { data, error } = await supabase
      .from('patients')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error saving patient:', error);
      return null;
    }
    return mapPatientFromDB(data);
  },

  updatePatient: async (id: string, patient: Partial<Patient>): Promise<boolean> => {
     const dbPayload = {
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      blood_group: patient.bloodGroup,
      address: patient.address,
      allergies: patient.allergies,
      chronic_conditions: patient.chronicConditions,
    };
    const { error } = await supabase.from('patients').update(dbPayload).eq('id', id);
    return !error;
  },

  deletePatient: async (id: string) => {
    // Delete visits first due to foreign key constraints usually, though Supabase might cascade if configured.
    // We'll try deleting patient directly.
    await supabase.from('visits').delete().eq('patient_id', id);
    await supabase.from('patients').delete().eq('id', id);
  },

  // Visits
  getVisits: async (patientId?: string): Promise<Visit[]> => {
    let query = supabase.from('visits').select('*').order('date', { ascending: false });
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) return [];
    return data.map(mapVisitFromDB);
  },

  addVisit: async (visit: Partial<Visit>) => {
    const dbPayload = {
      patient_id: visit.patientId,
      date: visit.date,
      symptoms: visit.symptoms,
      diagnosis: visit.diagnosis,
      prescription: visit.prescription,
      notes: visit.notes,
      fees: visit.fees,
    };

    const { error } = await supabase.from('visits').insert([dbPayload]);
    if (error) console.error('Error adding visit:', error);
  },

  // Appointments
  getAppointments: async (): Promise<Appointment[]> => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    
    if (error) return [];
    return data.map(mapAppointmentFromDB);
  },

  saveAppointment: async (appointment: Partial<Appointment>) => {
    const dbPayload = {
      patient_name: appointment.patientName,
      patient_id: appointment.patientId || null,
      mobile: appointment.mobile,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      type: appointment.type,
      notes: appointment.notes
    };

    if (appointment.id) {
        // Update
        const { error } = await supabase.from('appointments').update(dbPayload).eq('id', appointment.id);
        if (error) console.error(error);
    } else {
        // Insert
        const { error } = await supabase.from('appointments').insert([dbPayload]);
        if (error) console.error(error);
    }
  },

  updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
    await supabase.from('appointments').update({ status }).eq('id', id);
  },

  deleteAppointment: async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
  },

  // Inventory
  getInventory: async (): Promise<InventoryItem[]> => {
    const { data, error } = await supabase.from('inventory').select('*').order('name');
    if (error) return [];
    return data.map(mapInventoryFromDB);
  },

  saveInventoryItem: async (item: Partial<InventoryItem>) => {
    const payload = {
      name: item.name,
      potency: item.potency,
      type: item.type,
      quantity: item.quantity,
      min_level: item.minLevel
    };

    if (item.id) {
      await supabase.from('inventory').update(payload).eq('id', item.id);
    } else {
      await supabase.from('inventory').insert([payload]);
    }
  },

  deleteInventoryItem: async (id: string) => {
    await supabase.from('inventory').delete().eq('id', id);
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) return [];
    return data.map(mapExpenseFromDB);
  },

  addExpense: async (expense: Partial<Expense>) => {
    const payload = {
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes
    };
    await supabase.from('expenses').insert([payload]);
  },

  deleteExpense: async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
  },

  // Stats
  getStats: async () => {
    const { count: patientCount } = await supabase.from('patients').select('*', { count: 'exact', head: true });
    const { count: visitCount } = await supabase.from('visits').select('*', { count: 'exact', head: true });
    
    const todayStr = new Date().toISOString().split('T')[0];
    const { count: todayApptCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('date', todayStr)
        .neq('status', AppointmentStatus.Cancelled);

    // Calculate revenue 
    const { data: visits } = await supabase.from('visits').select('fees');
    const totalRevenue = visits ? visits.reduce((sum, v) => sum + (Number(v.fees) || 0), 0) : 0;

    // Calculate low stock items (doing client side filtering for simplicity or can do SQL query)
    const { data: inventory } = await supabase.from('inventory').select('quantity, min_level');
    const lowStockItems = inventory ? inventory.filter((i: any) => i.quantity <= i.min_level).length : 0;

    return {
      totalPatients: patientCount || 0,
      totalVisits: visitCount || 0,
      todayAppointments: todayApptCount || 0,
      totalRevenue,
      lowStockItems
    };
  }
};
