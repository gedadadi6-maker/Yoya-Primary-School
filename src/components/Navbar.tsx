import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { GraduationCap, Languages, RefreshCw, FileSpreadsheet, Wallet } from 'lucide-react';

interface NavbarProps {
  currentTab: 'barsiisa' | 'registrar' | 'finance' | 'admin';
  onTabChange: (tab: 'barsiisa' | 'registrar' | 'finance' | 'admin') => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  onResetData: () => void;
  onExportCSV: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  lang,
  onSelectLang,
  onResetData,
  onExportCSV,
}) => {
  const t = getTranslation(lang);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner with Trilingual Motto and Private School Tag */}
      <div className="bg-emerald-900 text-emerald-50 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-950">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{t.motto}</span>
          <span className="hidden sm:inline text-emerald-300">· {t.privateSchoolTag}</span>
        </div>
        <div className="flex items-center gap-3 text-emerald-200 text-[11px]">
          <span>Bara Barnootaa 2018 A.L. (2025/2026)</span>
          <span aria-hidden="true">·</span>
          <span>Aanaa Yooyyaa / Yooyyaa District</span>
        </div>
      </div>

      {/* Main Header 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 gap-4">
          
          {/* Zone 1: Trilingual Brand Wordmark & Official Emblem */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md ring-2 ring-emerald-600/30 shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/logo_a3828f5b.png"
                alt="Mana Barumsaa Sadarkaa 1ffaa Yooyyaa"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase leading-tight">
                MANA BARUMSAA SADARKAA 1FFAA YOOYYAA (DHUNFAA)
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                YOOYYAA PRIMARY SCHOOL (PRIVATE)
              </div>
              <div className="text-xs font-semibold text-emerald-800">
                የዮያ አንደኛ ደረጃ የግል ትምህርት ቤት
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Role Tabs (Segmented Control) */}
          <nav className="hidden xl:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('barsiisa')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'barsiisa'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">👨‍🏫</span>
              <span>{t.navTeacher}</span>
            </button>

            <button
              onClick={() => onTabChange('registrar')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'registrar'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">📁</span>
              <span>{t.navRegistrar}</span>
            </button>

            <button
              onClick={() => onTabChange('finance')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'finance'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">💰</span>
              <span>{t.navFinance}</span>
            </button>

            <button
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">👑</span>
              <span>{t.navAdmin}</span>
            </button>
          </nav>

          {/* Zone 3: Trilingual Switcher & Utility Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Trilingual Language Selector */}
            <div className="flex items-center p-1 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900">
              <Languages className="w-3.5 h-3.5 text-emerald-700 mr-1.5 ml-1 hidden sm:inline" />
              <button
                onClick={() => onSelectLang('om')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  lang === 'om' ? 'bg-emerald-700 text-white font-black' : 'hover:bg-emerald-100 text-emerald-900'
                }`}
                title="Afaan Oromoo"
              >
                OR
              </button>
              <button
                onClick={() => onSelectLang('en')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  lang === 'en' ? 'bg-emerald-700 text-white font-black' : 'hover:bg-emerald-100 text-emerald-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onSelectLang('am')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  lang === 'am' ? 'bg-emerald-700 text-white font-black' : 'hover:bg-emerald-100 text-emerald-900'
                }`}
                title="አማርኛ"
              >
                አማ
              </button>
            </div>

            <button
              onClick={onExportCSV}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title={t.exportData}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>

            <button
              onClick={onResetData}
              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title={t.resetData}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Mobile / Tablet Navigation Tabs */}
        <div className="flex xl:hidden pb-3 gap-1.5 overflow-x-auto">
          <button
            onClick={() => onTabChange('barsiisa')}
            className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-lg text-center whitespace-nowrap cursor-pointer ${
              currentTab === 'barsiisa'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            👨‍🏫 {t.navTeacher}
          </button>
          <button
            onClick={() => onTabChange('registrar')}
            className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-lg text-center whitespace-nowrap cursor-pointer ${
              currentTab === 'registrar'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            📁 {t.navRegistrar}
          </button>
          <button
            onClick={() => onTabChange('finance')}
            className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-lg text-center whitespace-nowrap cursor-pointer ${
              currentTab === 'finance'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            💰 {t.navFinance}
          </button>
          <button
            onClick={() => onTabChange('admin')}
            className={`flex-1 py-2 px-2.5 text-xs font-medium rounded-lg text-center whitespace-nowrap cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            👑 {t.navAdmin}
          </button>
        </div>
      </div>
    </header>
  );
};
