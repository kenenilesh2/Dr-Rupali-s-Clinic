
export enum Gender {
  Male = 'Male',
  Female = 'Female',
  Other = 'Other'
}

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: Gender;
  bloodGroup?: string;
  address: string;
  allergies?: string;
  chronicConditions?: string;
  registeredDate: string;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string; // e.g., "1-0-1"
  duration: string; // e.g., "5 days"
  instruction: string; // e.g., "After food"
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescription: PrescriptionItem[];
  notes: string;
  fees: number;
  nextFollowUp?: string;
}

export enum AppointmentStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Appointment {
  id: string;
  patientName: string; // For unregistered patients or quick view
  patientId?: string; // Optional linkage to real patient
  mobile: string;
  date: string; // ISO Date string
  time: string; // "10:30"
  status: AppointmentStatus;
  type: 'Online' | 'Walk-in';
  notes?: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalVisits: number;
  todayAppointments: number;
  totalRevenue: number;
  lowStockItems: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  potency: string; // e.g. 30, 200, 1M, Q
  type: 'Dilution' | 'Mother Tincture' | 'Bio-Chemic' | 'Ointment' | 'Other';
  quantity: number;
  minLevel: number;
  updatedAt?: string;
}
