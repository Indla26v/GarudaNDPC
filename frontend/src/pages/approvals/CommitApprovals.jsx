import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { IconAuditLog, IconCheck, IconClose, IconCases, IconOffender, IconEdit, IconSearch } from '../../components/Icons';

export default function CommitApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Review Modal State
  const [selectedEditRequest, setSelectedEditRequest] = useState(null);
  const [comparingEntity, setComparingEntity] = useState(null);
  const [comparingLoading, setComparingLoading] = useState(false);

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
      stage: 'Case Stage'
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

      // Monthly Income normalization (ignore currency symbol differences)
      if (key === 'monthlyIncome' || key === 'monthly_income') {
        const numFrom = rawFrom !== undefined && rawFrom !== null ? String(rawFrom).replace(/[^0-9.]/g, '') : '';
        const numTo = val !== undefined && val !== null ? String(val).replace(/[^0-9.]/g, '') : '';
        if (numFrom === numTo) continue;
        diffs.push({
          key,
          label,
          from: numFrom ? `₹${numFrom}` : '—',
          to: numTo ? `₹${numTo}` : '—'
        });
        continue;
      }

      // Boolean normalization
      if (key === 'previousCrimeHistory' || key === 'previous_crime_history') {
        const boolFrom = Boolean(rawFrom);
        const boolTo = Boolean(val);
        if (boolFrom === boolTo) continue;
        diffs.push({
          key,
          label,
          from: boolFrom ? 'Yes (Has Record)' : 'No (No Record)',
          to: boolTo ? 'Yes (Has Record)' : 'No (No Record)'
        });
        continue;
      }

      // Photo URL comparison & preview mode
      if (key === 'photoUrl' || key === 'photo_url') {
        const strFrom = rawFrom ? String(rawFrom).trim() : '';
        const strTo = val ? String(val).trim() : '';
        if (strFrom === strTo) continue;
        diffs.push({
          key,
          label,
          from: strFrom || '—',
          to: strTo || '—',
          isImage: true
        });
        continue;
      }

      // General text fields
      const fromStr = rawFrom !== undefined && rawFrom !== null ? String(rawFrom).trim() : '';
      const toStr = val !== undefined && val !== null ? String(val).trim() : '';

      if (fromStr !== toStr) {
        diffs.push({
          key,
          label,
          from: fromStr || '—',
          to: toStr || '—'
        });
      }
    }

    if ('contacts' in changes && Array.isArray(changes.contacts)) {
      const fromCount = currentRecord?.contacts?.length || 0;
      const toCount = changes.contacts.length;
      if (fromCount !== toCount) {
        diffs.push({
          label: 'Contacts List',
          from: `${fromCount} contact(s)`,
          to: `${toCount} updated contact(s)`
        });
      }
    }

    if ('financials' in changes && Array.isArray(changes.financials)) {
      const fromCount = currentRecord?.financials?.length || 0;
      const toCount = changes.financials.length;
      if (fromCount !== toCount) {
        diffs.push({
          label: 'Financial Accounts',
          from: `${fromCount} record(s)`,
          to: `${toCount} updated account(s)`
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
        api.get(`/cases?approvalStatus=PENDING${psId ? `&psId=${psId}` : ''}`),
        api.get(`/offenders?approvalStatus=PENDING${psId ? `&psId=${psId}` : ''}`),
        api.get(`/edit-requests?status=PENDING`),
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

  const handleAction = async (entity, id, action) => {
    setActionLoading(`${entity}-${id}-${action}`);
    try {
      if (entity === 'edit-request') {
        if (action === 'approve') {
          await api.post(`/edit-requests/${id}/approve`);
        } else {
          await api.post(`/edit-requests/${id}/reject`, { rejectionReason: 'Rejected by SHO' });
        }
      } else {
        await api.post(`/approvals/${entity}/${id}/${action}`);
      }
      setMessage({
        text: `Record successfully ${action === 'approve' ? 'approved & committed to database' : 'rejected'}.`,
        type: 'success'
      });
      fetchData();
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      console.error(err);
      setMessage({ text: err.response?.data?.message || `Failed to ${action} ${entity}.`, type: 'error' });
    } finally {
      setActionLoading(null);
    }
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
              Review, verify, and commit pending data submissions registered by Police Constables.
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Total Pending: <span className="font-mono text-amber-500 font-black">{cases.length + offenders.length + editRequests.length}</span>
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
          <button onClick={() => setMessage({ text: '', type: '' })} className="hover:opacity-80">
            <IconClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation (Pill Shaped Container) */}
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

      {/* Main Table Card (32px Rounded Corners with Card Elevation) */}
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
        {/* Cases View */}
        {activeTab === 'cases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                  <th className="px-5 py-4">FIR Number</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Submitted By</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-36 ml-auto" /></td>
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
                        <Link to={`/cases/${c.id}`} className="hover:underline text-amber-500">
                          {c.firNo}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                          {c.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {c.createdByName || 'Constable'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          PENDING COMMIT
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/cases/${c.id}`}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('cases', c.id, 'approve')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('cases', c.id, 'reject')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-36 ml-auto" /></td>
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
                        <Link to={`/offenders/${o.id}`} className="hover:underline text-amber-500">
                          {o.fullName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                          {o.category?.replace('_', ' ') || 'OFFENDER'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {o.createdByName || 'Constable'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          PENDING COMMIT
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/offenders/${o.id}`}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-2xs"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('offenders', o.id, 'approve')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('offenders', o.id, 'reject')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
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
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-36 ml-auto" /></td>
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
                        {er.requested_user?.full_name || 'Constable'}
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 uppercase tracking-wider">
                          PENDING EDIT
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openReviewModal(er)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <IconSearch className="w-3.5 h-3.5" /> Review Changes
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('edit-request', er.id, 'approve')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve Edit
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('edit-request', er.id, 'reject')}
                            className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
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

      {/* Light Mode Ultra Clean Review Changes Modal */}
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
                  <p className="text-xs font-extrabold text-slate-600 dark:text-slate-400">Loading profile data & computing changes...</p>
                </div>
              ) : (
                (() => {
                  const diffs = computeDiffs(selectedEditRequest.entity_type, comparingEntity, selectedEditRequest.changes_json);
                  if (diffs.length === 0) {
                    return (
                      <div className="py-12 text-center text-slate-500 text-xs font-semibold bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-6 shadow-xs">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No field differences detected</p>
                        <p className="text-xs text-slate-500 mt-1">The requested values match the existing record.</p>
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

              <div className="flex items-center gap-3">
                <button
                  disabled={!!actionLoading}
                  onClick={async () => {
                    await handleAction('edit-request', selectedEditRequest.id, 'reject');
                    setSelectedEditRequest(null);
                  }}
                  className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <IconClose className="w-4 h-4" /> Reject Request
                </button>
                <button
                  disabled={!!actionLoading}
                  onClick={async () => {
                    await handleAction('edit-request', selectedEditRequest.id, 'approve');
                    setSelectedEditRequest(null);
                  }}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 active:scale-95 disabled:opacity-50"
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
