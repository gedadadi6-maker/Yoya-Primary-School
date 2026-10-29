import React, { useState } from 'react';
import { Language, StockItem, StockTransaction } from '../types';
import { getTranslation } from '../i18n/translations';
import { Boxes, Plus, Minus, Search, AlertTriangle, CheckCircle2, ArrowDownCircle, ArrowUpCircle, PackagePlus, FileSpreadsheet, Send, Info } from 'lucide-react';

interface RegistrarPanelProps {
  lang: Language;
  stock: StockItem[];
  onAddStockItem: (item: Omit<StockItem, 'id' | 'lastUpdated'>) => void;
  onUpdateStockQty: (itemId: string, diff: number, transaction: Omit<StockTransaction, 'id' | 'itemId' | 'date'>) => void;
  onSendReportToAdmin?: (memo: string) => void;
}

export const RegistrarPanel: React.FC<RegistrarPanelProps> = ({
  lang,
  stock,
  onAddStockItem,
  onUpdateStockQty,
  onSendReportToAdmin,
}) => {
  const t = getTranslation(lang);

  // Department report to Admin modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Item Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StockItem['category']>('Kitaabota');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Koppii');
  const [minThreshold, setMinThreshold] = useState('20');
  const [condition, setCondition] = useState<StockItem['condition']>('Haaraa');
  const [location, setLocation] = useState('Kuusaa B-01');
  const [notes, setNotes] = useState('');

  // Transaction Modal state (Stock In / Stock Out)
  const [activeItemModal, setActiveItemModal] = useState<{
    item: StockItem;
    type: 'Galii' | 'Baasii';
  } | null>(null);
  const [txQty, setTxQty] = useState('1');
  const [txPerson, setTxPerson] = useState('');
  const [txReason, setTxReason] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(lang === 'om' ? 'Maaloo, Maqaa meeshaa galchaa!' : 'Please enter item name!');
      return;
    }
    const qty = parseInt(quantity) || 0;
    if (qty <= 0) {
      alert(lang === 'om' ? 'Baay\'ina sirrii galchaa!' : 'Please enter a valid quantity!');
      return;
    }

    onAddStockItem({
      name: name.trim(),
      category,
      quantity: qty,
      unit,
      minThreshold: parseInt(minThreshold) || 10,
      condition,
      location: location.trim() || 'Kuusaa Mana Barnootaa',
      notes: notes.trim() || undefined,
    });

    setName('');
    setQuantity('');
    setNotes('');
    alert(lang === 'om' ? 'Meeshaan milkaa\'inaan galmaa\'eera!' : 'Item registered successfully!');
  };

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemModal) return;

    const qty = parseInt(txQty) || 0;
    if (qty <= 0) {
      alert(lang === 'om' ? 'Baay\'ina sirrii galchaa!' : 'Please enter a positive quantity!');
      return;
    }

    if (activeItemModal.type === 'Baasii' && qty > activeItemModal.item.quantity) {
      alert(
        lang === 'om'
          ? `Baay'inni baasuuf yaaltan (${qty}) baay'ina kuusaa keessa jiru (${activeItemModal.item.quantity}) irra caala!`
          : `Quantity to issue (${qty}) exceeds available stock (${activeItemModal.item.quantity})!`
      );
      return;
    }

    const diff = activeItemModal.type === 'Galii' ? qty : -qty;

    onUpdateStockQty(activeItemModal.item.id, diff, {
      itemName: activeItemModal.item.name,
      type: activeItemModal.type,
      quantity: qty,
      person: txPerson.trim() || (lang === 'om' ? 'Barsiisaa / Hojjetaa' : 'Staff Member'),
      reason: txReason.trim() || (activeItemModal.type === 'Galii' ? 'Dabalata Kuusaa' : 'Fayyadama Barumsaa'),
    });

    setActiveItemModal(null);
    setTxQty('1');
    setTxPerson('');
    setTxReason('');
  };

  // Filtered Stock Items
  const filteredStock = stock.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = stock.filter((item) => item.quantity <= item.minThreshold).length;

  return (
    <div className="space-y-8">
      {/* Header Info & Inventory Stats */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-6 h-6 text-emerald-700" />
              <span>{t.registrarTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">{t.registrarSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700">
              {lang === 'om' ? 'Gosa Meeshaa' : 'Item Kinds'}: <span className="font-bold text-emerald-800 font-mono">{stock.length}</span>
            </div>
            {lowStockCount > 0 && (
              <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-300 rounded-lg text-xs font-semibold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{lowStockCount} {lang === 'om' ? 'Hanqina Qabu' : 'Low Stock'}</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t.transmitReportBtn}</span>
            </button>
          </div>
        </div>

        {/* Real-time Notice */}
        <div className="mt-4 flex items-center gap-2.5 text-xs text-amber-900 bg-amber-50/70 p-3 rounded-lg border border-amber-200/60">
          <Info className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {lang === 'om'
              ? 'Meeshaaleen kuusaa haaratti galmaa\'anii fi baasii ta\'an battalatti gara Gabatee Hoggana Mana Barnootaatti (Admin) gabaafamu.'
              : 'All inventory additions and stock-out logs report and sync in real-time to the Principal Admin Dashboard.'}
          </span>
        </div>
      </div>

      {/* Transmit Inventory Memo Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-700" />
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
                ? 'Gabaasa kuusaa, meeshaalee dhumachaa jiran ykn xalayaa bittaa battalatti gara Hogganaatti ergaa.'
                : 'Transmit current inventory status, critical low-stock items, or restock requests directly to the Principal.'}
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'om' ? 'Ibsa Gabaasa Kuusaa (Inventory Memo)' : 'Inventory Status Memo'}
              </label>
              <textarea
                rows={3}
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
                placeholder={lang === 'om' ? `Fkn. Meeshaaleen ${lowStockCount} hanqina qabu. Qalamoonni fi waraqaan akka bitamu gaafanna.` : 'e.g. Low stock alert for markers and printing paper. Requisition requested.'}
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
                  const memoText = `Gabaasa Meeshaalee: Gosa ${stock.length} jiru (${lowStockCount} hanqina qabu). ${reportNote.trim()}`;
                  if (onSendReportToAdmin) {
                    onSendReportToAdmin(memoText);
                  }
                  setIsReportModalOpen(false);
                  setReportNote('');
                  alert(t.reportSentSuccess);
                }}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-lg cursor-pointer"
              >
                {t.transmitReportBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Stock Form */}
      <form onSubmit={handleAddItem} className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 flex items-center gap-2">
          <PackagePlus className="w-4 h-4 text-emerald-600" />
          <span>{t.addItemTitle}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Item Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.itemName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.itemNamePlaceholder}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Kitaabota">{t.catBooks}</option>
              <option value="Meeshaa Barsiisuu">{t.catTeaching}</option>
              <option value="Meeshaa Barcumaa">{t.catFurniture}</option>
              <option value="Meeshaa Barreessaa">{t.catStationery}</option>
              <option value="Laabooratorii">{t.catLab}</option>
              <option value="Kan Biraa">{t.catOther}</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.quantity} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.unit}
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Koppii">{t.unitCopy}</option>
              <option value="Tokko">{t.unitPiece}</option>
              <option value="Kartoona">{t.unitCarton}</option>
              <option value="Paakeettii">{t.unitPack}</option>
            </select>
          </div>

          {/* Low stock threshold */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.minThreshold}
            </label>
            <input
              type="number"
              min="1"
              value={minThreshold}
              onChange={(e) => setMinThreshold(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.condition}
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="Haaraa">{t.condNew}</option>
              <option value="Hojirra Jira">{t.condInUse}</option>
              <option value="Suphaa Barbaada">{t.condRepair}</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t.location}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.locationPlaceholder}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex-1 max-w-lg mr-4">
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={lang === 'om' ? 'Ibsa dabalataa meeshaa kanaa...' : 'Additional notes regarding storage...'}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addStockBtn}</span>
          </button>
        </div>
      </form>

      {/* Stock Inventory Table & Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'om' ? 'Meeshaa barbaadi...' : 'Search stock items...'}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs text-slate-600 font-medium whitespace-nowrap">
              {t.category}:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">{lang === 'om' ? 'Gosa Hunda' : 'All Categories'}</option>
              <option value="Kitaabota">{t.catBooks}</option>
              <option value="Meeshaa Barsiisuu">{t.catTeaching}</option>
              <option value="Meeshaa Barcumaa">{t.catFurniture}</option>
              <option value="Meeshaa Barreessaa">{t.catStationery}</option>
              <option value="Laabooratorii">{t.catLab}</option>
              <option value="Kan Biraa">{t.catOther}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">{t.thItemName}</th>
                <th className="p-3">{t.thCategory}</th>
                <th className="p-3">{t.thQty}</th>
                <th className="p-3">{t.condition}</th>
                <th className="p-3">{t.location}</th>
                <th className="p-3">{t.thAlert}</th>
                <th className="p-3 text-right">{t.thActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((item) => {
                const isLow = item.quantity <= item.minThreshold;
                const isCritical = item.quantity <= Math.floor(item.minThreshold / 2);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.notes && <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="p-3">
                      <span className="text-slate-600 font-medium">{item.category}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-mono tabular-nums text-sm font-bold text-slate-900">
                        {item.quantity}{' '}
                        <span className="text-xs font-normal text-slate-500">{item.unit}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {item.minThreshold}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-700">{item.condition}</span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {item.location || '-'}
                    </td>
                    <td className="p-3">
                      {isCritical ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          {t.criticalStock}
                        </span>
                      ) : isLow ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {t.lowStock}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                          {t.goodStock}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Stock In Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemModal({ item, type: 'Galii' });
                            setTxQty('10');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
                          title="Galii Meeshaa / Stock In"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{lang === 'om' ? 'Galii' : 'In'}</span>
                        </button>

                        {/* Stock Out Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemModal({ item, type: 'Baasii' });
                            setTxQty('5');
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                          title="Baasii Meeshaa / Stock Out"
                        >
                          <Minus className="w-3 h-3" />
                          <span>{lang === 'om' ? 'Baasii' : 'Out'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStock.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    {lang === 'om'
                      ? 'Meeshaan barbaaddan hin argamne.'
                      : 'No inventory items match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transaction (In / Out) Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {activeItemModal.type === 'Galii' ? (
                  <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                ) : (
                  <ArrowUpCircle className="w-5 h-5 text-amber-600" />
                )}
                <span>
                  {activeItemModal.type === 'Galii' ? t.stockInModal : t.stockOutModal}
                </span>
              </h3>
              <button
                onClick={() => setActiveItemModal(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <span className="text-slate-500 block">{t.itemName}:</span>
                <span className="font-bold text-slate-900 text-sm">
                  {activeItemModal.item.name}
                </span>
                <div className="mt-1 text-slate-600 font-mono">
                  {lang === 'om' ? 'Kuusaa keessatti kan jiru' : 'Current on hand'}: {activeItemModal.item.quantity} {activeItemModal.item.unit}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'om' ? 'Baay\'ina Jijjiiramu' : 'Transaction Quantity'} ({activeItemModal.item.unit}) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={activeItemModal.type === 'Baasii' ? activeItemModal.item.quantity : 10000}
                  value={txQty}
                  onChange={(e) => setTxQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.recipient}
                </label>
                <input
                  type="text"
                  value={txPerson}
                  onChange={(e) => setTxPerson(e.target.value)}
                  placeholder={lang === 'om' ? 'Fkn. Barsiisaa Dheeressaa (Kutaa 7)' : 'e.g. Teacher Dheeressaa (Grade 7)'}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.reason}
                </label>
                <input
                  type="text"
                  value={txReason}
                  onChange={(e) => setTxReason(e.target.value)}
                  placeholder={lang === 'om' ? 'Fkn. Barattootaaf Qooduu' : 'e.g. Class distribution'}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveItemModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer ${
                    activeItemModal.type === 'Galii'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {t.confirmAction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
