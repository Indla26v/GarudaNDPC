/**
 * GARUDA — Case Registration / Edit Form (Page 3) — Phase 1
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';

export const ARREST_STATUS_META = {
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

const CONTRABAND_OPTIONS = [
  { value: 'DRY_GANJA', label: 'Dry Ganja' },
  { value: 'GANJA_OIL', label: 'Ganja Oil' },
  { value: 'BROWN_SUGAR', label: 'Brown Sugar' },
  { value: 'HEROIN', label: 'Heroin' },
  { value: 'MDMA', label: 'MDMA' },
  { value: 'SYNTHETIC', label: 'Synthetic Drugs' },
  { value: 'COCAINE', label: 'Cocaine' },
  { value: 'OPIUM', label: 'Opium' },
  { value: 'OTHER', label: 'Others' },
];

const UNIT_OPTIONS = [
  { value: 'KG', label: 'kg' },
  { value: 'GRAMS', label: 'grams' },
  { value: 'ML', label: 'ml' },
  { value: 'TABLETS', label: 'tablets' },
  { value: 'STRIPS', label: 'strips' },
  { value: 'PACKETS', label: 'packets' },
];

const isValidText = (val) => !val || /^[a-zA-Z0-9\s.,/-]*$/.test(val);
const isValidSectionOfLaw = (val) => !val || /^[a-zA-Z0-9\s()./,-]*$/.test(val);
const isValidNumeric = (val) => !val || /^\d*$/.test(String(val));
const isValidPhone = (val) => !val || /^\+?[0-9\s-]*$/.test(val);

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)', length: 10 },
  { code: '+1', label: 'USA/Canada (+1)', length: 10 },
  { code: '+44', label: 'UK (+44)', length: 10 },
  { code: '+971', label: 'UAE (+971)', length: 9 },
  { code: '+880', label: 'Bangladesh (+880)', length: 10 },
  { code: '+977', label: 'Nepal (+977)', length: 10 },
  { code: '+94', label: 'Sri Lanka (+94)', length: 9 }
];

const inp = "w-full px-3 py-2.5 rounded-lg text-sm outline-none";
const fieldStyle = { background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-600)', color: 'var(--color-garuda-100)' };

export const parseNotesList = (raw) => {
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

export const formatNotesToText = (raw) => {
  if (!raw || !raw.trim()) return '';
  const list = parseNotesList(raw);
  return list.map(item => item.text).filter(Boolean).join('\n');
};

export default function CaseForm() {
  const { id: rawId } = useParams();
  const id = rawId ? String(rawId).replace(/\/+$/, '') : undefined;
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    firNo: '',
    psId: '',
    sectionOfLaw: '',
    caseDate: new Date().toISOString().split('T')[0],
    stage: 'FIR',
    natureOfOffence: '',
    contrabandType: '',
    quantity: '',
    quantityUnit: 'KG',
    streetValue: '',
    sourceLocation: '',
    destinationLocation: '',
    intelligenceNotes: '',
    department: 'POLICE',
    isHistorySheet: false,
    isRowdySheet: false,
  });
  const [stations, setStations] = useState([]);
  const [accused, setAccused] = useState([]);
  const [offenderSearch, setOffenderSearch] = useState('');
  const [offenderResults, setOffenderResults] = useState([]);
  const [seizure, setSeizure] = useState({ contrabandKg: '', cashAmount: '', vehiclesCount: '0', otherItems: '' });
  const [seizedVehicles, setSeizedVehicles] = useState([]);
  const [hasVehicles, setHasVehicles] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [snackbar, setSnackbar] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});
  const [notesHistory, setNotesHistory] = useState([]);
  const [newNote, setNewNote] = useState('');

  const quickAccessSections = [
    { id: 'section-details', label: 'Case Details' },
    { id: 'section-contraband', label: 'Contraband & Route' },
    { id: 'section-accused', label: `Accused (${accused.length})` },
    { id: 'section-seizure', label: 'Seizures' },
    { id: 'section-vehicles', label: `Seized Vehicles (${seizedVehicles.length})` },
    { id: 'section-files', label: `Relevant PDF Files (${uploadedFiles.length})` },
  ];

  const showSnackbar = (type, message, duration = 4000) => {
    setSnackbar({ type, message });
    if (type !== 'info') {
      setTimeout(() => {
        setSnackbar(current => current && current.message === message ? null : current);
      }, duration);
    }
  };

  const emptyVehicle = { vehicleType: 'TWO_WHEELER', registrationNo: '', makeModel: '', color: '', ownerName: '', ownerAddress: '', seizureLocation: '', remarks: '' };

  useEffect(() => {
    fetchStations();
    if (isEdit) fetchCase();
  }, [id]);

  const fetchStations = async () => {
    try {
      const res = await api.get('/police-stations');
      setStations(res.data.data || []);
    } catch { /* ignore */ }
  };

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/cases/${id}`);
      const c = res.data.data;
      setForm({
        firNo: c.firNo || '',
        psId: c.psId?.toString() || '',
        sectionOfLaw: c.sectionOfLaw || '',
        caseDate: c.caseDate ? c.caseDate.split('T')[0] : '',
        stage: c.stage || 'FIR',
        natureOfOffence: c.natureOfOffence || '',
        contrabandType: c.contrabandType || '',
        quantity: c.quantity?.toString() || '',
        quantityUnit: c.quantityUnit || 'KG',
        streetValue: c.streetValue?.toString() || '',
        sourceLocation: c.sourceLocation || '',
        destinationLocation: c.destinationLocation || '',
        intelligenceNotes: formatNotesToText(c.intelligenceNotes),
        department: c.department || 'POLICE',
        isHistorySheet: c.isHistorySheet || false,
        isRowdySheet: c.isRowdySheet || false,
      });
      setNotesHistory(parseNotesList(c.intelligenceNotes));
      setNewNote('');
      setAccused((c.accused || []).map((a) => ({
        offenderId: a.offenderId,
        offenderName: a.offenderName,
        arrestStatus: a.arrestStatus || 'POLICE_CUSTODY',
      })));
      if (c.seizures?.[0]) {
        const s = c.seizures[0];
        setSeizure({
          contrabandKg: s.contrabandKg?.toString() || '',
          cashAmount: s.cashAmount?.toString() || '',
          vehiclesCount: s.vehiclesCount?.toString() || '0',
          otherItems: s.otherItems || '',
        });
      }
      if (c.seizedVehicles?.length > 0) {
        setHasVehicles(true);
        setSeizedVehicles(c.seizedVehicles.map(v => ({
          vehicleType: v.vehicleType || 'OTHER',
          registrationNo: v.registrationNo || '',
          makeModel: v.makeModel || '',
          color: v.color || '',
          ownerName: v.ownerName || '',
          ownerAddress: v.ownerAddress || '',
          seizureLocation: v.seizureLocation || '',
          remarks: v.remarks || '',
        })));
      }
      if (c.relevantFiles) {
        try {
          setUploadedFiles(JSON.parse(c.relevantFiles));
        } catch {
          setUploadedFiles(c.relevantFiles.split(',').map((url) => ({ name: url.split('/').pop(), url })));
        }
      } else {
        setUploadedFiles([]);
      }
    } catch {
      setError('Failed to load case');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const searchOffenders = async () => {
    if (!offenderSearch.trim()) return;
    setSnackbar({ type: 'info', message: 'Searching for offenders...' });
    try {
      const res = await api.get('/offenders', { params: { query: offenderSearch, size: 10 } });
      const content = res.data.data?.content || [];
      setOffenderResults(content);
      showSnackbar('success', `Search complete. Found ${content.length} match(es).`);
    } catch {
      setOffenderResults([]);
      showSnackbar('error', 'Failed to search offenders.');
    }
  };

  const addAccused = (o) => {
    if (accused.some((a) => a.offenderId === o.id)) return;
    setAccused([...accused, { offenderId: o.id, offenderName: o.fullName || o.full_name, arrestStatus: o.arrestStatus || 'POLICE_CUSTODY' }]);
    setOffenderSearch('');
    setOffenderResults([]);
  };

  const removeAccused = (offenderId) => setAccused(accused.filter((a) => a.offenderId !== offenderId));

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setFileUploading(true);
    setError('');
    try {
      const newUploaded = [];
      for (const file of files) {
        if (file.size > 15 * 1024 * 1024) {
          setError(`File ${file.name} is too large (max 15MB)`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/cases/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.data?.url) {
          newUploaded.push({
            name: res.data.data.name || file.name,
            url: res.data.data.url
          });
        }
      }
      setUploadedFiles(prev => [...prev, ...newUploaded]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload case files');
    } finally {
      setFileUploading(false);
      e.target.value = null;
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e, shouldRedirect = true, sectionName = '') => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setError('');
    setSectionErrors({});

    const setFormError = (msg) => {
      if (sectionName) {
        setSectionErrors(prev => ({ ...prev, [sectionName]: msg }));
        const sectionIdMap = {
          'Case Details': 'section-details',
          'Contraband & Route': 'section-contraband',
          'Accused': 'section-accused',
          'Seizure (optional)': 'section-seizure',
          'Seized Vehicles': 'section-vehicles',
          'Relevant PDF Files': 'section-files'
        };
        const targetId = sectionIdMap[sectionName];
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setError(msg);
      }
      setSaving(false);
    };

    const isSection = (sec) => !sectionName || sectionName === sec;

    // Case Details validation:
    if (isSection('Case Details')) {
      if (!form.psId) { setFormError('Station is required'); return; }
      if (!form.caseDate) { setFormError('Case Date is required'); return; }
      if (form.firNo && !isValidText(form.firNo)) {
        setFormError('FIR Number contains invalid special characters');
        return;
      }
      if (form.sectionOfLaw && !isValidSectionOfLaw(form.sectionOfLaw)) {
        setFormError('Section of Law contains invalid characters');
        return;
      }
    }

    // Contraband & Route validation:
    if (isSection('Contraband & Route')) {
      if (form.quantity && !/^\d*\.?\d*$/.test(String(form.quantity))) {
        setFormError('Quantity must be a valid number');
        return;
      }
      if (form.streetValue && !isValidNumeric(form.streetValue)) {
        setFormError('Street Value must be a valid number');
        return;
      }
      if (form.sourceLocation && !isValidText(form.sourceLocation)) {
        setFormError('Source Location contains invalid special characters');
        return;
      }
      if (form.destinationLocation && !isValidText(form.destinationLocation)) {
        setFormError('Destination Location contains invalid special characters');
        return;
      }
    }

    // Seizure optional validation:
    if (isSection('Seizure (optional)')) {
      if (seizure.contrabandKg && !/^\d*\.?\d*$/.test(seizure.contrabandKg)) {
        setFormError('Seizure contraband quantity must be a valid number');
        return;
      }
      if (seizure.cashAmount && !isValidNumeric(seizure.cashAmount)) {
        setFormError('Seizure cash amount must be a valid number');
        return;
      }
      if (seizure.vehiclesCount && !isValidNumeric(seizure.vehiclesCount)) {
        setFormError('Seizure vehicles count must be a valid number');
        return;
      }
    }

    // Seized vehicles validation:
    if (isSection('Seized Vehicles') && hasVehicles) {
      for (const v of seizedVehicles) {
        if (!v.registrationNo?.trim()) {
          setFormError('Vehicle Registration Number is required when vehicle seizure is enabled');
          return;
        }
        if (!/^[a-zA-Z0-9\s-]*$/.test(v.registrationNo)) {
          setFormError(`Vehicle Registration Number "${v.registrationNo}" contains invalid characters`);
          return;
        }
        if (v.makeModel?.trim() && !isValidText(v.makeModel)) {
          setFormError(`Vehicle Make/Model "${v.makeModel}" contains invalid characters`);
          return;
        }
        if (v.color?.trim() && !/^[a-zA-Z\s]*$/.test(v.color)) {
          setFormError(`Vehicle Color "${v.color}" contains invalid characters`);
          return;
        }
        if (v.ownerName?.trim() && !isValidText(v.ownerName)) {
          setFormError(`Vehicle Owner Name "${v.ownerName}" contains invalid characters`);
          return;
        }
        if (v.seizureLocation?.trim() && !isValidText(v.seizureLocation)) {
          setFormError(`Vehicle Seizure Location "${v.seizureLocation}" contains invalid characters`);
          return;
        }
      }
    }

    try {
      let updatedNotesHistory = [...notesHistory];
      if (newNote.trim()) {
        const entry = {
          id: Date.now().toString(),
          text: newNote.trim(),
          timestamp: new Date().toISOString()
        };
        updatedNotesHistory = [entry, ...updatedNotesHistory];
      }

      const payload = {
        ...form,
        intelligenceNotes: updatedNotesHistory.length > 0 ? JSON.stringify(updatedNotesHistory) : (form.intelligenceNotes || null),
        psId: parseInt(form.psId, 10),
        quantity: form.quantity ? parseFloat(form.quantity) : null,
        streetValue: form.streetValue ? parseFloat(form.streetValue) : null,
        relevantFiles: uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null,
        accused: accused.map((a) => ({ offenderId: a.offenderId, arrestStatus: a.arrestStatus })),
        seizures: seizure.contrabandKg || seizure.cashAmount
          ? [{
            contrabandKg: seizure.contrabandKg ? parseFloat(seizure.contrabandKg) : null,
            cashAmount: seizure.cashAmount ? parseFloat(seizure.cashAmount) : 0,
            vehiclesCount: parseInt(seizure.vehiclesCount, 10) || 0,
            otherItems: seizure.otherItems || null,
          }]
          : [],
        seizedVehicles: hasVehicles ? seizedVehicles.filter(v => v.registrationNo.trim()) : [],
      };
      if (isEdit) {
        if (!sectionName || sectionName === 'Case Details' || sectionName === 'Contraband & Route' || sectionName === 'Seized Vehicles' || sectionName === 'Relevant PDF Files') {
          await api.put(`/cases/${id}`, payload);
        }
        if (!sectionName || sectionName === 'Accused') {
          if (accused.length) await api.post(`/cases/${id}/accused`, accused.map((a) => ({ offenderId: a.offenderId, arrestStatus: a.arrestStatus })));
        }
        if (!sectionName || sectionName === 'Seizure (optional)') {
          if (payload.seizures?.length) await api.post(`/cases/${id}/seizures`, payload.seizures);
        }
        
        showSnackbar('success', sectionName ? `${sectionName} updated successfully!` : 'Case updated successfully!');
        if (shouldRedirect) {
          setTimeout(() => navigate(`/cases/${id}`), 1500);
        }
      } else {
        const res = await api.post('/cases', payload);
        const newId = res.data.data?.id;
        showSnackbar('success', 'Case registered successfully!');
        setTimeout(() => navigate(newId ? `/cases/${newId}` : '/cases'), 1500);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save case');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-garuda-50)' }}>
          {isEdit ? 'Edit Case' : 'Register New Case'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-garuda-400)' }}>
          {isEdit ? 'Update case details' : 'Register a new NDPS case — FIR auto-generated if left blank'}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl p-6 space-y-4 text-center animate-pulse" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--color-garuda-400)' }}>Loading case data...</div>
          <div className="space-y-2 mt-4">
            <div className="h-10 bg-slate-700/40 rounded w-full"></div>
            <div className="h-10 bg-slate-700/40 rounded w-5/6"></div>
            <div className="h-10 bg-slate-700/40 rounded w-4/5"></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Left Form Column */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          {sectionErrors['Case Details'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Case Details']}
            </div>
          )}
          <div id="section-details" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Case Details</h3>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Case Details')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firNo" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>FIR Number</label>
                <input id="firNo" name="firNo" value={form.firNo} onChange={handleChange} placeholder="Auto if empty" className={inp} style={fieldStyle} />
              </div>
              <div>
                <label htmlFor="psId" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Station *</label>
                <CustomSelect
                  id="psId"
                  name="psId"
                  value={form.psId}
                  onChange={handleChange}
                  placeholder="Select Station"
                  options={stations.map((s) => ({
                    value: String(s.id),
                    label: `${s.name}${(s.psCode || s.ps_code) ? ` (${s.psCode || s.ps_code})` : ''}`
                  }))}
                />
              </div>
              <div>
                <label htmlFor="department" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Department</label>
                <CustomSelect
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  options={[
                    { value: 'POLICE', label: 'Police' },
                    { value: 'EXCISE', label: 'Excise' }
                  ]}
                />
              </div>
              <div>
                <label htmlFor="caseDate" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Case Date *</label>
                <input id="caseDate" type="date" name="caseDate" value={form.caseDate} onChange={handleChange} required className={inp} style={fieldStyle} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="sectionOfLaw" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Section of Law</label>
                <input id="sectionOfLaw" name="sectionOfLaw" value={form.sectionOfLaw} onChange={handleChange} className={inp} style={fieldStyle} />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="natureOfOffence" className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Nature of Offence</label>
                <input id="natureOfOffence" name="natureOfOffence" value={form.natureOfOffence} onChange={handleChange} className={inp} style={fieldStyle} />
              </div>
              {isEdit && (
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Stage</label>
                  <CustomSelect
                    name="stage"
                    value={form.stage}
                    onChange={handleChange}
                    options={[
                      { value: 'FIR', label: 'FIR' },
                      { value: 'CHARGESHEET', label: 'Charge Sheet' },
                      { value: 'TRIAL', label: 'Trial' },
                      { value: 'CONVICTED', label: 'Convicted' },
                      { value: 'ACQUITTED', label: 'Acquitted' },
                      { value: 'CLOSED', label: 'Closed' }
                    ]}
                  />
                </div>
              )}
            </div>
          </div>

          {sectionErrors['Contraband & Route'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Contraband & Route']}
            </div>
          )}
          <div id="section-contraband" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Contraband & Route</h3>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Contraband & Route')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Type</label>
                <CustomSelect
                  name="contrabandType"
                  value={form.contrabandType}
                  onChange={handleChange}
                  placeholder="— Select Contraband —"
                  options={CONTRABAND_OPTIONS}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Quantity</label>
                  <input name="quantity" type="number" step="0.001" value={form.quantity} onChange={handleChange} className={inp} style={fieldStyle} />
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Unit</label>
                  <CustomSelect
                    name="quantityUnit"
                    value={form.quantityUnit}
                    onChange={handleChange}
                    options={UNIT_OPTIONS}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Street Value (₹)</label>
                <input name="streetValue" type="number" value={form.streetValue} onChange={handleChange} className={inp} style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Source Location</label>
                <input name="sourceLocation" value={form.sourceLocation} onChange={handleChange} className={inp} style={fieldStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Destination</label>
                <input name="destinationLocation" value={form.destinationLocation} onChange={handleChange} className={inp} style={fieldStyle} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Remarks</label>
                <textarea name="intelligenceNotes" value={form.intelligenceNotes} onChange={handleChange} rows={3} placeholder="Add case remarks..." className={inp} style={fieldStyle} />
              </div>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isHistorySheet" checked={form.isHistorySheet} onChange={handleChange} />
                <span className="text-sm" style={{ color: 'var(--color-garuda-300)' }}>History Sheet</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isRowdySheet" checked={form.isRowdySheet} onChange={handleChange} />
                <span className="text-sm" style={{ color: 'var(--color-garuda-300)' }}>Rowdy Sheet</span>
              </label>
            </div>
          </div>

          {sectionErrors['Accused'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Accused']}
            </div>
          )}
          <div id="section-accused" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Accused</h3>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Accused')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={offenderSearch}
                onChange={(e) => setOffenderSearch(e.target.value)}
                placeholder="Search offender by name, Aadhaar, phone, email..."
                className={`${inp} flex-1 min-w-[200px]`}
                style={fieldStyle}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchOffenders())}
              />
              <button
                type="button"
                onClick={searchOffenders}
                className="px-4 py-2 rounded-lg text-sm text-white transition-colors"
                style={{ background: 'var(--color-accent-500)', cursor: 'pointer', border: 'none' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-accent-600)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'var(--color-accent-500)'; }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-lg text-sm whitespace-nowrap border"
                style={{ borderColor: 'var(--color-accent-400)', background: 'transparent', color: 'var(--color-accent-400)', cursor: 'pointer' }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(234, 88, 12, 0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                + Add New Accused
              </button>
            </div>
            {offenderResults.length > 0 && (
              <ul className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-garuda-600)' }}>
                {offenderResults.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => addAccused(o)}
                      className="w-full text-left px-3 py-2 text-sm transition-colors"
                      style={{ color: 'var(--color-garuda-200)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-garuda-600)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {o.fullName || o.full_name} {(o.psName || o.ps_name) ? `(${o.psName || o.ps_name})` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {accused.length > 0 && (
              <ul className="space-y-2">
                {accused.map((a) => (
                  <li key={a.offenderId} className="flex items-center justify-between gap-3 p-2.5 rounded-lg" style={{ background: 'var(--color-garuda-900)' }}>
                    <span className="text-sm flex-1 min-w-0 truncate" style={{ color: 'var(--color-garuda-100)' }}>{a.offenderName}</span>
                    <div className="w-64">
                      <CustomSelect
                        value={a.arrestStatus}
                        onChange={(e) => {
                          setAccused(accused.map(x =>
                            x.offenderId === a.offenderId
                              ? { ...x, arrestStatus: e.target.value }
                              : x
                          ));
                        }}
                        options={Object.entries(ARREST_STATUS_META).map(([key, meta]) => ({
                          value: key,
                          label: meta.desc,
                        }))}
                      />
                    </div>
                    <button type="button" onClick={() => removeAccused(a.offenderId)} className="text-xs text-red-400 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer font-medium whitespace-nowrap">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {sectionErrors['Seizure (optional)'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Seizure (optional)']}
            </div>
          )}
          <div id="section-seizure" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Seizure (optional)</h3>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Seizure (optional)')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input id="contrabandKg" name="contrabandKg" placeholder="Contraband (kg)" value={seizure.contrabandKg} onChange={(e) => setSeizure({ ...seizure, contrabandKg: e.target.value })} className={inp} style={fieldStyle} />
              <input id="cashAmount" name="cashAmount" placeholder="Cash seized (₹)" value={seizure.cashAmount} onChange={(e) => setSeizure({ ...seizure, cashAmount: e.target.value })} className={inp} style={fieldStyle} />
              <input id="vehiclesCount" name="vehiclesCount" placeholder="Vehicles" value={seizure.vehiclesCount} onChange={(e) => setSeizure({ ...seizure, vehiclesCount: e.target.value })} className={inp} style={fieldStyle} />
              <input id="otherItems" name="otherItems" placeholder="Other items" value={seizure.otherItems} onChange={(e) => setSeizure({ ...seizure, otherItems: e.target.value })} className={inp} style={fieldStyle} />
            </div>
          </div>

          {sectionErrors['Seized Vehicles'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Seized Vehicles']}
            </div>
          )}
          <div id="section-vehicles" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <div className="flex items-center gap-4">
                <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Seized Vehicles</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasVehicles}
                    onChange={(e) => {
                      setHasVehicles(e.target.checked);
                      if (e.target.checked && seizedVehicles.length === 0) {
                        setSeizedVehicles([{ ...emptyVehicle }]);
                      }
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--color-garuda-300)' }}>Vehicle(s) seized in this case</span>
                </label>
              </div>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Seized Vehicles')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>

            {hasVehicles && (
              <div className="space-y-4">
                {seizedVehicles.map((v, idx) => (
                  <div key={idx} className="rounded-lg p-4 space-y-3" style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-700)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Vehicle #{idx + 1}</span>
                      {seizedVehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSeizedVehicles(seizedVehicles.filter((_, i) => i !== idx))}
                          className="text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Vehicle Type *</label>
                        <CustomSelect
                          value={v.vehicleType}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], vehicleType: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          options={[
                            { value: 'TWO_WHEELER', label: 'Two Wheeler' },
                            { value: 'FOUR_WHEELER', label: 'Four Wheeler' },
                            { value: 'AUTO', label: 'Auto Rickshaw' },
                            { value: 'TRUCK', label: 'Truck / Lorry' },
                            { value: 'BUS', label: 'Bus' },
                            { value: 'OTHER', label: 'Other' },
                          ]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Registration No *</label>
                        <input
                          value={v.registrationNo}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], registrationNo: e.target.value.toUpperCase() };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="AP 09 AB 1234"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Make / Model</label>
                        <input
                          value={v.makeModel}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], makeModel: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="e.g. Honda Activa, Maruti Swift"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Color</label>
                        <input
                          value={v.color}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], color: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="e.g. Red, White"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Owner Name</label>
                        <input
                          value={v.ownerName}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], ownerName: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="Vehicle owner"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Seizure Location</label>
                        <input
                          value={v.seizureLocation}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], seizureLocation: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="Where was it seized?"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-garuda-400)' }}>Remarks</label>
                        <input
                          value={v.remarks}
                          onChange={(e) => {
                            const updated = [...seizedVehicles];
                            updated[idx] = { ...updated[idx], remarks: e.target.value };
                            setSeizedVehicles(updated);
                          }}
                          placeholder="Any additional notes"
                          className={inp}
                          style={fieldStyle}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSeizedVehicles([...seizedVehicles, { ...emptyVehicle }])}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: 'var(--color-accent-400)', background: 'transparent', color: 'var(--color-accent-400)', cursor: 'pointer' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(234, 88, 12, 0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  + Add Another Vehicle
                </button>
              </div>
            )}
          </div>

          {sectionErrors['Relevant PDF Files'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Relevant PDF Files']}
            </div>
          )}
          <div id="section-files" className="rounded-xl p-6 space-y-4" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="font-semibold" style={{ color: 'var(--color-garuda-200)' }}>Relevant PDF Files</h3>
              {isEdit && (
                <button
                  type="button"
                  onClick={() => handleSubmit(null, false, 'Relevant PDF Files')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Update Section
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <label
                  className="btn btn-secondary text-sm flex items-center gap-2 cursor-pointer"
                  style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-600)', color: 'var(--color-garuda-100)' }}
                >
                  <svg className="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  {fileUploading ? 'Uploading...' : 'Choose Files'}
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={fileUploading}
                    className="hidden"
                  />
                </label>
                <span className="text-xs" style={{ color: 'var(--color-garuda-400)' }}>
                  Upload scans, FIR copies, or seizure reports (PDF, Word, Images up to 15MB each).
                </span>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {uploadedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-lg border text-xs"
                      style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-600)' }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium truncate hover:text-accent-400 transition-colors"
                          style={{ color: 'var(--color-garuda-100)' }}
                        >
                          {file.name}
                        </a>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-red-400 hover:text-red-500 font-bold px-2 py-1 bg-transparent border-none cursor-pointer text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => navigate('/cases')} className="px-5 py-2.5 rounded-lg text-sm" style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg text-sm text-white" style={{ background: 'var(--color-accent-500)', opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving...' : isEdit ? 'Update Case' : 'Register Case'}
            </button>
          </div>
        </form>
      </div>

      {/* Right Sticky Quick Access Panel */}
      <div className="hidden lg:block lg:col-span-3 sticky top-20 self-start space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto pr-1.5 custom-scrollbar">
        <div className="p-3.5 rounded-xl border space-y-2" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 px-1">Quick Navigation</p>
          <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-1 custom-scrollbar">
            {quickAccessSections.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold block transition-all cursor-pointer border-none bg-transparent text-slate-700 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Notes Section Below Quick Nav */}
        <div className="rounded-xl p-4 border space-y-3" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
          <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-300)' }}>
              Add Quick Note for Edit
            </span>
          </div>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            placeholder="Type a note for this edit..."
            className="w-full p-2.5 rounded-lg text-xs outline-none resize-none"
            style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-600)', color: 'var(--color-garuda-100)' }}
          />

          {notesHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--color-garuda-400)' }}>
                Notes History ({notesHistory.length})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {notesHistory.map((item, idx) => (
                  <div key={item.id || idx} className="p-2 rounded text-xs space-y-1" style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-700)' }}>
                    <p className="whitespace-pre-wrap font-medium" style={{ color: 'var(--color-garuda-100)' }}>
                      "{item.text}"
                    </p>
                    {item.timestamp && (
                      <span className="text-[10px] block" style={{ color: 'var(--color-garuda-400)' }}>
                        {new Date(item.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )}
      <AddAccusedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={addAccused}
        stations={stations}
        currentPsId={form.psId}
      />
      {snackbar && (
        <div 
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 scale-100 ${
            snackbar.type === 'success' 
              ? 'border-emerald-500 bg-emerald-950/90 text-emerald-100' 
              : snackbar.type === 'info'
              ? 'border-blue-500 bg-blue-950/90 text-blue-100'
              : 'border-red-500 bg-red-950/90 text-red-100'
          }`}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {snackbar.type === 'success' && (
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {snackbar.type === 'info' && (
            <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
            </svg>
          )}
          {snackbar.type === 'error' && (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{snackbar.message}</span>
        </div>
      )}
    </div>
  );
}

function AddAccusedModal({ isOpen, onClose, onSaved, stations, currentPsId }) {
  const [modalForm, setModalForm] = useState({
    fullName: '',
    alias: '',
    fatherHusbandName: '',
    age: '',
    gender: '',
    category: '',
    psId: currentPsId || '',
    aadhaarNo: '',
    phone: '',
    fullAddress: '',
    photoUrl: '',
    arrestStatus: 'POLICE_CUSTODY'
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  // Sync station ID with current form selection when opened
  useEffect(() => {
    if (isOpen) {
      setModalForm({
        fullName: '',
        alias: '',
        fatherHusbandName: '',
        age: '',
        gender: '',
        category: '',
        psId: currentPsId || '',
        aadhaarNo: '',
        countryCode: '+91',
        phone: '',
        fullAddress: '',
        photoUrl: '',
        arrestStatus: 'POLICE_CUSTODY'
      });
      setError('');
    } else {
      // Clean up camera stream when modal is closed
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    }
  }, [isOpen, currentPsId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error("Error playing video stream:", e));
        }
      }, 50);
    } catch (err) {
      setError('Could not access camera. Please use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      stopCamera();
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        await uploadFile(file);
      }
    }, 'image/jpeg', 0.85);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo file size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/offenders/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.data?.url) {
        setModalForm(prev => ({ ...prev, photoUrl: res.data.data.url }));
      } else {
        setError('Upload succeeded but no URL was returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo file size must be under 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    setUploading(true);
    setError('');
    try {
      const res = await api.post('/offenders/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.data?.url) {
        setModalForm(prev => ({ ...prev, photoUrl: res.data.data.url }));
      } else {
        setError('Upload succeeded but no URL was returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.fullName.trim()) return setError('Full name is required');
    if (!modalForm.psId) return setError('Police station is required');

    // Validation
    const aadhaarVal = (modalForm.aadhaarNo || '').trim();
    if (aadhaarVal && !/^\d{12}$/.test(aadhaarVal)) {
      return setError('Aadhaar must be exactly 12 digits and contain only numbers');
    }
    const phoneVal = (modalForm.phone || '').trim();
    if (phoneVal) {
      const cleanDigits = phoneVal.replace(/[^0-9]/g, '');
      const countryConfig = COUNTRY_CODES.find(cc => cc.code === modalForm.countryCode) || { length: 10 };
      if (cleanDigits.length !== countryConfig.length) {
        return setError(`Mobile Number must be exactly ${countryConfig.length} digits for ${modalForm.countryCode}`);
      }
    }
    const ageVal = (modalForm.age || '').trim();
    if (ageVal && !/^\d*$/.test(ageVal)) {
      return setError('Age must be a valid number');
    }

    if (!isValidText(modalForm.fullName)) return setError('Full Name contains invalid special characters');
    if (!isValidText(modalForm.alias)) return setError('Alias contains invalid special characters');
    if (!isValidText(modalForm.fatherHusbandName)) return setError("Father/Husband's Name contains invalid special characters");

    setSaving(true);
    setError('');
    try {
      const payload = {
        fullName: modalForm.fullName.trim(),
        alias: modalForm.alias.trim() || null,
        fatherHusbandName: modalForm.fatherHusbandName.trim() || null,
        age: modalForm.age ? parseInt(modalForm.age, 10) : null,
        gender: modalForm.gender || null,
        category: modalForm.category || null,
        psId: parseInt(modalForm.psId, 10),
        aadhaarNo: modalForm.aadhaarNo.trim() || null,
        fullAddress: modalForm.fullAddress.trim() || null,
        photoUrl: modalForm.photoUrl || null,
        contacts: modalForm.phone.trim()
          ? [{ contactType: 'MOBILE_PRIMARY', value: `${modalForm.countryCode}${modalForm.phone.trim().replace(/[^0-9]/g, '')}`, notes: 'Primary' }]
          : []
      };

      const res = await api.post('/offenders', payload);
      const newId = res.data.data?.id;

      if (newId) {
        onSaved({
          id: newId,
          fullName: modalForm.fullName.trim(),
          arrestStatus: modalForm.arrestStatus || 'POLICE_CUSTODY'
        });
        onClose();
      } else {
        setError('Failed to retrieve registered offender ID.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register accused');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm cursor-default animate-fade-in" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative w-full max-w-xl rounded-2xl p-6 text-left shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto z-10 border transition-all"
        style={{
          background: 'var(--color-garuda-800, #1e293b)',
          borderColor: 'var(--color-garuda-700, #334155)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-center justify-between mb-5 border-b pb-3.5" style={{ borderColor: 'var(--color-garuda-700, #334155)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-bold text-sm">
              +
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white" style={{ color: 'var(--color-garuda-50, #f8fafc)' }}>
              Register & Add New Accused
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 dark:hover:text-white bg-transparent border-none cursor-pointer text-lg font-bold p-1 select-none rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs font-semibold" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Full Name *</label>
              <input
                name="fullName"
                value={modalForm.fullName}
                onChange={handleChange}
                required
                placeholder="Full Legal Name"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Police Station *</label>
              <CustomSelect
                name="psId"
                value={modalForm.psId}
                onChange={handleChange}
                placeholder="Select PS"
                options={stations.map((s) => ({
                  value: String(s.id),
                  label: `${s.name}${s.ps_code || s.psCode ? ` (${s.ps_code || s.psCode})` : ''}`
                }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Alias</label>
              <input
                name="alias"
                value={modalForm.alias}
                onChange={handleChange}
                placeholder="Known Alias / Nickname"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Father/Husband Name</label>
              <input
                name="fatherHusbandName"
                value={modalForm.fatherHusbandName}
                onChange={handleChange}
                placeholder="Father or Husband Name"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Age</label>
              <input
                type="number"
                name="age"
                value={modalForm.age}
                onChange={handleChange}
                placeholder="Age in years"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Gender</label>
              <CustomSelect
                name="gender"
                value={modalForm.gender}
                onChange={handleChange}
                placeholder="Select Gender"
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Category</label>
              <CustomSelect
                name="category"
                value={modalForm.category}
                onChange={handleChange}
                placeholder="Select Category"
                options={[
                  { value: 'CONSUMER', label: 'Consumer' },
                  { value: 'LOCAL_PEDDLER', label: 'Local Peddler' },
                  { value: 'LOCAL_SUPPLIER', label: 'Local Supplier' },
                  { value: 'LOCAL_KINGPIN', label: 'Local Kingpin' },
                  { value: 'TRANSPORTER', label: 'Transporter' },
                  { value: 'INTERSTATE_KINGPIN', label: 'Interstate Kingpin' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Aadhaar Number</label>
              <input
                maxLength={12}
                name="aadhaarNo"
                value={modalForm.aadhaarNo}
                onChange={handleChange}
                placeholder="12-digit Aadhaar"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Mobile Number</label>
              <div className="flex gap-2">
                <div className="w-24 flex-shrink-0">
                  <CustomSelect
                    name="countryCode"
                    value={modalForm.countryCode || '+91'}
                    onChange={handleChange}
                    options={COUNTRY_CODES.map(cc => ({ value: cc.code, label: cc.code }))}
                  />
                </div>
                <input 
                  type="tel" 
                  name="phone" 
                  value={modalForm.phone} 
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setModalForm(prev => ({ ...prev, phone: val }));
                  }} 
                  placeholder="Primary phone number" 
                  className="flex-1 px-3.5 py-2 text-xs font-bold rounded-xl outline-none transition-all focus:ring-2 focus:ring-amber-500/30" 
                  style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }} 
                  maxLength={COUNTRY_CODES.find(cc => cc.code === (modalForm.countryCode || '+91'))?.length || 10}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Arrest Status</label>
              <CustomSelect
                name="arrestStatus"
                value={modalForm.arrestStatus}
                onChange={handleChange}
                placeholder="Select Arrest Status"
                options={Object.entries(ARREST_STATUS_META).map(([key, meta]) => ({
                  value: key,
                  label: meta.label || meta.desc
                }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Photograph</label>
              <div className="flex items-center gap-4 p-3.5 rounded-xl border transition-colors" style={{ background: 'var(--color-garuda-900, #0f172a)', borderColor: 'var(--color-garuda-600, #475569)' }}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex-shrink-0 flex items-center justify-center text-slate-400 shadow-inner">
                  {modalForm.photoUrl ? (
                    <>
                      <img src={modalForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setModalForm(prev => ({ ...prev, photoUrl: '' }))}
                        className="absolute inset-0 bg-black/75 flex items-center justify-center text-[10px] text-red-400 font-bold opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-none"
                      >
                        Remove
                      </button>
                    </>
                  ) : cameraActive ? (
                    <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {uploading ? (
                        <span className="text-[10px] animate-pulse font-bold text-amber-500">...</span>
                      ) : (
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex gap-2.5">
                  {cameraActive ? (
                    <>
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={uploading}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-bold text-xs border-none cursor-pointer shadow-sm active:scale-95 transition-all"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        disabled={uploading}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs border border-slate-700 cursor-pointer shadow-sm active:scale-95 transition-all"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      {!modalForm.photoUrl && (
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={uploading}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs border-none cursor-pointer shadow-sm active:scale-95 transition-all"
                        >
                          Capture
                        </button>
                      )}
                      <label
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs cursor-pointer flex items-center justify-center border border-slate-700 shadow-sm active:scale-95 transition-all select-none"
                      >
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--color-garuda-300, #cbd5e1)' }}>Full Address</label>
              <textarea
                name="fullAddress"
                value={modalForm.fullAddress}
                onChange={handleChange}
                rows={2}
                placeholder="Enter physical address details"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium outline-none resize-none transition-all focus:ring-2 focus:ring-amber-500/30"
                style={{ background: 'var(--color-garuda-900, #0f172a)', border: '1px solid var(--color-garuda-600, #475569)', color: 'var(--color-garuda-100, #f1f5f9)' }}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t" style={{ borderColor: 'var(--color-garuda-700, #334155)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-700"
              style={{ background: 'var(--color-garuda-700, #334155)', color: 'var(--color-garuda-300, #cbd5e1)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg hover:shadow-orange-500/20 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', border: 'none', opacity: (saving || uploading) ? 0.6 : 1 }}
            >
              {saving ? 'Registering...' : 'Register & Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
