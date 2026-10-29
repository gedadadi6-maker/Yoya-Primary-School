import React, { useState } from 'react';
import { Language, StudentRecord, SubjectScore } from '../types';
import { getTranslation } from '../i18n/translations';
import { Award, BookOpen, CheckCircle, Calculator, FileText, Trash2, Eye, UserPlus, Info, Send } from 'lucide-react';

interface TeacherPanelProps {
  lang: Language;
  students: StudentRecord[];
  onAddStudent: (student: Omit<StudentRecord, 'id' | 'createdAt'>) => void;
  onDeleteStudent: (id: string) => void;
  onViewReportCard: (student: StudentRecord) => void;
  onSendReportToAdmin?: (memo: string) => void;
}

export const TeacherPanel: React.FC<TeacherPanelProps> = ({
  lang,
  students,
  onAddStudent,
  onDeleteStudent,
  onViewReportCard,
  onSendReportToAdmin,
}) => {
  const t = getTranslation(lang);

  // Form states
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [grade, setGrade] = useState('Kutaa 8');
  const [section, setSection] = useState('A');
  const [gender, setGender] = useState<'Dhiira' | 'Dubara'>('Dhiira');
  const [semester, setSemester] = useState<'Semesteera 1ffaa' | 'Semesteera 2ffaa'>('Semesteera 1ffaa');
  const [conduct, setConduct] = useState<'Baay\'ee Gaarii' | 'Gaarii' | 'Giddugaleessa'>('Baay\'ee Gaarii');
  const [absentDays, setAbsentDays] = useState('0');
  const [teacherRemarks, setTeacherRemarks] = useState('');

  // Department Report to Admin Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportGrade, setReportGrade] = useState('Kutaa 8');
  const [reportNote, setReportNote] = useState('');

  // Mode: Full Curriculum (9 subjects) vs Core Curriculum (3 subjects)
  const [curriculumMode, setCurriculumMode] = useState<'core' | 'full'>('full');

  // Scores
  const [scores, setScores] = useState<SubjectScore>({
    afaanOromoo: 85,
    english: 80,
    herrega: 75,
    saayinsii: 82,
    hawaasaa: 78,
    lammummaa: 80,
    ict: 75,
    fayyaaQaamaa: 90,
    aartii: 80,
  });

  const handleScoreChange = (subject: keyof SubjectScore, val: string) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setScores((prev) => ({
      ...prev,
      [subject]: num,
    }));
  };

  // Calculate stats based on curriculum mode
  const activeSubjects = curriculumMode === 'core' 
    ? [scores.herrega, scores.english, scores.saayinsii]
    : Object.values(scores);

  const totalScore = Math.round(activeSubjects.reduce((acc, curr) => acc + curr, 0));
  const maxPossible = activeSubjects.length * 100;
  const averageScore = Number((totalScore / activeSubjects.length).toFixed(1));
  const isPassed = averageScore >= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'om' ? 'Maaloo, Maqaa barataa guutaa!' : 'Please enter the student name!');
      return;
    }

    const roll = rollNumber.trim() || `YY-${Math.floor(100 + Math.random() * 900)}`;

    onAddStudent({
      rollNumber: roll,
      name: name.trim(),
      gender,
      grade,
      section,
      semester,
      academicYear: '2018 A.L. (2025/2026)',
      scores,
      total: totalScore,
      average: averageScore,
      status: isPassed ? 'Darbe' : 'Kuwe',
      conduct,
      attendanceDays: 90 - (parseInt(absentDays) || 0),
      absentDays: parseInt(absentDays) || 0,
      teacherRemarks: teacherRemarks.trim() || (isPassed 
        ? (lang === 'om' ? 'Hirmaannaa gaarii qaba.' : 'Good academic performance.')
        : (lang === 'om' ? 'Deeggarsa dabalataa barbaada.' : 'Requires academic intervention.')),
      monthlyFee: 1600,
      feePlan: 'Ji\'aa',
      paidMonths: [],
      totalFeePaid: 0,
      remainingBalance: 16000,
      feeStatus: 'Hin Kaffalle',
    });

    // Reset some fields for next student
    setName('');
    setRollNumber('');
    setTeacherRemarks('');
    alert(t.gradeSubmitSuccess);
  };

  const clearForm = () => {
    setName('');
    setRollNumber('');
    setAbsentDays('0');
    setTeacherRemarks('');
    setScores({
      afaanOromoo: 0,
      english: 0,
      herrega: 0,
      saayinsii: 0,
      hawaasaa: 0,
      lammummaa: 0,
      ict: 0,
      fayyaaQaamaa: 0,
      aartii: 0,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-emerald-700" />
              <span>{t.teacherTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.teacherSubtitle}</p>
          </div>

          {/* Curriculum Toggle */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
            <span className="text-slate-500 font-medium px-2">
              {lang === 'om' ? 'Gosa Silabasii:' : 'Curriculum:'}
            </span>
            <button
              type="button"
              onClick={() => setCurriculumMode('core')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                curriculumMode === 'core'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'om' ? 'Barnoota Bu\'uuraa (3)' : 'Core Subjects (3)'}
            </button>
            <button
              type="button"
              onClick={() => setCurriculumMode('full')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                curriculumMode === 'full'
                  ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'om' ? 'Silabasii Guutuu (9)' : 'Full Primary (9)'}
            </button>
          </div>
        </div>

        {/* Real-time Notice & Transmit Report to Admin Button */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-emerald-50/70 p-3.5 rounded-lg border border-emerald-200/60">
          <div className="flex items-center gap-2.5 text-emerald-900">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === 'om'
                ? 'Yoo qabxii "Qabxii Galmeessi & Ergi" jettu, daataan kallattiin gara Registrar fi Gabatee Hoggana Mana Barumsaa Yooyyaatti gabaafama.'
                : 'When you submit grades, records immediately sync in real-time to the Registrar and School Principal Admin dashboard.'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t.transmitReportBtn}</span>
          </button>
        </div>
      </div>

      {/* Transmit Academic Memo Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
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
                ? 'Gabaasa qabxii kutaa filatamee fi yaada qabdan battalatti gara Admin Panel\'tti ergaa.'
                : 'Transmit class grade completion status or an official memo directly to the Principal.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">{t.thGrade}</label>
              <select
                value={reportGrade}
                onChange={(e) => setReportGrade(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => `Kutaa ${i + 1}`).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'om' ? 'Ibsa Gabaasaa / Yaada Barsiisaa' : 'Report Message / Memo'}
              </label>
              <textarea
                rows={3}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder={lang === 'om' ? 'Fkn. Qabxiin barattootaa xumurameera; qabxiin olaanaan 94% dha.' : 'e.g., Grades completed for 25 students; highest score is 94%.'}
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
                  const count = students.filter(s => s.grade === reportGrade).length;
                  const memoText = `${reportGrade}: Barattoota ${count} qabxiin isaanii to'atameera. ${reportNote.trim()}`;
                  if (onSendReportToAdmin) {
                    onSendReportToAdmin(memoText);
                  }
                  setIsReportModalOpen(false);
                  setReportNote('');
                  alert(t.reportSentSuccess);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                {t.transmitReportBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grade Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
        
        {/* Student Demographics Section */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'om' ? '1. Odeeffannoo Barataa' : '1. Student Identification'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Student Name */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.studentName} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.studentNamePlaceholder}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Roll / ID Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.rollNumber}
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder={t.rollNumberPlaceholder}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.gender}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Dhiira' | 'Dubara')}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Dhiira">{t.male}</option>
                <option value="Dubara">{t.female}</option>
              </select>
            </div>

            {/* Grade (Kutaa) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.thGrade} <span className="text-rose-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {Array.from({ length: 12 }, (_, i) => `Kutaa ${i + 1}`).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.section}
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="A">Koree A (Section A)</option>
                <option value="B">Koree B (Section B)</option>
                <option value="C">Koree C (Section C)</option>
                <option value="D">Koree D (Section D)</option>
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.semester}
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Semesteera 1ffaa">{t.sem1}</option>
                <option value="Semesteera 2ffaa">{t.sem2}</option>
              </select>
            </div>

            {/* Conduct */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.conduct}
              </label>
              <select
                value={conduct}
                onChange={(e) => setConduct(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Baay'ee Gaarii">{t.conductExcellent}</option>
                <option value="Gaarii">{t.conductGood}</option>
                <option value="Giddugaleessa">{t.conductFair}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subject Scores Section */}
        <div>
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{t.subjectsHeading}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {lang === 'om' ? 'Qabxii 0 hanga 100 galchaa' : 'Scores range from 0 to 100'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {/* Herrega / Maths */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {t.subHerrega}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.herrega || ''}
                onChange={(e) => handleScoreChange('herrega', e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                placeholder="0 - 100"
                required
              />
            </div>

            {/* English */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {t.subEnglish}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.english || ''}
                onChange={(e) => handleScoreChange('english', e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                placeholder="0 - 100"
                required
              />
            </div>

            {/* Saayinsii / Science */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                {t.subSaayinsii}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={scores.saayinsii || ''}
                onChange={(e) => handleScoreChange('saayinsii', e.target.value)}
                className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                placeholder="0 - 100"
                required
              />
            </div>

            {curriculumMode === 'full' && (
              <>
                {/* Afaan Oromoo */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subAfaanOromoo}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.afaanOromoo || ''}
                    onChange={(e) => handleScoreChange('afaanOromoo', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Saayinsii Hawaasaa */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subHawaasaa}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.hawaasaa || ''}
                    onChange={(e) => handleScoreChange('hawaasaa', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Barnoota Lammummaa */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subLammummaa}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.lammummaa || ''}
                    onChange={(e) => handleScoreChange('lammummaa', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>

                {/* ICT */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subICT}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.ict || ''}
                    onChange={(e) => handleScoreChange('ict', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Fayyaa & Jabina Qaamaa */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subFayyaa}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.fayyaaQaamaa || ''}
                    onChange={(e) => handleScoreChange('fayyaaQaamaa', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>

                {/* Aartii */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    {t.subAartii}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scores.aartii || ''}
                    onChange={(e) => handleScoreChange('aartii', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm bg-white font-mono tabular-nums border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                    placeholder="0 - 100"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Remarks and Absences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.absentDays}
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={absentDays}
              onChange={(e) => setAbsentDays(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.teacherRemarks}
            </label>
            <input
              type="text"
              value={teacherRemarks}
              onChange={(e) => setTeacherRemarks(e.target.value)}
              placeholder={t.teacherRemarksPlaceholder}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Live Calculation Preview Card */}
        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide block">
                {t.thTotal}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {totalScore} <span className="text-xs font-normal text-slate-500">/ {maxPossible}</span>
              </span>
            </div>

            <div className="border-l border-emerald-200 pl-6">
              <span className="text-xs text-slate-500 uppercase tracking-wide block">
                {t.thAvg}
              </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900">
                {averageScore}%
              </span>
            </div>

            <div className="border-l border-emerald-200 pl-6">
              <span className="text-xs text-slate-500 uppercase tracking-wide block">
                {t.thStatus}
              </span>
              <span
                className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${
                  isPassed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {isPassed
                  ? (lang === 'om' ? 'Darbe (Pass)' : 'Promoted')
                  : (lang === 'om' ? 'Kuwe (Fail)' : 'Retained')}
              </span>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearForm}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
            >
              {t.clearForm}
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.submitGrades}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Recently Recorded Grade Roster in Current Grade */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'om' ? 'Galmee Barattoota Kutaa Kanarraa' : 'Student Records in Grade'}: {grade}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'om'
                ? 'Barattoota kutaa filatame keessa jiran ilaalaa, kaartaa qabxii isaanii baasaa.'
                : 'Browse records in selected grade, preview official transcripts.'}
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
            {students.filter((s) => s.grade === grade).length} {lang === 'om' ? 'Barattoota' : 'Students'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">{t.thStudentName}</th>
                <th className="p-3">{t.thRollNo}</th>
                <th className="p-3">{t.thSection}</th>
                <th className="p-3">{t.thHerrega}</th>
                <th className="p-3">{t.thEnglish}</th>
                <th className="p-3">{t.thScience}</th>
                <th className="p-3">{t.thTotal}</th>
                <th className="p-3">{t.thAvg}</th>
                <th className="p-3">{t.thStatus}</th>
                <th className="p-3 text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students
                .filter((s) => s.grade === grade)
                .map((stud) => (
                  <tr key={stud.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-medium text-slate-900">{stud.name}</td>
                    <td className="p-3 font-mono text-slate-600">{stud.rollNumber}</td>
                    <td className="p-3 text-slate-600">{stud.section}</td>
                    <td className="p-3 font-mono tabular-nums">{stud.scores.herrega}</td>
                    <td className="p-3 font-mono tabular-nums">{stud.scores.english}</td>
                    <td className="p-3 font-mono tabular-nums">{stud.scores.saayinsii}</td>
                    <td className="p-3 font-mono tabular-nums font-semibold">{stud.total}</td>
                    <td className="p-3 font-mono tabular-nums font-bold text-emerald-800">
                      {stud.average}%
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          stud.status === 'Darbe'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {stud.status === 'Darbe'
                          ? (lang === 'om' ? 'Darbe' : 'Pass')
                          : (lang === 'om' ? 'Kuwe' : 'Fail')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onViewReportCard(stud)}
                          className="px-2 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                          title="Kartaa Qabxii Baasi / View Report Card"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{lang === 'om' ? 'Kartaa' : 'Card'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteStudent(stud.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Haqi / Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              {students.filter((s) => s.grade === grade).length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500">
                    {lang === 'om'
                      ? 'Kutaa kanarratti qabxiin barataa ammaaf hin galmoofne.'
                      : 'No student grades registered in this grade yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
