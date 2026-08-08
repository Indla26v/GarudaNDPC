/**
 * GARUDA — Reports & Intelligence Module (Page 8)
 * Route: /reports
 * Generate operational reports, analytical summaries, and DPR-format documents.
 */
import { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';
import {
  IconChart, IconClipboard, IconLock, IconTool, IconScale, IconReports,
  IconWarning, IconRunning, IconBell, IconOffender, IconPackage,
} from '../../components/Icons';

const TABS = [
  { id: 'standard', label: 'Standard Reports', Icon: IconChart },
  { id: 'dpr', label: 'DPR Export', Icon: IconClipboard },
  { id: 'intel', label: 'Intelligence Summary', Icon: IconLock },
  { id: 'custom', label: 'Custom Builder', Icon: IconTool },
  { id: 'court', label: 'Court Diary', Icon: IconScale },
  { id: 'performance', label: 'Performance', Icon: IconReports },
];

const STANDARD_REPORTS = [
  { name: 'Monthly Case Abstract', desc: 'Station-wise case summary for current month', Icon: IconClipboard, color: '#3b82f6', key: 'monthly' },
  { name: 'Yearly Comparative Chart', desc: 'Cases, arrests, convictions year-over-year', Icon: IconChart, color: '#8b5cf6', key: 'yearly' },
  { name: 'Pending Charge Sheet', desc: 'Cases beyond 60/180 days without CS', Icon: IconWarning, color: '#f59e0b', key: 'pending_cs' },
  { name: 'Absconder List', desc: 'Pending arrests with days outstanding', Icon: IconRunning, color: '#ef4444', key: 'absconder' },
  { name: 'Bail Expiry Alert', desc: 'Upcoming bail expiration dates', Icon: IconBell, color: '#d97706', key: 'bail_expiry' },
  { name: 'Court Pending List', desc: 'Pending cases with next hearing dates', Icon: IconScale, color: '#6366f1', key: 'court_pending' },
  { name: 'Drug Seizure Summary', desc: 'Drug-type-wise seizure quantities', Icon: IconPackage, color: '#059669', key: 'seizure' },
  { name: 'Top 10 Repeat Offenders', desc: 'Most frequent accused persons', Icon: IconOffender, color: '#b45309', key: 'top_offenders' },
];

const SEVERITY_STYLES = {
  CRITICAL: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
  HIGH:     { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.3)' },
  MEDIUM:   { bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04', border: 'rgba(234,179,8,0.3)' },
  LOW:      { bg: 'rgba(34,197,94,0.12)',  color: '#16a34a', border: 'rgba(34,197,94,0.3)' },
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('standard');
  const perms = usePermissions();

  // Report results state
  const [activeReport, setActiveReport] = useState(null); // which report is shown
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [exporting, setExporting] = useState(false);

  // DPR Export tab state
  const [dprStart, setDprStart] = useState('');
  const [dprEnd, setDprEnd] = useState('');
  const [dprExporting, setDprExporting] = useState(false);
  const [dprError, setDprError] = useState('');

  // Intel tab state
  const [intelLogs, setIntelLogs] = useState([]);
  const [intelLoading, setIntelLoading] = useState(false);
  const [stations, setStations] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [intelPsId, setIntelPsId] = useState('');
  const [intelSourceType, setIntelSourceType] = useState('INFORMER');
  const [intelOffenderId, setIntelOffenderId] = useState('');
  const [intelSupplyRoute, setIntelSupplyRoute] = useState('');
  const [intelInputText, setIntelInputText] = useState('');
  const [intelSubmitting, setIntelSubmitting] = useState(false);
  const [intelSubmitError, setIntelSubmitError] = useState('');
  const [intelSubmitSuccess, setIntelSubmitSuccess] = useState(false);

  // Reports states for Custom Builder
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customPsId, setCustomPsId] = useState('ALL');
  const [customContraband, setCustomContraband] = useState('ALL');
  const [customStage, setCustomStage] = useState('ALL');
  const [customData, setCustomData] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customExporting, setCustomExporting] = useState(false);
  const [customColumns, setCustomColumns] = useState({
    firNo: true,
    caseDate: true,
    sectionOfLaw: true,
    stage: true,
    psName: true,
    accusedName: true,
    age: true,
    contrabandType: true,
    quantity: true,
    cashAmount: true,
  });

  // Reports states for Court Diary
  const [courtDays, setCourtDays] = useState(30);
  const [courtData, setCourtData] = useState([]);
  const [courtLoading, setCourtLoading] = useState(false);

  // Reports states for Performance
  const [perfData, setPerfData] = useState(null);
  const [perfLoading, setPerfLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'intel') {
      loadIntelFormData();
      fetchIntelLogs();
    } else if (activeTab === 'court') {
      fetchCourtDiary();
    } else if (activeTab === 'performance') {
      fetchPerformance();
    } else if (activeTab === 'custom') {
      loadIntelFormData(); // Reuse PS loading
    }
  }, [activeTab, courtDays]);

  const fetchCourtDiary = async () => {
    setCourtLoading(true);
    try {
      const res = await api.get('/reports/court-diary', { params: { days: courtDays } });
      setCourtData(res.data.data?.hearings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCourtLoading(false);
    }
  };

  const fetchPerformance = async () => {
    setPerfLoading(true);
    try {
      const res = await api.get(`/reports/performance`);
      setPerfData(res.data.data || null);
    } catch (err) {
      console.error(err);
    } finally {
      setPerfLoading(false);
    }
  };

  const handleCustomReport = async (exportXlsx = false) => {
    if (exportXlsx) {
      setCustomExporting(true);
    } else {
      setCustomLoading(true);
    }

    try {
      const params = {
        startDate: customStart,
        endDate: customEnd,
        psId: customPsId,
        contrabandType: customContraband,
        stage: customStage,
        format: exportXlsx ? 'xlsx' : 'json'
      };

      if (exportXlsx) {
        const res = await api.get('/reports/custom', { params, responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `custom-report-${Date.now()}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const res = await api.get('/reports/custom', { params });
        setCustomData(res.data.data?.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCustomLoading(false);
      setCustomExporting(false);
    }
  };

  const loadIntelFormData = async () => {
    try {
      const psRes = await api.get('/police-stations');
      setStations(psRes.data.data || []);

      const offRes = await api.get('/offenders', { params: { size: 100 } });
      const offPayload = offRes.data.data;
      setOffenders(offPayload?.content || (Array.isArray(offPayload) ? offPayload : []));
    } catch (err) {
      console.error('Failed to load form data', err);
    }
  };

  const fetchIntelLogs = async () => {
    setIntelLoading(true);
    try {
      const res = await api.get('/intelligence');
      setIntelLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIntelLoading(false);
    }
  };

  const handleIntelSubmit = async (e) => {
    e.preventDefault();
    setIntelSubmitting(true);
    setIntelSubmitError('');
    setIntelSubmitSuccess(false);

    try {
      await api.post('/intelligence', {
        psId: intelPsId,
        sourceType: intelSourceType,
        offenderId: intelOffenderId || null,
        supplyRoute: intelSupplyRoute || null,
        inputText: intelInputText || null,
      });
      setIntelSubmitSuccess(true);
      setIntelSupplyRoute('');
      setIntelInputText('');
      setIntelOffenderId('');
      fetchIntelLogs();
    } catch (err) {
      setIntelSubmitError(err.response?.data?.message || 'Failed to record intelligence input');
    } finally {
      setIntelSubmitting(false);
    }
  };

  const handleDprExport = async () => {
    setDprExporting(true);
    setDprError('');
    try {
      const res = await api.get(`/reports/dpr-export`, {
        params: { startDate: dprStart, endDate: dprEnd },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dpr-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setDprError('Failed to export DPR Excel');
    } finally {
      setDprExporting(false);
    }
  };

  const generateReport = async (reportKey) => {
    setActiveReport(reportKey);
    setReportLoading(true);
    setReportError('');
    setReportData(null);

    let endpoint = '';
    if (reportKey === 'absconder') endpoint = '/reports/absconder-list';
    else if (reportKey === 'monthly') endpoint = '/reports/monthly-abstract';
    else if (reportKey === 'yearly') endpoint = '/reports/yearly-comparison';
    else if (reportKey === 'pending_cs') endpoint = '/reports/pending-charge-sheets';
    else if (reportKey === 'bail_expiry') endpoint = '/reports/bail-expiry-alerts';
    else if (reportKey === 'court_pending') endpoint = '/reports/court-pending';
    else if (reportKey === 'seizure') endpoint = '/reports/drug-seizures';
    else if (reportKey === 'top_offenders') endpoint = '/reports/top-offenders';

    if (!endpoint) {
      setReportError('Report type not supported');
      setReportLoading(false);
      return;
    }

    try {
      const res = await api.get(endpoint);
      setReportData(res.data.data);
    } catch (err) {
      setReportError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.get('/reports/absconder-list', {
        params: { format: 'csv' },
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `absconder-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setReportError('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const closeReport = () => {
    setActiveReport(null);
    setReportData(null);
    setReportError('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Analytical Reports & Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Operational abstracts, DPR spreadsheet exports, field intel inputs, and court hearing diary
          </p>
        </div>
      </div>

      {/* Clean Tab Bar */}
      <div className="flex gap-1.5 flex-wrap bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); closeReport(); }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <tab.Icon size={14} color={isActive ? (activeTab === 'performance' ? '#f59e0b' : '#ffffff') : undefined} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Standard Reports Grid */}
      {activeTab === 'standard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {STANDARD_REPORTS.map(report => (
              <div
                key={report.name}
                onClick={() => generateReport(report.key)}
                className="group bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-400 dark:hover:border-slate-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-xs"
                    style={{ background: `${report.color}14`, color: report.color }}
                  >
                    <report.Icon size={20} color={report.color} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {report.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                    {report.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>Generate Report</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active Report Output Section */}
          {activeReport && (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {STANDARD_REPORTS.find(r => r.key === activeReport)?.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {STANDARD_REPORTS.find(r => r.key === activeReport)?.desc}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeReport === 'absconder' && (
                    <button
                      onClick={exportCsv}
                      disabled={exporting}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                    >
                      {exporting ? 'Exporting...' : '⬇ Export CSV'}
                    </button>
                  )}
                  <button
                    onClick={closeReport}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {reportLoading ? (
                <div className="py-16 text-center text-slate-500 font-medium text-xs">Generating analytical report, please wait...</div>
              ) : reportError ? (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-300 font-medium">
                  {reportError}
                </div>
              ) : (
                <>
                  {/* Absconder List */}
                  {activeReport === 'absconder' && reportData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">Sl.No</th>
                            <th className="px-4 py-3">Offender Name</th>
                            <th className="px-4 py-3">Age</th>
                            <th className="px-4 py-3">Father/Husband</th>
                            <th className="px-4 py-3">FIR No</th>
                            <th className="px-4 py-3">PS</th>
                            <th className="px-4 py-3">Case Date</th>
                            <th className="px-4 py-3">Section</th>
                            <th className="px-4 py-3 text-center">Days</th>
                            <th className="px-4 py-3 text-center">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {reportData.absconders.map((a, i) => {
                            const sev = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.LOW;
                            return (
                              <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-4 py-3 font-semibold text-slate-400">{i + 1}</td>
                                <td className="px-4 py-3">
                                  <p className="font-bold text-slate-900 dark:text-white">{a.offenderName}</p>
                                  {a.alias && <p className="text-[10px] text-slate-400 font-medium">alias: {a.alias}</p>}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.age || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.fatherName || '—'}</td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{a.firNo}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.psName}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                  {a.caseDate ? new Date(a.caseDate).toLocaleDateString('en-IN') : '—'}
                                </td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{a.sectionOfLaw || '—'}</td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-rose-600 dark:text-rose-400">{a.daysOutstanding}d</td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                                    style={{
                                      background: sev.bg,
                                      color: sev.color,
                                      border: `1px solid ${sev.border}`,
                                    }}
                                  >
                                    {a.severity}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Monthly Case Abstract */}
                  {activeReport === 'monthly' && reportData && (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Month abstract for: <span className="font-bold text-slate-900 dark:text-white">{reportData.month}</span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                              <th className="px-4 py-3">Station Name</th>
                              <th className="px-4 py-3 text-center">Cases Registered</th>
                              <th className="px-4 py-3 text-center">Arrests Made</th>
                              <th className="px-4 py-3 text-right">Contraband Seized</th>
                              <th className="px-4 py-3 text-right">Cash Seized</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reportData.data.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="text-center py-8 text-slate-500 font-medium">No cases recorded for this month</td>
                              </tr>
                            ) : (
                              reportData.data.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.stationName}</td>
                                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{r.caseCount}</td>
                                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{r.arrestCount}</td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.contrabandKg.toFixed(3)} KG</td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">₹{r.cashAmount.toLocaleString('en-IN')}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Yearly Comparative Chart */}
                  {activeReport === 'yearly' && reportData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {reportData.data.map((r) => {
                          const maxCases = Math.max(...reportData.data.map(d => d.cases), 1);
                          const percent = (r.cases / maxCases) * 100;
                          return (
                            <div key={r.year} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-2 border border-slate-200 dark:border-slate-750">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">{r.year}</span>
                                <span className="text-slate-600 dark:text-slate-300 font-mono">
                                  Cases: <strong className="text-slate-900 dark:text-white">{r.cases}</strong> |
                                  Arrests: <strong className="text-slate-900 dark:text-white">{r.arrests}</strong> |
                                  Convictions: <strong className="text-emerald-600 dark:text-emerald-400">{r.convictions}</strong>
                                </span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <div className="h-full bg-slate-900 dark:bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pending Charge Sheets */}
                  {activeReport === 'pending_cs' && reportData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">FIR No</th>
                            <th className="px-4 py-3">Police Station</th>
                            <th className="px-4 py-3">Section</th>
                            <th className="px-4 py-3">Case Date</th>
                            <th className="px-4 py-3 text-center">Days Pending</th>
                            <th className="px-4 py-3">Accused Names</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {reportData.data.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No pending charge sheets beyond 60 days</td>
                            </tr>
                          ) : (
                            reportData.data.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{r.firNo}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.psName}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.sectionOfLaw}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                  {r.caseDate ? new Date(r.caseDate).toLocaleDateString('en-IN') : '—'}
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400">{r.daysPending}d</td>
                                <td className="px-4 py-3 truncate max-w-[200px] text-slate-600 dark:text-slate-300">{r.accusedNames || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Bail Expiry Alert */}
                  {activeReport === 'bail_expiry' && reportData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">Offender Name</th>
                            <th className="px-4 py-3">FIR No</th>
                            <th className="px-4 py-3">Police Station</th>
                            <th className="px-4 py-3">Bail Date</th>
                            <th className="px-4 py-3">Days on Bail</th>
                            <th className="px-4 py-3">Conditions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {reportData.data.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No active bail records found</td>
                            </tr>
                          ) : (
                            reportData.data.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.offenderName}</td>
                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-slate-100">{r.firNo}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.psName}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                  {r.bailDate ? new Date(r.bailDate).toLocaleDateString('en-IN') : '—'}
                                </td>
                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{r.daysSinceBail} days</td>
                                <td className="px-4 py-3 text-xs truncate max-w-[250px] text-slate-500 dark:text-slate-400">{r.bailConditions}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Court Pending List */}
                  {activeReport === 'court_pending' && reportData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">FIR No</th>
                            <th className="px-4 py-3">Police Station</th>
                            <th className="px-4 py-3">Section</th>
                            <th className="px-4 py-3">SC/PR Number</th>
                            <th className="px-4 py-3">Court Name</th>
                            <th className="px-4 py-3">Next Hearing</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {reportData.data.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">No cases pending in court trial</td>
                            </tr>
                          ) : (
                            reportData.data.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{r.firNo}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.psName}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.sectionOfLaw}</td>
                                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{r.scNumber}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.courtName}</td>
                                <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">
                                  {r.nextHearingDate ? new Date(r.nextHearingDate).toLocaleDateString('en-IN') : '—'}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Drug Seizure Summary */}
                  {activeReport === 'seizure' && reportData && (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs font-semibold text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        Total Contraband Seized: <span className="font-bold text-emerald-600 dark:text-emerald-400">{reportData.totalKg.toFixed(3)} KG</span>
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                              <th className="px-4 py-3">Contraband Type</th>
                              <th className="px-4 py-3 text-right">Seized Quantity</th>
                              <th className="px-4 py-3 text-right">Percentage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {reportData.data.length === 0 ? (
                              <tr>
                                <td colSpan={3} className="text-center py-8 text-slate-500 font-medium">No seizures recorded</td>
                              </tr>
                            ) : (
                              reportData.data.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.type}</td>
                                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{r.amount.toFixed(3)} KG</td>
                                  <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400 font-medium">{r.percentage}%</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Top 10 Repeat Offenders */}
                  {activeReport === 'top_offenders' && reportData && (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className="px-4 py-3">Sl.No</th>
                            <th className="px-4 py-3">Offender Name</th>
                            <th className="px-4 py-3">Alias</th>
                            <th className="px-4 py-3">Father/Husband Name</th>
                            <th className="px-4 py-3">Police Station</th>
                            <th className="px-4 py-3 text-center">Risk Score</th>
                            <th className="px-4 py-3 text-center">Cases Logged</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {reportData.data.map((r, i) => {
                            const s = SEVERITY_STYLES[r.riskScore] || SEVERITY_STYLES.LOW;
                            return (
                              <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/20">
                                <td className="px-4 py-3 font-semibold text-slate-400">{i + 1}</td>
                                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{r.offenderName}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{r.alias || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.fatherName || '—'}</td>
                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{r.psName}</td>
                                <td className="px-4 py-3 text-center">
                                  <span
                                    className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold"
                                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                                  >
                                    {r.riskScore}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">{r.caseCount}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* DPR Export Tab */}
      {activeTab === 'dpr' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Daily Progress Report (DPR) Export</h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Export cases matching the daily progress spreadsheet format
            </p>
          </div>
          <div className="flex flex-wrap gap-4 items-end bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Start Date</label>
              <input
                type="date"
                value={dprStart}
                onChange={(e) => setDprStart(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">End Date</label>
              <input
                type="date"
                value={dprEnd}
                onChange={(e) => setDprEnd(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleDprExport}
              disabled={dprExporting}
              className="px-5 py-2 text-xs font-bold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded-lg shadow-xs hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              {dprExporting ? 'Exporting...' : '⬇ Export DPR Excel'}
            </button>
          </div>
          {dprError && (
            <div className="text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-3.5 rounded-xl font-medium">
              {dprError}
            </div>
          )}
        </div>
      )}

      {/* Intelligence Summary Tab */}
      {activeTab === 'intel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Intel Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 space-y-4 h-fit border border-slate-200 dark:border-slate-700 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-750 pb-3">
                Record Intelligence Input
              </h3>
              <form onSubmit={handleIntelSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Police Station *</label>
                  <CustomSelect
                    value={intelPsId}
                    onChange={(e) => setIntelPsId(e.target.value)}
                    placeholder="Select Station"
                    options={stations.map(ps => ({ value: String(ps.id), label: ps.name }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Source Type *</label>
                  <CustomSelect
                    value={intelSourceType}
                    onChange={(e) => setIntelSourceType(e.target.value)}
                    options={[
                      { value: 'INFORMER', label: 'Informer' },
                      { value: 'FIELD_OFFICER', label: 'Field Officer' },
                      { value: 'SB', label: 'Special Branch (SB)' },
                      { value: 'EXCISE', label: 'Excise' },
                      { value: 'OTHER', label: 'Other' },
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Associated Offender (Optional)</label>
                  <CustomSelect
                    value={intelOffenderId}
                    onChange={(e) => setIntelOffenderId(e.target.value)}
                    placeholder="None"
                    options={[
                      { value: '', label: 'None' },
                      ...offenders.map(o => ({ value: String(o.id), label: o.fullName || o.full_name }))
                    ]}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Supply Route / Location</label>
                  <input
                    type="text"
                    value={intelSupplyRoute}
                    placeholder="e.g. Odisha -> Tirupati via NH-16"
                    onChange={(e) => setIntelSupplyRoute(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Intelligence Input Text</label>
                  <textarea
                    rows={3}
                    value={intelInputText}
                    placeholder="Provide details about suspects, timings, or modus operandi..."
                    onChange={(e) => setIntelInputText(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={intelSubmitting}
                  className="w-full py-2.5 text-xs font-bold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded-lg shadow-xs hover:bg-slate-800 transition-all"
                >
                  {intelSubmitting ? 'Recording...' : 'Submit Intel Input'}
                </button>
                {intelSubmitError && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium text-center">{intelSubmitError}</p>
                )}
                {intelSubmitSuccess && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">Recorded successfully!</p>
                )}
              </form>
            </div>

            {/* Intel Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Intelligence Logs</h3>
                <button
                  onClick={fetchIntelLogs}
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
              {intelLoading ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center text-slate-500 font-medium text-xs border border-slate-200 dark:border-slate-700">
                  Loading intelligence logs...
                </div>
              ) : intelLogs.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center text-slate-500 font-medium text-xs border border-slate-200 dark:border-slate-700">
                  No intelligence inputs recorded yet
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 text-left">
                  {intelLogs.map((log) => (
                    <div key={log.id} className="bg-white dark:bg-slate-800 rounded-xl p-4.5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mr-2 uppercase tracking-wide">
                            {log.sourceType}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{log.psName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{log.inputText}</p>
                      <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-slate-100 dark:border-slate-700/80 text-slate-500 dark:text-slate-400">
                        <div>
                          <span className="font-semibold text-slate-400">Offender:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{log.offenderName}</span>
                        </div>
                        {log.supplyRoute && (
                          <div>
                            <span className="font-semibold text-slate-400">Route:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{log.supplyRoute}</span>
                          </div>
                        )}
                        <div className="ml-auto">
                          <span className="font-semibold text-slate-400">By:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{log.createdByName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Builder Tab */}
      {activeTab === 'custom' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4 h-fit">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-750 pb-3">
              Filters & Columns
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Police Station</label>
                <CustomSelect
                  value={customPsId}
                  onChange={(e) => setCustomPsId(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Stations' },
                    ...stations.map(ps => ({ value: String(ps.id), label: ps.name }))
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Contraband Type</label>
                <CustomSelect
                  value={customContraband}
                  onChange={(e) => setCustomContraband(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Contraband' },
                    { value: 'DRY_GANJA', label: 'Dry Ganja' },
                    { value: 'GANJA_OIL', label: 'Ganja Oil' },
                    { value: 'BROWN_SUGAR', label: 'Brown Sugar' },
                    { value: 'HEROIN', label: 'Heroin' },
                    { value: 'MDMA', label: 'MDMA' },
                    { value: 'SYNTHETIC', label: 'Synthetic' },
                    { value: 'COCAINE', label: 'Cocaine' },
                    { value: 'OPIUM', label: 'Opium' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Case Stage</label>
                <CustomSelect
                  value={customStage}
                  onChange={(e) => setCustomStage(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'All Stages' },
                    { value: 'FIR', label: 'FIR' },
                    { value: 'CHARGESHEET', label: 'Charge Sheet' },
                    { value: 'TRIAL', label: 'Trial' },
                    { value: 'CONVICTED', label: 'Convicted' },
                    { value: 'ACQUITTED', label: 'Acquitted' },
                    { value: 'CLOSED', label: 'Closed' },
                  ]}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Select Columns</label>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-left">
                  {Object.keys(customColumns).map((col) => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
                      <input
                        type="checkbox"
                        checked={customColumns[col]}
                        onChange={(e) => setCustomColumns({ ...customColumns, [col]: e.target.checked })}
                        className="rounded border-slate-300 dark:border-slate-700 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3">
              <button
                onClick={() => handleCustomReport(false)}
                disabled={customLoading}
                className="w-full py-2.5 text-xs font-bold bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded-lg shadow-xs hover:bg-slate-800 transition-all"
              >
                {customLoading ? 'Running...' : 'Run Custom Report'}
              </button>
              <button
                onClick={() => handleCustomReport(true)}
                disabled={customExporting}
                className="w-full py-2.5 text-xs font-bold bg-white dark:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {customExporting ? 'Exporting...' : '⬇ Export to Excel'}
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Custom Query Output</h3>
            {customLoading ? (
              <div className="py-24 text-center text-slate-500 font-medium text-xs">Querying database, please wait...</div>
            ) : customData.length === 0 ? (
              <div className="py-24 text-center text-slate-500 font-medium text-xs">Configure filters and click "Run Custom Report" above.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                      {customColumns.firNo && <th className="px-4 py-3">FIR No</th>}
                      {customColumns.caseDate && <th className="px-4 py-3">Case Date</th>}
                      {customColumns.sectionOfLaw && <th className="px-4 py-3">Section</th>}
                      {customColumns.stage && <th className="px-4 py-3">Stage</th>}
                      {customColumns.psName && <th className="px-4 py-3">Station</th>}
                      {customColumns.accusedName && <th className="px-4 py-3">Accused</th>}
                      {customColumns.age && <th className="px-4 py-3">Age</th>}
                      {customColumns.contrabandType && <th className="px-4 py-3">Contraband</th>}
                      {customColumns.quantity && <th className="px-4 py-3">Qty</th>}
                      {customColumns.cashAmount && <th className="px-4 py-3">Seized Cash</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {customData.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/20"
                      >
                        {customColumns.firNo && (
                          <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                            {row['FIR No']}
                          </td>
                        )}
                        {customColumns.caseDate && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Case Date']}
                          </td>
                        )}
                        {customColumns.sectionOfLaw && (
                          <td className="px-4 py-3 truncate max-w-[120px] text-slate-600 dark:text-slate-300" title={row['Section of Law']}>
                            {row['Section of Law']}
                          </td>
                        )}
                        {customColumns.stage && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Stage']}
                          </td>
                        )}
                        {customColumns.psName && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Police Station']}
                          </td>
                        )}
                        {customColumns.accusedName && (
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {row['Accused Name']}
                          </td>
                        )}
                        {customColumns.age && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Age']}
                          </td>
                        )}
                        {customColumns.contrabandType && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Contraband Type']}
                          </td>
                        )}
                        {customColumns.quantity && (
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {row['Quantity (KG)']}
                          </td>
                        )}
                        {customColumns.cashAmount && (
                          <td className="px-4 py-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            ₹{Number(row['Cash (INR)']).toLocaleString('en-IN')}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Court Diary Tab */}
      {activeTab === 'court' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-750 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Court Hearings Diary</h3>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">Detailed list of court trials scheduled in the near future</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Days:</span>
              <div className="w-36">
                <CustomSelect
                  value={courtDays}
                  onChange={(e) => setCourtDays(parseInt(e.target.value))}
                  options={[
                    { value: 7, label: 'Next 7 Days' },
                    { value: 15, label: 'Next 15 Days' },
                    { value: 30, label: 'Next 30 Days' },
                  ]}
                />
              </div>
            </div>
          </div>

          {courtLoading ? (
            <div className="py-24 text-center text-slate-500 font-medium text-xs">Fetching hearings diary...</div>
          ) : courtData.length === 0 ? (
            <div className="py-24 text-center text-slate-500 font-medium text-xs">No upcoming court trials logged in the specified period.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courtData.map((h) => (
                <div key={h.id} className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4.5 border border-slate-200 dark:border-slate-750 space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 mr-2 uppercase">
                        {h.scNumber}
                      </span>
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">{h.courtName}</span>
                    </div>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {new Date(h.hearingDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">FIR No: <span className="font-mono text-indigo-600 dark:text-indigo-400">{h.firNo}</span></p>
                    <p className="text-slate-500 dark:text-slate-400">Station: {h.psName}</p>
                    <p className="text-slate-600 dark:text-slate-300">Accused: <span className="font-semibold text-slate-900 dark:text-slate-100">{h.accusedNames}</span></p>
                  </div>

                  {h.orderText && (
                    <div className="text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300">
                      <strong className="block text-slate-500 dark:text-slate-400 mb-0.5 text-[10px] uppercase tracking-wider">Trial Notes:</strong>
                      {h.orderText}
                    </div>
                  )}

                  {h.nextHearingDate && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-bold flex items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-750">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Next Hearing: {new Date(h.nextHearingDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance Dashboard Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {perfLoading ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-24 text-center text-slate-500 font-medium text-xs border border-slate-200 dark:border-slate-700">
              Calculating performance indicators...
            </div>
          ) : perfData ? (
            <>
              {/* Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Scopes Registered</span>
                  <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{perfData.summary.totalCases}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total active case records under department authority.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Charge Sheet Filing Rate</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">{perfData.summary.chargeSheetRate}%</p>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      ({perfData.summary.chargeSheetedCases}/{perfData.summary.totalCases})
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Filing rate within legal deadlines.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conviction Success Rate</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{perfData.summary.convictionRate}%</p>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                      ({perfData.summary.convictedCases} Convicted)
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Out of decided cases: {perfData.summary.convictedCases + perfData.summary.acquittedCases} trials.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filing Backlog</span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{perfData.summary.totalCases - perfData.summary.chargeSheetedCases}</p>
                    <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">FIR Stage</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cases remaining in FIR stage pending investigation.</p>
                </div>
              </div>

              {/* Station Leaders & Disposition Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Top 10 Active Stations Leaders
                  </h3>
                  <div className="w-full text-xs overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Station Name</th>
                          <th className="py-2.5 px-3 text-center">Cases Logged</th>
                          <th className="py-2.5 px-3 text-right">Contraband Seized</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {perfData.leaderboard.map((station, i) => (
                          <tr key={station.stationName} className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-400">
                              #{i + 1}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">{station.stationName}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 dark:text-slate-300">{station.casesCount}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">{station.contrabandKg.toFixed(2)} KG</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Trial Disposition Details
                  </h3>
                  <div className="space-y-4 flex-1 flex flex-col justify-center">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Convictions</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{perfData.summary.convictedCases} Cases</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-900">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(perfData.summary.convictedCases / Math.max(1, perfData.summary.convictedCases + perfData.summary.acquittedCases)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                        <span>Acquittals</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{perfData.summary.acquittedCases} Cases</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full overflow-hidden bg-slate-200/80 dark:bg-slate-900">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${(perfData.summary.acquittedCases / Math.max(1, perfData.summary.convictedCases + perfData.summary.acquittedCases)) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 text-xs leading-relaxed mt-2">
                      💡 <strong>Rate Analysis:</strong> Conviction rate of <strong>{perfData.summary.convictionRate}%</strong> reflects trials decided in court. Pending investigation backlog includes <strong>{perfData.summary.totalCases - perfData.summary.chargeSheetedCases} FIR cases</strong>.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-16 text-center text-slate-500 font-medium text-xs border border-slate-200 dark:border-slate-700">
              Failed to calculate performance parameters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
