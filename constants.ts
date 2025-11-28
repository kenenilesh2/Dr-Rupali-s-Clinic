export const CLINIC_NAME = "Shree Samarth Krupa Clinic";
export const DOCTOR_NAME = "Dr. Rupali Nilesh Kene";
export const DOCTOR_DEGREE = "BHMS";
export const DOCTOR_MOBILE = "919876543210"; // Placeholder, normally configurable
export const CURRENCY_SYMBOL = "₹";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export const PRESET_DOSAGES = [
  "1-0-1 (Morning-Night)",
  "1-1-1 (Morning-Afternoon-Night)",
  "1-0-0 (Morning only)",
  "0-0-1 (Night only)",
  "4 pills - 3 times a day",
  "SOS (As needed)"
];

// New: Common disease templates to speed up prescribing
export const DISEASE_PRESETS = {
  "Viral Fever": [
    { medicineName: "Arsenic Alb 30", dosage: "4 pills - 3 times a day", duration: "3 days", instruction: "Before food" },
    { medicineName: "Eupatorium Perf 200", dosage: "1-0-1", duration: "3 days", instruction: "For body ache" }
  ],
  "Common Cold/Coryza": [
    { medicineName: "Allium Cepa 30", dosage: "4 pills - 3 times a day", duration: "3 days", instruction: "If runny nose" },
    { medicineName: "Arsenic Alb 30", dosage: "1-0-1", duration: "3 days", instruction: "After food" }
  ],
  "Acidity/Gas": [
    { medicineName: "Nux Vomica 200", dosage: "0-0-1 (Night only)", duration: "5 days", instruction: "Before sleep" },
    { medicineName: "Carbo Veg 30", dosage: "SOS (As needed)", duration: "3 days", instruction: "When bloated" }
  ],
  "Injury/Trauma": [
    { medicineName: "Arnica Mont 200", dosage: "1-0-1", duration: "3 days", instruction: "After food" }
  ]
};