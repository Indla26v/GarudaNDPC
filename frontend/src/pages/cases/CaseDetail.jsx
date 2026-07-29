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
    if (Array.isArray(parsed)) return parsed;
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
  const canEdit = caseData && (perms.hasPermission?.('CASE_CREATE') || perms.hasMinRole?.('SI'));

  let files = [];
  if (caseData?.relevantFiles) {
    try {
      files = JSON.parse(caseData.relevantFiles);
    } catch (e) {
      files = caseData.relevantFiles.split(',').map(url => ({ name: url.split('/').pop(), url }));
    }
  }

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
        {canEdit && (
          <Link
            to={`/cases/${(id || '').toString().replace(/\/+$/, '')}/edit`}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
            style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-200)' }}
          >
            Edit Case
          </Link>
        )}
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
          <div className="rounded-xl p-6 overflow-x-auto" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--color-garuda-300)' }}>Case Progress</h3>
            {loading ? (
              <div className="flex items-center gap-4 min-w-[600px] py-2">
                <div className="h-6 bg-slate-700/60 rounded flex-1 animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center gap-0 min-w-[600px]">
                {STAGES.map((stage, i) => {
                  const isActive = i <= currentStageIdx;
                  const isCurrent = i === currentStageIdx;
                  return (
                    <div key={stage} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: isCurrent || isActive ? 'var(--color-accent-500)' : 'var(--color-garuda-700)',
                            color: isActive ? '#fff' : 'var(--color-garuda-400)',
                          }}
                        >
                          {isActive ? '✓' : i + 1}
                        </div>
                        <span className="text-[10px] mt-2 text-center" style={{ color: isActive ? 'var(--color-garuda-100)' : 'var(--color-garuda-500)' }}>
                          {STAGE_LABELS[stage]}
                        </span>
                      </div>
                      {i < STAGES.length - 1 && (
                        <div className="h-0.5 flex-1 -mt-5" style={{ background: i < currentStageIdx ? 'var(--color-accent-500)' : 'var(--color-garuda-700)' }} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Case Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>FIR Number</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-20 h-4 bg-slate-700/60 animate-pulse rounded"></span> : caseData?.firNo}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Section of Law</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-24 h-4 bg-slate-700/60 animate-pulse rounded"></span> : caseData?.sectionOfLaw || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Station</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-28 h-4 bg-slate-700/60 animate-pulse rounded"></span> : caseData?.psName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Contraband</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-32 h-4 bg-slate-700/60 animate-pulse rounded"></span> : (
                        <>
                          {caseData?.contrabandType ? CONTRABAND_LABELS[caseData.contrabandType] || caseData.contrabandType : '—'}
                          {caseData?.quantity ? ` (${caseData.quantity} ${caseData.quantityUnit || ''})` : ''}
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Source → Destination</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-36 h-4 bg-slate-700/60 animate-pulse rounded"></span> : [caseData?.sourceLocation, caseData?.destinationLocation].filter(Boolean).join(' → ') || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Date</p>
                    <p style={{ color: 'var(--color-garuda-100)' }}>
                      {loading ? <span className="inline-block w-24 h-4 bg-slate-700/60 animate-pulse rounded"></span> : caseData?.caseDate ? new Date(caseData.caseDate).toLocaleDateString('en-IN') : '—'}
                    </p>
                  </div>
                </div>
                {loading && (
                  <div className="h-4 bg-slate-700/50 rounded w-full animate-pulse mt-2"></div>
                )}
              </div>

              {!loading && files.length > 0 && (
                <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Case Documents ({files.length})
                  </h3>
                  <ul className="space-y-2">
                    {files.map((file, idx) => (
                      <li key={idx} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: 'var(--color-garuda-900)' }}>
                        <span className="text-sm font-medium truncate max-w-[70%]" style={{ color: 'var(--color-garuda-100)' }}>
                          {file.name}
                        </span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                          View / Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>
                Accused ({loading ? '...' : caseData?.accused?.length || 0})
              </h3>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-10 bg-slate-700/60 rounded animate-pulse"></div>
                  <div className="h-10 bg-slate-700/60 rounded animate-pulse"></div>
                </div>
              ) : caseData?.accused?.length > 0 ? (
                <ul className="space-y-2">
                  {caseData.accused.map((ca) => (
                    <li key={ca.id} className="flex items-center justify-between p-2 rounded" style={{ background: 'var(--color-garuda-900)' }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--color-garuda-100)' }}>
                          {ca.offenderName || `Offender #${ca.offenderId}`}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-garuda-400)' }}>
                          {ARREST_STATUS_META[ca.arrestStatus]?.label || ca.arrestStatus}
                          {ca.arrestDate ? ` • Arrested: ${new Date(ca.arrestDate).toLocaleDateString('en-IN')}` : ''}
                        </p>
                      </div>
                      <Link
                        to={`/offenders/${ca.offenderId}`}
                        className="text-xs px-2 py-1 rounded"
                        style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: 'var(--color-garuda-500)' }}>No accused linked yet</p>
              )}
            </div>
          </div>

          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Charge Sheet Card */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    Charge Sheet
                  </h3>
                  {caseData?.chargeSheet?.actualSubmissionDate ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/30">
                      Filed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30">
                      {caseData?.chargeSheet?.expectedSubmissionDate ? 'Pending' : 'Not Recorded'}
                    </span>
                  )}
                </div>
                {caseData?.chargeSheet ? (
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Prosecutor</p>
                      <p className="font-medium" style={{ color: 'var(--color-garuda-100)' }}>{caseData.chargeSheet.prosecutorName || '—'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Expected Date</p>
                        <p style={{ color: 'var(--color-garuda-200)' }}>
                          {caseData.chargeSheet.expectedSubmissionDate ? new Date(caseData.chargeSheet.expectedSubmissionDate).toLocaleDateString('en-IN') : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Actual Submission</p>
                        <p style={{ color: 'var(--color-garuda-200)' }}>
                          {caseData.chargeSheet.actualSubmissionDate ? new Date(caseData.chargeSheet.actualSubmissionDate).toLocaleDateString('en-IN') : 'Not Filed Yet'}
                        </p>
                      </div>
                    </div>
                    {caseData.chargeSheet.missingDocuments && (
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Missing Documents</p>
                        <p className="text-xs text-amber-400/90">{caseData.chargeSheet.missingDocuments}</p>
                      </div>
                    )}
                    {caseData.chargeSheet.notes && (
                      <div>
                        <p className="text-xs" style={{ color: 'var(--color-garuda-500)' }}>Notes / Remarks</p>
                        <p className="text-xs italic" style={{ color: 'var(--color-garuda-300)' }}>"{caseData.chargeSheet.notes}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--color-garuda-500)' }}>No charge sheet details recorded yet.</p>
                )}
              </div>

              {/* Court Hearings (Multiple) Card */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21h18" />
                      <path d="M3 10h18" />
                      <path d="M5 6l7-3 7 3" />
                      <path d="M4 10v11" />
                      <path d="M20 10v11" />
                      <path d="M8 10v11" />
                      <path d="M12 10v11" />
                      <path d="M16 10v11" />
                    </svg>
                    Court Hearings ({caseData?.courtHearings?.length || 0})
                  </h3>
                </div>
                {caseData?.courtHearings?.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {caseData.courtHearings.map((h) => (
                      <li key={h.id} className="p-2.5 rounded-lg text-xs space-y-1" style={{ background: 'var(--color-garuda-900)' }}>
                        <div className="flex justify-between font-semibold" style={{ color: 'var(--color-garuda-100)' }}>
                          <span>{h.courtName || 'Court'}</span>
                          <span className="text-blue-400">SC: {h.scNumber || '—'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]" style={{ color: 'var(--color-garuda-400)' }}>
                          <span>Hearing: {h.hearingDate ? new Date(h.hearingDate).toLocaleDateString('en-IN') : '—'}</span>
                          {h.nextHearingDate && <span className="text-amber-400 font-medium">Next: {new Date(h.nextHearingDate).toLocaleDateString('en-IN')}</span>}
                        </div>
                        {h.orderText && <p className="text-[11px] italic pt-0.5 text-blue-300">Notes/Order: "{h.orderText}"</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--color-garuda-500)' }}>No court hearings recorded yet.</p>
                )}
              </div>

              {/* Bail Records Card */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
                  <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Bail Records ({caseData?.bailRecords?.length || 0})
                  </h3>
                </div>
                {caseData?.bailRecords?.length > 0 ? (
                  <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {caseData.bailRecords.map((b) => {
                      const statusColors = {
                        GRANTED: 'text-green-400 bg-green-500/10 border-green-500/30',
                        PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                        REJECTED: 'text-red-400 bg-red-500/10 border-red-500/30',
                        CANCELLED: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
                      };
                      return (
                        <li key={b.id} className="p-2.5 rounded-lg text-xs space-y-1" style={{ background: 'var(--color-garuda-900)' }}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold" style={{ color: 'var(--color-garuda-100)' }}>{b.courtName || 'Court'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[b.status] || statusColors.PENDING}`}>
                              {b.status}
                            </span>
                          </div>
                          {b.grantedDate && (
                            <p className="text-[11px]" style={{ color: 'var(--color-garuda-400)' }}>
                              Granted: {new Date(b.grantedDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                          {b.suretyDetails && (
                            <p className="text-[11px]" style={{ color: 'var(--color-garuda-300)' }}>Surety: {b.suretyDetails}</p>
                          )}
                          {b.notes && (
                            <p className="text-[11px] italic pt-0.5 text-purple-300">Notes: "{b.notes}"</p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs py-4 text-center" style={{ color: 'var(--color-garuda-500)' }}>No bail records recorded yet.</p>
                )}
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-xl p-6 border" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
              <div className="h-5 bg-slate-700/60 rounded w-24 mb-3 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
                <div className="h-10 bg-slate-700/50 rounded animate-pulse"></div>
              </div>
            </div>
          ) : caseData?.seizures?.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
              <h3 className="font-semibold mb-3" style={{ color: 'var(--color-garuda-200)' }}>Seizures</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {caseData.seizures.map((s) => (
                  <div key={s.id} className="p-3 rounded-lg" style={{ background: 'var(--color-garuda-900)' }}>
                    {s.contrabandKg && <p className="text-sm" style={{ color: 'var(--color-warning-400)' }}>{s.contrabandKg} Kg</p>}
                    {Number(s.cashAmount) > 0 && <p className="text-sm" style={{ color: 'var(--color-success-400)' }}>₹{Number(s.cashAmount).toLocaleString('en-IN')}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && caseData?.seizedVehicles?.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-garuda-200)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                  <circle cx="6.5" cy="16.5" r="2.5" />
                  <circle cx="16.5" cy="16.5" r="2.5" />
                </svg>
                Seized Vehicles ({caseData.seizedVehicles.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-garuda-700)' }}>
                      <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Reg No</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Type</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Make / Model</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Owner</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Status</th>
                      {canEdit && <th className="text-right px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.seizedVehicles.map((v) => {
                      const statusColors = {
                        SEIZED: '#ef4444',
                        RELEASED: '#22c55e',
                        COURT_CUSTODY: '#f59e0b',
                        DISPOSED: '#6b7280',
                      };
                      const statusColor = statusColors[v.currentStatus] || '#ef4444';
                      return (
                        <tr key={v.id} style={{ borderBottom: '1px solid var(--color-garuda-700)' }}>
                          <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: 'var(--color-garuda-50)' }}>{v.registrationNo}</td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--color-garuda-300)' }}>
                            {({ TWO_WHEELER: 'Two Wheeler', FOUR_WHEELER: 'Four Wheeler', AUTO: 'Auto', TRUCK: 'Truck', BUS: 'Bus', OTHER: 'Other' })[v.vehicleType] || v.vehicleType}
                          </td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--color-garuda-200)' }}>
                            {v.makeModel || '—'}
                            {v.color && <span className="text-xs ml-1" style={{ color: 'var(--color-garuda-500)' }}>({v.color})</span>}
                          </td>
                          <td className="px-3 py-2.5" style={{ color: 'var(--color-garuda-200)' }}>{v.ownerName || '—'}</td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                              style={{ background: statusColor + '18', color: statusColor, border: `1px solid ${statusColor}40` }}
                            >
                              {v.currentStatus?.replace('_', ' ')}
                            </span>
                          </td>
                          {canEdit && (
                            <td className="px-3 py-2.5 text-right">
                              <button
                                onClick={() => {
                                  setSelectedVehicle(v);
                                  setIsModalOpen(true);
                                }}
                                className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-transparent hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--color-accent-400)', border: '1px solid var(--color-accent-500)40' }}
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
              <div className="rounded-xl p-6 space-y-4 mt-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
                  <div className="flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>
                      Quick Notes & Remarks ({notesList.length})
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  {notesList.map((note, idx) => (
                    <div key={note.id || idx} className="p-3.5 rounded-lg border space-y-1.5" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold" style={{ color: 'var(--color-accent-400)' }}>
                          Note #{notesList.length - idx}
                        </span>
                        {note.timestamp ? (
                          <span className="text-[11px] font-mono" style={{ color: 'var(--color-garuda-400)' }}>
                            {new Date(note.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        ) : (
                          <span className="text-[11px] italic" style={{ color: 'var(--color-garuda-500)' }}>Previous Note</span>
                        )}
                      </div>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--color-garuda-50)' }}>
                        "{note.text}"
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
