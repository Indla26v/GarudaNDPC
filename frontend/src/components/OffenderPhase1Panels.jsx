import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ARREST_STATUS_META = {
  POLICE_CUSTODY: {
    label: 'Police Custody',
    desc: 'Police Custody (Locked up at the police station)',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.3)'
  },
  JUDICIAL_CUSTODY: {
    label: 'Judicial Custody',
    desc: 'Judicial Custody (Sent to prison/jail)',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.3)'
  },
  ON_BAIL: {
    label: 'on Bail',
    desc: 'on Bail (Temporary freedom during trial)',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.3)'
  },
  ABSCONDING: {
    label: 'Absconding',
    desc: 'Absconding (Wanted / On the run)',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.3)'
  },
  RELEASED: {
    label: 'Released / Free',
    desc: 'Released / Free (Set free permanently because they were Acquitted)',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.3)'
  }
};

const inputStyle = {
  background: 'var(--color-garuda-700)',
  border: '1px solid var(--color-garuda-600)',
  color: 'var(--color-garuda-50)',
};

export function OffenderCaseHistory({ offenderId, isEdit }) {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/cases/offender/${offenderId}`)
      .then((r) => setCases(r.data.data || []))
      .catch(() => setCases([]))
      .finally(() => setLoading(false));
  }, [offenderId]);

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      const targetCase = cases.find(item => item.id === caseId);
      if (!targetCase) return;

      const updatedAccused = targetCase.accused.map(a => {
        if (String(a.offenderId) === String(offenderId)) {
          return { ...a, arrestStatus: newStatus };
        }
        return a;
      });

      await api.post(`/cases/${caseId}/accused`, updatedAccused);

      setCases(prevCases => prevCases.map(item => {
        if (item.id === caseId) {
          return {
            ...item,
            accused: item.accused.map(a =>
              String(a.offenderId) === String(offenderId)
                ? { ...a, arrestStatus: newStatus }
                : a
            )
          };
        }
        return item;
      }));
    } catch (err) {
      console.error('Failed to update arrest status', err);
    }
  };

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>Loading case history...</p>;
  if (!cases.length) return <p className="text-sm" style={{ color: 'var(--color-garuda-500)' }}>No linked cases</p>;

  return (
    <ul className="space-y-2">
      {cases.map((c) => {
        const offenderAccusedObj = c.accused?.find(a => String(a.offenderId) === String(offenderId));
        const arrestStatus = offenderAccusedObj?.arrestStatus || 'POLICE_CUSTODY';

        return (
          <li key={c.id} className="p-3 rounded-lg flex items-center justify-between gap-4" style={{ background: 'var(--color-garuda-900)' }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-garuda-100)' }}>{c.firNo}</p>
              <p className="text-xs" style={{ color: 'var(--color-garuda-400)' }}>
                {c.psName} • {c.stage} • {c.caseDate ? new Date(c.caseDate).toLocaleDateString('en-IN') : '—'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
              {isEdit ? (
                <select
                  value={arrestStatus}
                  onChange={(e) => handleStatusChange(c.id, e.target.value)}
                  className="px-2 py-1 rounded-md text-xs font-semibold outline-none cursor-pointer"
                  style={{
                    background: ARREST_STATUS_META[arrestStatus]?.bg || 'rgba(34,197,94,0.15)',
                    color: ARREST_STATUS_META[arrestStatus]?.color || '#22c55e',
                    border: `1px solid ${ARREST_STATUS_META[arrestStatus]?.border || 'rgba(34,197,94,0.3)'}`,
                  }}
                >
                  {Object.entries(ARREST_STATUS_META).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.desc}</option>
                  ))}
                </select>
              ) : (
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: ARREST_STATUS_META[arrestStatus]?.bg || 'rgba(34,197,94,0.15)',
                    color: ARREST_STATUS_META[arrestStatus]?.color || '#22c55e',
                    border: `1px solid ${ARREST_STATUS_META[arrestStatus]?.border || 'rgba(34,197,94,0.3)'}`,
                  }}
                >
                  {ARREST_STATUS_META[arrestStatus]?.label || arrestStatus}
                </span>
              )}

              <Link to={`/cases/${c.id}`} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}>
                View
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function OffenderInterrogationPanel({ offenderId }) {
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({ sourceInfo: '', notes: '', paymentMode: '', deliveryMode: '' });
  const [msg, setMsg] = useState('');

  const load = () => {
    api.get(`/offenders/${offenderId}/interrogations`)
      .then((r) => setSessions(r.data.data || []))
      .catch(() => setSessions([]));
  };

  useEffect(() => { load(); }, [offenderId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/offenders/${offenderId}/interrogations`, form);
      setForm({ sourceInfo: '', notes: '', paymentMode: '', deliveryMode: '' });
      setMsg('Session saved');
      load();
    } catch {
      setMsg('Failed to save');
    }
  };

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      {sessions.map((s) => (
        <div key={s.id} className="p-3 rounded-lg text-sm" style={{ background: 'var(--color-garuda-900)' }}>
          <p style={{ color: 'var(--color-garuda-200)' }}>{new Date(s.sessionAt).toLocaleString('en-IN')} — {s.officerName || 'Officer'}</p>
          {s.sourceInfo && <p className="text-xs mt-1" style={{ color: 'var(--color-garuda-400)' }}>Source: {s.sourceInfo}</p>}
          {s.notes && <p className="text-xs" style={{ color: 'var(--color-garuda-400)' }}>{s.notes}</p>}
        </div>
      ))}
      <form onSubmit={submit} className="grid gap-3">
        <input placeholder="Source of contraband" className="px-3 py-2 rounded text-sm" style={inputStyle} value={form.sourceInfo} onChange={(e) => setForm((f) => ({ ...f, sourceInfo: e.target.value }))} />
        <input placeholder="Payment mode" className="px-3 py-2 rounded text-sm" style={inputStyle} value={form.paymentMode} onChange={(e) => setForm((f) => ({ ...f, paymentMode: e.target.value }))} />
        <input placeholder="Delivery mode" className="px-3 py-2 rounded text-sm" style={inputStyle} value={form.deliveryMode} onChange={(e) => setForm((f) => ({ ...f, deliveryMode: e.target.value }))} />
        <textarea placeholder="Notes" rows={2} className="px-3 py-2 rounded text-sm" style={inputStyle} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        <button type="submit" className="px-4 py-2 rounded text-sm text-white w-fit" style={{ background: 'var(--color-accent-500)' }}>Save Interrogation</button>
      </form>
    </div>
  );
}

export function ImeiPanel({ offenderId, isEdit }) {
  const [imeiRecords, setImeiRecords] = useState([]);
  const [form, setForm] = useState({ imeiNumber: '', deviceMake: '', deviceModel: '', simNumber: '', simProvider: '', mobileNumber: '', notes: '' });
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get(`/offenders/${offenderId}/imei`)
      .then((r) => setImeiRecords(r.data.data || []))
      .catch(() => setImeiRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [offenderId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/offenders/${offenderId}/imei`, form);
      setForm({ imeiNumber: '', deviceMake: '', deviceModel: '', simNumber: '', simProvider: '', mobileNumber: '', notes: '' });
      setMsg('IMEI record added');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to add IMEI');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/offenders/${offenderId}/imei/${id}`, { status });
      load();
    } catch (err) {
      setMsg('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: 'rgba(34,197,94,0.3)' };
      case 'SWAPPED': return { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
      case 'SUSPICIOUS': return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' };
      default: return { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' };
    }
  };

  if (loading) return <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>Loading IMEI records...</p>;

  return (
    <div className="space-y-6">
      {msg && <p className="text-sm text-green-400">{msg}</p>}
      
      {/* Existing Records */}
      {imeiRecords.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>No IMEI records found.</p>
      ) : (
        <div className="space-y-3">
          {imeiRecords.map((r) => {
            const st = getStatusColor(r.status);
            return (
              <div key={r.id} className="p-4 rounded-xl text-sm border" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-mono font-bold" style={{ color: 'var(--color-garuda-50)' }}>{r.imeiNumber}</p>
                  {isEdit ? (
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className="px-2 py-1 rounded-lg text-xs outline-none cursor-pointer border"
                      style={{ background: st.bg, color: st.color, borderColor: st.border }}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="SWAPPED">Swapped</option>
                      <option value="SUSPICIOUS">Suspicious</option>
                      <option value="DEACTIVATED">Deactivated</option>
                    </select>
                  ) : (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold border" style={{ background: st.bg, color: st.color, borderColor: st.border }}>
                      {r.status}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs font-semibold" style={{ color: 'var(--color-garuda-300)' }}>
                  <p>Device: {r.deviceMake || '?'} {r.deviceModel}</p>
                  <p>Mobile: {r.mobileNumber || '?'}</p>
                  <p>SIM: {r.simNumber || '?'} ({r.simProvider || '?'})</p>
                  <p>First Seen: {new Date(r.firstSeen).toLocaleDateString()}</p>
                </div>
                {r.notes && <p className="text-xs mt-2 italic font-medium" style={{ color: 'var(--color-garuda-400)' }}>{r.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Record Form */}
      {isEdit && (
        <form onSubmit={submit} className="p-5 rounded-xl border space-y-4 mt-6" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
          <h4 className="text-sm font-bold" style={{ color: 'var(--color-garuda-100)' }}>Add New IMEI Record</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="IMEI Number (15 digits) *" className="px-3 py-2.5 rounded-lg text-sm w-full font-mono outline-none" style={inputStyle} value={form.imeiNumber} onChange={(e) => setForm((f) => ({ ...f, imeiNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 15) }))} />
            <input placeholder="Mobile Number" className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.mobileNumber} onChange={(e) => setForm((f) => ({ ...f, mobileNumber: e.target.value }))} />
            <input placeholder="Device Make (e.g. Samsung)" className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.deviceMake} onChange={(e) => setForm((f) => ({ ...f, deviceMake: e.target.value }))} />
            <input placeholder="Device Model (e.g. Galaxy S21)" className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.deviceModel} onChange={(e) => setForm((f) => ({ ...f, deviceModel: e.target.value }))} />
            <input placeholder="SIM Number (ICCID)" className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.simNumber} onChange={(e) => setForm((f) => ({ ...f, simNumber: e.target.value }))} />
            <input placeholder="SIM Provider (e.g. Jio)" className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.simProvider} onChange={(e) => setForm((f) => ({ ...f, simProvider: e.target.value }))} />
          </div>
          <textarea placeholder="Additional notes..." rows={2} className="px-3 py-2.5 rounded-lg text-sm w-full outline-none" style={inputStyle} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md w-fit" style={{ background: 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-400))' }}>Add Record</button>
        </form>
      )}
    </div>
  );
}
