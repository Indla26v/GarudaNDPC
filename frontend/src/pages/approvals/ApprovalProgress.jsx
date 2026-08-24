import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  IconRefresh,
  IconWarning,
  IconCheckCircle,
} from '../../components/Icons';
import CustomSelect from '../../components/CustomSelect';

export default function ApprovalProgress() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    items: [],
    cases: [],
    offenders: [],
    editRequests: [],
    stats: { total: 0, pending: 0, changesRequested: 0, approved: 0, rejected: 0 },
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'action-required' | 'cases' | 'offenders' | 'edit-requests'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'CHANGES_REQUESTED' | 'APPROVED' | 'REJECTED'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubmissions = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/approvals/my-submissions');
      setData(res.data?.data || {
        items: [],
        cases: [],
        offenders: [],
        editRequests: [],
        stats: { total: 0, pending: 0, changesRequested: 0, approved: 0, rejected: 0 },
      });
    } catch (err) {
      console.error('Failed to fetch approval submissions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  // Filter items based on activeTab, statusFilter, and searchQuery
  const filteredItems = useMemo(() => {
    let list = data.items || [];

    if (activeTab === 'action-required') {
      list = list.filter((i) => i.status === 'CHANGES_REQUESTED');
    } else if (activeTab === 'cases') {
      list = list.filter((i) => i.submissionType === 'CASE');
    } else if (activeTab === 'offenders') {
      list = list.filter((i) => i.submissionType === 'OFFENDER');
    } else if (activeTab === 'edit-requests') {
      list = list.filter((i) => i.submissionType === 'EDIT_REQUEST');
    }

    if (statusFilter !== 'ALL' && activeTab !== 'action-required') {
      list = list.filter((i) => i.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.subtitle?.toLowerCase().includes(q) ||
          i.approvalNotes?.toLowerCase().includes(q) ||
          i.id?.toString().includes(q)
      );
    }

    return list;
  }, [data.items, activeTab, statusFilter, searchQuery]);

  const stats = data.stats || { total: 0, pending: 0, changesRequested: 0, approved: 0, rejected: 0 };

  const handleEditResubmit = (item) => {
    if (item.submissionType === 'CASE') {
      navigate(`/cases/${item.id}/edit`);
    } else if (item.submissionType === 'OFFENDER') {
      navigate(`/offenders/${item.id}/edit`);
    } else if (item.submissionType === 'EDIT_REQUEST') {
      if (item.entityType === 'OFFENDER') {
        navigate(`/offenders/${item.entityId}/edit`);
      } else {
        navigate(`/cases/${item.entityId}/edit`);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Pending SHO Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-black bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/40 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <IconWarning className="w-3.5 h-3.5 text-orange-500" />
            Changes Requested
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <IconCheck className="w-3.5 h-3.5" /> Approved & Committed
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
            <IconClose className="w-3.5 h-3.5" /> Rejected by SHO
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-500/15 text-slate-400 border border-slate-500/30 uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black">
            <IconAuditLog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-garuda-50)' }}>
              Approval Status & Progress Tracker
            </h1>
            <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-garuda-400)' }}>
              Track verification progress, review notes from Station SHO, and resubmit corrected records.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchSubmissions(true)}
          disabled={refreshing || loading}
          className="px-5 py-2.5 rounded-full text-xs font-extrabold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs border border-slate-200/90 dark:border-slate-700 active:scale-95 disabled:opacity-60 self-start md:self-auto"
        >
          <IconRefresh className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Modern Rounded KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Submissions */}
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('ALL');
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            activeTab === 'all' && statusFilter === 'ALL'
              ? 'bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Submissions
            </span>
            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <IconAuditLog className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white font-mono">
            {stats.total}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">All registered submissions</div>
        </div>

        {/* Pending Review */}
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('PENDING');
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30'
              : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Pending Review
            </span>
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-500">
              <IconCheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-amber-600 dark:text-amber-400 font-mono">
            {stats.pending}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Awaiting SHO verification</div>
        </div>

        {/* Changes Requested (Action Required) */}
        <div
          onClick={() => {
            setActiveTab('action-required');
            setStatusFilter('ALL');
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            activeTab === 'action-required'
              ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40'
              : 'bg-white dark:bg-slate-850 border-orange-500/30 dark:border-orange-500/30 hover:border-orange-500 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconWarning className="w-3.5 h-3.5 text-orange-500" />
              Action Required
            </span>
            <div className="p-1.5 rounded-xl bg-orange-500/20 text-orange-500">
              <IconEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-orange-600 dark:text-orange-400 font-mono">
            {stats.changesRequested}
          </div>
          <div className="text-[10px] text-orange-600/80 dark:text-orange-300/80 mt-1 font-semibold">Changes requested by SHO</div>
        </div>

        {/* Approved & Committed */}
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('APPROVED');
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/40 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconCheck className="w-3.5 h-3.5" />
              Approved
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">
              <IconCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.approved}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Committed to database</div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('REJECTED');
          }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden ${
            statusFilter === 'REJECTED'
              ? 'bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30'
              : 'bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-rose-500/40 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconClose className="w-3.5 h-3.5" />
              Rejected
            </span>
            <div className="p-1.5 rounded-xl bg-rose-500/15 text-rose-500">
              <IconClose className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black mt-2 text-rose-600 dark:text-rose-400 font-mono">
            {stats.rejected}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">Rejected submissions</div>
        </div>
      </div>

      {/* Action Required Banner Notice if any changes requested */}
      {stats.changesRequested > 0 && activeTab !== 'action-required' && (
        <div className="p-4.5 rounded-3xl bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-orange-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0 shadow-md shadow-orange-500/25">
              <IconWarning className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-orange-950 dark:text-orange-200">
                You have {stats.changesRequested} submission(s) requiring changes
              </h3>
              <p className="text-xs text-orange-800/90 dark:text-orange-300/90 mt-0.5 font-medium">
                The Station SHO has reviewed your submissions and requested specific adjustments. Please update and resubmit.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('action-required');
              setStatusFilter('ALL');
            }}
            className="px-5 py-2.5 rounded-full text-xs font-black bg-orange-500 hover:bg-orange-400 text-slate-950 transition-all shrink-0 cursor-pointer shadow-md shadow-orange-500/20 active:scale-95"
          >
            View Required Changes ({stats.changesRequested})
          </button>
        </div>
      )}

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Navigation Tabs Container */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 overflow-x-auto custom-scrollbar shadow-xs">
          {[
            { id: 'all', label: 'All Submissions', count: data.items.length, icon: IconAuditLog },
            { id: 'action-required', label: 'Changes Requested', count: stats.changesRequested, icon: IconWarning, highlight: stats.changesRequested > 0 },
            { id: 'cases', label: 'New Cases', count: data.cases.length, icon: IconCases },
            { id: 'offenders', label: 'New Offenders', count: data.offenders.length, icon: IconOffender },
            { id: 'edit-requests', label: 'Edit Requests', count: data.editRequests.length, icon: IconEdit },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'action-required') setStatusFilter('ALL');
                }}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap select-none ${
                  isActive
                    ? tab.highlight
                      ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                      : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : tab.highlight
                    ? 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    isActive
                      ? 'bg-slate-950 text-amber-400'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center w-full sm:w-64">
            <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search submissions..."
              className="w-full pl-9 pr-4 py-2 rounded-full text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs transition-all"
            />
          </div>

          {activeTab !== 'action-required' && (
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending Review' },
                { value: 'CHANGES_REQUESTED', label: 'Changes Requested' },
                { value: 'APPROVED', label: 'Approved & Committed' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
              className="w-48"
              triggerClassName="py-2"
            />
          )}
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-850 p-12 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Loading your submissions and approval progress...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-850 p-16 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <IconAuditLog className="w-6 h-6 stroke-1" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No submissions found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              {activeTab === 'action-required'
                ? 'There are no submissions currently requiring changes.'
                : 'No submissions match your search or filter criteria.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isChangesRequested = item.status === 'CHANGES_REQUESTED';
            const isApproved = item.status === 'APPROVED';
            const isRejected = item.status === 'REJECTED';

            return (
              <div
                key={`${item.submissionType}-${item.id}`}
                className={`rounded-3xl border transition-all p-5 sm:p-6 space-y-4 shadow-sm ${
                  isChangesRequested
                    ? 'bg-orange-500/5 dark:bg-orange-950/20 border-orange-500/40 hover:border-orange-500'
                    : 'bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl shrink-0 font-bold shadow-xs ${
                        item.submissionType === 'CASE'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                          : item.submissionType === 'OFFENDER'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      }`}
                    >
                      {item.submissionType === 'CASE' && <IconCases className="w-6 h-6" />}
                      {item.submissionType === 'OFFENDER' && <IconOffender className="w-6 h-6" />}
                      {item.submissionType === 'EDIT_REQUEST' && <IconEdit className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                          {item.submissionType?.replace('_', ' ')}
                        </span>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {item.title}
                        </h3>
                        {item.stage && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                            {item.stage}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                        {item.subtitle} • Station: <strong className="text-slate-700 dark:text-slate-300">{item.station}</strong> • Submitted:{' '}
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="self-start sm:self-auto shrink-0">
                    {getStatusBadge(item.status)}
                  </div>
                </div>

                {/* Connected Modern Progress Stepper */}
                <div className="py-2">
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 relative">
                    {/* Step 1: Draft & Submit */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
                        <IconCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-slate-800 dark:text-slate-200">1. Draft & Submit</div>
                        <div className="text-[10px] text-slate-400 truncate">Submitted by Constable</div>
                      </div>
                    </div>

                    {/* Step 2: SHO Review */}
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                        isApproved
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200'
                          : isChangesRequested
                          ? 'bg-orange-500/15 border-orange-500/40 text-orange-500 dark:text-orange-300'
                          : isRejected
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-300'
                          : 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow-sm ${
                          isApproved
                            ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                            : isChangesRequested
                            ? 'bg-orange-500 text-slate-950 shadow-orange-500/30'
                            : isRejected
                            ? 'bg-rose-500 text-white shadow-rose-500/30'
                            : 'bg-amber-500 text-slate-950 shadow-amber-500/30 animate-pulse'
                        }`}
                      >
                        {isApproved && <IconCheck className="w-4 h-4" />}
                        {isChangesRequested && <IconWarning className="w-4 h-4" />}
                        {isRejected && <IconClose className="w-4 h-4" />}
                        {!isApproved && !isChangesRequested && !isRejected && <IconCheckCircle className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black">
                          {isApproved
                            ? '2. SHO Verified'
                            : isChangesRequested
                            ? '2. Changes Needed'
                            : isRejected
                            ? '2. SHO Rejected'
                            : '2. Under SHO Review'}
                        </div>
                        <div className="text-[10px] opacity-80 truncate">
                          {isChangesRequested ? 'Action required by you' : 'Station review'}
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Database Commit */}
                    <div
                      className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                        isApproved
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-300'
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 ${
                          isApproved ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isApproved ? <IconCheck className="w-4 h-4" /> : <span className="font-bold">3</span>}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black">3. Database Commit</div>
                        <div className="text-[10px] opacity-80 truncate">
                          {isApproved ? 'Sealed & Active in DB' : 'Pending verification'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clean SHO Feedback Box if Note is present (No Emojis) */}
                {item.approvalNotes && (
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 shadow-xs ${
                      isChangesRequested
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-950 dark:text-orange-200'
                        : isRejected
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
                      <IconAuditLog className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase tracking-wider">
                        {isChangesRequested ? 'SHO Instructions / Required Changes' : 'SHO Review Feedback'}
                      </div>
                      <p className="text-xs mt-1 font-medium leading-relaxed">
                        {item.approvalNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] font-mono text-slate-400">
                    Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-IN') : 'Recent'}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Edit & Resubmit Action */}
                    {(isChangesRequested || item.status === 'PENDING') && (
                      <button
                        onClick={() => handleEditResubmit(item)}
                        className={`px-5 py-2 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                          isChangesRequested
                            ? 'bg-orange-500 hover:bg-orange-400 text-slate-950 shadow-orange-500/25 active:scale-95'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 active:scale-95'
                        }`}
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                        {isChangesRequested ? 'Edit & Resubmit Corrections' : 'Edit Submission'}
                      </button>
                    )}

                    {/* Direct View Links */}
                    {item.submissionType === 'CASE' && (
                      <Link
                        to={`/cases/${item.id}`}
                        className="px-4 py-2 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
                      >
                        View Case Details
                      </Link>
                    )}

                    {item.submissionType === 'OFFENDER' && (
                      <Link
                        to={`/offenders/${item.id}`}
                        className="px-4 py-2 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
                      >
                        View Offender Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
