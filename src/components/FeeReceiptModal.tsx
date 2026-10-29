import React from 'react';
import { Language, FeeReceipt } from '../types';
import { getTranslation } from '../i18n/translations';
import { Printer, X, Receipt, CheckCircle2, ShieldCheck } from 'lucide-react';

interface FeeReceiptModalProps {
  receipt: FeeReceipt | null;
  lang: Language;
  onClose: () => void;
}

export const FeeReceiptModal: React.FC<FeeReceiptModalProps> = ({
  receipt,
  lang,
  onClose,
}) => {
  if (!receipt) return null;
  const t = getTranslation(lang);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-auto overflow-hidden shadow-2xl border border-slate-300 flex flex-col">
        
        {/* Toolbar (Hidden during print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">
              {lang === 'om'
                ? 'Nagahee Kaffaltii Barataa (Attachment)'
                : lang === 'am'
                ? 'የተማሪ የክፍያ ደረሰኝ ማያያዣ (Attachment)'
                : 'Student Fee Receipt Attachment'}
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

        {/* Printable Receipt Attachment Document */}
        <div className="print-area p-8 sm:p-10 text-slate-900 bg-white">
          <div className="border-2 border-emerald-900 p-6 sm:p-8 rounded-lg relative space-y-6">
            
            {/* Trilingual Header with Official School Logo */}
            <div className="text-center pb-5 border-b-2 border-emerald-900 space-y-1">
              <div className="flex items-center justify-center gap-3 mb-2">
                <img
                  src="/assets/aistudio/logo_a3828f5b.png"
                  alt="Mana Barumsaa Yooyyaa Emblem"
                  className="w-20 h-20 object-contain drop-shadow-sm"
                />
              </div>
              <div className="text-[11px] uppercase font-bold tracking-widest text-slate-600">
                BIROO BARNOOTA OROMIYAA · OROMIA EDUCATION BUREAU · የኦሮሚያ ትምህርት ቢሮ
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-emerald-950 uppercase">
                MANA BARUMSAA SADARKAA 1FFAA YOOYYAA (DHUNFAA)
              </h1>
              <div className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                YOOYYAA PRIMARY SCHOOL (PRIVATE)
              </div>
              <div className="text-sm font-bold text-emerald-900">
                የዮያ አንደኛ ደረጃ የግል ትምህርት ቤት
              </div>
              
              <div className="inline-block mt-2 px-4 py-1 bg-emerald-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                NAGAHEE KAFFALTII BARATAA / STUDENT FEE RECEIPT ATTACHMENT / የክፍያ ደረሰኝ
              </div>
            </div>

            {/* Receipt Meta & Numbering */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-2 border-b border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">{t.receiptNo}: </span>
                <span className="font-mono font-bold text-slate-900 text-sm">{receipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{t.paymentDate}: </span>
                <span className="font-semibold text-slate-900">{receipt.paidDate}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">{t.paymentMethod}: </span>
                <span className="font-semibold text-emerald-800">{receipt.paymentMethod}</span>
              </div>
              {receipt.telebirrId && (
                <div className="flex items-center gap-1.5 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 text-cyan-900">
                  <span className="font-semibold text-slate-600">Telebirr ID:</span>
                  <span className="font-mono font-bold text-cyan-800">{receipt.telebirrId}</span>
                </div>
              )}
            </div>

            {/* Student Identification Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">{t.studentName}:</span>
                <span className="font-bold text-sm text-slate-900">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.rollNumber}:</span>
                <span className="font-bold font-mono text-slate-900">{receipt.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.thGrade} &amp; {t.thSection}:</span>
                <span className="font-bold text-slate-900">{receipt.grade} ({receipt.section})</span>
              </div>
              <div>
                <span className="text-slate-500 block">{t.feePlan}:</span>
                <span className="font-bold text-slate-900">{receipt.feeType}</span>
              </div>
            </div>

            {/* Payment Details Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 uppercase">
                <tr>
                  <th className="p-3 border-r border-slate-300">{lang === 'om' ? 'Ibsa Kaffaltii (Fee Description)' : lang === 'am' ? 'የክፍያው ዝርዝር' : 'Fee Description'}</th>
                  <th className="p-3 border-r border-slate-300">{lang === 'om' ? 'Yeroo/Ji\'oota Kaffalame' : lang === 'am' ? 'የተከፈለበት ወቅት' : 'Period / Months Covered'}</th>
                  <th className="p-3 text-right">{t.amountPaid}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="p-3 border-r border-slate-300 font-semibold text-slate-900">
                    {lang === 'om' ? `Kaffaltii Barumsaa (${receipt.feeType})` : lang === 'am' ? `የትምህርት ቤት ክፍያ (${receipt.feeType})` : `Tuition Fee (${receipt.feeType})`}
                  </td>
                  <td className="p-3 border-r border-slate-300 text-slate-700">
                    {receipt.forPeriod}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-900 text-sm">
                    {receipt.amountPaid.toLocaleString()} ETB
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Box */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-emerald-50/80 border border-emerald-900/30 rounded-lg text-xs">
              <div>
                <span className="text-slate-600 block">{lang === 'om' ? 'Ida\'ama Kaffalamu (Due)' : lang === 'am' ? 'ጠቅላላ ክፍያ' : 'Total Due'}:</span>
                <span className="font-bold text-sm font-mono text-slate-900">
                  {receipt.totalDue.toLocaleString()} ETB
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">{lang === 'om' ? 'Hamma Kaffalame (Paid)' : lang === 'am' ? 'የተከፈለ' : 'Paid Today'}:</span>
                <span className="font-bold text-base font-mono text-emerald-900">
                  {receipt.amountPaid.toLocaleString()} ETB
                </span>
              </div>
              <div>
                <span className="text-slate-600 block">{t.remainingBalance}:</span>
                <span className={`font-bold text-sm font-mono ${receipt.remainingBalance === 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {receipt.remainingBalance.toLocaleString()} ETB {receipt.remainingBalance === 0 && '✓ (Qulqulluu)'}
                </span>
              </div>
            </div>

            {/* Telebirr Digital Payment Verification Badge */}
            {receipt.telebirrId && (
              <div className="text-xs bg-cyan-50/90 p-3 rounded-lg border-2 border-cyan-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded bg-cyan-700 text-white font-black text-[10px] tracking-wider uppercase shadow-2xs">
                    TELEBIRR VERIFIED
                  </span>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      {lang === 'om' ? 'Lakk. Eenyummaa Kaffaltii Telebirr (Tx ID):' : lang === 'am' ? 'የቴሌብር ማመሳከሪያ ቁጥር (Tx ID)፡' : 'Telebirr Transaction Reference ID:'}
                    </span>
                    <span className="font-mono font-black text-cyan-950 text-sm tracking-wide">
                      {receipt.telebirrId}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-cyan-800 font-bold uppercase tracking-wider text-right">
                  ✓ Telebirr Mirkanaa'e
                </div>
              </div>
            )}

            {/* Notes / Reference */}
            {receipt.referenceNo && (
              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-md border border-slate-200">
                <span className="font-semibold text-slate-800">{lang === 'om' ? 'Lakk. Ragaa Baankii / Ragaa:' : lang === 'am' ? 'የባንክ ማመሳከሪያ ቁጥር፡' : 'Bank/Transaction Reference:'} </span>
                <span className="font-mono text-slate-900">{receipt.referenceNo}</span>
                {receipt.notes && <span className="ml-2 italic text-slate-500">· {receipt.notes}</span>}
              </div>
            )}

            {/* Signatures & School Seal */}
            <div className="pt-6 border-t-2 border-emerald-900/40 grid grid-cols-3 gap-6 text-center text-xs">
              
              {/* Cashier / Accountant */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-36 border-b border-slate-800 mb-1.5 pb-1 font-serif italic text-slate-700 text-sm">
                  {receipt.cashierName || 'Darajjee T.'}
                </div>
                <div className="font-bold text-slate-900">{t.cashierSig}</div>
                <div className="text-[10px] text-slate-400">Faayinaansii Yooyyaa</div>
              </div>

              {/* School Official Stamp Seal */}
              <div className="flex flex-col items-center justify-end relative">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-800/80 p-1 flex items-center justify-center text-center rotate-[-6deg] mb-1">
                  <div className="text-[7.5px] font-bold text-emerald-900 leading-tight uppercase">
                    ★ YOOYYAA PRIVATE ★<br />
                    CHAAPPAA KAFFALTII<br />
                    ★ FINANCE SEAL ★
                  </div>
                </div>
                <div className="w-32 border-b border-slate-800 mb-1"></div>
                <div className="text-[10px] font-semibold text-slate-600">Chaappaa Seeraa</div>
              </div>

              {/* Principal Approval */}
              <div className="flex flex-col items-center justify-end">
                <div className="w-36 border-b border-slate-800 mb-1.5 pb-1 font-serif italic text-slate-700 text-sm">
                  Hoggana Mana Barumsaa
                </div>
                <div className="font-bold text-slate-900">{t.directorSeal}</div>
                <div className="text-[10px] text-slate-400">Yooyyaa Primary School</div>
              </div>
            </div>

            <div className="pt-2 text-center text-[9px] text-slate-400 uppercase tracking-widest">
              {t.officialRemark}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
