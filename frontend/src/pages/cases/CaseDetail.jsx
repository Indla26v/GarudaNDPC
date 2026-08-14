/**
 * GARUDA — Case Detail View (Page 3) — Phase 1
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { usePermissions } from '../../hooks/usePermissions';
import CaseLifecyclePanel from '../../components/CaseLifecyclePanel';
import VehicleStatusModal from '../../components/VehicleStatusModal';

const parseNotesList = (raw) => {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          return { id: item.id || String(idx), text: item.text || '', timestamp: item.timestamp || null };
        }
        return { id: String(idx), text: String(item), timestamp: null };
      });
    }
    if (typeof parsed === 'object' && parsed !== null) {
      return [{ id: parsed.id || '1', text: parsed.text || '', timestamp: parsed.timestamp || null }];
    }
  } catch (e) {
    /* ignore fallback */
  }
  return [{ id: 'legacy-1', text: raw, timestamp: null }];
};

const ARREST_STATUS_META = {
  POLICE_CUSTODY: { label: 'Police Custody' },
  JUDICIAL_CUSTODY: { label: 'Judicial Custody' },
  ON_BAIL: { label: 'on Bail' },
  ABSCONDING: { label: 'Absconding' },
  RELEASED: { label: 'Released / Free' }
};

const STAGES = ['FIR', 'CHARGESHEET', 'TRIAL', 'CONVICTED', 'ACQUITTED', 'CLOSED'];
const STAGE_LABELS = {
  FIR: 'FIR Registered',
  CHARGESHEET: 'Charge Sheet',
  TRIAL: 'Under Trial',
  CONVICTED: 'Convicted',
  ACQUITTED: 'Acquitted',
  CLOSED: 'Closed',
};

const getDynamicStages = (currentStage) => {
  const base = ['FIR', 'CHARGESHEET', 'TRIAL'];
  if (currentStage === 'CONVICTED') return [...base, 'CONVICTED'];
  if (currentStage === 'ACQUITTED') return [...base, 'ACQUITTED'];
  if (currentStage === 'CLOSED') return [...base, 'CLOSED'];
  return base;
};

const CONTRABAND_LABELS = {
  DRY_GANJA: 'Dry Ganja',
  GANJA_OIL: 'Ganja Oil',
  BROWN_SUGAR: 'Brown Sugar',
  HEROIN: 'Heroin',
  MDMA: 'MDMA',
  SYNTHETIC: 'Synthetic',
  COCAINE: 'Cocaine',
  OPIUM: 'Opium',
  OTHER: 'Other',
};

export default function CaseDetail() {
  const { id } = useParams();
  const perms = usePermissions();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');
  
  // Modal state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data.data);
    } catch {
      setError('Failed to load case details');
    } finally {
      setLoading(false);
    }
  };

  if (error || (!caseData && !loading)) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--color-danger-400)' }}>{error || 'Case not found'}</p>
        <Link to="/cases" className="text-sm mt-4 inline-block" style={{ color: 'var(--color-accent-400)' }}>← Back to Cases</Link>
      </div>
    );
  }

  const currentStageIdx = caseData ? STAGES.indexOf(caseData.stage) : -1;
  const isSamePS = !perms.isStationLevel || (String(caseData?.psId) === String(perms.policeStationId));
  const canEdit = caseData && (perms.hasPermission?.('CASE_CREATE') || perms.hasMinRole?.('SI')) && isSamePS;

  let files = [];
  if (caseData?.relevantFiles) {
    try {
      files = JSON.parse(caseData.relevantFiles);
    } catch (e) {
      files = caseData.relevantFiles.split(',').map(url => ({ name: url.split('/').pop(), url }));
    }
  }

  const [exportingPdf, setExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await api.get(`/cases/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const safeFir = (caseData?.firNo || 'Case').replace(/[/\\?%*:|"<>]/g, '_');
      link.setAttribute('download', `Case_Report_${safeFir}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Export error:', err);
      alert('Failed to export Case PDF report');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <Link to="/cases" className="text-xs mb-2 inline-block" style={{ color: 'var(--color-garuda-400)' }}>← Back to Cases</Link>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-garuda-50)' }}>
            Case: {loading ? <span className="inline-block w-40 h-7 bg-slate-700 animate-pulse rounded align-middle"></span> : caseData?.firNo}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-garuda-400)' }}>
            {loading ? (
              <span className="inline-block w-56 h-4 bg-slate-700/80 animate-pulse rounded mt-1"></span>
            ) : (
              `${caseData?.psName || ''} • ${caseData?.caseDate ? new Date(caseData.caseDate).toLocaleDateString('en-IN') : '—'}`
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf || loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>{exportingPdf ? 'Exporting PDF...' : 'Export Case PDF'}</span>
          </button>
          {canEdit && (
            <Link
              to={`/cases/${(id || '').toString().replace(/\/+$/, '')}/edit`}
              className="px-4 py-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-black rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              Edit Case
            </Link>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
        {['overview', 'lifecycle'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm capitalize"
            style={{
              color: tab === t ? 'var(--color-accent-400)' : 'var(--color-garuda-400)',
              borderBottom: tab === t ? '2px solid var(--color-accent-500)' : 'none',
            }}
          >
            {t === 'lifecycle' ? 'Charge Sheet & Court' : 'Overview'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="rounded-2xl p-6 overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-sm font-extrabold mb-5 text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Case Progress
            </h3>
            {loading ? (
              <div className="flex items-center gap-4 min-w-[500px] py-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-700/60 rounded flex-1 animate-pulse"></div>
              </div>
            ) : (
              (() => {
                const dynamicStages = getDynamicStages(caseData?.stage);
                const currentStageIdx = dynamicStages.indexOf(caseData?.stage);

                return (
                  <div className="flex items-center gap-0 min-w-[500px] px-2 py-1">
                    {dynamicStages.map((stage, i) => {
                      const isCompleted = currentStageIdx >= 0 ? i <= currentStageIdx : i === 0;
                      const isOutcome = stage === 'CONVICTED' || stage === 'ACQUITTED' || stage === 'CLOSED';

                      let badgeColor = 'bg-amber-500 text-slate-950 shadow-amber-500/25';
                      if (isOutcome) {
                        if (stage === 'CONVICTED') badgeColor = 'bg-emerald-500 text-white shadow-emerald-500/25';
                        else if (stage === 'ACQUITTED') badgeColor = 'bg-rose-500 text-white shadow-rose-500/25';
                        else if (stage === 'CLOSED') badgeColor = 'bg-slate-600 text-white shadow-slate-600/25';
                      }

                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className="flex flex-col items-center flex-1">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all shadow-md ${
                                isCompleted
                                  ? `${badgeColor} scale-105`
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {isCompleted ? '✓' : i + 1}
                            </div>
                            <span className={`text-[11px] mt-2.5 text-center font-bold tracking-tight ${
                              isCompleted ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {STAGE_LABELS[stage]}
                            </span>
                          </div>
                          {i < dynamicStages.length - 1 && (
                            <div 
                              className={`h-1 flex-1 -mt-5 transition-all rounded-full ${
                                i < (currentStageIdx >= 0 ? currentStageIdx : 0)
                                  ? 'bg-amber-500 shadow-xs'
                                  : 'bg-slate-200 dark:bg-slate-800'
                              }`} 
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case Information Card */}
            <div className="space-y-6">
              <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                  Case Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">FIR Number</p>
                    <p className="font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {loading ? <span className="inline-block w-20 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : caseData?.firNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Section of Law</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {loading ? <span className="inline-block w-24 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : caseData?.sectionOfLaw || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Station</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {loading ? <span className="inline-block w-28 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : caseData?.psName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Contraband</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                      {loading ? <span className="inline-block w-32 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : (
                        <>
                          {caseData?.contrabandType ? CONTRABAND_LABELS[caseData.contrabandType] || caseData.contrabandType : '—'}
                          {caseData?.quantity ? ` (${caseData.quantity} ${caseData.quantityUnit || ''})` : ''}
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Source → Destination</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {loading ? <span className="inline-block w-36 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : [caseData?.sourceLocation, caseData?.destinationLocation].filter(Boolean).join(' → ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Date</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {loading ? <span className="inline-block w-24 h-4 bg-slate-200 dark:bg-slate-700/60 animate-pulse rounded"></span> : caseData?.caseDate ? new Date(caseData.caseDate).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {!loading && files.length > 0 && (
                <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Case Documents ({files.length})
                  </h3>
                  <ul className="space-y-2.5">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[70%]">
                          {file.name}
                        </span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
                        >
                          View / Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Accused Card */}
            <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                Accused ({loading ? '...' : caseData?.accused?.length || 0})
              </h3>
              {loading ? (
                <div className="space-y-2.5">
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                  <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                </div>
              ) : caseData?.accused?.length > 0 ? (
                <ul className="space-y-2.5">
                  {caseData.accused.map((ca) => (
                    <li key={ca.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                          {ca.offenderName || `Offender #${ca.offenderId}`}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {ARREST_STATUS_META[ca.arrestStatus]?.label || ca.arrestStatus}
                          {ca.arrestDate ? ` • Arrested: ${new Date(ca.arrestDate).toLocaleDateString('en-IN')}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/offenders/${ca.offenderId}`}
                        className="px-3.5 py-1.5 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650 transition-all shadow-2xs"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs py-6 text-center text-slate-400 dark:text-slate-500 font-semibold">No accused linked yet</p>
              )}
            </div>
          </div>

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Charge Sheet Card */}
              <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      Charge Sheet
                    </h3>
                    {caseData?.chargeSheet?.actualSubmissionDate ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-2xs">
                        Filed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-2xs">
                        {caseData?.chargeSheet?.expectedSubmissionDate ? 'Pending' : 'Not Recorded'}
                      </span>
                    )}
                  </div>
                  {caseData?.chargeSheet ? (
                    <div className="space-y-3 text-xs pt-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Prosecutor</p>
                        <p className="font-extrabold text-slate-900 dark:text-white mt-0.5">{caseData.chargeSheet.prosecutorName || '—'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Expected Date</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {caseData.chargeSheet.expectedSubmissionDate ? new Date(caseData.chargeSheet.expectedSubmissionDate).toLocaleDateString('en-IN') : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Actual Submission</p>
                          <p className="font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {caseData.chargeSheet.actualSubmissionDate ? new Date(caseData.chargeSheet.actualSubmissionDate).toLocaleDateString('en-IN') : 'Not Filed Yet'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs py-6 text-center text-slate-400 dark:text-slate-500 font-semibold">No charge sheet details recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Court Hearings Card */}
              <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21h18" />
                        <path d="M3 10h18" />
                        <path d="M5 6l7-3 7 3" />
                        <path d="M4 10v11" />
                        <path d="M20 10v11" />
                      </svg>
                      Court Hearings ({caseData?.courtHearings?.length || 0})
                    </h3>
                  </div>
                  {caseData?.courtHearings?.length > 0 ? (
                    <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1 pt-3">
                      {caseData.courtHearings.map((h) => (
                        <li key={h.id} className="p-3 rounded-2xl text-xs space-y-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                          <div className="flex justify-between font-extrabold text-slate-900 dark:text-white">
                            <span>{h.courtName || 'Court'}</span>
                            <span className="text-blue-600 dark:text-blue-400 font-mono">SC: {h.scNumber || '—'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs py-6 text-center text-slate-400 dark:text-slate-500 font-semibold">No court hearings recorded yet.</p>
                  )}
                </div>
              </div>

              {/* Bail Records Card */}
              <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      Bail Records ({caseData?.bailRecords?.length || 0})
                    </h3>
                  </div>
                  {caseData?.bailRecords?.length > 0 ? (
                    <ul className="space-y-2.5 max-h-48 overflow-y-auto pr-1 pt-3">
                      {caseData.bailRecords.map((b) => (
                        <li key={b.id} className="p-3 rounded-2xl text-xs space-y-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-2xs">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-slate-900 dark:text-white">{b.courtName || 'Court'}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs py-6 text-center text-slate-400 dark:text-slate-500 font-semibold">No bail records recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl">
              <div className="h-5 bg-slate-200 dark:bg-slate-700/60 rounded w-24 mb-3 animate-pulse"></div>
            </div>
          ) : caseData?.seizures?.length > 0 && (
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-3">
                Seizures
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caseData.seizures.map((s) => (
                  <div key={s.id} className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 shadow-xs space-y-1">
                    {s.contrabandKg && <p className="text-base font-black text-amber-600 dark:text-amber-400">{s.contrabandKg} Kg</p>}
                    {Number(s.cashAmount) > 0 && <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">₹{Number(s.cashAmount).toLocaleString('en-IN')}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && caseData?.seizedVehicles?.length > 0 && (
            <div className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                    <circle cx="6.5" cy="16.5" r="2.5" />
                    <circle cx="16.5" cy="16.5" r="2.5" />
                  </svg>
                  Seized Vehicles ({caseData.seizedVehicles.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Reg No</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Type</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Make / Model</th>
                      <th className="text-left px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Owner</th>
                      <th className="text-center px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                      {canEdit && <th className="text-right px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.seizedVehicles.map((v) => {
                      const statusBadge = {
                        SEIZED: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                        RELEASED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                        COURT_CUSTODY: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                        DISPOSED: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                      }[v.currentStatus] || 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';

                      return (
                        <tr key={v.id} className="border-b border-slate-100/80 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
                              {v.registrationNo}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                            {({ TWO_WHEELER: 'Two Wheeler', FOUR_WHEELER: 'Four Wheeler', AUTO: 'Auto', TRUCK: 'Truck', BUS: 'Bus', OTHER: 'Other' })[v.vehicleType] || v.vehicleType}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                            {v.makeModel || '—'}
                            {v.color && <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 ml-1.5">({v.color})</span>}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-400">{v.ownerName || '—'}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-2xs ${statusBadge}`}>
                              {v.currentStatus?.replace('_', ' ')}
                            </span>
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedVehicle(v);
                                  setIsModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all shadow-2xs cursor-pointer"
                              >
                                Update
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Notes & Remarks History Card (below Seized Vehicles) */}
          {!loading && caseData?.intelligenceNotes && (() => {
            const notesList = parseNotesList(caseData.intelligenceNotes);
            if (!notesList.length) return null;

            return (
              <div className="rounded-3xl p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl mt-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 flex items-center justify-center text-orange-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                        Quick Notes & Remarks ({notesList.length})
                      </h3>
                      <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        Investigation activity & status logs
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 pt-1">
                  {notesList.map((note, idx) => (
                    <div 
                      key={note.id || idx} 
                      className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                          Note #{notesList.length - idx}
                        </span>
                        {note.timestamp ? (
                          <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <circle cx="12" cy="12" r="10" strokeWidth="2" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
                            </svg>
                            {new Date(note.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[11px] italic text-slate-400">Previous Note</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap pl-1 border-l-2 border-orange-500/30">
                        {note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {tab === 'lifecycle' && (
        <CaseLifecyclePanel caseId={id} canEdit={canEdit} onCaseUpdated={fetchCase} />
      )}

      <VehicleStatusModal
        vehicle={selectedVehicle}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVehicle(null);
        }}
        onSuccess={fetchCase}
      />
    </div>
  );
}
