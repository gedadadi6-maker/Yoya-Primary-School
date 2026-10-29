import React, { useState } from 'react';
import { Language, StudentRecord, StockItem, LogEntry, IncomeExpenseRecord, FeeReceipt } from '../types';
import { getTranslation } from '../i18n/translations';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Boxes, 
  AlertTriangle, 
  Search, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  Trash2, 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  DollarSign,
  CreditCard,
  Building,
  CheckCircle2,
  ArrowRight,
  Receipt,
  FileCheck,
  Package,
  Layers,
  ChevronRight,
  Smartphone,
  Download
} from 'lucide-react';

interface AdminPanelProps {
  lang: Language;
  students: StudentRecord[];
  stock: StockItem[];
  logs: LogEntry[];
  transactions: IncomeExpenseRecord[];
  receipts: FeeReceipt[];
  onDeleteStudent: (id: string) => void;
  onViewReportCard: (student: StudentRecord) => void;
  onViewReceiptAttachment: (receipt: FeeReceipt) => void;
  onPrintClassSheet: (grade: string, section?: string) => void;
  onSendAnnouncement: (message: string) => void;
  onClearLogs: () => void;
  onExportCSV: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  lang,
  students,
  stock,
  logs,
  transactions,
  receipts,
  onDeleteStudent,
  onViewReportCard,
  onViewReceiptAttachment,
  onPrintClassSheet,
  onSendAnnouncement,
  onClearLogs,
  onExportCSV,
}) => {
  const t = getTranslation(lang);

  // Active Admin View Tab
  const [adminView, setAdminView] = useState<'overview' | 'teachers' | 'registrar' | 'finance' | 'logs'>('overview');

  // Filters for Academic / Grades
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filters for Stock
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockCategoryFilter, setStockCategoryFilter] = useState('all');

  // Filters for Finance
  const [feeStatusFilter, setFeeStatusFilter] = useState('all');

  // Broadcast state
  const [announcementText, setAnnouncementText] = useState('');

  // Log filter
  const [logFilter, setLogFilter] = useState<'all' | 'Barsiisaa' | 'Registrar' | 'Admin' | 'Faayinaansii'>('all');

  // Key Academic Metrics
  const totalStudents = students.length;
  const passedStudents = students.filter((s) => s.status === 'Darbe').length;
  const failedStudents = students.filter((s) => s.status === 'Kuwe').length;
  const passRate = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : '0';
  const overallAvg = totalStudents > 0 
    ? (students.reduce((acc, s) => acc + s.average, 0) / totalStudents).toFixed(1)
    : '0';
  const highestScore = totalStudents > 0 
    ? Math.max(...students.map((s) => s.average))
    : 0;

  // Key Stock Metrics
  const lowStockCount = stock.filter((item) => item.quantity <= item.minThreshold).length;

  // Key Financial Metrics
  const totalTuitionBilled = students.reduce((sum, s) => sum + (s.monthlyFee * 10), 0);
  const totalTuitionCollected = students.reduce((sum, s) => sum + s.totalFeePaid, 0);
  const totalTuitionPending = students.reduce((sum, s) => sum + s.remainingBalance, 0);
  const tuitionCollectionRate = totalTuitionBilled > 0 
    ? ((totalTuitionCollected / totalTuitionBilled) * 100).toFixed(1)
    : '0';

  const fullyPaidCount = students.filter((s) => s.feeStatus === 'Kaffalameera').length;
  const partialPaidCount = students.filter((s) => s.feeStatus === 'Walakkaa').length;
  const unpaidCount = students.filter((s) => s.feeStatus === 'Hin Kaffalle').length;

  const totalGeneralIncome = transactions
    .filter((t) => t.type === 'Galii')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGeneralExpense = transactions
    .filter((t) => t.type === 'Baasii')
    .reduce((sum, t) => sum + t.amount, 0);

  const netInstitutionalBalance = totalGeneralIncome - totalGeneralExpense;

  // Key Telebirr Metrics for School Principal
  const adminTelebirrReceipts = receipts.filter(
    (r) => !!r.telebirrId || r.paymentMethod === 'Telebirr' || r.paymentMethod.includes('Telebirr')
  );
  const adminTotalTelebirr = adminTelebirrReceipts.reduce((sum, r) => sum + r.amountPaid, 0);

  // Grade-by-Grade Completion Matrix
  const gradeLevels = Array.from({ length: 12 }, (_, i) => `Kutaa ${i + 1}`);
  const gradeSummary = gradeLevels.map((g) => {
    const classStudents = students.filter((s) => s.grade === g);
    const count = classStudents.length;
    const passed = classStudents.filter((s) => s.status === 'Darbe').length;
    const failed = classStudents.filter((s) => s.status === 'Kuwe').length;
    const avg = count > 0 
      ? (classStudents.reduce((acc, s) => acc + s.average, 0) / count).toFixed(1)
      : '-';
    const topStud = count > 0 
      ? [...classStudents].sort((a, b) => b.average - a.average)[0]
      : null;

    return {
      grade: g,
      count,
      passed,
      failed,
      avg,
      topStud,
      isReported: count > 0,
    };
  });

  // Filter students for Academic view
  const filteredStudents = students.filter((s) => {
    const matchesGrade = selectedGrade === 'all' || s.grade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesStatus && matchesSearch;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => b.average - a.average);

  // Filter stock for Registrar view
  const filteredStock = stock.filter((item) => {
    const matchesCat = stockCategoryFilter === 'all' || item.category === stockCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(stockSearchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Filter students for Fee view
  const filteredFeeStudents = students.filter((s) => {
    if (feeStatusFilter === 'all') return true;
    return s.feeStatus === feeStatusFilter;
  });

  // Handle Broadcast
  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    onSendAnnouncement(announcementText.trim());
    setAnnouncementText('');
    alert(lang === 'om' ? 'Beeksisni gara galmee ergaatti ergameera!' : 'Announcement broadcast to system logs!');
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.role === logFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top School Executive Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-13 h-13 rounded-full bg-white p-0.5 border border-slate-200 shadow-xs shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/logo_a3828f5b.png"
                alt="Yooyyaa School Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  {t.liveSyncBadge}
                </span>
                <span className="text-xs text-slate-500">
                  {lang === 'om' ? 'Kutaaleen Hundi Gabaasa Dhiyeessaa Jiru' : 'All Departments Synchronized'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mt-1">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <span>{t.adminTitle}</span>
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">{t.adminSubtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onPrintClassSheet(selectedGrade === 'all' ? 'Kutaa 8' : selectedGrade)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{lang === 'om' ? 'Gabaasa Kutaa Maxxansi' : 'Print Class Results'}</span>
            </button>

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>{t.exportData}</span>
            </button>
          </div>
        </div>

        {/* Multi-Department Tab Switcher inside Admin */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setAdminView('overview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
              adminView === 'overview'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t.adminTabOverview}</span>
          </button>

          <button
            onClick={() => setAdminView('teachers')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
              adminView === 'teachers'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.adminTabTeachers}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900/30 text-white font-mono">
              {totalStudents}
            </span>
          </button>

          <button
            onClick={() => setAdminView('registrar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
              adminView === 'registrar'
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{t.adminTabRegistrar}</span>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-600 text-white font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminView('finance')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
              adminView === 'finance'
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{t.adminTabFinance}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-900/30 text-white font-mono">
              {tuitionCollectionRate}%
            </span>
          </button>

          <button
            onClick={() => setAdminView('logs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-colors ${
              adminView === 'logs'
                ? 'bg-purple-700 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.adminTabLogs}</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-900/30 text-white font-mono">
              {logs.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: EXECUTIVE OVERVIEW (Cuunfaa Waliigalaa) */}
      {adminView === 'overview' && (
        <div className="space-y-6">
          {/* Top 3 Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Teacher Department Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                      <Users className="w-4 h-4" />
                    </span>
                    <span>{lang === 'om' ? 'Kutaa Barsiisotaa' : 'Teacher Department'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    {lang === 'om' ? 'Qabxiiwwan' : 'Academics'}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.totalStudents}:</span>
                    <span className="font-bold font-mono text-slate-900">{totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.passRate}:</span>
                    <span className="font-bold font-mono text-emerald-700">{passRate}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Giddugaleessa Waliigalaa' : 'School Average'}:</span>
                    <span className="font-bold font-mono text-slate-900">{overallAvg}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.topScorer}:</span>
                    <span className="font-bold font-mono text-emerald-700">{highestScore}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAdminView('teachers')}
                className="mt-5 w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'om' ? 'Gabaasa Barsiisaa Hordofi' : 'View Academic Report'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 2. Registrar Department Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                      <Boxes className="w-4 h-4" />
                    </span>
                    <span>{lang === 'om' ? 'Kutaa Registrar' : 'Registrar Department'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                    {lang === 'om' ? 'Meeshaalee Kuusaa' : 'Stock & Supplies'}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.totalStockItems}:</span>
                    <span className="font-bold font-mono text-slate-900">{stock.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.lowStockAlerts}:</span>
                    <span className={`font-bold font-mono ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {lowStockCount} {lang === 'om' ? 'hanqina' : 'items'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Haala Meeshaalee' : 'Stock Status'}:</span>
                    <span className="font-semibold text-slate-800">
                      {lowStockCount === 0 ? (lang === 'om' ? 'Guutuu' : 'Optimal') : (lang === 'om' ? 'Bittaa Barbaada' : 'Reorder Needed')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Bakka Kuusaa' : 'Storage'}:</span>
                    <span className="text-slate-700">Kuusaa Yooyyaa</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAdminView('registrar')}
                className="mt-5 w-full py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'om' ? 'Gabaasa Meeshaalee Hordofi' : 'View Inventory Report'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 3. Finance Department Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <span>{lang === 'om' ? 'Kutaa Faayinaansii' : 'Finance Department'}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                    {lang === 'om' ? 'Kaffaltii & Baasii' : 'Fees & Ledger'}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Kaffaltii Sassaabame' : 'Tuition Collected'}:</span>
                    <span className="font-bold font-mono text-emerald-700">{totalTuitionCollected.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Haftee Kaffaltii' : 'Tuition Remaining'}:</span>
                    <span className="font-bold font-mono text-amber-700">{totalTuitionPending.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{lang === 'om' ? 'Baasii Mana Barnootaa' : 'School Expenses'}:</span>
                    <span className="font-bold font-mono text-rose-700">{totalGeneralExpense.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{t.netBalance}:</span>
                    <span className={`font-bold font-mono ${netInstitutionalBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {netInstitutionalBalance.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAdminView('finance')}
                className="mt-5 w-full py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{lang === 'om' ? 'Gabaasa Faayinaansii Hordofi' : 'View Financial Ledger'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Principal Broadcast Announcement Form */}
          <form onSubmit={handleBroadcast} className="bg-white p-5 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-700" />
              <span>{t.sendAnnouncement}</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder={t.announcementPlaceholder}
                className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.sendBtn}</span>
              </button>
            </div>
          </form>

          {/* Recent Submissions from All Panels */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'om' ? 'Gabaasaaleen Dhiheenya Kutaalee Irraa Dhufan' : 'Latest Department Submissions & Activity'}</span>
              </h3>
              <button
                onClick={() => setAdminView('logs')}
                className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{lang === 'om' ? 'Hunda Ilaali' : 'View All Logs'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 text-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-base leading-none mt-0.5">
                      {log.role === 'Barsiisaa' ? '👨‍🏫' : log.role === 'Registrar' ? '📁' : log.role === 'Faayinaansii' ? '💰' : '👑'}
                    </span>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {lang === 'om' ? log.messageOm : lang === 'am' ? log.messageAm || log.messageOm : log.messageEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="font-medium text-slate-600">{log.role}</span>
                        <span>·</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEACHERS REPORT (Gabaasa Barsiisotaa Kutaa 1-12) */}
      {adminView === 'teachers' && (
        <div className="space-y-6">
          {/* Grade Submission Progress Matrix */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {t.gradeSubmissionOverview}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {lang === 'om' 
                ? 'Sadarkaa qabxii barattootaa kutaalee 1 hanga 12; baay\'ina barattootaa fi giddugaleessa qabxii.' 
                : 'Status of grades submitted across Grades 1 through 12, including averages and top scorers.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {gradeSummary.map((item) => (
                <div
                  key={item.grade}
                  onClick={() => setSelectedGrade(item.grade)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedGrade === item.grade
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{item.grade}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.count > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    ></span>
                  </div>
                  <div className="mt-2 text-xs">
                    <div className="font-mono text-slate-700 font-semibold">
                      {item.count} {lang === 'om' ? 'barattoota' : 'students'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.count > 0 ? (
                        <span className="text-emerald-700 font-semibold">Avg: {item.avg}%</span>
                      ) : (
                        <span className="text-slate-400">{lang === 'om' ? 'Hin galmoofne' : 'Pending'}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Student Table with Filters */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'om' ? 'Koreen Qabxii Fi Gabaasa Barattootaa Kutaa 1-12' : 'Master Student Academic Results'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'om'
                    ? 'Qabxii barattoota hunda to\'adhaa, kaartaa qabxii baasaa, ykn gabaasa kutaa maxxansaa.'
                    : 'Review verified student results, rank standings, and print academic cards.'}
                </p>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{t.allGrades}</option>
                  {gradeLevels.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="Darbe">{t.pass}</option>
                  <option value="Kuwe">{t.fail}</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">{t.thStudentName}</th>
                    <th className="p-3">{t.thRollNo}</th>
                    <th className="p-3">{t.thGrade}</th>
                    <th className="p-3">{t.thSection}</th>
                    <th className="p-3">{t.thAfaanOromoo}</th>
                    <th className="p-3">{t.thEnglish}</th>
                    <th className="p-3">{t.thHerrega}</th>
                    <th className="p-3">{t.thScience}</th>
                    <th className="p-3">{t.thTotal}</th>
                    <th className="p-3">{t.thAvg}</th>
                    <th className="p-3">{t.thRank}</th>
                    <th className="p-3">{t.thStatus}</th>
                    <th className="p-3 text-right">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedStudents.map((stud, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr key={stud.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono text-slate-400 font-medium">{rank}</td>
                        <td className="p-3 font-semibold text-slate-900">{stud.name}</td>
                        <td className="p-3 font-mono text-slate-600">{stud.rollNumber}</td>
                        <td className="p-3 text-slate-700">{stud.grade}</td>
                        <td className="p-3 text-slate-600">{stud.section}</td>
                        <td className="p-3 font-mono tabular-nums">{stud.scores.afaanOromoo}</td>
                        <td className="p-3 font-mono tabular-nums">{stud.scores.english}</td>
                        <td className="p-3 font-mono tabular-nums">{stud.scores.herrega}</td>
                        <td className="p-3 font-mono tabular-nums">{stud.scores.saayinsii}</td>
                        <td className="p-3 font-mono tabular-nums font-semibold">{stud.total}</td>
                        <td className="p-3 font-mono tabular-nums font-bold text-emerald-800">
                          {stud.average}%
                        </td>
                        <td className="p-3 font-mono tabular-nums font-semibold">
                          {rank === 1 ? '🥇 1ffaa' : rank === 2 ? '🥈 2ffaa' : rank === 3 ? '🥉 3ffaa' : `${rank}ffaa`}
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              stud.status === 'Darbe'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {stud.status === 'Darbe' ? t.pass : t.fail}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => onViewReportCard(stud)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                              title="Kartaa Qabxii Baasi / Official Report Card"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{lang === 'om' ? 'Kartaa' : 'Card'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteStudent(stud.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Haqi / Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {sortedStudents.length === 0 && (
                    <tr>
                      <td colSpan={14} className="p-6 text-center text-slate-500">
                        {lang === 'om'
                          ? 'Barataan calallii kanaan walsimu hin argamne.'
                          : 'No student records match the selected filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: REGISTRAR REPORT (Gabaasa Meeshaalee & Kuusaa) */}
      {adminView === 'registrar' && (
        <div className="space-y-6">
          {/* Urgent Stock Low Alert Banner */}
          {lowStockCount > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  {lang === 'om' ? 'Akeekkachiisa Hanqina Meeshaa Kuusaa' : 'Urgent Inventory Replenishment Alert'}
                </h4>
                <p className="text-xs text-rose-800 mt-1">
                  {lang === 'om' 
                    ? `Gosti meeshaa ${lowStockCount} sadarkaa xiqqaa (min threshold) gadi bu'eera. Maaloo bittaa hatattamaa eeyyamaa.`
                    : `${lowStockCount} stock items have dropped below their minimum safety thresholds. Requisition recommended.`}
                </p>
              </div>
            </div>
          )}

          {/* Stock Table & Search */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.inventoryAuditOverview}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'om' ? 'Gabaasa meeshaalee fi kitaabotaa Registrar irraa gabaafame.' : 'Official stock report dispatched by the school registrar.'}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder={lang === 'om' ? 'Meeshaa barbaadi...' : 'Search items...'}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <select
                  value={stockCategoryFilter}
                  onChange={(e) => setStockCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="all">{lang === 'om' ? 'Gosa Hunda' : 'All Categories'}</option>
                  <option value="Kitaabota">Kitaabota</option>
                  <option value="Meeshaa Barsiisuu">Meeshaa Barsiisuu</option>
                  <option value="Meeshaa Barcumaa">Meeshaa Barcumaa</option>
                  <option value="Meeshaa Barreessaa">Meeshaa Barreessaa</option>
                  <option value="Laabooratorii">Laabooratorii</option>
                  <option value="Kan Biraa">Kan Biraa</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t.thItemName}</th>
                    <th className="p-3">{t.thCategory}</th>
                    <th className="p-3">{t.thQty}</th>
                    <th className="p-3">{lang === 'om' ? 'Sadarkaa Xiqqaa' : 'Threshold'}</th>
                    <th className="p-3">{lang === 'om' ? 'Haala Meeshaa' : 'Condition'}</th>
                    <th className="p-3">{lang === 'om' ? 'Bakka' : 'Location'}</th>
                    <th className="p-3">{t.thAlert}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStock.map((item) => {
                    const isLow = item.quantity <= item.minThreshold;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-600">{item.category}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="p-3 font-mono text-slate-500">{item.minThreshold}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {item.condition}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{item.location || 'Kuusaa'}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                              isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isLow ? t.lowStock : t.goodStock}
                          </span>
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

      {/* VIEW 4: FINANCE REPORT (Gabaasa Faayinaansii, Kaffaltii & Galmee) */}
      {adminView === 'finance' && (
        <div className="space-y-6">
          {/* Tuition Collection Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === 'om' ? 'Kaffaltii Barumsaa Waliigalaa' : 'Total Tuition Billed'}
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-slate-900">
                {totalTuitionBilled.toLocaleString()} ETB
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">10-Month Academic Total</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === 'om' ? 'Kaffaltii Sassaabame (Collected)' : 'Tuition Collected'}
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-emerald-700">
                {totalTuitionCollected.toLocaleString()} ETB
              </div>
              <div className="text-[11px] text-emerald-600 mt-0.5 font-semibold">
                {tuitionCollectionRate}% {lang === 'om' ? 'sassaabameera' : 'collected'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === 'om' ? 'Kaffaltii Hafe (Pending)' : 'Unpaid Tuition'}
              </span>
              <div className="mt-2 text-xl font-bold font-mono text-amber-700">
                {totalTuitionPending.toLocaleString()} ETB
              </div>
              <div className="text-[11px] text-amber-600 mt-0.5">
                {unpaidCount} {lang === 'om' ? 'barattoota hin kaffalin' : 'unpaid students'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {lang === 'om' ? 'Haala Barattootaa' : 'Student Payment Status'}
              </span>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {fullyPaidCount} {lang === 'om' ? 'Guutuu' : 'Paid'}
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {partialPaidCount} {lang === 'om' ? 'Walakkaa' : 'Partial'}
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {unpaidCount} {lang === 'om' ? 'Hin kaffalle' : 'Unpaid'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">{totalStudents} Total Enrolled</div>
            </div>
          </div>

          {/* Student Fee Roster Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.tuitionSummary}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'om' ? 'Hordoffii kaffaltii barattootaa tokkoon-tokkoo isaanii.' : 'Individual student tuition progress and remaining balance status.'}
                </p>
              </div>

              <select
                value={feeStatusFilter}
                onChange={(e) => setFeeStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">{lang === 'om' ? 'Haala Kaffaltii Hunda' : 'All Fee Statuses'}</option>
                <option value="Kaffalameera">{lang === 'om' ? 'Kaffalameera (Paid)' : 'Fully Paid'}</option>
                <option value="Walakkaa">{lang === 'om' ? 'Walakkaa (Partial)' : 'Partial Paid'}</option>
                <option value="Hin Kaffalle">{lang === 'om' ? 'Hin Kaffalle (Unpaid)' : 'Unpaid'}</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">{t.thStudentName}</th>
                    <th className="p-3">{t.thGrade}</th>
                    <th className="p-3">{t.feePlan}</th>
                    <th className="p-3">{t.amountPaid}</th>
                    <th className="p-3">{t.remainingBalance}</th>
                    <th className="p-3">{t.paidMonths}</th>
                    <th className="p-3">{t.feeStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFeeStudents.map((stud) => (
                    <tr key={stud.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">{stud.name}</td>
                      <td className="p-3 text-slate-600">{stud.grade}</td>
                      <td className="p-3 text-slate-700">{stud.feePlan}</td>
                      <td className="p-3 font-mono font-bold text-emerald-700">
                        {stud.totalFeePaid.toLocaleString()} ETB
                      </td>
                      <td className="p-3 font-mono text-amber-700">
                        {stud.remainingBalance.toLocaleString()} ETB
                      </td>
                      <td className="p-3 text-slate-600">
                        {stud.paidMonths.length > 0 ? (
                          <span className="font-mono text-emerald-800 font-semibold">
                            {stud.paidMonths.length}/10 {lang === 'om' ? "Ji'oota" : 'Months'}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            stud.feeStatus === 'Kaffalameera'
                              ? 'bg-emerald-100 text-emerald-800'
                              : stud.feeStatus === 'Walakkaa'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {stud.feeStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Telebirr Student Fee Collections Audit Section in Admin */}
          <div className="bg-white p-6 rounded-xl border border-cyan-300 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-cyan-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <Smartphone className="w-5 h-5 text-cyan-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{t.telebirrReports}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-100 text-cyan-900 border border-cyan-200 uppercase">
                      Admin Audit
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'om'
                      ? 'Kaffaltii barattootaa kan karaa Telebirr raawwatamee fi lakkoofsa eenyummaa (Tx ID) isaanii.'
                      : 'Audit of student tuition fees paid via Telebirr with transaction references.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-cyan-50/70 px-3.5 py-1.5 rounded-lg border border-cyan-200">
                <div className="text-right">
                  <div className="text-[10px] text-cyan-800 font-semibold uppercase">{lang === 'om' ? 'Ida\'ama Telebirr' : 'Total Telebirr'}</div>
                  <div className="font-mono font-black text-cyan-950 text-sm">{adminTotalTelebirr.toLocaleString()} ETB</div>
                </div>
                <div className="h-6 w-px bg-cyan-200"></div>
                <div className="text-right">
                  <div className="text-[10px] text-cyan-800 font-semibold uppercase">{lang === 'om' ? 'Baay\'ina' : 'Count'}</div>
                  <div className="font-mono font-black text-cyan-950 text-sm">{adminTelebirrReceipts.length}</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-cyan-50/80 text-cyan-950 font-bold border-b border-cyan-200 text-[11px]">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">{t.telebirrId}</th>
                    <th className="p-2.5">{t.thStudentName}</th>
                    <th className="p-2.5">{t.thRollNo}</th>
                    <th className="p-2.5">{t.thGrade}</th>
                    <th className="p-2.5">{t.amountPaid}</th>
                    <th className="p-2.5">{t.paymentDate}</th>
                    <th className="p-2.5">{t.receiptNo}</th>
                    <th className="p-2.5 text-right">{t.thActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminTelebirrReceipts.map((rcp, idx) => (
                    <tr key={rcp.id} className="hover:bg-cyan-50/30 transition-colors">
                      <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <span className="font-mono font-bold text-cyan-950 bg-cyan-100/70 px-2 py-0.5 rounded border border-cyan-200 text-xs">
                          {rcp.telebirrId || rcp.referenceNo || 'TLB-VERIFIED'}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900">{rcp.studentName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{rcp.rollNumber}</td>
                      <td className="p-2.5 text-slate-700">{rcp.grade} ({rcp.section})</td>
                      <td className="p-2.5 font-mono font-bold text-cyan-900">{rcp.amountPaid.toLocaleString()} ETB</td>
                      <td className="p-2.5 font-mono text-slate-600">{rcp.paidDate}</td>
                      <td className="p-2.5 font-mono text-slate-500 text-[11px]">{rcp.receiptNumber}</td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => onViewReceiptAttachment(rcp)}
                          className="px-2.5 py-1 text-[11px] font-bold text-cyan-900 bg-cyan-100 hover:bg-cyan-200 rounded border border-cyan-300 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3 h-3 text-cyan-700" />
                          <span>{lang === 'om' ? 'Nagahee' : 'Receipt'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminTelebirrReceipts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-4 text-center text-slate-400">
                        {lang === 'om' ? 'Kaffaltiin Telebirr hin jiru.' : 'No Telebirr payments recorded yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Institutional Ledger & Expenses (Utilities, Salaries, Supplies) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {t.financeLedger}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'om' 
                    ? 'Galmee baasii fi galii mana barnootaa (Ibsaa, Bishaan, Bittaa Meeshaalee, Mindaa, Kiree).' 
                    : 'Institutional income and expense ledger recorded by finance.'}
                </p>
              </div>
            </div>

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
                    <th className="p-3 text-right">{t.amountPaid}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600">{tx.date}</td>
                      <td className="p-3 font-mono text-slate-800 font-semibold">{tx.voucherNo}</td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.type === 'Galii' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-slate-700">{tx.category}</td>
                      <td className="p-3 text-slate-800">{tx.partyName}</td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">{tx.description}</td>
                      <td className="p-3 text-slate-500">{tx.paymentMethod}</td>
                      <td
                        className={`p-3 font-mono font-bold text-right ${
                          tx.type === 'Galii' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type === 'Galii' ? '+' : '-'}{tx.amount.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Official Issued Receipts Table */}
          {receipts.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {lang === 'om' ? 'Nagaheewwan Kaffaltii Barattootaa (Attachments)' : 'Issued Official Fee Receipts'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'om' ? 'Nagahee kaffaltii qabduun maallaqaa baaste cuqaasuun ilaali ykn maxxansi.' : 'Click to inspect or print official fee vouchers.'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t.receiptNo}</th>
                      <th className="p-3">{t.paymentDate}</th>
                      <th className="p-3">{t.thStudentName}</th>
                      <th className="p-3">{t.thGrade}</th>
                      <th className="p-3">{t.feePlan}</th>
                      <th className="p-3">{t.amountPaid}</th>
                      <th className="p-3">{t.cashierName}</th>
                      <th className="p-3 text-right">{t.thActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {receipts.slice(0, 10).map((rcp) => (
                      <tr key={rcp.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-emerald-800">{rcp.receiptNumber}</td>
                        <td className="p-3 font-mono text-slate-600">{rcp.paidDate}</td>
                        <td className="p-3 font-semibold text-slate-900">{rcp.studentName}</td>
                        <td className="p-3 text-slate-600">{rcp.grade} {rcp.section}</td>
                        <td className="p-3 text-slate-700">{rcp.forPeriod}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">
                          {rcp.amountPaid.toLocaleString()} ETB
                        </td>
                        <td className="p-3 text-slate-600">{rcp.cashierName}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => onViewReceiptAttachment(rcp)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 flex items-center gap-1 inline-flex cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>{lang === 'om' ? 'Nagahee' : 'Receipt'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 5: STAFF LOGS & AUDIT TRAIL */}
      {adminView === 'logs' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{t.logsTitle}</span>
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'om'
                  ? 'Ergaawwan barsiisotaa, registrar fi faayinaansii irraa kallattiin gara bulchiinsaatti dhufan.'
                  : 'Direct audit trail and status notifications dispatched by teachers, registrars, and finance officers.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
              >
                <option value="all">{lang === 'om' ? 'Kutaalee Hunda' : 'All Roles'}</option>
                <option value="Barsiisaa">{t.navTeacher}</option>
                <option value="Registrar">{t.navRegistrar}</option>
                <option value="Faayinaansii">{t.navFinance}</option>
                <option value="Admin">{t.navAdmin}</option>
              </select>

              <button
                onClick={onClearLogs}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                {lang === 'om' ? 'Qulqulleessi' : lang === 'am' ? 'አጽዳ' : 'Clear Logs'}
              </button>
            </div>
          </div>

          {/* Notification Log List */}
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/80 hover:bg-slate-50 text-xs flex items-start justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5">
                    {log.role === 'Barsiisaa' ? '👨‍🏫' : log.role === 'Registrar' ? '📁' : log.role === 'Faayinaansii' ? '💰' : '👑'}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 text-[13px]">
                      {lang === 'om' ? log.messageOm : lang === 'am' ? log.messageAm || log.messageOm : log.messageEn}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span className="font-semibold text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {log.role}
                      </span>
                      <span>·</span>
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">
                {lang === 'om' ? 'Ergaan ammaaf hin jiru.' : 'No activity logs to show.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
