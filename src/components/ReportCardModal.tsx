import React from 'react';
import { Language, StudentRecord } from '../types';
import { getTranslation } from '../i18n/translations';
import { Printer, X, GraduationCap, Award, CheckCircle2 } from 'lucide-react';

interface ReportCardModalProps {
  student: StudentRecord | null;
  lang: Language;
  onClose: () => void;
  classRank?: number;
  totalInClass?: number;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  lang,
  onClose,
  classRank,
  totalInClass,
}) => {
  if (!student) return null;
  const t = getTranslation(lang);

  const getLetterGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', desc: lang === 'om' ? 'Baay\'ee Gaarii' : 'Excellent' };
    if (score >= 80) return { grade: 'B', desc: lang === 'om' ? 'Gaarii' : 'Very Good' };
    if (score >= 65) return { grade: 'C', desc: lang === 'om' ? 'Giddugaleessa' : 'Good' };
    if (score >= 50) return { grade: 'D', desc: lang === 'om' ? 'Qoqqobamaa' : 'Satisfactory' };
    return { grade: 'F', desc: lang === 'om' ? 'Kuwe' : 'Fail' };
  };

  const subjectList = [
    { key: 'afaanOromoo', nameOm: 'Afaan Oromoo', nameEn: 'Afaan Oromoo', score: student.scores.afaanOromoo },
    { key: 'english', nameOm: 'Afaan Ingilizii (English)', nameEn: 'English Language', score: student.scores.english },
    { key: 'herrega', nameOm: 'Herrega (Mathematics)', nameEn: 'Mathematics', score: student.scores.herrega },
    { key: 'saayinsii', nameOm: 'Saayinsii Waliigalaa / Naannoo', nameEn: 'General / Environmental Science', score: student.scores.saayinsii },
    { key: 'hawaasaa', nameOm: 'Saayinsii Hawaasaa', nameEn: 'Social Studies', score: student.scores.hawaasaa },
    { key: 'lammummaa', nameOm: 'Barnoota Lammummaa', nameEn: 'Citizenship Education', score: student.scores.lammummaa },
    { key: 'ict', nameOm: 'Teeknooloojii Odeeffannoo (ICT)', nameEn: 'Information Tech (ICT)', score: student.scores.ict },
    { key: 'fayyaaQaamaa', nameOm: 'Barnoota Fayyaa fi Jabina Qaamaa', nameEn: 'Health & Physical Education', score: student.scores.fayyaaQaamaa },
    { key: 'aartii', nameOm: 'Aartii fi Muuziqaa (PVA)', nameEn: 'Performing & Visual Arts', score: student.scores.aartii },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-4xl w-full my-auto overflow-hidden shadow-2xl border border-slate-300 flex flex-col">
        
        {/* Modal Controls Toolbar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">
              {lang === 'om' ? 'Kaartaa Qabxii Barataa - Gabaasa Seera Qabeessa' : 'Official Student Academic Transcript'}
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

        {/* Printable Certificate / Report Card Document */}
        <div className="print-area p-8 sm:p-12 text-slate-900 bg-white">
          
          {/* Official Outer Border & Header */}
          <div className="border-4 border-double border-emerald-900 p-6 sm:p-8 rounded-lg relative">
            
            {/* Header Lockup - Trilingual with Official Logo */}
            <div className="text-center pb-6 border-b-2 border-emerald-900 space-y-1">
              <div className="flex items-center justify-center mb-2">
                <img
                  src="/assets/aistudio/logo_a3828f5b.png"
                  alt="Mana Barumsaa Yooyyaa Logo"
                  className="w-22 h-22 object-contain drop-shadow-sm"
                />
              </div>
              <div className="text-xs uppercase font-semibold tracking-widest text-slate-600">
                {lang === 'om'
                  ? 'REPUBLIKA DEMOKRAATAWA FEDERAALAWA ITOOPHIYAA · BIROO BARNOOTA OROMIYAA'
                  : lang === 'am'
                  ? 'የኢትዮጵያ ፌዴራላዊ ዴሞክራሲያዊ ሪፐብሊክ · የኦሮሚያ ትምህርት ቢሮ'
                  : 'FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA · OROMIA REGIONAL EDUCATION BUREAU'}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 uppercase pt-1">
                MANA BARUMSAA SADARKAA 1FFAA YOOYYAA (DHUNFAA)
              </h1>
              <div className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                YOOYYAA PRIMARY SCHOOL (PRIVATE)
              </div>
              <div className="text-sm font-bold text-emerald-900">
                የዮያ አንደኛ ደረጃ የግል ትምህርት ቤት
              </div>
              <div className="inline-block mt-2 px-4 py-1 bg-emerald-900 text-white text-xs font-bold uppercase tracking-widest rounded-sm">
                {t.reportCardTitle} · {t.academicReport}
              </div>
            </div>

            {/* Student Profile Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-300 text-xs">
              <div>
                <span className="text-slate-500 block">{t.studentName}:</span>
                <span className="font-bold text-sm text-slate-900">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.rollNumber}:</span>
                <span className="font-bold font-mono text-slate-900">{student.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.thGrade} &amp; {t.thSection}:</span>
                <span className="font-bold text-slate-900">{student.grade} ({student.section})</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.gender}:</span>
                <span className="font-bold text-slate-900">
                  {student.gender === 'Dhiira' ? (lang === 'om' ? 'Dhiira (M)' : 'Male') : (lang === 'om' ? 'Dubara (F)' : 'Female')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.academicYear}:</span>
                <span className="font-semibold text-slate-900">{student.academicYear}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.semester}:</span>
                <span className="font-semibold text-slate-900">
                  {student.semester === 'Semesteera 1ffaa' ? (lang === 'om' ? 'Semesteera 1ffaa' : '1st Semester') : (lang === 'om' ? 'Semesteera 2ffaa' : '2nd Semester')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.conduct}:</span>
                <span className="font-semibold text-slate-900">{student.conduct}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.absentDays}:</span>
                <span className="font-semibold text-slate-900">{student.absentDays} {lang === 'om' ? 'Guyyoota' : 'Days'}</span>
              </div>
            </div>

            {/* Subject Scores Table */}
            <div className="py-6">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase">
                    <th className="p-2.5 border-r border-slate-300">#</th>
                    <th className="p-2.5 border-r border-slate-300">
                      {lang === 'om' ? 'Gosa Barnootaa (Subjects)' : 'Subject Name'}
                    </th>
                    <th className="p-2.5 border-r border-slate-300 text-center">
                      {lang === 'om' ? 'Qabxii (100%)' : 'Score (100%)'}
                    </th>
                    <th className="p-2.5 border-r border-slate-300 text-center">
                      {lang === 'om' ? 'Sadarkaa (Grade)' : 'Grade'}
                    </th>
                    <th className="p-2.5 text-center">
                      {lang === 'om' ? 'Ibsa Dandeettii' : 'Achievement Level'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjectList.map((sub, index) => {
                    const gradeInfo = getLetterGrade(sub.score);
                    return (
                      <tr key={sub.key} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2 border-r border-slate-300 font-mono text-slate-400">{index + 1}</td>
                        <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                          {lang === 'om' ? sub.nameOm : sub.nameEn}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono tabular-nums font-bold">
                          {sub.score}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold font-mono">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs ${
                              gradeInfo.grade === 'F' ? 'text-rose-700 bg-rose-50' : 'text-slate-900'
                            }`}
                          >
                            {gradeInfo.grade}
                          </span>
                        </td>
                        <td className="p-2 text-center text-[11px] text-slate-600">
                          {gradeInfo.desc}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Performance Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-emerald-50/70 border border-emerald-900/30 rounded-lg text-xs">
              <div>
                <span className="text-slate-600 block">{t.thTotal}:</span>
                <span className="font-bold text-base font-mono text-slate-900">
                  {student.total} <span className="text-xs text-slate-500 font-normal">/ {subjectList.length * 100}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">{t.thAvg}:</span>
                <span className="font-bold text-base font-mono text-emerald-900">
                  {student.average}%
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">{t.thRank}:</span>
                <span className="font-bold text-base font-mono text-slate-900">
                  {classRank ? `${classRank}ffaa` : '1ffaa'} {totalInClass ? `(${totalInClass} keessaa)` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">{t.thStatus}:</span>
                <span
                  className={`inline-block px-3 py-1 rounded-md font-bold text-xs ${
                    student.status === 'Darbe'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-rose-700 text-white'
                  }`}
                >
                  {student.status === 'Darbe'
                    ? (lang === 'om' ? 'DARBEERA (PROMOTED)' : 'PROMOTED')
                    : (lang === 'om' ? 'KUWEERA (RETAINED)' : 'RETAINED')}
                </span>
              </div>
            </div>

            {/* Teacher Remarks & Grading Scale */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-800">{t.teacherRemarks}: </span>
                <span className="italic text-slate-700">
                  "{student.teacherRemarks || (lang === 'om' ? 'Barattuu cimmittii fi qajeeltuu.' : 'Good academic performance and respectful conduct.')}"
                </span>
              </div>
              <div className="text-[10px] text-slate-500">
                {t.gradingScale}
              </div>
            </div>

            {/* Official Signatures & Seal Section */}
            <div className="mt-8 pt-6 border-t-2 border-emerald-900/60 grid grid-cols-3 gap-6 text-center text-xs">
              
              {/* Homeroom Teacher */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-36 border-b border-slate-800 mb-1.5 pb-1 font-serif italic text-slate-700 text-sm">
                  Barsiisaa Kutaa
                </div>
                <div className="font-semibold text-slate-900">{t.homeroomTeacherSig}</div>
                <div className="text-[10px] text-slate-400">Yooyyaa Primary School</div>
              </div>

              {/* Registrar */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-36 border-b border-slate-800 mb-1.5 pb-1 font-serif italic text-slate-700 text-sm">
                  Registrar
                </div>
                <div className="font-semibold text-slate-900">{t.registrarSig}</div>
                <div className="text-[10px] text-slate-400">Galmee Barattootaa</div>
              </div>

              {/* Principal Stamp & Signature */}
              <div className="flex flex-col items-center justify-end relative">
                {/* School Seal Stamp Graphic */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-800/80 p-1 flex items-center justify-center text-center rotate-[-8deg] mb-1">
                  <div className="text-[8px] font-bold text-emerald-900 leading-tight uppercase">
                    ★ YOOYYAA PRIMARY ★<br />
                    CHAAPPAA SEERAA<br />
                    ★ PRINCIPAL SEAL ★
                  </div>
                </div>
                <div className="w-36 border-b border-slate-800 mb-1.5"></div>
                <div className="font-bold text-slate-900">{t.directorSeal}</div>
                <div className="text-[10px] text-slate-500">M/B Sadarkaa 1ffaa Yooyyaa</div>
              </div>
            </div>

            {/* Official Notice Footer */}
            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-widest">
              {t.officialRemark}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
