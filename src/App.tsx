import React, { useState, useEffect } from 'react';
import { Language, StudentRecord, StockItem, LogEntry, StockTransaction, FeeReceipt, IncomeExpenseRecord } from './types';
import { initialStudents, initialStock, initialLogs, initialReceipts, initialTransactions } from './data/initialData';
import { getTranslation } from './i18n/translations';
import { Navbar } from './components/Navbar';
import { TeacherPanel } from './components/TeacherPanel';
import { RegistrarPanel } from './components/RegistrarPanel';
import { FinancePanel } from './components/FinancePanel';
import { AdminPanel } from './components/AdminPanel';
import { ReportCardModal } from './components/ReportCardModal';
import { FeeReceiptModal } from './components/FeeReceiptModal';
import { PrintClassSheetModal } from './components/PrintClassSheetModal';

export default function App() {
  // Trilingual Language State ('om' | 'en' | 'am')
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('school_lang');
    return (saved === 'en' || saved === 'om' || saved === 'am') ? saved : 'om';
  });

  // Current Active Role Tab
  const [currentTab, setCurrentTab] = useState<'barsiisa' | 'registrar' | 'finance' | 'admin'>('barsiisa');

  // School Data States with localStorage persistence
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('school_students');
      return saved ? JSON.parse(saved) : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  const [stock, setStock] = useState<StockItem[]>(() => {
    try {
      const saved = localStorage.getItem('school_stock');
      return saved ? JSON.parse(saved) : initialStock;
    } catch {
      return initialStock;
    }
  });

  const [receipts, setReceipts] = useState<FeeReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('school_receipts');
      return saved ? JSON.parse(saved) : initialReceipts;
    } catch {
      return initialReceipts;
    }
  });

  const [transactions, setTransactions] = useState<IncomeExpenseRecord[]>(() => {
    try {
      const saved = localStorage.getItem('school_transactions');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [logs, setLogs] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('school_logs');
      return saved ? JSON.parse(saved) : initialLogs;
    } catch {
      return initialLogs;
    }
  });

  // Modals
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<StudentRecord | null>(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<FeeReceipt | null>(null);
  const [printClassGrade, setPrintClassGrade] = useState<string | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('school_stock', JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem('school_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('school_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('school_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('school_lang', lang);
  }, [lang]);

  const t = getTranslation(lang);

  // Format timestamp
  const getNowFormatted = () => {
    const d = new Date();
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 1. Add new student grade record
  const handleAddStudent = (studentData: Omit<StudentRecord, 'id' | 'createdAt'>) => {
    const newStudent: StudentRecord = {
      ...studentData,
      id: `stud-${Date.now()}`,
      createdAt: new Date().toISOString(),
      // Private school default fee values if not provided
      monthlyFee: studentData.monthlyFee || 1600,
      feePlan: studentData.feePlan || 'Ji\'aa',
      paidMonths: studentData.paidMonths || [],
      totalFeePaid: studentData.totalFeePaid || 0,
      remainingBalance: studentData.remainingBalance ?? ((studentData.monthlyFee || 1600) * 10),
      feeStatus: studentData.feeStatus || 'Hin Kaffalle',
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Dispatch real-time notification to logs
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Barsiisaa',
      messageOm: `👨‍🏫 Barsiisaan qabxii barataa [${newStudent.name}, ${newStudent.grade} ${newStudent.section}] gara sirnaatti ergeera (Ida'ama: ${newStudent.total}).`,
      messageEn: `👨‍🏫 Teacher submitted grades for student [${newStudent.name}, ${newStudent.grade} ${newStudent.section}] (Total: ${newStudent.total}).`,
      messageAm: `👨‍🏫 መምህር የተማሪ [${newStudent.name}፣ ${newStudent.grade} ${newStudent.section}] ውጤት መዝግቧል (ድምር፡ ${newStudent.total})።`,
      type: 'grade',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // 2. Delete student record
  const handleDeleteStudent = (id: string) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;

    if (!window.confirm(lang === 'om' ? `Dhuguma qabxii barataa [${target.name}] haquu barbaadduu?` : `Are you sure you want to delete records for [${target.name}]?`)) {
      return;
    }

    setStudents((prev) => prev.filter((s) => s.id !== id));

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Admin',
      messageOm: `🗑️ Galmeen barataa [${target.name}, ${target.grade}] haqameera.`,
      messageEn: `🗑️ Record for student [${target.name}, ${target.grade}] was removed.`,
      messageAm: `🗑️ የተማሪ [${target.name}፣ ${target.grade}] መዝገብ ተሰርዟል።`,
      type: 'system',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // 3. Record student tuition fee payment and issue receipt attachment
  const handleRecordFeePayment = (
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
  ) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const total10MonthsFee = targetStudent.monthlyFee * 10;
    const newTotalPaid = targetStudent.totalFeePaid + payment.amountPaid;
    const newRemaining = Math.max(0, total10MonthsFee - newTotalPaid);
    
    // Combine paid months without duplicates
    const updatedMonths = Array.from(new Set([...targetStudent.paidMonths, ...payment.paidMonths]));
    
    const newFeeStatus: StudentRecord['feeStatus'] = 
      newRemaining === 0 ? 'Kaffalameera' : newTotalPaid > 0 ? 'Walakkaa' : 'Hin Kaffalle';

    // Update student
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const updatedPlan: StudentRecord['feePlan'] = 
            (payment.feeType === 'Ji\'aa' || payment.feeType === 'Simisteera' || payment.feeType === 'Ji\'a 10')
              ? payment.feeType
              : s.feePlan;

          return {
            ...s,
            feePlan: updatedPlan,
            paidMonths: updatedMonths,
            totalFeePaid: newTotalPaid,
            remainingBalance: newRemaining,
            feeStatus: newFeeStatus,
            telebirrId: payment.telebirrId || s.telebirrId,
          };
        }
        return s;
      })
    );

    // Create Official Receipt Attachment
    const newReceipt: FeeReceipt = {
      id: `rcp-${Date.now()}`,
      receiptNumber: `YY-RCP-2026-${String(receipts.length + 1).padStart(3, '0')}`,
      studentId: targetStudent.id,
      studentName: targetStudent.name,
      rollNumber: targetStudent.rollNumber,
      grade: targetStudent.grade,
      section: targetStudent.section,
      feeType: payment.feeType,
      forPeriod: payment.forPeriod,
      amountPaid: payment.amountPaid,
      totalDue: total10MonthsFee,
      remainingBalance: newRemaining,
      paymentMethod: payment.paymentMethod,
      referenceNo: payment.referenceNo,
      telebirrId: payment.telebirrId,
      paidDate: new Date().toISOString().split('T')[0],
      cashierName: payment.cashierName,
      notes: payment.notes,
    };

    setReceipts((prev) => [newReceipt, ...prev]);

    // Automatically create corresponding institutional income transaction
    const newIncomeTx: IncomeExpenseRecord = {
      id: `fin-tx-${Date.now()}`,
      type: 'Galii',
      category: 'Kaffaltii Barumsaa',
      amount: payment.amountPaid,
      date: new Date().toISOString().split('T')[0],
      voucherNo: newReceipt.receiptNumber,
      partyName: `${targetStudent.name} (Maatii)`,
      description: `Kaffaltii ${payment.feeType}: ${payment.forPeriod} (${targetStudent.grade})${payment.telebirrId ? ` [Telebirr ID: ${payment.telebirrId}]` : ''}`,
      paymentMethod: payment.paymentMethod.includes('Telebirr') ? 'Telebirr' : payment.paymentMethod.includes('Baankii') ? 'Baankii' : 'Callaa',
      recordedBy: 'Faayinaansii',
    };

    setTransactions((prev) => [newIncomeTx, ...prev]);

    // Add Audit Log
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Faayinaansii',
      messageOm: `💰 Kaffaltiin barataa [${targetStudent.name} - ${payment.amountPaid.toLocaleString()} ETB (${payment.forPeriod})] ${payment.telebirrId ? `(Telebirr ID: ${payment.telebirrId})` : ''} galmaa'ee nagaheen [${newReceipt.receiptNumber}] baafameera.`,
      messageEn: `💰 Tuition fee payment for [${targetStudent.name} - ${payment.amountPaid.toLocaleString()} ETB (${payment.forPeriod})] ${payment.telebirrId ? `(Telebirr ID: ${payment.telebirrId})` : ''} recorded, receipt [${newReceipt.receiptNumber}] generated.`,
      messageAm: `💰 የተማሪ [${targetStudent.name} - ${payment.amountPaid.toLocaleString()} ብር (${payment.forPeriod})] ${payment.telebirrId ? `(ቴሌብር ቁጥር፡ ${payment.telebirrId})` : ''} ክፍያ ተመዝግቦ ደረሰኝ [${newReceipt.receiptNumber}] ተቆርጧል።`,
      type: 'fee',
    };

    setLogs((prev) => [newLog, ...prev]);

    // Automatically open the receipt modal so the user can immediately print/view the attachment!
    setSelectedReceiptForModal(newReceipt);
  };

  // 4. Institutional Finance (Galii fi Baasii)
  const handleAddTransaction = (txData: Omit<IncomeExpenseRecord, 'id'>) => {
    const newTx: IncomeExpenseRecord = {
      ...txData,
      id: `fin-${Date.now()}`,
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Faayinaansii',
      messageOm: `📊 Faayinaansii: [${newTx.type}] ${newTx.category} (${newTx.amount.toLocaleString()} ETB - ${newTx.partyName}) galmaa'eera.`,
      messageEn: `📊 Finance: [${newTx.type}] ${newTx.category} (${newTx.amount.toLocaleString()} ETB - ${newTx.partyName}) recorded.`,
      messageAm: `📊 ፋይናንስ፡ [${newTx.type === 'Galii' ? 'ገቢ' : 'ወጪ'}] ${newTx.category} (${newTx.amount.toLocaleString()} ብር - ${newTx.partyName}) ተመዝግቧል።`,
      type: 'finance',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    if (!window.confirm(lang === 'om' ? `Galmee kana haquu barbaadduu? (${target.voucherNo})` : `Delete this ledger record?`)) {
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // 5. Stock Management
  const handleAddStockItem = (itemData: Omit<StockItem, 'id' | 'lastUpdated'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: `stock-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setStock((prev) => [newItem, ...prev]);

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Registrar',
      messageOm: `📁 Registrar: Meeshaan haaraan [${newItem.name} - Baay'ina: ${newItem.quantity} ${newItem.unit}] kuusaatti galmaa'eera.`,
      messageEn: `📁 Registrar: Registered new stock item [${newItem.name} - Qty: ${newItem.quantity} ${newItem.unit}].`,
      messageAm: `📁 ሬጅስትራር፡ አዲስ ዕቃ [${newItem.name} - ብዛት፡ ${newItem.quantity} ${newItem.unit}] መዝግቧል።`,
      type: 'stock',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  const handleUpdateStockQty = (
    itemId: string,
    diff: number,
    tx: Omit<StockTransaction, 'id' | 'itemId' | 'date'>
  ) => {
    setStock((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newQty = Math.max(0, item.quantity + diff);
          return {
            ...item,
            quantity: newQty,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Registrar',
      messageOm: `📁 Registrar: [${tx.type}] Meeshaa [${tx.itemName}] baay'ina: ${tx.quantity} (${tx.person || 'Hojjetaa'}).`,
      messageEn: `📁 Registrar: [${tx.type === 'Galii' ? 'Stock In' : 'Stock Out'}] Item [${tx.itemName}] qty: ${tx.quantity} (${tx.person || 'Staff'}).`,
      messageAm: `📁 ሬጅስትራር፡ [${tx.type === 'Galii' ? 'ገቢ' : 'ወጪ'}] ዕቃ [${tx.itemName}] ብዛት፡ ${tx.quantity}።`,
      type: 'stock',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // 6. Principal Announcements
  const handleSendAnnouncement = (message: string) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role: 'Admin',
      messageOm: `📢 Beeksisa Hogganaa: ${message}`,
      messageEn: `📢 Principal Announcement: ${message}`,
      messageAm: `📢 የርዕሰ መምህሩ ማስታወቂያ፡ ${message}`,
      type: 'announcement',
    };

    setLogs((prev) => [newLog, ...prev]);
  };

  // 7. Clear Audit Logs
  const handleClearLogs = () => {
    if (window.confirm(lang === 'om' ? 'Galmee ergaa qulqulleessuu barbaadduu?' : 'Clear all activity logs?')) {
      setLogs([
        {
          id: `log-${Date.now()}`,
          timestamp: getNowFormatted(),
          role: 'Admin',
          messageOm: 'Galmeen ergaa haaraatti qulqulleeffameera.',
          messageEn: 'System activity logs cleared.',
          messageAm: 'የእንቅስቃሴ መከታተያ መዝገብ ጸድቷል።',
          type: 'system',
        },
      ]);
    }
  };

  // 8. Reset to default initial seed data
  const handleResetData = () => {
    if (window.confirm(t.confirmReset)) {
      setStudents(initialStudents);
      setStock(initialStock);
      setReceipts(initialReceipts);
      setTransactions(initialTransactions);
      setLogs(initialLogs);
      alert(lang === 'om' ? 'Daataan Yooyyaa haala bu\'uuraatti deebi\'eera!' : 'Yooyyaa School data reset to initial defaults!');
    }
  };

  // 9. Export all student data and financial ledger to CSV
  const handleExportCSV = () => {
    const headers = [
      'Roll Number',
      'Student Name',
      'Gender',
      'Grade',
      'Section',
      'Fee Plan',
      'Total Paid (ETB)',
      'Remaining Balance (ETB)',
      'Fee Status',
      'Average Score',
      'Academic Status',
    ];

    const rows = students.map((s) => [
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${s.gender}"`,
      `"${s.grade}"`,
      `"${s.section}"`,
      `"${s.feePlan}"`,
      s.totalFeePaid,
      s.remainingBalance,
      `"${s.feeStatus}"`,
      s.average,
      `"${s.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Yooyyaa_Private_School_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate student class rank for the Report Card
  const getStudentClassRank = (target: StudentRecord | null) => {
    if (!target) return { rank: 1, total: 1 };
    const classmates = students
      .filter((s) => s.grade === target.grade)
      .sort((a, b) => b.average - a.average);
    const index = classmates.findIndex((s) => s.id === target.id);
    return {
      rank: index >= 0 ? index + 1 : 1,
      total: classmates.length,
    };
  };

  // 10. Send official department report / memo directly to Admin
  const handleSendDepartmentReport = (
    role: LogEntry['role'],
    memo: string,
    type: LogEntry['type'] = 'system'
  ) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}`,
      timestamp: getNowFormatted(),
      role,
      messageOm: `📢 [Gabaasa ${role}]: ${memo}`,
      messageEn: `📢 [${role} Report]: ${memo}`,
      messageAm: `📢 [የ${role} ሪፖርት]፡ ${memo}`,
      type,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const currentRankInfo = getStudentClassRank(selectedStudentForCard);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        lang={lang}
        onSelectLang={(selectedLang) => setLang(selectedLang)}
        onResetData={handleResetData}
        onExportCSV={handleExportCSV}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. Teacher Panel */}
        {currentTab === 'barsiisa' && (
          <TeacherPanel
            lang={lang}
            students={students}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
            onViewReportCard={(stud) => setSelectedStudentForCard(stud)}
            onSendReportToAdmin={(memo) => handleSendDepartmentReport('Barsiisaa', memo, 'grade')}
          />
        )}

        {/* 2. Registrar Panel */}
        {currentTab === 'registrar' && (
          <RegistrarPanel
            lang={lang}
            stock={stock}
            onAddStockItem={handleAddStockItem}
            onUpdateStockQty={handleUpdateStockQty}
            onSendReportToAdmin={(memo) => handleSendDepartmentReport('Registrar', memo, 'stock')}
          />
        )}

        {/* 3. Finance & Fees Panel (Tuition, 10-Month plans, Attachment Receipts, Institutional Ledger) */}
        {currentTab === 'finance' && (
          <FinancePanel
            lang={lang}
            students={students}
            receipts={receipts}
            transactions={transactions}
            onRecordFeePayment={handleRecordFeePayment}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onViewReceiptAttachment={(rcp) => setSelectedReceiptForModal(rcp)}
            onSendReportToAdmin={(memo) => handleSendDepartmentReport('Faayinaansii', memo, 'finance')}
          />
        )}

        {/* 4. Admin Panel */}
        {currentTab === 'admin' && (
          <AdminPanel
            lang={lang}
            students={students}
            stock={stock}
            logs={logs}
            transactions={transactions}
            receipts={receipts}
            onDeleteStudent={handleDeleteStudent}
            onViewReportCard={(stud) => setSelectedStudentForCard(stud)}
            onViewReceiptAttachment={(rcp) => setSelectedReceiptForModal(rcp)}
            onPrintClassSheet={(grade) => setPrintClassGrade(grade)}
            onSendAnnouncement={handleSendAnnouncement}
            onClearLogs={handleClearLogs}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>

      {/* Official Student Report Card Modal */}
      {selectedStudentForCard && (
        <ReportCardModal
          student={selectedStudentForCard}
          lang={lang}
          onClose={() => setSelectedStudentForCard(null)}
          classRank={currentRankInfo.rank}
          totalInClass={currentRankInfo.total}
        />
      )}

      {/* Official Student Fee Receipt Attachment Modal */}
      {selectedReceiptForModal && (
        <FeeReceiptModal
          receipt={selectedReceiptForModal}
          lang={lang}
          onClose={() => setSelectedReceiptForModal(null)}
        />
      )}

      {/* Class Master Result Roster Modal */}
      {printClassGrade && (
        <PrintClassSheetModal
          grade={printClassGrade}
          students={students}
          lang={lang}
          onClose={() => setPrintClassGrade(null)}
        />
      )}

      {/* Quiet Trilingual Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-bold text-slate-800">
            MANA BARUMSAA SADARKAA 1FFAA YOOYYAA (DHUNFAA) · YOOYYAA PRIMARY SCHOOL · የዮያ አንደኛ ደረጃ የግል ትምህርት ቤት
          </div>
          <div className="text-slate-400">
            Biroo Barnoota Oromiyaa · {lang === 'om' ? 'Mirgi hundi seeraan eeggamaadha' : lang === 'am' ? 'መብቱ በህግ የተጠበቀ ነው' : 'All Rights Reserved'} &copy; 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
