export type Language = 'om' | 'en' | 'am';

export interface SubjectScore {
  afaanOromoo: number;
  english: number;
  herrega: number; // Mathematics
  saayinsii: number; // General/Environmental Science
  hawaasaa: number; // Social Studies
  lammummaa: number; // Citizenship
  ict: number; // Information Communication Tech
  fayyaaQaamaa: number; // Health & Physical Education
  aartii: number; // Performing & Visual Arts
}

export interface StudentRecord {
  id: string;
  rollNumber: string;
  name: string;
  gender: 'Dhiira' | 'Dubara'; // Male / Female
  grade: string; // e.g. "Kutaa 1" through "Kutaa 12"
  section: string; // e.g. "A", "B", "C"
  semester: 'Semesteera 1ffaa' | 'Semesteera 2ffaa';
  academicYear: string;
  scores: SubjectScore;
  total: number;
  average: number;
  status: 'Darbe' | 'Kuwe'; // Pass / Fail
  conduct: 'Baay\'ee Gaarii' | 'Gaarii' | 'Giddugaleessa'; // Excellent, Good, Satisfactory
  attendanceDays: number;
  absentDays: number;
  teacherRemarks?: string;
  // Private school fee status
  monthlyFee: number; // in ETB (e.g. 1500 ETB)
  feePlan: 'Ji\'aa' | 'Simisteera' | 'Ji\'a 10'; // Monthly, Semester, 10-Months
  paidMonths: string[]; // e.g. ["Fulbaana", "Onkoloolessa", "Sadaasa"]
  totalFeePaid: number;
  remainingBalance: number;
  feeStatus: 'Kaffalameera' | 'Walakkaa' | 'Hin Kaffalle'; // Paid, Partial, Unpaid
  telebirrId?: string; // Latest / primary Telebirr Transaction ID if paid via Telebirr
  createdAt: string;
}

export interface FeeReceipt {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  grade: string;
  section: string;
  feeType: 'Ji\'aa' | 'Simisteera' | 'Ji\'a 10' | 'Galmee' | 'Kan Biraa';
  forPeriod: string; // e.g. "Fulbaana - Onkoloolessa 2018"
  amountPaid: number;
  totalDue: number;
  remainingBalance: number;
  paymentMethod: 'Kash / Callaa' | 'Baankii / Telebirr' | 'CBE' | 'Telebirr' | 'Baankii' | 'Callaa';
  referenceNo?: string;
  telebirrId?: string; // Telebirr Transaction ID
  paidDate: string;
  cashierName: string;
  notes?: string;
}

export interface IncomeExpenseRecord {
  id: string;
  type: 'Galii' | 'Baasii'; // Income or Expense
  category: 
    | 'Kaffaltii Barumsaa' 
    | 'Kaffaltii Galmee' 
    | 'Gurgurtaa Kitaabaa' 
    | 'Mindaa Hojjettootaa' 
    | 'Kiree Manaa' 
    | 'Bishaan & Elektiriikii' 
    | 'Meeshaalee Kuusaa' 
    | 'Suphaa & Qulqullina' 
    | 'Gibira' 
    | 'Kan Biraa';
  amount: number;
  date: string;
  voucherNo: string;
  partyName: string; // Paid by or Paid to
  description: string;
  paymentMethod: 'Callaa' | 'Baankii' | 'Telebirr';
  recordedBy: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: 'Kitaabota' | 'Meeshaa Barsiisuu' | 'Meeshaa Barcumaa' | 'Meeshaa Barreessaa' | 'Laabooratorii' | 'Kan Biraa';
  quantity: number;
  unit: string;
  minThreshold: number;
  condition: 'Haaraa' | 'Hojirra Jira' | 'Suphaa Barbaada';
  lastUpdated: string;
  location?: string;
  notes?: string;
}

export interface StockTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'Galii' | 'Baasii';
  quantity: number;
  person: string;
  date: string;
  reason: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  role: 'Barsiisaa' | 'Registrar' | 'Admin' | 'Faayinaansii';
  messageOm: string;
  messageEn: string;
  messageAm: string;
  type: 'grade' | 'stock' | 'fee' | 'finance' | 'system' | 'announcement';
}
