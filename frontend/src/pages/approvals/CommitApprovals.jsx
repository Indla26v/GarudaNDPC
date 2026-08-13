import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { IconAuditLog, IconCheck, IconClose, IconCases, IconOffender, IconEdit } from '../../components/Icons';

export default function CommitApprovals() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('cases');
  const [cases, setCases] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

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
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
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
          <div className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Total Pending: <span className="font-mono text-amber-500 font-black">{cases.length + offenders.length + editRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {message.text && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-fade-in border shadow-xs ${
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

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer select-none ${
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-xl overflow-hidden">
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
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('cases', c.id, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('cases', c.id, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('offenders', o.id, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('offenders', o.id, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
                            disabled={!!actionLoading}
                            onClick={() => handleAction('edit-request', er.id, 'approve')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <IconCheck className="w-3.5 h-3.5" /> Approve Edit
                          </button>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleAction('edit-request', er.id, 'reject')}
                            className="px-3 py-1.5 rounded-lg text-xs font-extrabold bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
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
    </div>
  );
}
