import React, { useState } from 'react';
import { Language, StudentRecord, FeeReceipt, IncomeExpenseRecord } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  DollarSign, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Trash2,
  Wallet,
  Zap,
  Package,
  Building,
  Wrench,
  Download,
  Filter,
  Sparkles,
  Send,
  Info,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

interface FinancePanelProps {
  lang: Language;
  students: StudentRecord[];
  receipts: FeeReceipt[];
  transactions: IncomeExpenseRecord[];
  onRecordFeePayment: (
    studentId: string,
    payment: {
      amountPaid: number;
      feeType: FeeReceipt['feeType'];
      forPeriod: string;
      paymentMethod: FeeReceipt['paymentMethod'];
      referenceNo?: string;
      telebirrId?: string;
      paidMonths: string[];
      cashierName: string;
      notes?: string;
    }
  ) => void;
  onAddTransaction: (tx: Omit<IncomeExpenseRecord, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onViewReceiptAttachment: (receipt: FeeReceipt) => void;
  onSendReportToAdmin?: (memo: string) => void;
}

export const FinancePanel: React.FC<FinancePanelProps> = ({
  lang,
  students,
  receipts,
  transactions,
  onRecordFeePayment,
  onAddTransaction,
  onDeleteTransaction,
  onViewReceiptAttachment,
  onSendReportToAdmin,
}) => {
  const t = getTranslation(lang);

  // Department report to Admin modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');

  // Active sub-tab: 'fees' (Student Tuition) vs 'telebirr' (Telebirr Fee Reports) vs 'ledger' (School Income/Expense)
  const [activeSubTab, setActiveSubTab] = useState<'fees' | 'telebirr' | 'ledger'>('fees');

  // Search & Filters for Tuition
  const [studentSearch, setStudentSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');

  // Search & Filters for Telebirr Report
  const [telebirrSearch, setTelebirrSearch] = useState('');
  const [telebirrGradeFilter, setTelebirrGradeFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Student Payment Form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [feePlanType, setFeePlanType] = useState<FeeReceipt['feeType']>('Ji\'aa');
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['Fulbaana']);
  const [payAmount, setPayAmount] = useState('1600');
  const [payMethod, setPayMethod] = useState<FeeReceipt['paymentMethod']>('Telebirr');
  const [payRefNo, setPayRefNo] = useState('');
  const [payTelebirrId, setPayTelebirrId] = useState('');
  const [cashierName, setCashierName] = useState('Darajjee Tasfaayee');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Institutional Transaction Form state (Galii fi Baasii)
  const [txType, setTxType] = useState<'Galii' | 'Baasii'>('Galii');
  const [txCategory, setTxCategory] = useState<IncomeExpenseRecord['category']>('Kaffaltii Barumsaa');
  const [txAmount, setTxAmount] = useState('');
  const [txParty, setTxParty] = useState('');
  const [txVoucher, setTxVoucher] = useState(`YY-VCH-${Math.floor(100 + Math.random() * 900)}`);
  const [txDesc, setTxDesc] = useState('');
  const [txMethod, setTxMethod] = useState<'Callaa' | 'Baankii' | 'Telebirr'>('Callaa');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Ledger Filter & Date Tracking
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'Galii' | 'Baasii'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilterMode, setDateFilterMode] = useState<'all' | 'this_month' | 'last_month' | 'last_30_days'>('all');
  const [ledgerSearch, setLedgerSearch] = useState('');

  // Calculations for Financial KPIs
  const totalIncome = transactions
    .filter((t) => t.type === 'Galii')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const totalUnpaidTuition = students.reduce((sum, s) => sum + s.remainingBalance, 0);
  const totalCollectedTuition = students.reduce((sum, s) => sum + s.totalFeePaid, 0);

  // Operational Category Spending Totals for Quick Inspection
  const utilitiesTotal = transactions
    .filter((t) => t.category === 'Bishaan & Elektiriikii' && t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  const suppliesTotal = transactions
    .filter((t) => t.category === 'Meeshaalee Kuusaa' && t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  const salariesTotal = transactions
    .filter((t) => t.category === 'Mindaa Hojjettootaa' && t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  const rentMaintenanceTotal = transactions
    .filter((t) => (t.category === 'Kiree Manaa' || t.category === 'Suphaa & Qulqullina') && t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  // Quick Preset Helper for Common School Income/Expense
  const handleApplyPreset = (preset: 'utilities' | 'supplies' | 'salary' | 'rent' | 'maintenance' | 'books') => {
    if (preset === 'utilities') {
      setTxType('Baasii');
      setTxCategory('Bishaan & Elektiriikii');
      setTxParty(lang === 'om' ? 'Tajaajila Elektiriikii & Bishaan Aanaa Yooyyaa' : lang === 'am' ? 'የዮያ ወረዳ የውሃና መብራት አገልግሎት' : 'Yooyyaa District Water & Power Utility');
      setTxDesc(lang === 'om' ? 'Biilii bishaanii fi humna ibsaa ji\'aa' : lang === 'am' ? 'የወሩ የውሃና መብራት ክፍያ' : 'Monthly water & electricity utility bill');
      setTxAmount('1950');
      setTxMethod('Telebirr');
    } else if (preset === 'supplies') {
      setTxType('Baasii');
      setTxCategory('Meeshaalee Kuusaa');
      setTxParty(lang === 'om' ? 'Dukaana Meeshaa Barreessaa Yooyyaa' : lang === 'am' ? 'የትምህርት መርጃ ዕቃዎች መደብር' : 'Educational Stationery Store');
      setTxDesc(lang === 'om' ? 'Bittaa shookii, dabtara qorannoo, fi qalama barsiisotaa' : lang === 'am' ? 'የኖራ፣ የፈተና ደብተር እና ስክሪብቶ ግዢ' : 'Stationery, chalk, and exam registers purchase');
      setTxAmount('4500');
      setTxMethod('Callaa');
    } else if (preset === 'salary') {
      setTxType('Baasii');
      setTxCategory('Mindaa Hojjettootaa');
      setTxParty(lang === 'om' ? 'Barsiisota & Hojjettoota Mana Barnootaa' : lang === 'am' ? 'መምህራን እና ሠራተኞች' : 'Teachers & Staff Payroll');
      setTxDesc(lang === 'om' ? 'Mindaa ji\'aa kan barsiisotaa fi eegdotaa' : lang === 'am' ? 'የወር ደመወዝ ክፍያ' : 'Monthly teachers & support staff salaries');
      setTxAmount('28000');
      setTxMethod('Baankii');
    } else if (preset === 'rent') {
      setTxType('Baasii');
      setTxCategory('Kiree Manaa');
      setTxParty(lang === 'om' ? 'Abbaa Qabeenyaa Gamoo (Yooyyaa)' : lang === 'am' ? 'የሕንፃው አከራይ' : 'School Facility Landlord');
      setTxDesc(lang === 'om' ? 'Kiree gamoo kutaalee barnootaa ji\'aa' : lang === 'am' ? 'የትምህርት ክፍሎች የሕንፃ ኪራይ' : 'Classroom facilities monthly lease');
      setTxAmount('12000');
      setTxMethod('Baankii');
    } else if (preset === 'maintenance') {
      setTxType('Baasii');
      setTxCategory('Suphaa & Qulqullina');
      setTxParty(lang === 'om' ? 'Ogeessa Suphaa Mukaa fi Sibiilaa' : lang === 'am' ? 'የጥገና እና ፅዳት ሠራተኛ' : 'Carpentry & Maintenance Worker');
      setTxDesc(lang === 'om' ? 'Suphaa barcuma barattootaa fi balbala' : lang === 'am' ? 'የተማሪዎች ወንበርና ጠረጴዛ ጥገና' : 'Student desks & facility repairs');
      setTxAmount('2200');
      setTxMethod('Callaa');
    } else if (preset === 'books') {
      setTxType('Galii');
      setTxCategory('Gurgurtaa Kitaabaa');
      setTxParty(lang === 'om' ? 'Barattoota & Maatii' : lang === 'am' ? 'ተማሪዎችና ወላጆች' : 'Students & Parents');
      setTxDesc(lang === 'om' ? 'Gurgurtaa moojulii fi kitaabota dabalataa' : lang === 'am' ? 'የትምህርት መጻሕፍትና ሞጁሎች ሽያጭ' : 'Supplementary curriculum modules sales');
      setTxAmount('8400');
      setTxMethod('Telebirr');
    }
  };

  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setTxDate(d.toISOString().split('T')[0]);
  };

  // Month checklist options (10 Academic Months)
  const academicMonths = [
    { om: 'Fulbaana', en: 'September', am: 'መስከረም', shortOm: 'Ful', shortEn: 'Sep', shortAm: 'መስ' },
    { om: 'Onkoloolessa', en: 'October', am: 'ጥቅምት', shortOm: 'Onk', shortEn: 'Oct', shortAm: 'ጥቅ' },
    { om: 'Sadaasa', en: 'November', am: 'ኅዳር', shortOm: 'Sad', shortEn: 'Nov', shortAm: 'ኅዳ' },
    { om: 'Muddee', en: 'December', am: 'ታኅሣሥ', shortOm: 'Mud', shortEn: 'Dec', shortAm: 'ታኅ' },
    { om: 'Amajjii', en: 'January', am: 'ጥር', shortOm: 'Ama', shortEn: 'Jan', shortAm: 'ጥር' },
    { om: 'Guraandhala', en: 'February', am: 'የካቲት', shortOm: 'Gur', shortEn: 'Feb', shortAm: 'የካ' },
    { om: 'Bitooteessa', en: 'March', am: 'መጋቢት', shortOm: 'Bit', shortEn: 'Mar', shortAm: 'መጋ' },
    { om: 'Ebla', en: 'April', am: 'ሚያዝያ', shortOm: 'Ebl', shortEn: 'Apr', shortAm: 'ሚያ' },
    { om: 'Caamsaa', en: 'May', am: 'ግንቦት', shortOm: 'Caa', shortEn: 'May', shortAm: 'ግን' },
    { om: 'Waxabajjii', en: 'June', am: 'ሰኔ', shortOm: 'Wax', shortEn: 'Jun', shortAm: 'ሰኔ' },
  ];

  const handleToggleMonth = (mName: string) => {
    setSelectedMonths((prev) =>
      prev.includes(mName) ? prev.filter((m) => m !== mName) : [...prev, mName]
    );
  };

  const handleQuickPlanSelect = (plan: 'Ji\'aa' | 'Simisteera' | 'Ji\'a 10') => {
    setFeePlanType(plan);
    const stud = students.find((s) => s.id === selectedStudentId);
    const mFee = stud?.monthlyFee || 1600;

    if (plan === 'Ji\'aa') {
      setSelectedMonths(['Fulbaana']);
      setPayAmount(mFee.toString());
    } else if (plan === 'Simisteera') {
      setSelectedMonths(['Fulbaana', 'Onkoloolessa', 'Sadaasa', 'Muddee', 'Amajjii']);
      setPayAmount((mFee * 5).toString());
    } else if (plan === 'Ji\'a 10') {
      setSelectedMonths(academicMonths.map((m) => m.om));
      setPayAmount((mFee * 10).toString());
    }
  };

  // Submit student fee payment
  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stud = students.find((s) => s.id === selectedStudentId);
    if (!stud) {
      alert(lang === 'om' ? 'Maaloo, Barataa filadhaa!' : 'Please select a student!');
      return;
    }

    const amt = parseFloat(payAmount) || 0;
    if (amt <= 0) {
      alert(lang === 'om' ? 'Hamma kaffaltii sirrii galchaa!' : 'Please enter a valid amount!');
      return;
    }

    const periodDesc = selectedMonths.length > 0 
      ? (selectedMonths.length === 10 ? 'Waggaa Guutuu (Ji\'a 10)' : selectedMonths.join(', '))
      : 'Kaffaltii Barumsaa';

    const effectiveTelebirrId = payTelebirrId.trim() || 
      (payMethod === 'Telebirr' ? (payRefNo.trim() || `TLB-${Date.now().toString().slice(-6)}`) : undefined);

    onRecordFeePayment(stud.id, {
      amountPaid: amt,
      feeType: feePlanType,
      forPeriod: periodDesc,
      paymentMethod: payMethod,
      referenceNo: payRefNo.trim() || undefined,
      telebirrId: effectiveTelebirrId,
      paidMonths: selectedMonths,
      cashierName: cashierName.trim() || 'Faayinaansii Yooyyaa',
      notes: paymentNotes.trim() || undefined,
    });

    setPayRefNo('');
    setPayTelebirrId('');
    setPaymentNotes('');
    alert(lang === 'om' ? 'Kaffaltiin milkaa\'inaan galmaa\'ee nagaheen qophaa\'eera!' : 'Payment recorded and official receipt attachment generated!');
  };

  // Submit Institutional Transaction (Galii fi Baasii)
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount) || 0;
    if (amt <= 0) {
      alert(lang === 'om' ? 'Hamma maallaqaa sirrii galchaa!' : 'Please enter a valid amount!');
      return;
    }
    if (!txParty.trim()) {
      alert(lang === 'om' ? 'Maaloo, Eenyuuf/Eenyurraa akka ta\'e galchaa!' : 'Please enter payee or payer name!');
      return;
    }

    onAddTransaction({
      type: txType,
      category: txCategory,
      amount: amt,
      date: txDate,
      voucherNo: txVoucher.trim() || `YY-TX-${Date.now()}`,
      partyName: txParty.trim(),
      description: txDesc.trim() || `${txType} - ${txCategory}`,
      paymentMethod: txMethod,
      recordedBy: 'Faayinaansii',
    });

    setTxAmount('');
    setTxParty('');
    setTxDesc('');
    setTxVoucher(`YY-VCH-${Math.floor(100 + Math.random() * 900)}`);
    alert(lang === 'om' ? 'Galmeen faayinaansii haala gaariin kuusameera!' : 'Financial record saved successfully!');
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    const matchesFeeStatus = feeStatusFilter === 'all' || s.feeStatus === feeStatusFilter;
    return matchesSearch && matchesGrade && matchesFeeStatus;
  });

  // Filter transactions with category and date range tracking
  const filteredTransactions = transactions.filter((t) => {
    const matchesType = ledgerTypeFilter === 'all' || t.type === ledgerTypeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = t.partyName.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      t.voucherNo.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(ledgerSearch.toLowerCase());

    let matchesDate = true;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    if (dateFilterMode === 'this_month') {
      matchesDate = t.date.startsWith(currentMonthStr);
    } else if (dateFilterMode === 'last_month') {
      matchesDate = t.date.startsWith(lastMonthStr);
    } else if (dateFilterMode === 'last_30_days') {
      const txTime = new Date(t.date).getTime();
      const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);
      matchesDate = txTime >= thirtyDaysAgo;
    }

    return matchesType && matchesCategory && matchesSearch && matchesDate;
  });

  // Export Financial Ledger to CSV
  const handleExportLedgerCSV = () => {
    const headers = ['Date', 'Voucher', 'Type', 'Category', 'Party', 'Description', 'Method', 'Amount (ETB)'];
    const rows = filteredTransactions.map((tx) => [
      `"${tx.date}"`,
      `"${tx.voucherNo}"`,
      `"${tx.type}"`,
      `"${tx.category}"`,
      `"${tx.partyName}"`,
      `"${tx.description}"`,
      `"${tx.paymentMethod}"`,
      tx.amount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yooyyaa_School_Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Telebirr Fee Collection Metrics & Filtering
  const telebirrReceipts = receipts.filter(
    (r) => !!r.telebirrId || r.paymentMethod === 'Telebirr' || r.paymentMethod.includes('Telebirr')
  );
  const totalTelebirrAmount = telebirrReceipts.reduce((sum, r) => sum + r.amountPaid, 0);
  const uniqueTelebirrStudentsCount = new Set(telebirrReceipts.map((r) => r.studentId)).size;

  const filteredTelebirrReceipts = telebirrReceipts.filter((r) => {
    const term = telebirrSearch.toLowerCase();
    const matchesSearch =
      (r.telebirrId && r.telebirrId.toLowerCase().includes(term)) ||
      r.studentName.toLowerCase().includes(term) ||
      r.rollNumber.toLowerCase().includes(term) ||
      r.receiptNumber.toLowerCase().includes(term) ||
      r.grade.toLowerCase().includes(term);
    const matchesGrade = telebirrGradeFilter === 'all' || r.grade === telebirrGradeFilter;
    return matchesSearch && matchesGrade;
  });

  const handleExportTelebirrCSV = () => {
    const headers = [
      'Telebirr_Transaction_ID',
      'Student_Name',
      'Roll_Number',
      'Grade',
      'Section',
      'Fee_Type',
      'Period_Covered',
      'Amount_Paid_ETB',
      'Payment_Date',
      'Receipt_Number',
      'Cashier',
      'Status'
    ];
    const rows = filteredTelebirrReceipts.map((r) => [
      `"${r.telebirrId || r.referenceNo || 'TLB-VERIFIED'}"`,
      `"${r.studentName}"`,
      `"${r.rollNumber}"`,
      `"${r.grade}"`,
      `"${r.section}"`,
      `"${r.feeType}"`,
      `"${r.forPeriod}"`,
      r.amountPaid,
      `"${r.paidDate}"`,
      `"${r.receiptNumber}"`,
      `"${r.cashierName}"`,
      '"Verified_Telebirr"'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yooyyaa_School_Telebirr_Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTelebirrId = (idStr: string) => {
    navigator.clipboard?.writeText(idStr);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Info & Sub-Navigation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 mb-1">
              {t.privateSchoolTag}
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-700" />
              <span>{t.navFinance}</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {activeSubTab === 'fees' ? t.feeSubtitle : activeSubTab === 'telebirr' ? t.telebirrReportSubtitle : t.financeSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sub Tabs: Student Fees vs Telebirr Fee Reports vs School Income/Expense */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start md:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveSubTab('fees')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'fees'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{t.feeManagement}</span>
              </button>

              <button
                onClick={() => setActiveSubTab('telebirr')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'telebirr'
                    ? 'bg-cyan-700 text-white shadow-xs font-bold'
                    : 'text-cyan-900 hover:text-cyan-950 hover:bg-cyan-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>{t.telebirrReports}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeSubTab === 'telebirr' ? 'bg-white text-cyan-800' : 'bg-cyan-100 text-cyan-800'
                }`}>
                  {telebirrReceipts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSubTab('ledger')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeSubTab === 'ledger'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>{t.financeLedger}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.transmitReportBtn}</span>
            </button>
          </div>
        </div>

        {/* Real-time Notice */}
        <div className="mt-4 flex items-center gap-2.5 text-xs text-blue-900 bg-blue-50/70 p-3 rounded-lg border border-blue-200/60">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <span>
            {lang === 'om'
              ? 'Kaffaltiin barattootaa fi baasiin galmaa\'an hundi battalatti gara Gabatee Hoggana Mana Barnootaatti (Admin) gabaafamu.'
              : 'All tuition fee receipts and recorded expenses automatically report and sync in real-time to the Principal Admin Dashboard.'}
          </span>
        </div>
      </div>

      {/* Transmit Financial Memo Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-blue-700" />
                <span>{t.transmitReportTitle}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600">
              {lang === 'om'
                ? 'Gabaasa faayinaansii, sadarkaa kaffaltii barattootaa ykn baasiiwwan mana barnootaa battalatti gara Hogganaatti ergaa.'
                : 'Transmit current fee collection status, outstanding balances, or major expense summaries directly to the Principal.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'om' ? 'Ibsa Gabaasa Faayinaansii (Finance Memo)' : 'Financial Status Memo'}
              </label>
              <textarea
                rows={3}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder={lang === 'om' ? 'Fkn. Kaffaltiin ji\'a Sadaasaa 80% sassaabameera; biiliin ibsaa fi bishaanii kaffalameera.' : 'e.g. November tuition is 80% collected; utility bills paid.'}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  const memoText = `Gabaasa Faayinaansii: Galii ${totalIncome.toLocaleString()} ETB, Baasii ${totalExpense.toLocaleString()} ETB. ${reportNote.trim()}`;
                  if (onSendReportToAdmin) {
                    onSendReportToAdmin(memoText);
                  }
                  setIsReportModalOpen(false);
                  setReportNote('');
                  alert(t.reportSentSuccess);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
              >
                {t.transmitReportBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected / Income */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalIncome}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-800">
              {totalIncome.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">ETB</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalExpense}
            </span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-rose-700">
              {totalExpense.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">ETB</span>
          </div>
        </div>

        {/* Net Surplus / Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.netBalance}
            </span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tabular-nums ${netBalance >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
              {netBalance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">ETB</span>
          </div>
        </div>

        {/* Unpaid Tuition Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.unpaidFees}
            </span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-amber-800">
              {totalUnpaidTuition.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">ETB</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: STUDENT TUITION & FEES (Kaffaltii Barattootaa)                 */}
      {/* ========================================================================= */}
      {activeSubTab === 'fees' && (
        <div className="space-y-8">
          
          {/* Record Student Payment Form */}
          <form onSubmit={handleFeeSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{t.recordPayment}</span>
              </h3>

              {/* Quick Plan Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">{t.feePlan}:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPlanSelect('Ji\'aa')}
                  className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                    feePlanType === 'Ji\'aa' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  {t.planMonthly}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPlanSelect('Simisteera')}
                  className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                    feePlanType === 'Simisteera' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  {t.planSemester}
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPlanSelect('Ji\'a 10')}
                  className={`px-2.5 py-1 rounded border text-[11px] font-semibold cursor-pointer ${
                    feePlanType === 'Ji\'a 10' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700 border-slate-300'
                  }`}
                >
                  {t.planTenMonth}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Select Student */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.studentName} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    const s = students.find((st) => st.id === e.target.value);
                    if (s) {
                      setPayAmount(s.monthlyFee.toString());
                    }
                  }}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                >
                  {students.map((stud) => (
                    <option key={stud.id} value={stud.id}>
                      {stud.name} ({stud.grade} - {stud.rollNumber}) · Haftee: {stud.remainingBalance.toLocaleString()} ETB
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount to Pay */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.amountPaid} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Telebirr">📱 {t.payTelebirr} (Digital Wallet)</option>
                  <option value="Kash / Callaa">💵 {t.payCash}</option>
                  <option value="Baankii">🏦 {t.payBank} (CBE/Awash)</option>
                </select>
              </div>
            </div>

            {/* 10-Month Selection Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                {lang === 'om'
                  ? 'Ji\'oota Kaffalaman Filadhaa (Kaffaltii Waggaa Ji\'a 10):'
                  : lang === 'am'
                  ? 'የሚከፈልባቸውን ወራት ይምረጡ (የ10 ወር ክፍያ):'
                  : 'Select Months Being Paid (10-Month Academic Schedule):'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {academicMonths.map((m) => {
                  const isChecked = selectedMonths.includes(m.om);
                  return (
                    <button
                      key={m.om}
                      type="button"
                      onClick={() => handleToggleMonth(m.om)}
                      className={`p-2 rounded-lg border text-xs font-medium text-left transition-colors flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{lang === 'om' ? m.om : lang === 'am' ? m.am : m.en}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference, Telebirr ID & Cashier Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={payMethod === 'Telebirr' ? 'p-2 rounded-lg bg-cyan-50/90 border border-cyan-300' : ''}>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-cyan-950 font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-cyan-700" />
                    <span>{t.telebirrId}</span>
                  </span>
                  {payMethod === 'Telebirr' && (
                    <span className="text-[10px] text-cyan-800 font-extrabold uppercase">
                      Telebirr
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={payTelebirrId}
                  onChange={(e) => setPayTelebirrId(e.target.value)}
                  placeholder="Fkn. TLB-2026-90481"
                  className="w-full px-3 py-2 text-sm border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 font-mono font-bold bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'om' ? 'Lakk. Ragaa Baankii/Vowcharii' : lang === 'am' ? 'የባንክ ማመሳከሪያ ቁጥር' : 'Bank Ref / Voucher No.'}
                </label>
                <input
                  type="text"
                  value={payRefNo}
                  onChange={(e) => setPayRefNo(e.target.value)}
                  placeholder="e.g. CBE-TXN-90214"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.cashierName}
                </label>
                <input
                  type="text"
                  value={cashierName}
                  onChange={(e) => setCashierName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'om' ? 'Yaada Dabalataa' : lang === 'am' ? 'ተጨማሪ ማስታወሻ' : 'Notes / Remarks'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Kaffaltii qulqullinaan raawwatame"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Receipt className="w-4 h-4" />
                <span>{lang === 'om' ? 'Kaffaltii Galmeessi & Nagahee Baasi' : lang === 'am' ? 'ክፍያ መዝግብና ደረሰኝ አውጣ' : 'Record & Issue Receipt Attachment'}</span>
              </button>
            </div>
          </form>

          {/* Student Tuition Fee Roster Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{t.allGrades}</option>
                  {Array.from({ length: 12 }, (_, i) => `Kutaa ${i + 1}`).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <select
                  value={feeStatusFilter}
                  onChange={(e) => setFeeStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{lang === 'om' ? 'Haala Kaffaltii Hunda' : lang === 'am' ? 'ሁሉም ሁኔታ' : 'All Fee Statuses'}</option>
                  <option value="Kaffalameera">{t.feeStatusPaid}</option>
                  <option value="Walakkaa">{t.feeStatusPartial}</option>
                  <option value="Hin Kaffalle">{t.feeStatusUnpaid}</option>
                </select>
              </div>
            </div>

            {/* 10-Month Fee Progress Legend & Overview */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.tenMonthProgress}:</span>
                </span>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-3 h-3 rounded bg-emerald-600 inline-block shadow-2xs"></span>
                  <span className="font-medium text-slate-700">{lang === 'om' ? 'Ji\'a Kaffalame' : lang === 'am' ? 'የተከፈለ ወር' : 'Paid Month'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block"></span>
                  <span className="font-medium text-slate-700">{lang === 'om' ? 'Ji\'a Hafe' : lang === 'am' ? 'ቀሪ ወር' : 'Remaining Month'}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 font-medium">
                <span>{lang === 'om' ? 'Barnoota Waggaa Ji\'a 10: Fulbaana - Waxabajjii' : lang === 'am' ? 'የ10 ወራት የትምህርት ዘመን፡ መስከረም - ሰኔ' : '10 Academic Months: Sep - Jun'}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t.thStudentName}</th>
                    <th className="p-3">{t.thRollNo}</th>
                    <th className="p-3">{t.thGrade}</th>
                    <th className="p-3">{t.feePlan}</th>
                    <th className="p-3 min-w-[260px]">{t.tenMonthProgress}</th>
                    <th className="p-3">{t.amountPaid}</th>
                    <th className="p-3">{t.remainingBalance}</th>
                    <th className="p-3">{t.feeStatus}</th>
                    <th className="p-3 text-right">{t.generateReceipt}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((stud) => {
                    const latestReceipt = receipts.find((r) => r.studentId === stud.id);
                    const paidCount = stud.paidMonths.length;
                    const pct = Math.round((paidCount / 10) * 100);

                    return (
                      <tr key={stud.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          <div>{stud.name}</div>
                          {stud.telebirrId && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-cyan-50 text-cyan-800 font-mono border border-cyan-200 mt-1 font-bold">
                              <Smartphone className="w-3 h-3 text-cyan-600" />
                              <span>{stud.telebirrId}</span>
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{stud.rollNumber}</td>
                        <td className="p-3 text-slate-700">{stud.grade} ({stud.section})</td>
                        <td className="p-3 text-slate-600 font-medium">{stud.feePlan}</td>
                        
                        {/* Visual 10-Month Progress Tracker & Progress Bar */}
                        <td className="p-3 min-w-[260px]">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900 text-xs">
                                {paidCount} / 10
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                ({pct}%)
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold ${
                                paidCount === 10
                                  ? 'text-emerald-700'
                                  : paidCount >= 5
                                  ? 'text-teal-700'
                                  : paidCount > 0
                                  ? 'text-amber-700'
                                  : 'text-rose-600'
                              }`}
                            >
                              {paidCount === 10
                                ? (lang === 'om' ? '✓ Waggaa Guutuu' : lang === 'am' ? '✓ ሙሉ ዓመት' : '✓ Full Year')
                                : `${10 - paidCount} ${t.remainingBadge}`}
                            </span>
                          </div>

                          {/* Progress Bar Visualization */}
                          <div className="w-full bg-slate-200/90 h-2 rounded-full overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                paidCount === 10
                                  ? 'bg-emerald-600'
                                  : paidCount >= 5
                                  ? 'bg-emerald-500'
                                  : paidCount > 0
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          {/* 10-Month Tile / Badge Grid (Month-by-Month Status) */}
                          <div className="grid grid-cols-10 gap-1">
                            {academicMonths.map((m) => {
                              const isPaid = stud.paidMonths.includes(m.om);
                              const shortName = lang === 'om' ? m.shortOm : lang === 'am' ? m.shortAm : m.shortEn;
                              const fullName = lang === 'om' ? m.om : lang === 'am' ? m.am : m.en;

                              return (
                                <div
                                  key={m.om}
                                  title={`${fullName}: ${
                                    isPaid
                                      ? (lang === 'om' ? 'Kaffalameera (Paid)' : lang === 'am' ? 'ተከፍሏል' : 'Paid')
                                      : (lang === 'om' ? 'Kan Hafe (Remaining)' : lang === 'am' ? 'ቀሪ' : 'Remaining')
                                  }`}
                                  className={`h-5.5 rounded flex items-center justify-center text-[9px] font-bold transition-all cursor-default select-none ${
                                    isPaid
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200/60'
                                  }`}
                                >
                                  {shortName}
                                </div>
                              );
                            })}
                          </div>
                        </td>

                        <td className="p-3 font-mono tabular-nums font-bold text-slate-900">
                          {stud.totalFeePaid.toLocaleString()} ETB
                        </td>
                        <td className="p-3 font-mono tabular-nums font-bold text-rose-700">
                          {stud.remainingBalance.toLocaleString()} ETB
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                              stud.feeStatus === 'Kaffalameera'
                                ? 'bg-emerald-100 text-emerald-800'
                                : stud.feeStatus === 'Walakkaa'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {stud.feeStatus === 'Kaffalameera'
                              ? t.feeStatusPaid
                              : stud.feeStatus === 'Walakkaa'
                              ? t.feeStatusPartial
                              : t.feeStatusUnpaid}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {latestReceipt ? (
                            <button
                              type="button"
                              onClick={() => onViewReceiptAttachment(latestReceipt)}
                              className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded hover:bg-emerald-100 flex items-center gap-1.5 ml-auto cursor-pointer"
                              title="Nagahee / Attachment"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>{lang === 'om' ? 'Nagahee (Attachment)' : lang === 'am' ? 'ደረሰኝ (Attachment)' : 'Receipt Attachment'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(stud.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer ml-auto"
                            >
                              {lang === 'om' ? '+ Kaffalchiisi' : lang === 'am' ? '+ ክፍያ ተቀበል' : '+ Pay'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: DEDICATED STUDENT TELEBIRR FEE PAYMENT REPORT & AUDIT ROSTER  */}
      {/* ========================================================================= */}
      {activeSubTab === 'telebirr' && (
        <div className="space-y-6">
          {/* Telebirr Executive Header Banner with Official School Logo */}
          <div className="bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-cyan-800/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white p-1 shrink-0 shadow-md ring-2 ring-cyan-400/40 overflow-hidden">
                  <img
                    src="/assets/aistudio/logo_a3828f5b.png"
                    alt="Yooyyaa School Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-400 text-cyan-950 uppercase tracking-wider">
                      TELEBIRR DIGITAL PORTAL
                    </span>
                    <span className="text-xs text-cyan-200">
                      {lang === 'om' ? 'Kaffaltii Barattootaa Mirkanaa\'e' : 'Verified Student Collections'}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white uppercase mt-1">
                    {lang === 'om'
                      ? 'GABAASA KAFFALTII TELEBIRR BARATTOOTAA'
                      : lang === 'am'
                      ? 'የተማሪዎች የቴሌብር ክፍያ እና ማመሳከሪያ ሪፖርት'
                      : 'STUDENT TELEBIRR TUITION FEE AUDIT ROSTER'}
                  </h3>
                  <p className="text-xs text-cyan-100/80 mt-0.5">
                    {lang === 'om'
                      ? 'Hordoffii fi mirkaneessa kaffaltii barumsaa kan karaa lakkoofsa eenyummaa (Telebirr ID) raawwatame.'
                      : 'Audit and reconcile all tuition payments submitted via Telebirr transaction IDs with digital receipts.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportTelebirrCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-300" />
                  <span>{t.exportTelebirrCSV}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t.printTelebirrReport}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Telebirr Key Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Telebirr Collected */}
            <div className="bg-white p-5 rounded-xl border border-cyan-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.totalTelebirrCollected}
                </span>
                <div className="p-2 rounded-lg bg-cyan-50 text-cyan-700">
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums text-cyan-900">
                  {totalTelebirrAmount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-bold">ETB</span>
              </div>
              <div className="text-[10px] text-cyan-700 font-semibold mt-1">
                {lang === 'om' ? 'Kaffaltii barattootaa guutuu' : 'Total tuition collected via Telebirr'}
              </div>
            </div>

            {/* Total Transactions Count */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.telebirrTransactionsCount}
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
                  {telebirrReceipts.length}
                </span>
                <span className="text-xs text-slate-500">{lang === 'om' ? 'Nagahee' : 'Receipts'}</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                {lang === 'om' ? 'Nagaheewwan mirkanaa\'an' : 'Verified receipts issued'}
              </div>
            </div>

            {/* Unique Students */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t.telebirrStudentsCount}
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
                  {uniqueTelebirrStudentsCount}
                </span>
                <span className="text-xs text-slate-500">/ {students.length}</span>
              </div>
              <div className="text-[10px] text-blue-700 font-semibold mt-1">
                {lang === 'om' ? 'Barattoota Telebirr fayyadaman' : 'Enrolled students using Telebirr'}
              </div>
            </div>

            {/* Verification & Compliance */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {lang === 'om' ? 'Haala Mirkaneessaa' : 'Audit Status'}
                </span>
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono tabular-nums text-emerald-700">
                  100%
                </span>
                <span className="text-xs text-emerald-800 font-bold">{lang === 'om' ? 'Mirkanaa\'e' : 'Verified'}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {lang === 'om' ? 'ID Telebirr tokkoon-tokkoo qaba' : 'All receipts mapped with Tx ID'}
              </div>
            </div>
          </div>

          {/* Search, Grade Filter & Toolbar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={telebirrSearch}
                  onChange={(e) => setTelebirrSearch(e.target.value)}
                  placeholder={t.searchTelebirrPlaceholder}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={telebirrGradeFilter}
                  onChange={(e) => setTelebirrGradeFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{t.allGrades}</option>
                  {Array.from({ length: 12 }, (_, i) => `Kutaa ${i + 1}`).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                {telebirrSearch && (
                  <button
                    type="button"
                    onClick={() => setTelebirrSearch('')}
                    className="text-xs text-rose-600 hover:underline px-2 py-1 cursor-pointer font-medium"
                  >
                    {lang === 'om' ? 'Haqi' : 'Clear'}
                  </button>
                )}
              </div>
            </div>

            {/* Telebirr Student Fee Payments Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-cyan-900/10 text-cyan-950 font-bold border-b border-cyan-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{t.telebirrId}</th>
                    <th className="p-3">{t.thStudentName}</th>
                    <th className="p-3">{t.thRollNo}</th>
                    <th className="p-3">{t.thGrade}</th>
                    <th className="p-3">{t.feePlan}</th>
                    <th className="p-3">{lang === 'om' ? 'Yeroo / Ji\'oota' : 'Period Covered'}</th>
                    <th className="p-3">{t.amountPaid}</th>
                    <th className="p-3">{t.paymentDate}</th>
                    <th className="p-3">{t.receiptNo}</th>
                    <th className="p-3">{lang === 'om' ? 'Haala' : 'Status'}</th>
                    <th className="p-3 text-right">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTelebirrReceipts.map((rcp, idx) => {
                    const txId = rcp.telebirrId || rcp.referenceNo || 'TLB-VERIFIED';
                    const isCopied = copiedId === txId;

                    return (
                      <tr key={rcp.id} className="hover:bg-cyan-50/40 transition-colors">
                        <td className="p-3 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="p-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-100 text-cyan-950 border border-cyan-300 font-mono font-black text-xs">
                            <span>{txId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyTelebirrId(txId)}
                              className="text-cyan-700 hover:text-cyan-950 p-0.5 rounded cursor-pointer"
                              title="Copy Telebirr ID"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{rcp.studentName}</td>
                        <td className="p-3 font-mono text-slate-600">{rcp.rollNumber}</td>
                        <td className="p-3 text-slate-800 font-semibold">{rcp.grade} ({rcp.section})</td>
                        <td className="p-3 text-slate-700 font-medium">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-bold">
                            {rcp.feeType}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px] max-w-[180px] truncate" title={rcp.forPeriod}>
                          {rcp.forPeriod}
                        </td>
                        <td className="p-3 font-mono tabular-nums font-black text-cyan-950 text-sm">
                          {rcp.amountPaid.toLocaleString()} ETB
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-xs whitespace-nowrap">{rcp.paidDate}</td>
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{rcp.receiptNumber}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>{t.telebirrVerified}</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onViewReceiptAttachment(rcp)}
                            className="px-2.5 py-1 text-[11px] font-bold text-cyan-900 bg-cyan-100/80 hover:bg-cyan-200/90 border border-cyan-300 rounded flex items-center gap-1.5 ml-auto cursor-pointer transition-colors shadow-2xs"
                            title="Nagahee Telebirr Ilaali"
                          >
                            <Receipt className="w-3.5 h-3.5 text-cyan-800" />
                            <span>{lang === 'om' ? 'Nagahee' : 'Receipt'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTelebirrReceipts.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-slate-500">
                        <Smartphone className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <div className="font-semibold text-slate-700">
                          {lang === 'om'
                            ? 'Kaffaltiin Telebirr calallii kanaan walsimu hin argamne.'
                            : 'No Telebirr payments match the specified search or filter criteria.'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {lang === 'om'
                            ? 'Lakk. Eenyummaa Telebirr (Tx ID) biraa ykn maqaa barataa sirrii galchaa.'
                            : 'Try entering another Telebirr Transaction ID or clearing filters.'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Audit Footnote */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {lang === 'om'
                    ? 'Ragaan kun kaffaltii barumsaa barattoonni karaa Telebirr raawwatan hunda kan mirkaneessudha.'
                    : 'This roster officially records and certifies all student fee transactions disbursed via Telebirr.'}
                </span>
              </span>
              <span className="font-mono font-bold text-cyan-950">
                {lang === 'om' ? 'Ida\'ama:' : 'Total:'} {totalTelebirrAmount.toLocaleString()} ETB ({filteredTelebirrReceipts.length} {lang === 'om' ? 'Kaffaltii' : 'Transactions'})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: GENERAL SCHOOL INCOME & EXPENSES (Galii fi Baasii Waliigalaa)   */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-8">
          
          {/* Operational Expenses Category Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Utility Bills */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'om' ? 'Biilii Tajaajilaa (Utilities)' : lang === 'am' ? 'የውሃና መብራት ክፍያ' : 'Utility Bills'}</span>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {utilitiesTotal.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">ETB</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'om' ? 'Bishaan, Elektiriikii & Wi-Fi' : lang === 'am' ? 'የውሃ፣ መብራትና ኢንተርኔት' : 'Water, Power & Connectivity'}
              </div>
            </div>

            {/* School Supply Purchases */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                  <span>{lang === 'om' ? 'Bittaa Meeshaalee (Supplies)' : lang === 'am' ? 'የዕቃዎች ግዢ' : 'Supply Purchases'}</span>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {suppliesTotal.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">ETB</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'om' ? 'Shookii, dabtara, qalama, meeshaa daree' : lang === 'am' ? 'ኖራ፣ ደብተሮች፣ ስክሪብቶዎች' : 'Stationery, chalk & classroom items'}
              </div>
            </div>

            {/* Staff & Teacher Salaries */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-500" />
                  <span>{lang === 'om' ? 'Mindaa Hojjettootaa (Salaries)' : lang === 'am' ? 'የመምህራን ደመወዝ' : 'Staff Salaries'}</span>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {salariesTotal.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">ETB</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'om' ? 'Barsiisota, qulqullina & eegdota' : lang === 'am' ? 'መምህራን፣ የጥበቃና ፅዳት ሠራተኞች' : 'Teachers, security & staff payroll'}
              </div>
            </div>

            {/* Rent & Maintenance */}
            <div className="bg-white p-4.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-rose-500" />
                  <span>{lang === 'om' ? 'Kiree & Suphaa (Facility)' : lang === 'am' ? 'ኪራይና ጥገና' : 'Rent & Repairs'}</span>
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                  {rentMaintenanceTotal.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">ETB</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {lang === 'om' ? 'Kiree gamoo, suphaa barcumaa & daree' : lang === 'am' ? 'የሕንፃ ኪራይና የጠረጴዛ ጥገና' : 'Building lease & desk maintenance'}
              </div>
            </div>
          </div>

          {/* Quick Entry Shortcuts (One-Click Presets for Fast Manual Entry) */}
          <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {t.quickPresets}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('utilities')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>⚡ {lang === 'om' ? 'Biilii Elektiriikii & Bishaan' : lang === 'am' ? 'የውሃና መብራት ክፍያ' : 'Utility Bills'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('supplies')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Package className="w-3.5 h-3.5 text-blue-500" />
                <span>📦 {lang === 'om' ? 'Bittaa Meeshaalee Kuusaa' : lang === 'am' ? 'የትምህርት መርጃ ዕቃዎች ግዢ' : 'Supply Purchases'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('salary')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Building className="w-3.5 h-3.5 text-purple-500" />
                <span>👨‍🏫 {lang === 'om' ? 'Mindaa Barsiisotaa' : lang === 'am' ? 'የመምህራን ደመወዝ' : 'Staff Salaries'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('rent')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Building className="w-3.5 h-3.5 text-slate-600" />
                <span>🏢 {lang === 'om' ? 'Kiree Gamoo' : lang === 'am' ? 'የሕንፃ ኪራይ' : 'Building Rent'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('maintenance')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-rose-500" />
                <span>🛠️ {lang === 'om' ? 'Suphaa & Qulqullina' : lang === 'am' ? 'ጥገና እና ፅዳት' : 'Repairs & Maintenance'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('books')}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>📚 {lang === 'om' ? 'Gurgurtaa Kitaabaa (+Galii)' : lang === 'am' ? 'የመጽሐፍት ሽያጭ (+ገቢ)' : 'Book Sales (+Income)'}</span>
              </button>
            </div>
          </div>

          {/* Manual Income/Expense Form with Date Tracking */}
          <form onSubmit={handleTransactionSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'om' ? 'Galmeessa Galii fi Baasii Mana Barnootaa' : lang === 'am' ? 'የትምህርት ቤቱ አጠቃላይ ገቢና ወጪ መመዝገቢያ' : 'Manual School Income & Expense Entry'}</span>
              </h3>

              {/* Type Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('Baasii');
                    setTxCategory('Bishaan & Elektiriikii');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    txType === 'Baasii'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  - {t.typeExpense}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('Galii');
                    setTxCategory('Kaffaltii Barumsaa');
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    txType === 'Galii'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  + {t.typeIncome}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.finCategory} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {txType === 'Baasii' ? (
                    <>
                      <optgroup label={lang === 'om' ? 'Baasiiwwan Hojii (Operational)' : 'Operational Expenses'}>
                        <option value="Bishaan & Elektiriikii">⚡ {t.catUtilities}</option>
                        <option value="Meeshaalee Kuusaa">📦 {t.catPurchases}</option>
                        <option value="Mindaa Hojjettootaa">👨‍🏫 {t.catSalary}</option>
                        <option value="Kiree Manaa">🏢 {t.catRent}</option>
                        <option value="Suphaa & Qulqullina">🛠️ {t.catMaintenance}</option>
                        <option value="Gibira">🏛️ {t.catTaxes}</option>
                        <option value="Kan Biraa">Kan Biraa (Other)</option>
                      </optgroup>
                    </>
                  ) : (
                    <>
                      <optgroup label={lang === 'om' ? 'Galiiwwan (Revenues)' : 'Revenues'}>
                        <option value="Kaffaltii Barumsaa">🎓 {t.catTuition}</option>
                        <option value="Kaffaltii Galmee">📝 {t.catRegFee}</option>
                        <option value="Gurgurtaa Kitaabaa">📚 {t.catBookSale}</option>
                        <option value="Kan Biraa">Kan Biraa (Other)</option>
                      </optgroup>
                    </>
                  )}
                </select>
              </div>

              {/* Amount in ETB */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'om' ? 'Hamma Maallaqaa (ETB)' : lang === 'am' ? 'የገንዘብ መጠን (ብር)' : 'Amount (ETB)'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  required
                />
              </div>

              {/* Date Tracking & Quick Set Buttons */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {t.paymentDate} <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="text-emerald-700 hover:underline cursor-pointer font-medium"
                    >
                      {lang === 'om' ? 'Har\'a' : lang === 'am' ? 'ዛሬ' : 'Today'}
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      {lang === 'om' ? 'Kaleessa' : lang === 'am' ? 'ትናንት' : 'Yest'}
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.paymentMethod}
                </label>
                <select
                  value={txMethod}
                  onChange={(e) => setTxMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Callaa">{t.payCash}</option>
                  <option value="Baankii">{t.payBank}</option>
                  <option value="Telebirr">{t.payTelebirr}</option>
                </select>
              </div>

              {/* Paid By / Received From */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.partyName} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={txParty}
                  onChange={(e) => setTxParty(e.target.value)}
                  placeholder={txType === 'Baasii' ? 'e.g. Tajaajila Elektiriikii & Bishaan' : 'e.g. Barattoota & Maatii'}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Voucher / Receipt Reference */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.voucherNo}
                </label>
                <input
                  type="text"
                  value={txVoucher}
                  onChange={(e) => setTxVoucher(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Purpose / Description */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.description}
                </label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. Biilii bishaanii fi humna ibsaa ji'a kanaa"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Action Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'om' ? 'Galmeessi (Save)' : lang === 'am' ? 'መዝግብ' : 'Record Transaction'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Ledger Table with Date Tracking & Filter Controls */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            
            {/* Top Toolbar: Search, Date Filter, Category Filter, CSV Export */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    placeholder={lang === 'om' ? 'Barbaadi (Vowcharii, Qaama)...' : lang === 'am' ? 'ፈልግ (ቫውቸር፣ ስም)...' : 'Search party, voucher...'}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Date Filter Segmented Buttons */}
                <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg text-xs overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      dateFilterMode === 'all'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.allTime}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('this_month')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      dateFilterMode === 'this_month'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.thisMonth}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('last_month')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      dateFilterMode === 'last_month'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.lastMonth}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateFilterMode('last_30_days')}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      dateFilterMode === 'last_30_days'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.last30Days}
                  </button>
                </div>
              </div>

              {/* Category & Type Selectors + CSV Export */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter */}
                <select
                  value={ledgerTypeFilter}
                  onChange={(e) => setLedgerTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{lang === 'om' ? 'Gosa Hunda' : lang === 'am' ? 'ሁሉም ዓይነቶች' : 'All Types'}</option>
                  <option value="Galii">+ {t.typeIncome}</option>
                  <option value="Baasii">- {t.typeExpense}</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white max-w-[180px] truncate"
                >
                  <option value="all">{lang === 'om' ? 'Kategoriilee Hunda' : lang === 'am' ? 'ሁሉም ዘርፎች' : 'All Categories'}</option>
                  <option value="Bishaan & Elektiriikii">⚡ {t.catUtilities}</option>
                  <option value="Meeshaalee Kuusaa">📦 {t.catPurchases}</option>
                  <option value="Mindaa Hojjettootaa">👨‍🏫 {t.catSalary}</option>
                  <option value="Kiree Manaa">🏢 {t.catRent}</option>
                  <option value="Suphaa & Qulqullina">🛠️ {t.catMaintenance}</option>
                  <option value="Kaffaltii Barumsaa">🎓 {t.catTuition}</option>
                  <option value="Gurgurtaa Kitaabaa">📚 {t.catBookSale}</option>
                  <option value="Gibira">🏛️ {t.catTaxes}</option>
                  <option value="Kan Biraa">Kan Biraa</option>
                </select>

                {/* Export CSV */}
                <button
                  type="button"
                  onClick={handleExportLedgerCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Export Financial Ledger to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>CSV</span>
                </button>
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t.paymentDate}</th>
                    <th className="p-3">{t.voucherNo}</th>
                    <th className="p-3">{t.transactionType}</th>
                    <th className="p-3">{t.finCategory}</th>
                    <th className="p-3">{t.partyName}</th>
                    <th className="p-3">{t.description}</th>
                    <th className="p-3">{t.paymentMethod}</th>
                    <th className="p-3 text-right">{lang === 'om' ? 'Hamma (ETB)' : 'Amount'}</th>
                    <th className="p-3 text-right">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-slate-600 font-medium whitespace-nowrap font-mono">{tx.date}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{tx.voucherNo}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.type === 'Galii'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type === 'Galii' ? `+ ${t.typeIncome}` : `- ${t.typeExpense}`}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {tx.category === 'Bishaan & Elektiriikii' ? (
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                          ) : tx.category === 'Meeshaalee Kuusaa' ? (
                            <Package className="w-3.5 h-3.5 text-blue-500" />
                          ) : tx.category === 'Mindaa Hojjettootaa' ? (
                            <Building className="w-3.5 h-3.5 text-purple-500" />
                          ) : (
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span>{tx.category}</span>
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{tx.partyName}</td>
                      <td className="p-3 text-slate-600">{tx.description}</td>
                      <td className="p-3 text-slate-600">{tx.paymentMethod}</td>
                      <td className={`p-3 text-right font-mono tabular-nums font-bold ${tx.type === 'Galii' ? 'text-emerald-800' : 'text-rose-700'}`}>
                        {tx.type === 'Galii' ? '+' : '-'}{tx.amount.toLocaleString()} ETB
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Haqi / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-6 text-center text-slate-500">
                        {lang === 'om' ? 'Galmeen faayinaansii calallii kanaan walsimu hin argamne.' : 'No financial records match the selected date and category filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
