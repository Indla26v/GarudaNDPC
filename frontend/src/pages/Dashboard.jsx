/**
 * GARUDA — Command Dashboard (Page 1)
 * Route: /dashboard
 * 
 * Real-time command overview with:
 *  - KPI cards (cases, arrests, absconders, pending CS, courts, convictions)
 *  - Year-wise case trend (2016–2026) line chart
 *  - Station-wise bar chart
 *  - Drug type donut chart
 *  - Live alert feed
 *  - Absconder ticker
 *  - Quick action links
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/axios';
import { usePermissions } from '../hooks/usePermissions';
import { useSSE } from '../hooks/useSSE';
import {
  IconClipboard, IconLock, IconRunning, IconHourglass, IconScale, IconCheckCircle,
  IconPackage, IconDollar, IconCar, IconBell, IconMegaphone, IconSearch, IconReports, IconShield,
  IconNetwork, IconOffender, IconConsumer, IconChain
} from '../components/Icons';

const getAvatarColor = (name) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'
  ];
  if (!name) return colors[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

const KPI_CARDS = [
  { key: 'totalCases',           label: 'Total Cases',       Icon: IconClipboard, color: '#3b82f6' },
  { key: 'totalArrests',         label: 'Arrests',           Icon: IconLock,      color: '#22c55e' },
  { key: 'totalAbsconders',      label: 'Absconders',        Icon: IconRunning,   color: '#ef4444' },
  { key: 'pendingChargeSheets',  label: 'Pending CS',        Icon: IconHourglass, color: '#f59e0b' },
  { key: 'pendingCourtCases',    label: 'Pending Courts',    Icon: IconScale,     color: '#8b5cf6' },
  { key: 'convictionsThisYear',  label: 'Convictions (YTD)', Icon: IconCheckCircle, color: '#06b6d4' },
];

const ALERT_ICON_MAP = {
  NEW_CASE: IconClipboard,
  ABSCONDER: IconRunning,
  CHARGE_SHEET: IconHourglass,
  CONVICTION: IconCheckCircle,
};

const IconTruck = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8v16z" />
    <path d="M14 6h4l4 4v6h-8V6z" />
    <circle cx="7.5" cy="18.5" r="2.5" />
    <circle cx="16.5" cy="16.5" r="2.5" />
  </svg>
);

const IconCrown = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M5 20h14" />
  </svg>
);

const HIERARCHY_STAGES = [
  {
    step: 1,
    key: 'interstateLink',
    label: 'Interstate Link',
    borderColor: '#6366f1',
    iconType: 'network',
  },
  {
    step: 2,
    key: 'financier',
    label: 'Financier',
    borderColor: '#16a34a',
    iconType: 'rupee',
  },
  {
    step: 3,
    key: 'supplier',
    label: 'Supplier',
    borderColor: '#2563eb',
    iconType: 'supplier',
  },
  {
    step: 4,
    key: 'transporter',
    label: 'Transporter',
    borderColor: '#ea580c',
    iconType: 'truck',
  },
  {
    step: 5,
    key: 'localKingpin',
    label: 'Local Kingpin',
    borderColor: '#dc2626',
    iconType: 'crown',
  },
  {
    step: 6,
    key: 'localPeddler',
    label: 'Local Peddler',
    borderColor: '#8b5cf6',
    iconType: 'peddler',
  },
  {
    step: 7,
    key: 'consumer',
    label: 'Consumers',
    borderColor: '#0d9488',
    iconType: 'consumers',
  },
];

// Simple in-memory client-side cache for tab switching
let cachedSummary = null;
let lastFetchTime = 0;
let cachedToken = null;
const CACHE_TTL = 30000; // 30 seconds cache

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState('monthly');
  const [sortColumn, setSortColumn] = useState('totalCases');
  const [sortOrder, setSortOrder] = useState('desc');

  // If cache is valid, initialize with cached data and skip loading screen
  const isCacheValid = cachedSummary && 
                       cachedToken === `summary_${timeRange}` &&
                       (Date.now() - lastFetchTime < CACHE_TTL);

  const [summary, setSummary] = useState(isCacheValid ? cachedSummary : null);
  const [loading, setLoading] = useState(!isCacheValid);
  const [error, setError] = useState('');
  const perms = usePermissions();
  const navigate = useNavigate();
  const { lastEvent, isConnected } = useSSE();

  useEffect(() => {
    fetchSummary(false, timeRange);
  }, []);

  // Refresh data on SSE events (bypasses cache)
  useEffect(() => {
    if (lastEvent && ['case_created', 'offender_created', 'data_updated', 'absconder_alerts', 'chargesheet_overdue_alerts'].includes(lastEvent.type)) {
      fetchSummary(true, timeRange);
    }
  }, [lastEvent]);

  const fetchSummary = async (force = false, range = timeRange) => {
    const now = Date.now();
    const cacheKey = `summary_${range}`;
    const cacheIsValid = cachedSummary && 
                         cachedToken === cacheKey &&
                         (now - lastFetchTime < CACHE_TTL);
    
    if (!force && cacheIsValid) {
      setSummary(cachedSummary);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/dashboard/summary?timeRange=${range}${force ? '&force=true' : ''}`);
      cachedSummary = res.data.data;
      cachedToken = cacheKey;
      lastFetchTime = Date.now();
      setSummary(res.data.data);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
    fetchSummary(true, newRange);
  };

  const fmt = (val) => {
    if (val === null || val === undefined) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const renderStatValue = (val) => {
    if (loading && !summary) {
      return <span className="w-16 h-8 bg-white/20 rounded animate-pulse inline-block" />;
    }
    return fmt(val);
  };

  const renderSeizureValue = (val, prefix = '', suffix = '') => {
    if (loading && !summary) {
      return <span className="w-24 h-6 bg-black/10 rounded animate-pulse inline-block" />;
    }
    return `${prefix}${fmt(val)}${suffix}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--color-danger-400)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header + Quick Links ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-garuda-50)' }}>
              Command Dashboard
            </h1>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--color-garuda-400)' }}>
            NDPS Operations{summary?.isStationLevel
              ? ` — ${summary?.psWiseData?.[0]?.psName || 'Your Station'}`
              : ' — Tirupati District'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Global Dashboard Period Filter Pill Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-xs mr-2">
            <button
              onClick={() => handleTimeRangeChange('monthly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'monthly'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('yearly')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'yearly'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => handleTimeRangeChange('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          {perms.canRegisterCase && (
            <Link 
              to="/cases/new" 
              className="px-3.5 py-2 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              + New Case
            </Link>
          )}
          <Link 
            to="/offenders" 
            className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <IconSearch size={14} /> Search Accused
          </Link>
          <Link 
            to="/reports" 
            className="px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
          >
            <IconReports size={14} /> Reports
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {KPI_CARDS.map((card, i) => (
          <div
            key={card.key}
            className="flex flex-col border-0 rounded-xl overflow-hidden hover:translate-y-[-2px] transition-all duration-200 max-w-[145px] sm:max-w-none w-full mx-auto"
            style={{
              background: card.color,
              boxShadow: `0 4px 12px ${card.color}40`,
              animationDelay: `${i * 60}ms`
            }}
          >
            {/* Header Zone */}
            <div 
              className="px-2.5 py-1.5 sm:px-4 sm:py-2.5 flex items-center justify-start bg-black/10"
            >
              <span className="text-[10px] sm:text-[12px] font-bold text-white tracking-wider uppercase select-none">
                {card.label}
              </span>
            </div>
            
            {/* Body Zone */}
            <div className="p-2.5 sm:p-4 flex items-center justify-between gap-2 sm:gap-3">
              {/* Left Side: Icon in subtle container */}
              <div 
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center bg-white/20 border border-white/20 flex-shrink-0"
              >
                <card.Icon size={18} color="#ffffff" />
              </div>
              
              {/* Right Side: Large bold stat number */}
              <div className="text-right flex-1 min-w-0">
                <p 
                  className="font-extrabold truncate text-white text-xl sm:text-2xl lg:text-3xl"
                  style={{ lineHeight: '1.2' }}
                >
                  {renderStatValue(summary?.[card.key])}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Seizure Stats Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Contraband Seized', val: summary?.totalContrabandKg, suffix: ' Kg', color: '#f59e0b', Icon: IconPackage, link: null },
          { label: 'Cash Seized', val: summary?.totalCashSeized, prefix: '₹', color: '#22c55e', Icon: IconDollar, link: null },
          { label: 'Vehicles Seized', val: summary?.totalSeizedVehicleRecords, color: '#ec4899', Icon: IconCar, link: '/vehicles-seized' },
        ].map(s => {
          const content = (
            <div key={s.label} className={`card rounded-xl p-2.5 sm:p-4 flex items-center gap-2.5 sm:gap-4 ${s.link ? 'hover:translate-y-[-2px] transition-all duration-200' : ''} max-w-[300px] sm:max-w-none w-full mx-auto`} style={s.link ? { cursor: 'pointer' } : {}}>
              <div
                className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + '14' }}
              >
                <s.Icon size={18} color={s.color} />
              </div>
              <div>
                <p className="text-sm sm:text-lg font-bold" style={{ color: s.color }}>
                  {renderSeizureValue(s.val, s.prefix || '', s.suffix || '')}
                </p>
                <p className="text-[10px] sm:text-xs" style={{ color: 'var(--color-garuda-400)' }}>{s.label}</p>
              </div>
              {s.link && (
                <div className="ml-auto">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke={s.color} strokeWidth="2" viewBox="0 0 24 24" style={{ opacity: 0.6 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );
          return s.link ? (
            <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
              {content}
            </Link>
          ) : content;
        })}
      </div>


      {/* ── Side-by-Side: Most Wanted List & Hierarchy of Smugglers ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Wanted List */}
        <div className="card rounded-xl p-5 shadow-card border border-slate-700/20 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/20 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500">
              Most Wanted List
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold uppercase tracking-wider border border-red-500/20">
              Top 10 Active
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch flex-1">
            {/* Gangster/Detective Badge (Left side) */}
            <div className="flex flex-col items-center justify-center p-4 border border-red-500/10 rounded-xl bg-red-500/[0.03] select-none w-full sm:w-[150px] shrink-0">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-red-500/15 group">
                <svg viewBox="0 0 100 100" className="w-16 h-16 text-red-500 transition-all duration-300 group-hover:scale-105" fill="currentColor">
                  {/* Target rings */}
                  <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30" />
                  
                  {/* Crosshairs */}
                  <line x1="50" y1="6" x2="50" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="50" y1="86" x2="50" y2="94" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6" y1="50" x2="14" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="86" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Hat Crown */}
                  <path d="M33 39 C33 22, 67 22, 67 39 Z" />

                  {/* Hat Ribbon */}
                  <path d="M32.5 37 L67.5 37 L67 40 L33 40 Z" fill="#7f1d1d" />

                  {/* Hat Brim */}
                  <path d="M18 43 C18 40.5, 30 40, 50 40 C70 40, 82 40.5, 82 43 C82 45, 70 45.5, 50 45.5 C30 45.5, 18 45, 18 43 Z" />

                  {/* Face & Neck */}
                  <path d="M35 44 L65 44 L63 56 C61 63, 57 64, 50 64 C43 64, 39 63, 37 56 Z" />
                  <path d="M44 62 L56 62 L56 68 L44 68 Z" />

                  {/* Sunglasses (cuts through face) */}
                  <path d="M38 50 C38 47, 47 47, 47 50 C47 53, 38 53, 38 50 Z M53 50 C53 47, 62 47, 62 50 C62 53, 53 53, 53 50 Z" fill="var(--color-garuda-800)" />
                  <line x1="47" y1="49" x2="53" y2="49" stroke="var(--color-garuda-800)" strokeWidth="2" />

                  {/* Coat / Shoulders */}
                  <path d="M22 76 L34 66 L42 70 L50 63 L58 70 L66 66 L78 76 C78 76, 50 82, 22 76 Z" />
                </svg>
              </div>
              <div className="mt-3 text-red-500 font-extrabold text-[10px] tracking-widest uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 shadow-sm animate-pulse">
                Most Wanted
              </div>
              <div className="flex gap-1 mt-2 text-red-500 text-xs">
                <span>★</span><span>★</span><span>★</span>
              </div>
            </div>

            {/* Table of Suspects (Right side) */}
            <div className="flex-1 w-full overflow-x-auto">
              <div className="max-h-[220px] overflow-y-auto scrollbar-thin pr-2">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <thead>
                    <tr className="border-b border-slate-700/20 text-[10px] font-extrabold uppercase tracking-wider text-[var(--color-garuda-400)]">
                      <th className="py-2 px-1 w-[50%]">Name / Alias</th>
                      <th className="py-2 px-1 w-[28%]">District</th>
                      <th className="py-2 px-1 w-[22%]">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && !summary ? (
                      [...Array(5)].map((_, idx) => (
                        <tr key={idx} className="border-b border-slate-700/10 animate-pulse">
                          <td className="py-3 px-1 w-[50%]"><span className="inline-block w-24 h-4 bg-slate-700/50 rounded" /></td>
                          <td className="py-3 px-1 w-[28%]"><span className="inline-block w-16 h-4 bg-slate-700/50 rounded" /></td>
                          <td className="py-3 px-1 w-[22%]"><span className="inline-block w-16 h-4 bg-slate-700/50 rounded" /></td>
                        </tr>
                      ))
                    ) : summary?.mostWanted?.length > 0 ? (
                      summary.mostWanted.map((o) => {
                        const riskBorders = {
                          CRITICAL: '#dc2626',
                          HIGH: '#f97316',
                          MEDIUM: '#eab308',
                          LOW: '#3b82f6',
                        };
                        const borderColor = riskBorders[o.riskScore] || '#3b82f6';
                        return (
                          <tr 
                            key={o.id} 
                            onClick={() => navigate(`/offenders/${o.id}`)}
                            className="border-b border-slate-700/10 hover:bg-red-500/[0.04] cursor-pointer transition-colors duration-150"
                          >
                            <td className="py-2.5 px-1 w-[50%]">
                              <div className="flex items-center gap-2 min-w-0">
                                {/* Avatar */}
                                <div 
                                  className="w-6.5 h-6.5 rounded-full overflow-hidden border flex-shrink-0 flex items-center justify-center text-[9px] font-black text-white"
                                  style={{ borderColor: borderColor, backgroundColor: getAvatarColor(o.fullName) }}
                                >
                                  {o.photoUrl ? (
                                    <img src={o.photoUrl} alt={o.fullName} className="w-full h-full object-cover" />
                                  ) : (
                                    o.fullName?.charAt(0).toUpperCase() || '?'
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-extrabold text-xs text-[var(--color-garuda-100)] truncate hover:text-red-500 transition-colors duration-150" title={o.fullName}>
                                    {o.fullName}
                                  </span>
                                  {o.alias && (
                                    <span className="text-[9px] font-bold text-[var(--color-garuda-400)] truncate tracking-wide" title={o.alias}>
                                      @{o.alias}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-1 w-[28%] text-[var(--color-garuda-300)] font-semibold text-xs truncate" title={o.district || o.psName || 'Tirupati'}>
                              {o.district || o.psName || 'Tirupati'}
                            </td>
                            <td className="py-2.5 px-1 w-[22%] text-[var(--color-garuda-300)] font-semibold text-xs truncate" title={o.state || 'Andhra Pradesh'}>
                              {o.state || 'Andhra Pradesh'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-6 text-[var(--color-garuda-500)]">
                          No active or absconding suspects.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Hierarchy of Smugglers */}
        <div className="card rounded-xl p-5 shadow-card border border-slate-700/20 relative overflow-hidden flex flex-col justify-between">
          {/* Decorative corner grid background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="flex justify-between items-center mb-5 border-b border-slate-700/20 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">
              Hierarchy of Smugglers
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase tracking-wider border border-indigo-500/20">
              Level 1 to 7
            </span>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin flex-1 flex items-center">
            <div className="flex items-stretch justify-between min-w-[520px] lg:min-w-0 gap-1 px-1 w-full">
              {HIERARCHY_STAGES.map((stage, idx) => {
                const count = summary?.smugglerHierarchy?.[stage.key];
                
                // Render Icon based on type
                let IconComponent = null;
                if (stage.iconType === 'network') {
                  IconComponent = <IconNetwork size={16} color="#ffffff" />;
                } else if (stage.iconType === 'rupee') {
                  IconComponent = <span className="text-sm font-black text-white">₹</span>;
                } else if (stage.iconType === 'supplier' || stage.iconType === 'peddler') {
                  IconComponent = <IconOffender size={16} color="#ffffff" />;
                } else if (stage.iconType === 'truck') {
                  IconComponent = <IconTruck size={16} color="#ffffff" />;
                } else if (stage.iconType === 'crown') {
                  IconComponent = <IconCrown size={16} color="#ffffff" />;
                } else if (stage.iconType === 'consumers') {
                  IconComponent = <IconConsumer size={16} color="#ffffff" />;
                }

                return (
                  <div key={stage.key} className="flex flex-col items-center flex-1 text-center select-none group relative">
                    {/* Large Icon Badge with dynamic colored glow and connecting dotted lines */}
                    <div className="flex flex-col items-center w-full mb-2">
                      {/* Relative container for badge and line */}
                      <div className="relative w-full flex items-center justify-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-md group-hover:scale-110 relative z-10"
                          style={{ 
                            background: `linear-gradient(135deg, ${stage.borderColor}dd, ${stage.borderColor})`,
                            boxShadow: `0 4px 10px ${stage.borderColor}33`,
                          }}
                        >
                          {IconComponent}
                        </div>
                        
                        {/* Connecting dotted line pointing to next step */}
                        {idx < HIERARCHY_STAGES.length - 1 && (
                          <div className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-1/2 -translate-y-1/2 z-0">
                            <div 
                              className="border-t-2 border-dotted h-0 w-full" 
                              style={{ borderColor: 'var(--color-garuda-400)', opacity: 0.5 }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title Label */}
                    <p className="text-[9px] font-extrabold tracking-wider uppercase mb-1 min-h-[24px] flex items-center justify-center leading-tight text-[var(--color-garuda-300)]">
                      {stage.label}
                    </p>

                    {/* Count/Data */}
                    <div className="text-base font-black mt-0.5 transition-all duration-300 group-hover:scale-110 text-[var(--color-garuda-100)]">
                      {loading && !summary ? (
                        <span className="inline-block w-8 h-4 bg-slate-700/50 animate-pulse rounded" />
                      ) : (
                        fmt(count)
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>



      {/* ── Bottom Row: Alerts + Absconder Ticker ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Alert Feed */}
        <div className="card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
            <IconBell size={16} color="#d97706" /> Live Alert Feed
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading && !summary ? (
              <div className="h-32 flex items-center justify-center text-xs text-[var(--color-garuda-500)] animate-pulse">
                Loading alerts...
              </div>
            ) : (
              summary?.recentAlerts?.length > 0 ? summary.recentAlerts.map(alert => {
                const AlertIcon = ALERT_ICON_MAP[alert.type] || IconMegaphone;
                return (
                  <div key={alert.id + alert.type} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--color-garuda-900)' }}>
                    <AlertIcon size={16} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: 'var(--color-garuda-100)' }}>{alert.message}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-garuda-500)' }}>
                        {new Date(alert.date).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm" style={{ color: 'var(--color-garuda-500)' }}>No recent alerts</p>
              )
            )}
          </div>
        </div>

        {/* Absconder Ticker */}
        <div className="card rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
            <IconRunning size={16} color="#ef4444" /> Pending Absconders
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading && !summary ? (
              <div className="h-32 flex items-center justify-center text-xs text-[var(--color-garuda-500)] animate-pulse">
                Loading absconders...
              </div>
            ) : (
              summary?.absconderTicker?.length > 0 ? summary.absconderTicker.map(a => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--color-garuda-900)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-garuda-100)' }}>{a.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--color-garuda-400)' }}>FIR: {a.firNo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: a.daysOutstanding > 30 ? '#ef4444' : '#f59e0b' }}>
                      {a.daysOutstanding}d
                    </p>
                    <p className="text-[10px]" style={{ color: 'var(--color-garuda-500)' }}>outstanding</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm" style={{ color: 'var(--color-garuda-500)' }}>No absconders on record</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── PS-wise Data Table (for SP/Admin) ────────────────────────── */}
      {(summary?.psWiseData?.length > 1 || (loading && !summary)) && (() => {
        if (loading && !summary) {
          return (
            <div className="card rounded-xl p-5 h-64 flex items-center justify-center animate-pulse text-xs text-[var(--color-garuda-500)]">
              Loading station breakdown table...
            </div>
          );
        }

        const sortedData = [...(summary?.psWiseData || [])].sort((a, b) => {
          let valA = a[sortColumn];
          let valB = b[sortColumn];

          if (sortColumn === 'psName') {
            return sortOrder === 'asc'
              ? valA.localeCompare(valB)
              : valB.localeCompare(valA);
          }

          valA = Number(valA || 0);
          valB = Number(valB || 0);

          return sortOrder === 'asc' ? valA - valB : valB - valA;
        });

        const handleHeaderClick = (col) => {
          if (sortColumn === col) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortColumn(col);
            setSortOrder('desc');
          }
        };

        const renderSortIndicator = (col) => {
          if (sortColumn !== col) return null;
          return sortOrder === 'asc' ? ' ▲' : ' ▼';
        };

        return (
          <div className="card rounded-xl overflow-hidden">
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderBottom: '1px solid var(--color-garuda-700)' }}>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--color-garuda-200)' }}>
                Police Station-wise Breakdown
              </h2>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Period Filter Segmented Pill Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-xs">
                  <button
                    onClick={() => handleTimeRangeChange('monthly')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      timeRange === 'monthly'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('yearly')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      timeRange === 'yearly'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Year
                  </button>
                  <button
                    onClick={() => handleTimeRangeChange('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      timeRange === 'all'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Time
                  </button>
                </div>

                {/* Sort Column Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide uppercase select-none text-[var(--color-garuda-400)]">Sort:</span>
                  <select 
                    className="py-1 px-2.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs outline-none cursor-pointer" 
                    value={sortColumn} 
                    onChange={(e) => setSortColumn(e.target.value)}
                  >
                    <option value="psName">PS Name</option>
                    <option value="totalCases">Cases</option>
                    <option value="totalOffenders">Offenders</option>
                    <option value="totalArrests">Arrests</option>
                    <option value="totalAbsconders">Absconders</option>
                    <option value="totalContrabandKg">Contraband</option>
                    <option value="totalCashSeized">Cash</option>
                  </select>
                </div>

                {/* Sort Order Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold tracking-wide uppercase select-none text-[var(--color-garuda-400)]">Order:</span>
                  <select 
                    className="py-1 px-2.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs outline-none cursor-pointer" 
                    value={sortOrder} 
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="cursor-pointer select-none" onClick={() => handleHeaderClick('psName')}>
                      PS Name{renderSortIndicator('psName')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalCases')}>
                      Cases{renderSortIndicator('totalCases')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalOffenders')}>
                      Offenders{renderSortIndicator('totalOffenders')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalArrests')}>
                      Arrests{renderSortIndicator('totalArrests')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalAbsconders')}>
                      Absconders{renderSortIndicator('totalAbsconders')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalContrabandKg')}>
                      Contraband (Kg){renderSortIndicator('totalContrabandKg')}
                    </th>
                    <th className="text-center cursor-pointer select-none" onClick={() => handleHeaderClick('totalCashSeized')}>
                      Cash{renderSortIndicator('totalCashSeized')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((ps) => (
                    <tr key={ps.psId} className="table-row">
                      <td className="px-4 py-3" style={{ color: 'var(--color-garuda-100)' }}>{ps.psName}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-info-400)' }}>{fmt(ps.totalCases)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-garuda-200)' }}>{fmt(ps.totalOffenders)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-success-400)' }}>{fmt(ps.totalArrests)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-danger-400)' }}>{fmt(ps.totalAbsconders)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-warning-400)' }}>{fmt(ps.totalContrabandKg)}</td>
                      <td className="px-4 py-3 text-center" style={{ color: 'var(--color-garuda-200)' }}>₹{fmt(ps.totalCashSeized)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
