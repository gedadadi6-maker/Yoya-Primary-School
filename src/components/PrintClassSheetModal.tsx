import React from 'react';
import { Language, StudentRecord } from '../types';
import { getTranslation } from '../i18n/translations';
import { Printer, X, GraduationCap } from 'lucide-react';

interface PrintClassSheetModalProps {
  grade: string;
  students: StudentRecord[];
  lang: Language;
  onClose: () => void;
}

export const PrintClassSheetModal: React.FC<PrintClassSheetModalProps> = ({
  grade,
  students,
  lang,
  onClose,
}) => {
  const t = getTranslation(lang);

  const classStudents = students
    .filter((s) => s.grade === grade)
    .sort((a, b) => b.average - a.average);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full my-auto overflow-hidden shadow-2xl border border-slate-300 flex flex-col">
        
        {/* Toolbar */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">
              {lang === 'om' ? `Gabaasa Qabxii Kutaa Guutuu: ${grade}` : `Class Master Result Roster: ${grade}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printBtn}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Master Sheet */}
        <div className="print-area p-8 text-slate-900 bg-white">
          <div className="border border-slate-300 p-6 rounded-lg">
            
            {/* Header - Trilingual with Official Logo */}
            <div className="text-center pb-4 border-b border-slate-300 space-y-0.5">
              <div className="flex items-center justify-center mb-1.5">
                <img
                  src="/assets/aistudio/logo_a3828f5b.png"
                  alt="Mana Barumsaa Yooyyaa Logo"
                  className="w-16 h-16 object-contain drop-shadow-xs"
                />
              </div>
              <h2 className="text-lg font-black uppercase text-emerald-950">
                MANA BARUMSAA SADARKAA 1FFAA YOOYYAA (DHUNFAA)
              </h2>
              <div className="text-xs uppercase font-bold text-slate-700">
                YOOYYAA PRIMARY SCHOOL (PRIVATE) · BIROO BARNOOTA OROMIYAA
              </div>
              <div className="text-xs font-bold text-emerald-900">
                የዮያ አንደኛ ደረጃ የግል ትምህርት ቤት
              </div>
              <div className="mt-2 text-xs font-semibold text-slate-800">
                {lang === 'om'
                  ? 'GALMEE GABAASA QABXII KUTAA (CLASS MASTER ROSTER)'
                  : lang === 'am'
                  ? 'የክፍል አጠቃላይ የውጤት መመዝገቢያ (CLASS MASTER ROSTER)'
                  : 'CLASS GRADE SUMMARY & RANK SHEET'}: <span className="text-emerald-800 font-bold">{grade}</span> · 2018 A.L. (2025/2026)
              </div>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center">#</th>
                    <th className="p-2 border-r border-slate-300">{t.thStudentName}</th>
                    <th className="p-2 border-r border-slate-300">{t.thRollNo}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.gender}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thSection}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thHerrega}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thEnglish}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thScience}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thTotal}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thAvg}</th>
                    <th className="p-2 border-r border-slate-300 text-center">{t.thRank}</th>
                    <th className="p-2 text-center">{t.thStatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classStudents.map((stud, idx) => {
                    const rank = idx + 1;
                    return (
                      <tr key={stud.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 border-r border-slate-300 text-center font-mono text-slate-500">{rank}</td>
                        <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">{stud.name}</td>
                        <td className="p-2 border-r border-slate-300 font-mono text-slate-600">{stud.rollNumber}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{stud.gender === 'Dhiira' ? 'D (M)' : 'Dub (F)'}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{stud.section}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums">{stud.scores.herrega}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums">{stud.scores.english}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums">{stud.scores.saayinsii}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums font-bold">{stud.total}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums font-bold text-emerald-900">{stud.average}%</td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums font-bold">{rank}ffaa</td>
                        <td className="p-2 text-center font-semibold">
                          <span className={stud.status === 'Darbe' ? 'text-emerald-700' : 'text-rose-700'}>
                            {stud.status === 'Darbe' ? (lang === 'om' ? 'Darbe' : 'Pass') : (lang === 'om' ? 'Kuwe' : 'Fail')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {classStudents.length === 0 && (
                    <tr>
                      <td colSpan={12} className="p-6 text-center text-slate-500">
                        {lang === 'om' ? 'Barattoonni kutaa kanatti hin argamne.' : 'No students found in this grade.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
              <div>
                <div className="w-36 border-b border-slate-800 mx-auto mb-1"></div>
                <div className="font-semibold">{t.homeroomTeacherSig}</div>
              </div>
              <div>
                <div className="w-36 border-b border-slate-800 mx-auto mb-1"></div>
                <div className="font-semibold">{t.registrarSig}</div>
              </div>
              <div>
                <div className="w-36 border-b border-slate-800 mx-auto mb-1"></div>
                <div className="font-semibold">{t.directorSeal}</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
