/**
 * Charge sheet, court hearings, and bail records for a case (Phase 1).
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';
import CustomSelect from './CustomSelect';

const inputStyle = {
  background: 'var(--color-garuda-900)',
  border: '1px solid var(--color-garuda-600)',
  color: 'var(--color-garuda-100)',
};

export default function CaseLifecyclePanel({ caseId, canEdit, onCaseUpdated }) {
  const [chargeSheet, setChargeSheet] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [bailRecords, setBailRecords] = useState([]);
  const [csForm, setCsForm] = useState({});
  const [hearingForm, setHearingForm] = useState({});
  const [bailForm, setBailForm] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadAll();
  }, [caseId]);

  const loadAll = async () => {
    try {
      const [cs, ch, br] = await Promise.all([
        api.get(`/cases/${caseId}/charge-sheet`),
        api.get(`/cases/${caseId}/court-hearings`),
        api.get(`/cases/${caseId}/bail-records`),
      ]);
      const csData = cs.data.data;
      setChargeSheet(csData);
      if (csData) {
        setCsForm({
          expectedSubmissionDate: csData.expectedSubmissionDate ? String(csData.expectedSubmissionDate).split('T')[0] : '',
          actualSubmissionDate: csData.actualSubmissionDate ? String(csData.actualSubmissionDate).split('T')[0] : '',
          prosecutorName: csData.prosecutorName || '',
          missingDocuments: csData.missingDocuments || '',
          notes: csData.notes || '',
        });
      }
      setHearings(ch.data.data || []);
      setBailRecords(br.data.data || []);
    } catch { /* ignore */ }
  };

  const saveChargeSheet = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/cases/${caseId}/charge-sheet`, csForm);
      setMsg('Charge sheet updated successfully');
      loadAll();
      onCaseUpdated?.();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to save charge sheet');
    }
  };

  const addHearing = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${caseId}/court-hearings`, hearingForm);
      setHearingForm({});
      setMsg('Court hearing added successfully');
      loadAll();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to add hearing');
    }
  };

  const addBail = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/cases/${caseId}/bail-records`, bailForm);
      setBailForm({});
      setMsg('Bail record added successfully');
      loadAll();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to add bail record');
    }
  };

  const inputClass = "w-full h-10 px-4 py-2 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all focus:ring-2 focus:ring-amber-500/30";
  const textareaClass = "w-full px-4 py-3 rounded-2xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none resize-none transition-all focus:ring-2 focus:ring-amber-500/30";

  return (
    <div className="space-y-6">
      {msg && (
        <p className="text-xs font-bold px-4 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
          {msg}
        </p>
      )}

      {/* Charge Sheet Card */}
      <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200">Charge Sheet</h3>
        <form onSubmit={saveChargeSheet} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Expected Submission Date</label>
            <input
              type="date"
              className={inputClass}
              value={csForm.expectedSubmissionDate || ''}
              onChange={e => setCsForm(f => ({ ...f, expectedSubmissionDate: e.target.value }))}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Actual Submission Date</label>
            <input
              type="date"
              className={inputClass}
              value={csForm.actualSubmissionDate || ''}
              onChange={e => setCsForm(f => ({ ...f, actualSubmissionDate: e.target.value }))}
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Prosecutor Name</label>
            <input
              className={inputClass}
              placeholder="e.g. Adv. K. Sharma"
              value={csForm.prosecutorName || ''}
              onChange={e => setCsForm(f => ({ ...f, prosecutorName: e.target.value }))}
              disabled={!canEdit}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Notes / Remarks</label>
            <textarea
              rows={2}
              className={textareaClass}
              placeholder="Add notes or remarks regarding charge sheet submission..."
              value={csForm.notes || ''}
              onChange={e => setCsForm(f => ({ ...f, notes: e.target.value }))}
              disabled={!canEdit}
            />
          </div>
          {canEdit && (
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-all active:scale-95 cursor-pointer border-none"
              >
                Save Charge Sheet
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Court Hearings Card */}
      <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200">Court Hearings</h3>
        {hearings.length > 0 && (
          <ul className="space-y-3 mb-5">
            {hearings.map(h => (
              <li key={h.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{h.courtName || 'Court'} — SC {h.scNumber || '—'}</span>
                </div>
                <span className="block text-slate-500 dark:text-slate-400">
                  Hearing Date: {h.hearingDate ? new Date(h.hearingDate).toLocaleDateString('en-IN') : '—'}
                  {h.nextHearingDate ? ` → Next Hearing: ${new Date(h.nextHearingDate).toLocaleDateString('en-IN')}` : ''}
                </span>
                {h.orderText && (
                  <p className="italic text-slate-600 dark:text-slate-300">
                    Notes/Order: "{h.orderText}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <form onSubmit={addHearing} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">SC Number</label>
              <input
                placeholder="e.g. SC/102/2026"
                className={inputClass}
                value={hearingForm.scNumber || ''}
                onChange={e => setHearingForm(f => ({ ...f, scNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Court Name</label>
              <input
                placeholder="e.g. NDPS Special Court, Tirupati"
                className={inputClass}
                value={hearingForm.courtName || ''}
                onChange={e => setHearingForm(f => ({ ...f, courtName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Hearing Date</label>
              <input
                type="date"
                className={inputClass}
                value={hearingForm.hearingDate || ''}
                onChange={e => setHearingForm(f => ({ ...f, hearingDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Next Hearing Date</label>
              <input
                type="date"
                className={inputClass}
                value={hearingForm.nextHearingDate || ''}
                onChange={e => setHearingForm(f => ({ ...f, nextHearingDate: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Order / Hearing Notes</label>
              <textarea
                rows={2}
                className={textareaClass}
                placeholder="Add court order details or hearing notes..."
                value={hearingForm.orderText || ''}
                onChange={e => setHearingForm(f => ({ ...f, orderText: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-all active:scale-95 cursor-pointer border-none"
              >
                Add Hearing
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Bail Records Card */}
      <div className="rounded-2xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-slate-800 dark:text-slate-200">Bail Records</h3>
        {bailRecords.length > 0 && (
          <ul className="space-y-3 mb-5">
            {bailRecords.map(b => (
              <li key={b.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 dark:text-slate-100">Status: {b.status}</span>
                  <span className="text-slate-500 dark:text-slate-400">{b.courtName || '—'}</span>
                </div>
                {b.notes && (
                  <p className="italic text-slate-600 dark:text-slate-300">
                    Notes: "{b.notes}"
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        {canEdit && (
          <form onSubmit={addBail} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Bail Status</label>
              <CustomSelect
                value={bailForm.status || 'PENDING'}
                onChange={e => setBailForm(f => ({ ...f, status: e.target.value }))}
                className="w-full"
                options={[
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'GRANTED', label: 'Granted' },
                  { value: 'REJECTED', label: 'Rejected' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Court Name</label>
              <input
                placeholder="e.g. Sessions Court"
                className={inputClass}
                value={bailForm.courtName || ''}
                onChange={e => setBailForm(f => ({ ...f, courtName: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5 text-slate-700 dark:text-slate-300">Bail Notes / Conditions</label>
              <textarea
                rows={2}
                className={textareaClass}
                placeholder="Add bail conditions or remarks..."
                value={bailForm.notes || ''}
                onChange={e => setBailForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-all active:scale-95 cursor-pointer border-none"
              >
                Add Bail Record
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
