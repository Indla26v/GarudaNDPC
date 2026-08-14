/**
 * GARUDA — Case Management (Page 2)
 * Route: /cases
 * 
 * Lists cases with filtering by stage, search query, pagination, and new case registration.
 * Clean, high-contrast executive design.
 */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { usePermissions } from '../../hooks/usePermissions';
import { IconSearch } from '../../components/Icons';
import CustomSelect from '../../components/CustomSelect';
import FloatingPagination from '../../components/FloatingPagination';

const STAGE_COLORS = {
  FIR:         { bg: '#3b82f6', label: 'FIR Registered' },
  CHARGESHEET: { bg: '#8b5cf6', label: 'Charge Sheet' },
  TRIAL:       { bg: '#f59e0b', label: 'Under Trial' },
  CONVICTED:   { bg: '#22c55e', label: 'Convicted' },
  ACQUITTED:   { bg: '#ef4444', label: 'Acquitted' },
  CLOSED:      { bg: '#64748b', label: 'Case Closed' },
};

const generatePastMonths = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const value = `${year}-${monthNum}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
};

export default function CaseManagement() {
  const [searchParams] = useSearchParams();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState(() => searchParams.get('stage') || '');
  const [stageCounts, setStageCounts] = useState({});

  // Time / Period Filtering
  const pastMonthOptions = useMemo(() => generatePastMonths(), []);
  const [periodFilter, setPeriodFilter] = useState(() => searchParams.get('timeRange') || 'all'); // 'monthly' | 'yearly' | 'all'
  const [selectedMonth, setSelectedMonth] = useState(() => searchParams.get('month') || pastMonthOptions[0]?.value || '');
  const [selectedYear, setSelectedYear] = useState(() => searchParams.get('year') || String(new Date().getFullYear()));
  const [exporting, setExporting] = useState(false);

  // Dropdown popover state for Month & Year buttons
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setShowMonthDropdown(false);
      }
      if (yearRef.current && !yearRef.current.contains(e.target)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedMonthObj = pastMonthOptions.find((opt) => opt.value === selectedMonth);
  const selectedMonthLabel = selectedMonthObj ? selectedMonthObj.label : 'Month';

  const perms = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    const stage = searchParams.get('stage');
    const timeRange = searchParams.get('timeRange');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (stage !== null) setStageFilter(stage);
    if (timeRange !== null) setPeriodFilter(timeRange);
    if (month !== null) setSelectedMonth(month);
    if (year !== null) setSelectedYear(year);
  }, [searchParams]);

  useEffect(() => {
    fetchCases();
  }, [page, stageFilter, periodFilter, selectedMonth, selectedYear]);

  const fetchCases = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        size: 15,
        ...(search ? { search } : {}),
        ...(stageFilter ? { stage: stageFilter } : {}),
        timeRange: periodFilter,
        ...(periodFilter === 'monthly' ? { month: selectedMonth } : {}),
        ...(periodFilter === 'yearly' ? { year: selectedYear } : {}),
      };

      const res = await api.get('/cases', { params });
      const payload = res.data.data;

      const items = payload?.content || (Array.isArray(payload) ? payload : []);
      const pages = payload?.totalPages || 1;

      setCases(items);
      setTotalPages(pages);

      const stageCountsFromData = payload?.stageCounts || res.data?.stageCounts;
      if (stageCountsFromData) {
        setStageCounts(stageCountsFromData);
      } else {
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

  const handleExportCasePdf = async (e, caseId, firNo) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.get(`/cases/${caseId}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeFir = (firNo || 'Case').replace(/[/\\?%*:|"<>]/g, '_');
      link.setAttribute('download', `Case_Report_${safeFir}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Case PDF export error:', err);
      alert('Failed to export Case PDF report');
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (stageFilter) params.append('stage', stageFilter);
      params.append('timeRange', periodFilter);
      if (periodFilter === 'monthly' && selectedMonth) params.append('month', selectedMonth);
      if (periodFilter === 'yearly' && selectedYear) params.append('year', selectedYear);

      const response = await api.get(`/cases/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cases-export-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export cases to Excel');
    } finally {
      setExporting(false);
    }
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
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Period Filter Toggle Pills — Month & Year itself are Dropdowns */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700/60 inline-flex items-center shadow-xs relative">
            
            {/* ── Month Dropdown Button Trigger ───────────────────────── */}
            <div className="relative" ref={monthRef}>
              <button
                type="button"
                onClick={() => {
                  setPeriodFilter('monthly');
                  setShowMonthDropdown((prev) => !prev);
                  setShowYearDropdown(false);
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  periodFilter === 'monthly'
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{periodFilter === 'monthly' ? selectedMonthLabel : 'Month'}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${showMonthDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Month Dropdown Popover */}
              {showMonthDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {pastMonthOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedMonth(opt.value);
                        setPeriodFilter('monthly');
                        setShowMonthDropdown(false);
                        setPage(0);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        selectedMonth === opt.value && periodFilter === 'monthly'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {selectedMonth === opt.value && periodFilter === 'monthly' && (
                        <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Year Dropdown Button Trigger ────────────────────────── */}
            <div className="relative" ref={yearRef}>
              <button
                type="button"
                onClick={() => {
                  setPeriodFilter('yearly');
                  setShowYearDropdown((prev) => !prev);
                  setShowMonthDropdown(false);
                }}
                className={`px-3 py-1.5 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  periodFilter === 'yearly'
                    ? 'bg-amber-500 text-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{periodFilter === 'yearly' ? selectedYear : 'Year'}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${showYearDropdown ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Year Dropdown Popover */}
              {showYearDropdown && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                  {['2026', '2025', '2024'].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setSelectedYear(yr);
                        setPeriodFilter('yearly');
                        setShowYearDropdown(false);
                        setPage(0);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        selectedYear === yr && periodFilter === 'yearly'
                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      <span>{yr}</span>
                      {selectedYear === yr && periodFilter === 'yearly' && (
                        <span className="text-amber-600 dark:text-amber-400 font-black">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── All Time Button ────────────────────────────────────────── */}
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('all');
                setShowMonthDropdown(false);
                setShowYearDropdown(false);
                setPage(0);
              }}
              className={`px-3 py-1.5 text-xs font-black rounded-full transition-all cursor-pointer ${
                periodFilter === 'all'
                  ? 'bg-amber-500 text-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-3.5 py-2 text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : '⬇ Export Excel'}
          </button>

          {perms.canRegisterCase && (
            <Link
              to="/cases/new"
              className="px-4 py-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              + Register New Case
            </Link>
          )}
        </div>
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
                            className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border shadow-2xs"
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
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleExportCasePdf(e, c.id, c.firNo)}
                              title="Export PDF Case Report with Accused Photos"
                              className="px-3 py-1.5 rounded-full text-xs font-extrabold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 transition-all inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                              PDF
                            </button>
                            <Link
                              to={`/cases/${c.id}`}
                              className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all inline-block shadow-2xs"
                            >
                              View
                            </Link>
                          </div>
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

          {/* Floating Vertical Pill Pagination */}
          <FloatingPagination page={page} totalPages={totalPages} setPage={setPage} loading={loading} />
        </div>
      )}
    </div>
  );
}
