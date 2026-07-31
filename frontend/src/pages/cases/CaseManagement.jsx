/**
 * GARUDA — Case Management (Page 2)
 * Route: /cases
 * 
 * Lists cases with filtering by stage, search query, pagination, and new case registration.
 * Clean, high-contrast executive design.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { usePermissions } from '../../hooks/usePermissions';
import { IconSearch } from '../../components/Icons';
import CustomSelect from '../../components/CustomSelect';

const STAGE_COLORS = {
  FIR:         { bg: '#3b82f6', label: 'FIR Registered' },
  CHARGESHEET: { bg: '#8b5cf6', label: 'Charge Sheet' },
  TRIAL:       { bg: '#f59e0b', label: 'Under Trial' },
  CONVICTED:   { bg: '#22c55e', label: 'Convicted' },
  ACQUITTED:   { bg: '#ef4444', label: 'Acquitted' },
  CLOSED:      { bg: '#64748b', label: 'Case Closed' },
};

export default function CaseManagement() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [stageCounts, setStageCounts] = useState({});

  const perms = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, [page, stageFilter]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: page + 1,
        size: 15,
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
      };

      const res = await api.get('/cases', { params });
      const payload = res.data.data;

      const items = payload?.content || (Array.isArray(payload) ? payload : []);
      const pages = payload?.totalPages || 1;

      setCases(items);
      setTotalPages(pages);

      // Extract stage counts from response metadata if available
      if (res.data.stageCounts) {
        setStageCounts(res.data.stageCounts);
      } else {
        // Fallback: compute from current items if missing
        const counts = {};
        items.forEach((c) => {
          counts[c.stage] = (counts[c.stage] || 0) + 1;
        });
        setStageCounts(counts);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchCases();
  };

  const handleStageClick = (stageKey) => {
    if (stageFilter === stageKey) {
      setStageFilter('');
    } else {
      setStageFilter(stageKey);
    }
    setPage(0);
  };

  const handleStageSelect = (e) => {
    setStageFilter(e.target.value);
    setPage(0);
  };

  return (
    <div className={`space-y-6 animate-fade-in ${totalPages > 1 ? 'pb-20 sm:pb-6 pr-0 sm:pr-16' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Case Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            NDPS case lifecycle — FIR registration to court disposition
          </p>
        </div>
        {perms.canRegisterCase && (
          <Link
            to="/cases/new"
            className="px-4 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
          >
            + Register New Case
          </Link>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex gap-3 flex-wrap items-center">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[280px]">
          <input
            type="text"
            placeholder="Search by FIR No., accused name, station..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs focus:ring-2 focus:ring-amber-500/50 outline-none flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <IconSearch size={14} /> Search
          </button>
        </form>

        <CustomSelect
          value={stageFilter}
          onChange={handleStageSelect}
          placeholder="All Stages"
          className="w-full md:w-52"
          options={[
            { value: '', label: 'All Stages' },
            ...Object.entries(STAGE_COLORS).map(([key, val]) => ({
              value: key,
              label: val.label
            }))
          ]}
        />
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(STAGE_COLORS).map(([key, val]) => {
          const count = stageCounts[key] || 0;
          const isSelected = stageFilter === key;
          return (
            <button
              key={key}
              onClick={() => handleStageClick(key)}
              className={`rounded-xl p-3.5 text-center cursor-pointer transition-all border shadow-xs ${
                isSelected
                  ? 'bg-slate-100 dark:bg-slate-800 border-amber-500 ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <p className="text-2xl font-black font-mono tracking-tight" style={{ color: val.bg }}>{count}</p>
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mt-1">{val.label}</p>
            </button>
          );
        })}
      </div>

      {/* Cases Table Container */}
      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-medium text-center">
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
          {/* Desktop View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                  <th className="px-4 py-3.5">FIR No.</th>
                  <th className="px-4 py-3.5">Police Station</th>
                  <th className="px-4 py-3.5">Section of Law</th>
                  <th className="px-4 py-3.5">Case Date</th>
                  <th className="px-4 py-3.5">Stage</th>
                  <th className="px-4 py-3.5">Accused</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  [1, 2, 3, 4, 5].map((idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-12" /></td>
                      <td className="px-4 py-3.5 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-10 ml-auto" /></td>
                    </tr>
                  ))
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                      No cases found matching the criteria
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => {
                    const stage = STAGE_COLORS[c.stage] || STAGE_COLORS.FIR;
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-slate-900 dark:text-white">{c.firNo}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300">{c.psName || '—'}</td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400">
                          <span className="max-w-[200px] truncate block font-medium" title={c.sectionOfLaw}>{c.sectionOfLaw || '—'}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 font-medium">
                          {c.caseDate ? new Date(c.caseDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider border"
                            style={{
                              background: `${stage.bg}14`,
                              color: stage.bg,
                              borderColor: `${stage.bg}30`,
                            }}
                          >
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {c.accused?.length || 0} accused
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Link
                            to={`/cases/${c.id}`}
                            className="px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors inline-block"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block sm:hidden p-4 space-y-3">
            {loading ? (
              [1, 2, 3].map((idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 animate-pulse bg-slate-50 dark:bg-slate-900">
                  <div className="flex justify-between">
                    <div className="w-1/3 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="w-1/4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))
            ) : cases.length === 0 ? (
              <div className="py-8 text-center text-xs font-medium text-slate-500">No cases found</div>
            ) : (
              cases.map((c) => {
                const stage = STAGE_COLORS[c.stage] || STAGE_COLORS.FIR;
                return (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/cases/${c.id}`)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 bg-white dark:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">FIR: {c.firNo}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {c.psName || '—'} • {c.caseDate ? new Date(c.caseDate).toLocaleDateString('en-IN') : '—'}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border"
                        style={{ background: `${stage.bg}14`, color: stage.bg, borderColor: `${stage.bg}30` }}
                      >
                        {stage.label}
                      </span>
                    </div>

                    <div className="text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-750">
                      <span className="font-bold text-slate-400 mr-1">Section:</span>
                      <span>{c.sectionOfLaw || '—'}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium">Linked Accused</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{c.accused?.length || 0} accused</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && !loading && (
            <div 
              className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 z-50 flex flex-row sm:flex-col items-center gap-2 p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md"
              style={{ minWidth: '44px' }}
            >
              <div className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 text-center select-none pr-2 sm:pr-0 pb-0 sm:pb-1.5 border-r sm:border-r-0 sm:border-b border-slate-200 dark:border-slate-800 mr-1.5 sm:mr-0">
                {page + 1}/{totalPages}
              </div>
              
              <button
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0 || loading}
                title="Previous Page"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>

              <div className="flex flex-row sm:flex-col gap-1.5">
                {Array.from({ length: totalPages }).map((_, index) => {
                  if (
                    totalPages <= 6 ||
                    index < 2 ||
                    index === totalPages - 1 ||
                    (index >= page - 1 && index <= page + 1)
                  ) {
                    const isCurrent = page === index;
                    return (
                      <button
                        key={index}
                        onClick={() => setPage(index)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  }
                  if (
                    (index === 2 && page > 2) ||
                    (index === totalPages - 2 && page < totalPages - 3)
                  ) {
                    return (
                      <span key={`ellipsis-${index}`} className="text-slate-400 dark:text-slate-500 text-center select-none text-[10px] leading-none py-0.5 font-bold">
                        •••
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page === totalPages - 1 || loading}
                title="Next Page"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
