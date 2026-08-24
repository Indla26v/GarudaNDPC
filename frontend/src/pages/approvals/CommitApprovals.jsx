import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  IconAuditLog,
  IconCheck,
  IconClose,
  IconCases,
  IconOffender,
  IconEdit,
  IconSearch,
  IconWarning,
} from '../../components/Icons';

export default function CommitApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Note Action Modal State (for Request Changes & Reject with Notes)
  const [noteModal, setNoteModal] = useState({
    isOpen: false,
    entity: '', // 'cases' | 'offenders' | 'edit-requests'
    id: null,
    item: null,
    action: '', // 'request-changes' | 'reject'
    noteText: '',
  });

  // Review Modal State for Edit Requests
  const [selectedEditRequest, setSelectedEditRequest] = useState(null);
  const [comparingEntity, setComparingEntity] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

  // Quick Preview Modal State for Cases & Offenders
  const [previewItem, setPreviewItem] = useState(null);

  const openReviewModal = async (er) => {
    setSelectedEditRequest(er);
    setComparingLoading(true);
    setComparingEntity(null);
    try {
      if (er.entity_type === 'OFFENDER') {
        const res = await api.get(`/offenders/${er.entity_id}`);
        setComparingEntity(res.data?.data || null);
      } else if (er.entity_type === 'CASE') {
        const res = await api.get(`/cases/${er.entity_id}`);
        setComparingEntity(res.data?.data || null);
      }
    } catch (e) {
      console.error('Failed to fetch entity for diff:', e);
    } finally {
      setComparingLoading(false);
    }
  };

  const computeDiffs = (entityType, currentRecord, changesJson) => {
    let changes = {};
    try {
      changes = typeof changesJson === 'string' ? JSON.parse(changesJson) : (changesJson || {});
    } catch (e) {
      return [];
    }

    const diffs = [];

    const FIELD_LABELS = {
      fullName: 'Full Name',
      full_name: 'Full Name',
      alias: 'Alias',
      fatherHusbandName: 'Father/Husband Name',
      father_husband_name: 'Father/Husband Name',
      age: 'Age',
      gender: 'Gender',
      category: 'Category',
      occupation: 'Occupation',
      monthlyIncome: 'Monthly Income',
      monthly_income: 'Monthly Income',
      fullAddress: 'Full Address',
      full_address: 'Full Address',
      landmark: 'Landmark / Area',
      landmarkArea: 'Landmark / Area',
      landmark_area: 'Landmark / Area',
      district: 'District',
      state: 'State',
      status: 'Status',
      photoUrl: 'Offender Photo',
      photo_url: 'Offender Photo',
      previousCrimeHistory: 'Previous Crime History',
      previous_crime_history: 'Previous Crime History',
      historySheetStatus: 'History Sheet Status',
      history_sheet_status: 'History Sheet Status',
      aadhaarNo: 'Aadhaar Number',
      voterId: 'Voter ID',
      panCard: 'PAN Card',
      firNo: 'FIR Number',
      fir_no: 'FIR Number',
      sectionOfLaw: 'Section of Law',
      section_of_law: 'Section of Law',
      stage: 'Case Stage',
    };

    const getOriginalVal = (key) => {
      if (!currentRecord) return null;
      if (key === 'fullName' || key === 'full_name') return currentRecord.fullName ?? currentRecord.full_name;
      if (key === 'fatherHusbandName' || key === 'father_husband_name') return currentRecord.fatherHusbandName ?? currentRecord.father_husband_name;
      if (key === 'monthlyIncome' || key === 'monthly_income') return currentRecord.monthlyIncome ?? currentRecord.monthly_income;
      if (key === 'landmark' || key === 'landmarkArea' || key === 'landmark_area') return currentRecord.landmark ?? currentRecord.landmarkArea ?? currentRecord.landmark_area;
      if (key === 'fullAddress' || key === 'full_address') return currentRecord.fullAddress ?? currentRecord.full_address;
      if (key === 'firNo' || key === 'fir_no') return currentRecord.firNo ?? currentRecord.fir_no;
      if (key === 'sectionOfLaw' || key === 'section_of_law') return currentRecord.sectionOfLaw ?? currentRecord.section_of_law;
      if (key === 'previousCrimeHistory' || key === 'previous_crime_history') return currentRecord.previousCrimeHistory ?? currentRecord.previous_crime_history;
      if (key === 'photoUrl' || key === 'photo_url') return currentRecord.photoUrl ?? currentRecord.photo_url;
      return currentRecord[key];
    };

    for (const [key, val] of Object.entries(changes)) {
      if (['contacts', 'financials', 'socialMedia', 'criminalHistories', 'supplyChainLinks', 'psId', 'ps_id', 'slNo', 'sl_no'].includes(key)) {
        continue;
      }
      const label = FIELD_LABELS[key] || key;
      const rawFrom = getOriginalVal(key);

      if (key === 'monthlyIncome' || key === 'monthly_income') {
        const numFrom = rawFrom !== undefined && rawFrom !== null ? String(rawFrom).replace(/[^0-9.]/g, '') : '';
        const numTo = val !== undefined && val !== null ? String(val).replace(/[^0-9.]/g, '') : '';
        if (numFrom === numTo) continue;
        diffs.push({
          key,
          label,
          from: numFrom ? `₹${numFrom}` : '—',
          to: numTo ? `₹${numTo}` : '—',
        });
        continue;
      }

      if (key === 'previousCrimeHistory' || key === 'previous_crime_history') {
        const boolFrom = Boolean(rawFrom);
        const boolTo = Boolean(val);
        if (boolFrom === boolTo) continue;
        diffs.push({
          key,
          label,
          from: boolFrom ? 'Yes (Has Record)' : 'No (No Record)',
          to: boolTo ? 'Yes (Has Record)' : 'No (No Record)',
        });
        continue;
      }

      if (key === 'photoUrl' || key === 'photo_url') {
        const strFrom = rawFrom ? String(rawFrom).trim() : '';
        const strTo = val ? String(val).trim() : '';
        if (strFrom === strTo) continue;
        diffs.push({
          key,
          label,
          from: strFrom || '—',
          to: strTo || '—',
          isImage: true,
        });
        continue;
      }

      const fromStr = rawFrom !== undefined && rawFrom !== null ? String(rawFrom).trim() : '';
      const toStr = val !== undefined && val !== null ? String(val).trim() : '';

      if (fromStr !== toStr) {
        diffs.push({
          key,
          label,
          from: fromStr || '—',
          to: toStr || '—',
        });
      }
    }

    return diffs;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const psId = user?.policeStationId;
      const [casesRes, offendersRes, editsRes] = await Promise.all([
        api.get(`/cases?approvalStatus=PENDING,CHANGES_REQUESTED${psId ? `&psId=${psId}` : ''}`),
        api.get(`/offenders?approvalStatus=PENDING,CHANGES_REQUESTED${psId ? `&psId=${psId}` : ''}`),
        api.get(`/edit-requests?status=PENDING,CHANGES_REQUESTED`),
      ]);
      setCases(casesRes.data?.data?.content || []);
      setOffenders(offendersRes.data?.data?.content || []);
      setEditRequests(editsRes.data?.data?.content || []);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load approvals.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleAction = async (entity, id, action, noteText = '') => {
    setActionLoading(`${entity}-${id}-${action}`);
    try {
      if (entity === 'edit-request') {
        if (action === 'approve') {
          await api.post(`/edit-requests/${id}/approve`);
        } else if (action === 'request-changes') {
          await api.post(`/edit-requests/${id}/request-changes`, { notes: noteText });
        } else {
          await api.post(`/edit-requests/${id}/reject`, { rejectionReason: noteText || 'Rejected by SHO' });
        }
      } else {
        if (action === 'approve') {
          await api.post(`/approvals/${entity}/${id}/approve`);
        } else if (action === 'request-changes') {
          await api.post(`/approvals/${entity}/${id}/request-changes`, { notes: noteText });
        } else {
          await api.post(`/approvals/${entity}/${id}/reject`, { notes: noteText });
        }
      }

      let successMsg = 'Action completed successfully.';
      if (action === 'approve') {
        successMsg = 'Record successfully approved and committed to database.';
      } else if (action === 'request-changes') {
        successMsg = 'Changes requested. Record returned to Constable for revision.';
      } else if (action === 'reject') {
        successMsg = 'Record rejected.';
      }

      setMessage({ text: successMsg, type: 'success' });
      setNoteModal({ isOpen: false, entity: '', id: null, item: null, action: '', noteText: '' });
      fetchData();
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || `Failed to process ${action} for ${entity}.`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const openNoteModal = (entity, item, action) => {
    setNoteModal({
      isOpen: true,
      entity,
      id: item.id,
      item,
      action,
      noteText: item.approvalNotes || '',
    });
  };

  const tabs = [
    { id: 'cases', label: 'New Cases', count: cases.length, icon: IconCases },
    { id: 'offenders', label: 'New Offenders', count: offenders.length, icon: IconOffender },
    { id: 'edit-requests', label: 'Edit Requests', count: editRequests.length, icon: IconEdit },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-inner">
            <IconAuditLog className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-garuda-50)' }}>
              Commit Approvals
            </h1>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-garuda-400)' }}>
              Review, verify, request revisions, or commit pending data submissions registered by Police Constables.
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Total Pending Reviews: <span className="font-mono text-amber-500 font-black">{cases.length + offenders.length + editRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in border shadow-sm ${
          message.type === 'error'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="hover:opacity-80 cursor-pointer">
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 max-w-fit shadow-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4.5 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer select-none ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                isActive
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
        {/* Cases View */}
        {activeTab === 'cases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                  <th className="px-5 py-4">FIR Number</th>
                  <th className="px-5 py-4">Stage / Section</th>
                  <th className="px-5 py-4">Submitted By</th>
                  <th className="px-5 py-4">Approval Status & Feedback</th>
                  <th className="px-5 py-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 ml-auto" /></td>
                    </tr>
                  ))
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <IconCases className="w-10 h-10 stroke-1 opacity-40" />
                        <p className="font-bold text-sm">No pending cases to review</p>
                        <p className="text-xs">All Constable case registrations have been processed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        <Link to={`/cases/${c.id}`} className="hover:underline text-amber-500 font-extrabold flex items-center gap-1.5">
                          {c.firNo}
                        </Link>
                        {c.natureOfOffence && (
                          <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                            {c.natureOfOffence}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                          {c.stage}
                        </span>
                        {c.sectionOfLaw && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">{c.sectionOfLaw}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="font-bold text-slate-900 dark:text-white">{c.createdByName || 'Constable'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {c.approvalStatus === 'CHANGES_REQUESTED' ? (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                              <IconWarning className="w-3 h-3 text-orange-500" /> CHANGES REQUESTED
                            </span>
                            {c.approvalNotes && (
                              <p className="text-[11px] text-orange-600 dark:text-orange-300 mt-1 font-medium bg-orange-500/5 p-1.5 rounded border border-orange-500/20 max-w-xs">
                                <strong>Note:</strong> {c.approvalNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                              PENDING COMMIT
                            </span>
                            {c.approvalNotes && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic max-w-xs">
                                {c.approvalNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            to={`/cases/${c.id}`}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('cases', c.id, 'approve')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('cases', c, 'request-changes')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconEdit className="w-3.5 h-3.5" /> Request Changes
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('cases', c, 'reject')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconClose className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Offenders View */}
        {activeTab === 'offenders' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                  <th className="px-5 py-4">Offender Name</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Submitted By</th>
                  <th className="px-5 py-4">Approval Status & Feedback</th>
                  <th className="px-5 py-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 ml-auto" /></td>
                    </tr>
                  ))
                ) : offenders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <IconOffender className="w-10 h-10 stroke-1 opacity-40" />
                        <p className="font-bold text-sm">No pending offender profiles</p>
                        <p className="text-xs">All Constable profile entries have been committed.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  offenders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                            {o.photoUrl ? (
                              <img src={o.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="font-bold text-amber-500 text-xs">{o.fullName?.[0] || 'O'}</span>
                            )}
                          </div>
                          <div>
                            <Link to={`/offenders/${o.id}`} className="hover:underline text-amber-500 font-extrabold">
                              {o.fullName}
                            </Link>
                            {o.alias && <p className="text-[11px] font-normal text-slate-400">Alias: {o.alias}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                          {o.category?.replace('_', ' ') || 'OFFENDER'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="font-bold text-slate-900 dark:text-white">{o.createdByName || 'Constable'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {o.approvalStatus === 'CHANGES_REQUESTED' ? (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                              <IconWarning className="w-3 h-3 text-orange-500" /> CHANGES REQUESTED
                            </span>
                            {o.approvalNotes && (
                              <p className="text-[11px] text-orange-600 dark:text-orange-300 mt-1 font-medium bg-orange-500/5 p-1.5 rounded border border-orange-500/20 max-w-xs">
                                <strong>Note:</strong> {o.approvalNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                              PENDING COMMIT
                            </span>
                            {o.approvalNotes && (
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic max-w-xs">
                                {o.approvalNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <Link
                            to={`/offenders/${o.id}`}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('offenders', o.id, 'approve')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('offenders', o, 'request-changes')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconEdit className="w-3.5 h-3.5" /> Request Changes
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('offenders', o, 'reject')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconClose className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Edit Requests View */}
        {activeTab === 'edit-requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                  <th className="px-5 py-4">Entity Type</th>
                  <th className="px-5 py-4">Entity ID</th>
                  <th className="px-5 py-4">Requested By</th>
                  <th className="px-5 py-4">Status & Notes</th>
                  <th className="px-5 py-4 text-right">Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 ml-auto" /></td>
                    </tr>
                  ))
                ) : editRequests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-400 dark:text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <IconEdit className="w-10 h-10 stroke-1 opacity-40" />
                        <p className="font-bold text-sm">No pending edit requests</p>
                        <p className="text-xs">There are no pending update requests requiring approval.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  editRequests.map((er) => (
                    <tr key={er.id} className="hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                          {er.entity_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{er.entity_id}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        <div className="font-bold text-slate-900 dark:text-white">{er.requested_user?.full_name || 'Constable'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {er.requested_at ? new Date(er.requested_at).toLocaleDateString('en-IN') : 'Recent'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {er.status === 'CHANGES_REQUESTED' ? (
                          <div>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/30 uppercase tracking-wider inline-flex items-center gap-1">
                              <IconWarning className="w-3 h-3 text-orange-500" /> CHANGES REQUESTED
                            </span>
                            {er.rejection_reason && (
                              <p className="text-[11px] text-orange-600 dark:text-orange-300 mt-1 font-medium bg-orange-500/5 p-1.5 rounded border border-orange-500/20 max-w-xs">
                                <strong>Note:</strong> {er.rejection_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                            PENDING EDIT
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => openReviewModal(er)}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <IconSearch className="w-3.5 h-3.5" /> Review Changes
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('edit-request', er.id, 'approve')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('edit-request', er, 'request-changes')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <IconEdit className="w-3.5 h-3.5" /> Request Changes
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => openNoteModal('edit-request', er, 'reject')}
                            className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <IconClose className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note Action Modal (Request Changes / Rejection Notes) */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${noteModal.action === 'request-changes' ? 'bg-amber-500 text-slate-950' : 'bg-rose-500 text-white'} font-bold`}>
                  {noteModal.action === 'request-changes' ? <IconEdit className="w-5 h-5" /> : <IconClose className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {noteModal.action === 'request-changes' ? 'Request Changes & Return to Constable' : 'Reject Submission'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {noteModal.entity.toUpperCase()} #{noteModal.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setNoteModal({ isOpen: false, entity: '', id: null, item: null, action: '', noteText: '' })}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {noteModal.action === 'request-changes'
                  ? 'Please describe the changes or missing details needed from the Constable. This note will appear on their Approval Progress tracker and editing screen.'
                  : 'Please state the reason for rejecting this record submission.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {noteModal.action === 'request-changes' ? 'SHO Instructions / Feedback Note *' : 'Rejection Reason'}
                </label>
                <textarea
                  rows={4}
                  value={noteModal.noteText}
                  onChange={(e) => setNoteModal({ ...noteModal, noteText: e.target.value })}
                  placeholder={
                    noteModal.action === 'request-changes'
                      ? 'e.g. Please verify and fill in vehicle registration number, attach panchnama PDF, or correct the offender age before resubmission.'
                      : 'e.g. Duplicate case record or incorrect jurisdiction.'
                  }
                  className="w-full px-4 py-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between">
              <button
                onClick={() => setNoteModal({ isOpen: false, entity: '', id: null, item: null, action: '', noteText: '' })}
                className="px-4 py-2 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!noteModal.noteText.trim() || !!actionLoading}
                onClick={() => handleAction(noteModal.entity, noteModal.id, noteModal.action, noteModal.noteText)}
                className={`px-5 py-2.5 rounded-full text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 ${
                  noteModal.action === 'request-changes'
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                    : 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-500/20'
                }`}
              >
                {noteModal.action === 'request-changes' ? (
                  <>
                    <IconEdit className="w-4 h-4" /> Send Back to Constable
                  </>
                ) : (
                  <>
                    <IconClose className="w-4 h-4" /> Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Edit Request Modal */}
      {selectedEditRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-slate-850 dark:to-slate-900">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold">
                  <IconEdit className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                      Review Edit Request
                    </h3>
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                      {selectedEditRequest.entity_type} #{selectedEditRequest.entity_id}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Requested by <span className="font-extrabold text-slate-800 dark:text-slate-200">{selectedEditRequest.requested_user?.full_name || selectedEditRequest.requested_user?.username || 'Constable'}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEditRequest(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <IconClose className="w-5 h-5" />
              </button>
            </div>

            {/* Offender Context Summary */}
            {comparingEntity && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border-2 border-amber-500/30 shadow-xs flex items-center justify-center overflow-hidden">
                    {comparingEntity.photoUrl ? (
                      <img src={comparingEntity.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{comparingEntity.fullName?.[0] || 'O'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {comparingEntity.fullName || `Offender #${selectedEditRequest.entity_id}`}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>Category: <strong className="text-slate-700 dark:text-slate-200 uppercase">{comparingEntity.category || 'N/A'}</strong></span>
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-extrabold">
                  Status: PENDING REVIEW
                </div>
              </div>
            )}

            {/* Modal Body / Diffs Matrix */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {comparingLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400 animate-pulse">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Loading data & computing changes...</p>
                </div>
              ) : (
                (() => {
                  const diffs = computeDiffs(selectedEditRequest.entity_type, comparingEntity, selectedEditRequest.changes_json);
                  if (diffs.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-500 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No direct field differences detected</p>
                        <p className="text-xs text-slate-500 mt-1">Review raw proposal: {selectedEditRequest.reason || 'No description provided'}</p>
                      </div>
                    );
                  }
                  return (
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-850 overflow-hidden shadow-sm">
                      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wider select-none">
                        <span>Fields Modified ({diffs.length})</span>
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Verification View</span>
                      </div>
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                            <th className="px-5 py-3.5">Field Name</th>
                            <th className="px-5 py-3.5">Current Value (From)</th>
                            <th className="px-5 py-3.5">Proposed Value (To)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {diffs.map((d, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-5 py-4 font-extrabold text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                  {d.label}
                                </div>
                              </td>
                              <td className="px-5 py-4">
                                {d.isImage ? (
                                  d.from !== '—' ? (
                                    <img src={d.from} alt="Current" className="w-16 h-16 object-cover rounded-2xl border-2 border-rose-300 shadow-xs opacity-75" />
                                  ) : (
                                    <span className="text-slate-400 italic">No Photo</span>
                                  )
                                ) : (
                                  <div className="inline-block px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 font-semibold line-through">
                                    {d.from}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                {d.isImage ? (
                                  <img src={d.to} alt="Proposed" className="w-16 h-16 object-cover rounded-2xl border-2 border-emerald-500 shadow-md" />
                                ) : (
                                  <div className="inline-block px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-extrabold shadow-2xs">
                                    {d.to}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-between">
              <button
                onClick={() => setSelectedEditRequest(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={!!actionLoading}
                  onClick={() => {
                    const er = selectedEditRequest;
                    setSelectedEditRequest(null);
                    openNoteModal('edit-request', er, 'request-changes');
                  }}
                  className="px-4 py-2.5 rounded-full text-xs font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <IconEdit className="w-3.5 h-3.5" /> Request Changes
                </button>
                <button
                  disabled={!!actionLoading}
                  onClick={() => {
                    const er = selectedEditRequest;
                    setSelectedEditRequest(null);
                    openNoteModal('edit-request', er, 'reject');
                  }}
                  className="px-4 py-2.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <IconClose className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  disabled={!!actionLoading}
                  onClick={async () => {
                    await handleAction('edit-request', selectedEditRequest.id, 'approve');
                    setSelectedEditRequest(null);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <IconCheck className="w-4 h-4" /> Approve & Commit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
