/**
 * GARUDA — District Analytics Page (SP & Admin Oversight)
 * 
 * Real-time district-level intelligence with aggregated data across all Police Stations.
 * Styled with a clean, bespoke, high-contrast executive design system.
 */
import { useState, useEffect } from 'react';
import api from '../api/axios';
import CustomSelect from '../components/CustomSelect';
import { useSSE } from '../hooks/useSSE';
import {
  IconClipboard, IconOffender, IconLock, IconRunning, IconPackage, IconDollar, IconCar,
} from '../components/Icons';

export default function DistrictAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly'); // 'monthly' | 'yearly' | 'all'
  const { lastEvent, isConnected } = useSSE();

  // Filters state (Comparison section)
  const [stationsDetails, setStationsDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('cases');

  // Filters & Sorting state (Detailed Breakdown Table)
  const [tableSearch, setTableSearch] = useState('');
  const [tableDivision, setTableDivision] = useState('ALL');
  const [tableType, setTableType] = useState('ALL');
  const [tableSortField, setTableSortField] = useState('totalCases');
  const [tableSortAsc, setTableSortAsc] = useState(false);

  useEffect(() => {
    fetchSummary(timeRange);
    fetchStationsDetails();
  }, [timeRange]);

  // Refresh data on SSE events
  useEffect(() => {
    if (lastEvent && ['case_created', 'offender_created', 'data_updated'].includes(lastEvent.type)) {
      fetchSummary(timeRange);
    }
  }, [lastEvent, timeRange]);

  const fetchSummary = async (range = timeRange) => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/summary', { params: { timeRange: range } });
      setSummary(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationsDetails = async () => {
    try {
      const res = await api.get('/police-stations');
      setStationsDetails(res.data.data || []);
    } catch (err) {
      console.error('Failed to load station details:', err);
    }
  };

  // Combine summary psWiseData with details (sdpo, station_type)
  const enrichedPsData = summary?.psWiseData?.map((ps) => {
    const details = stationsDetails.find(s => String(s.id) === String(ps.psId) || s.ps_code === ps.psCode);
    return {
      ...ps,
      sdpo: details?.sdpo || 'Other',
      stationType: details?.station_type || 'POLICE',
    };
  }) || [];

  // Extract unique divisions dynamically
  const divisionsList = Array.from(
    new Set(stationsDetails.map(s => s.sdpo).filter(Boolean))
  ).sort();

  // Filter and Sort the comparison data
  const filteredPsData = enrichedPsData
    .filter((ps) => {
      const matchesSearch = 
        ps.psName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ps.psCode.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDivision = divisionFilter === 'ALL' || ps.sdpo === divisionFilter;
      const matchesType = typeFilter === 'ALL' || ps.stationType === typeFilter;

      return matchesSearch && matchesDivision && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'cases') return b.totalCases - a.totalCases;
      if (sortBy === 'arrests') return b.totalArrests - a.totalArrests;
      if (sortBy === 'absconders') return b.totalAbsconders - a.totalAbsconders;
      if (sortBy === 'contraband') return b.totalContrabandKg - a.totalContrabandKg;
      if (sortBy === 'cash') return b.totalCashSeized - a.totalCashSeized;
      return 0;
    });

  const handleTableSort = (field) => {
    if (tableSortField === field) {
      setTableSortAsc(!tableSortAsc);
    } else {
      setTableSortField(field);
      setTableSortAsc(false);
    }
  };

  // Filter and Sort Detailed Table Data
  const tableData = enrichedPsData
    .filter((ps) => {
      const matchesSearch = 
        ps.psName.toLowerCase().includes(tableSearch.toLowerCase()) ||
        ps.psCode.toLowerCase().includes(tableSearch.toLowerCase());
      
      const matchesDivision = tableDivision === 'ALL' || ps.sdpo === tableDivision;
      const matchesType = tableType === 'ALL' || ps.stationType === tableType;

      return matchesSearch && matchesDivision && matchesType;
    })
    .sort((a, b) => {
      const fieldA = a[tableSortField];
      const fieldB = b[tableSortField];
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return tableSortAsc ? fieldA - fieldB : fieldB - fieldA;
      }
      
      const strA = String(fieldA || '');
      const strB = String(fieldB || '');
      return tableSortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

  const formatNumber = (val) => {
    if (val === null || val === undefined) return '0';
    return Number(val).toLocaleString('en-IN');
  };

  const getTimeRangeLabel = () => {
    if (timeRange === 'monthly') return 'This Month (Last 30 Days)';
    if (timeRange === 'yearly') return 'This Year';
    return 'All Time (Complete History)';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Executive Header with Time Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            District Intelligence Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Aggregated operational metrics, case volumes, and station-level breakdown
          </p>
        </div>

        {/* Header Right Controls: Time Range Filter */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Filter Segmented Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl shadow-xs">
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                timeRange === 'monthly'
                  ? 'bg-amber-500 text-black font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                timeRange === 'yearly'
                  ? 'bg-amber-500 text-black font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Year
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                timeRange === 'all'
                  ? 'bg-amber-500 text-black font-extrabold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Time Range Active Sub-bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm px-1 text-slate-500 dark:text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span>Active Filter Period:</span>
          <span className="font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-mono">
            {getTimeRangeLabel()}
          </span>
        </div>
        {loading && <span className="text-amber-600 dark:text-amber-400 font-bold animate-pulse">Updating metrics...</span>}
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
        {/* Cases Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Cases</span>
            <IconClipboard size={18} className="text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {loading ? '—' : formatNumber(summary?.totalCases)}
          </p>
        </div>

        {/* Offenders Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Offenders</span>
            <IconOffender size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? '—' : formatNumber(summary?.totalOffenders)}
          </p>
        </div>

        {/* Arrests Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Arrests</span>
            <IconLock size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {loading ? '—' : formatNumber(summary?.totalArrests)}
          </p>
        </div>

        {/* Absconders Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Absconders</span>
            <IconRunning size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {loading ? '—' : formatNumber(summary?.totalAbsconders)}
          </p>
        </div>

        {/* Contraband Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contraband</span>
            <IconPackage size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? '—' : formatNumber(summary?.totalContrabandKg)}
            </p>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Kilograms (Kg)</span>
          </div>
        </div>

        {/* Cash Seized Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cash Seized</span>
            <IconDollar size={16} className="text-teal-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 tracking-tight font-mono">
              ₹{loading ? '—' : formatNumber(summary?.totalCashSeized)}
            </p>
          </div>
        </div>

        {/* Vehicles Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Vehicles</span>
            <IconCar size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {loading ? '—' : formatNumber(summary?.totalVehiclesSeized)}
          </p>
        </div>
      </div>

      {/* Station Volume Analytics Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        {/* Panel Header */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Station Volume & Case Comparison
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked analysis across all registered police stations ({getTimeRangeLabel()})
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-750">
            {filteredPsData.length} of {summary?.psWiseData?.length || 0} Stations Listed
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2.5 flex-1 w-full">
            {/* Search */}
            <input
              type="text"
              placeholder="Search station or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-56 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50"
            />

            {/* Division Select */}
            <div className="w-full sm:w-48">
              <CustomSelect
                value={divisionFilter}
                onChange={(e) => setDivisionFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Divisions' },
                  ...divisionsList.map((div) => ({ value: div, label: div }))
                ]}
              />
            </div>

            {/* Type Select */}
            <div className="w-full sm:w-36">
              <CustomSelect
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  { value: 'POLICE', label: 'Police Stations' },
                  { value: 'EXCISE', label: 'Excise Stations' },
                ]}
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">Order By:</span>
            <div className="w-44">
              <CustomSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'cases', label: 'Cases Volume' },
                  { value: 'arrests', label: 'Arrests Made' },
                  { value: 'absconders', label: 'Absconders' },
                  { value: 'contraband', label: 'Contraband Seized' },
                  { value: 'cash', label: 'Cash Seized' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Stations Comparison List */}
        <div className="p-6 space-y-3.5">
          {loading && !summary ? (
            <div className="py-12 text-center text-xs text-slate-500 animate-pulse font-medium">
              Loading district station analytics...
            </div>
          ) : filteredPsData.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-medium">
              No police stations match the current filter selection.
            </div>
          ) : (
            filteredPsData.map((ps, idx) => {
              const maxCases = Math.max(...filteredPsData.map(p => p.totalCases), 1);
              const percentage = (ps.totalCases / maxCases) * 100;
              const hasActivity = ps.totalCases > 0 || ps.totalArrests > 0 || ps.totalAbsconders > 0;

              return (
                <div 
                  key={ps.psId} 
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasActivity 
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/90 dark:border-slate-750' 
                      : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 w-6">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {ps.psName}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {ps.psCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                      <span className={ps.totalCases > 0 ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}>
                        {formatNumber(ps.totalCases)} <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">cases</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className={ps.totalArrests > 0 ? 'font-bold text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}>
                        {formatNumber(ps.totalArrests)} <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">arrests</span>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className={ps.totalAbsconders > 0 ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-600'}>
                        {formatNumber(ps.totalAbsconders)} <span className="font-sans text-[11px] text-slate-500 dark:text-slate-400">absconders</span>
                      </span>
                    </div>
                  </div>

                  {/* Clean Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-900 dark:bg-amber-500 transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, hasActivity ? 1.5 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Executive Detailed Breakdown Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Station Operational Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Complete metric table for {getTimeRangeLabel()}. Click column header to sort.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {tableData.length} records matching table criteria
          </span>
        </div>

        {/* Table Filter Controls */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2.5 flex-1 w-full">
            <input
              type="text"
              placeholder="Filter table rows..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full sm:w-56 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <div className="w-full sm:w-48">
              <CustomSelect
                value={tableDivision}
                onChange={(e) => setTableDivision(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Divisions' },
                  ...divisionsList.map((div) => ({ value: div, label: div }))
                ]}
              />
            </div>
            <div className="w-full sm:w-36">
              <CustomSelect
                value={tableType}
                onChange={(e) => setTableType(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Types' },
                  { value: 'POLICE', label: 'Police Stations' },
                  { value: 'EXCISE', label: 'Excise Stations' },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 select-none">
                <th className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('psName')}>
                  Police Station {tableSortField === 'psName' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('psCode')}>
                  Code {tableSortField === 'psCode' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalCases')}>
                  Cases {tableSortField === 'totalCases' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalOffenders')}>
                  Offenders {tableSortField === 'totalOffenders' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalArrests')}>
                  Arrests {tableSortField === 'totalArrests' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalAbsconders')}>
                  Absconders {tableSortField === 'totalAbsconders' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalContrabandKg')}>
                  Contraband (Kg) {tableSortField === 'totalContrabandKg' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="text-right cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-3.5" onClick={() => handleTableSort('totalCashSeized')}>
                  Cash (₹) {tableSortField === 'totalCashSeized' ? (tableSortAsc ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading && !summary ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs font-medium text-slate-500 animate-pulse">
                    Loading breakdown table...
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-xs font-medium text-slate-500">
                    No stations match the selected filters.
                  </td>
                </tr>
              ) : (
                tableData.map((ps) => (
                  <tr
                    key={ps.psId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{ps.psName}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-500 dark:text-slate-400">{ps.psCode}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-blue-600 dark:text-blue-400">{formatNumber(ps.totalCases)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">{formatNumber(ps.totalOffenders)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(ps.totalArrests)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{formatNumber(ps.totalAbsconders)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{formatNumber(ps.totalContrabandKg)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400">₹{formatNumber(ps.totalCashSeized)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
