import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';
import { usePermissions } from '../../hooks/usePermissions';
import { OffenderCaseHistory, OffenderInterrogationPanel, ImeiPanel } from '../../components/OffenderPhase1Panels';

const CATEGORIES = ['INTERSTATE_LINK','FINANCIER','SUPPLIER','TRANSPORTER','LOCAL_KINGPIN','LOCAL_PEDDLER','CONSUMER'];
const GENDERS = ['MALE','FEMALE','OTHER'];
const PURCHASE_MODES = ['CASH','UPI','CREDIT','BARTER','MIXED'];
const ADDICTION_TYPES = ['GANJA_ONLY','GANJA_ALCOHOL','GANJA_OTHER_DRUGS','MULTIPLE'];
const CONSUMPTION_FREQS = ['DAILY','WEEKLY','OCCASIONAL'];
const PROCUREMENT_SOURCES = ['LOCAL','OUTSIDE_DISTRICT','ONLINE','COURIER'];
const CORE_CONTACT_TYPES = ['MOBILE_PRIMARY','MOBILE_SECONDARY','MOBILE_SIBLING','GMAIL'];
const SOCIAL_CONTACT_TYPES = ['WHATSAPP','TELEGRAM','INSTAGRAM','FACEBOOK','OTHER_SOCIAL'];
const LINK_TYPES = ['CO_CONSUMER','PEDDLER','SUPPLIER','TRANSPORTER','KINGPIN'];
const FIN_TYPES = [
  { value: 'BANK_ACCOUNT_NO', label: 'Bank Account No' },
  { value: 'BANK_NAME', label: 'Bank Name' },
  { value: 'UPI_ID', label: 'UPI ID' },
];
const TEST_RESULTS = ['POSITIVE', 'NEGATIVE', 'PENDING'];

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)', length: 10 },
  { code: '+1', label: 'USA/Canada (+1)', length: 10 },
  { code: '+44', label: 'UK (+44)', length: 10 },
  { code: '+971', label: 'UAE (+971)', length: 9 },
  { code: '+880', label: 'Bangladesh (+880)', length: 10 },
  { code: '+977', label: 'Nepal (+977)', length: 10 },
  { code: '+94', label: 'Sri Lanka (+94)', length: 9 }
];

const BackIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const PrintIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const EditIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const inputStyle = {
  background: 'var(--color-garuda-700)',
  border: '1px solid var(--color-garuda-600)',
  color: 'var(--color-garuda-50)',
};
const labelStyle = { color: 'var(--color-garuda-300)' };

const isValidText = (val) => !val || /^[a-zA-Z0-9\s.,/-]*$/.test(val);
const isValidSectionOfLaw = (val) => !val || /^[a-zA-Z0-9\s()./,-]*$/.test(val);
const isValidPan = (val) => !val || /^[a-zA-Z0-9]{10}$/.test(val);
const isValidIfsc = (val) => !val || /^[a-zA-Z0-9]{11}$/.test(val);
const isValidUpiId = (val) => !val || /^[a-zA-Z0-9@._-]*$/.test(val);
const isValidNumeric = (val) => !val || /^\d*$/.test(String(val));
const isValidPhone = (val) => !val || /^\+?[0-9\s-]*$/.test(val);
const isValidEmail = (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function OffenderForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const perms = usePermissions();

  const isEditRoute = location.pathname.endsWith('/edit');
  const isNew = location.pathname.endsWith('/new') || (!id && !isEditRoute);

  const [aadhaarRevealed, setAadhaarRevealed] = useState(false);
  const [aadhaarMasked, setAadhaarMasked] = useState(true);
  const [stations, setStations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sectionErrors, setSectionErrors] = useState({});
  const [snackbar, setSnackbar] = useState(null); // { type: 'success' | 'error', message: '' }

  // Photo upload state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [quickNotes, setQuickNotes] = useState('');

  const [form, setForm] = useState({
    slNo:'', psId:'', fullName:'', alias:'', fatherHusbandName:'',
    age:'', gender:'', category:'',
    fullAddress:'', landmark:'', district:'', state:'',
    occupation:'', monthlyIncome:'',
    addictionType:'', consumptionFrequency:'', sourceOfProcurement:'',
    testResult:'', modeOfPurchase:'', usualConsumptionSpot:'', sectionOfLaw:'',
    aadhaarNo:'', voterId:'', panCard:'', photoUrl:'',
    previousCrimeHistory: false, historySheetStatus:'',
    contacts: [],
    socialMedia: [
      { contactType: 'WHATSAPP', value: '', notes: '' },
      { contactType: 'INSTAGRAM', value: '', notes: '' },
      { contactType: 'FACEBOOK', value: '', notes: '' }
    ],
    financials: [],
    criminalHistories: [],
    supplyChainLinks: [],
  });

  const isSamePS = !perms.isStationLevel || (!form.psId || String(form.psId) === String(perms.policeStationId));
  const isCrossPSEditRestricted = isEditRoute && !!form.psId && !isSamePS;
  const isEdit = isEditRoute && !isCrossPSEditRestricted;
  const isView = (!isEditRoute && !isNew && !!id) || isCrossPSEditRestricted;

  useEffect(() => {
    fetchStations();
    if (isEditRoute || isView || !!id) fetchOffender();
  }, [id, isEditRoute, isView]);

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  const fetchStations = async () => {
    try {
      const r = await api.get('/police-stations');
      setStations(r.data.data || []);
    } catch {}
  };

  const fetchOffender = async () => {
    try {
      const r = await api.get(`/offenders/${id}`);
      const d = r.data.data;
      setForm({
        slNo: d.slNo||'', psId: d.psId||'', fullName: d.fullName||'',
        alias: d.alias||'', fatherHusbandName: d.fatherHusbandName||'',
        age: d.age||'', gender: d.gender||'', category: d.category||'',
        fullAddress: d.fullAddress || d.full_address || '',
        landmark: d.landmark || d.landmarkArea || d.landmark_area || '',
        district: d.district||'', state: d.state||'',
        occupation: d.occupation||'', monthlyIncome: d.monthlyIncome||'',
        addictionType: d.addictionType||'', consumptionFrequency: d.consumptionFrequency||'',
        sourceOfProcurement: d.sourceOfProcurement||'', testResult: d.testResult||'',
        modeOfPurchase: d.modeOfPurchase||'', usualConsumptionSpot: d.usualConsumptionSpot||'',
        sectionOfLaw: d.sectionOfLaw || d.drugProfile?.sectionOfLaw || '',
        aadhaarNo: d.identityDocs?.aadhaarNo || d.aadhaarNo || '',
        voterId: d.identityDocs?.voterId || d.voterId || '',
        panCard: d.identityDocs?.panCard || d.panCard || '',
        photoUrl: d.photoUrl||'',
        previousCrimeHistory: d.previousCrimeHistory||false, historySheetStatus: d.historySheetStatus||'',
        contacts: (d.contacts || [])
          .filter(c => CORE_CONTACT_TYPES.includes(c.contactType || c.contact_type))
          .map(c => {
            const isEmail = (c.contactType || c.contact_type) === 'GMAIL';
            if (isEmail) {
              return {
                id: c.id,
                contactType: c.contactType || c.contact_type,
                value: c.value || '',
                notes: c.notes || ''
              };
            } else {
              let val = (c.value || '').trim().replace(/\s+/g, '');
              let matchedCode = '+91';
              let digits = val;
              for (const cc of COUNTRY_CODES) {
                if (val.startsWith(cc.code)) {
                  matchedCode = cc.code;
                  digits = val.substring(cc.code.length);
                  break;
                }
              }
              if (!val.startsWith('+')) {
                matchedCode = '+91';
                digits = val;
              }
              return {
                id: c.id,
                contactType: c.contactType || c.contact_type,
                countryCode: matchedCode,
                phoneDigits: digits,
                notes: c.notes || ''
              };
            }
          }),
        socialMedia: (() => {
          const loadedSocial = (d.contacts || [])
            .filter(c => SOCIAL_CONTACT_TYPES.includes(c.contactType || c.contact_type))
            .map(c => ({
              id: c.id,
              contactType: c.contactType || c.contact_type,
              value: c.value || '',
              notes: c.notes || ''
            }));

          const defaults = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK'];
          const result = [];
          
          defaults.forEach(defType => {
            const foundIndex = loadedSocial.findIndex(s => s.contactType === defType);
            if (foundIndex !== -1) {
              result.push(loadedSocial[foundIndex]);
              loadedSocial.splice(foundIndex, 1);
            } else {
              result.push({ contactType: defType, value: '', notes: '' });
            }
          });
          
          result.push(...loadedSocial);
          return result;
        })(),
        financials: (() => {
          const rawFinancials = d.financials || [];
          const uiFinancials = [];
          const pairedIds = new Set();

          // 1. Process Bank Accounts
          rawFinancials.filter(f => f.finType === 'BANK_ACCOUNT_NO').forEach(ba => {
            const ifsc = rawFinancials.find(f => 
              f.finType === 'IFSC_CODE' && 
              !pairedIds.has(f.id) && 
              (f.bankName === ba.bankName || !pairedIds.has(f.id))
            );

            uiFinancials.push({
              id: ba.id,
              finType: 'BANK_ACCOUNT_NO',
              value: ba.value || '',
              ifscValue: ifsc ? ifsc.value : '',
              bankName: ba.bankName || '',
              notes: ba.notes || ''
            });

            pairedIds.add(ba.id);
            if (ifsc) pairedIds.add(ifsc.id);
          });

          // 2. Process UPI IDs
          rawFinancials.filter(f => f.finType === 'UPI_ID').forEach(upi => {
            const upiMobile = rawFinancials.find(f => 
              f.finType === 'UPI_LINKED_MOBILE' && 
              !pairedIds.has(f.id)
            );

            uiFinancials.push({
              id: upi.id,
              finType: 'UPI_ID',
              value: upi.value || '',
              upiMobileValue: upiMobile ? upiMobile.value : '',
              bankName: upi.bankName || '',
              notes: upi.notes || ''
            });

            pairedIds.add(upi.id);
            if (upiMobile) pairedIds.add(upiMobile.id);
          });

          // 3. Process remaining financials
          rawFinancials.forEach(f => {
            if (pairedIds.has(f.id)) return;
            if (f.finType === 'IFSC_CODE' || f.finType === 'UPI_LINKED_MOBILE') return;

            uiFinancials.push({
              id: f.id,
              finType: f.finType,
              value: f.value || '',
              bankName: f.bankName || '',
              notes: f.notes || ''
            });
          });

          return uiFinancials;
        })(),
        criminalHistories: d.criminalHistories||[], supplyChainLinks: d.supplyChainLinks||[],
      });
      setAadhaarMasked(d.identityDocs?.aadhaarMasked ?? !!String(d.aadhaarNo || '').includes('XXXX'));
    } catch {
      setError('Failed to load offender data');
    }
  };

  const revealAadhaar = async () => {
    try {
      const r = await api.get(`/offenders/${id}`, { params: { reveal: 'true' } });
      const a = r.data.data?.identityDocs?.aadhaarNo || r.data.data?.aadhaarNo;
      set('aadhaarNo', a || '');
      setAadhaarRevealed(true);
      setAadhaarMasked(false);
    } catch {
      setError('Not authorized to view Aadhaar');
    }
  };

  const printProfile = async () => {
    try {
      setError('');
      const [casesRes, intRes] = await Promise.all([
        api.get(`/cases/offender/${id}`),
        api.get(`/offenders/${id}/interrogations`)
      ]);
      const cases = casesRes.data?.data || [];
      const sessions = intRes.data?.data || [];
      
      const matchedStation = stations.find(s => String(s.id) === String(form.psId));
      const stationName = matchedStation ? `${matchedStation.name} (${matchedStation.psCode})` : '—';
      
      const w = window.open('', '_blank');
      if (!w) return;
      
      const val = (v) => v || '—';
      
      w.document.write(`
        <html>
          <head>
            <title>Offender Profile - ${form.fullName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; background: #fff; }
              .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px double #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
              .header-title h1 { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
              .header-title p { font-size: 12px; color: #64748b; margin: 5px 0 0 0; font-weight: 500; }
              .badge { font-size: 11px; font-weight: 700; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; color: #334155; }
              h2 { font-size: 14px; color: #ea580c; border-bottom: 1.5px solid #fed7aa; padding-bottom: 4px; margin-top: 30px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 700; }
              .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px; }
              .col-span-2 { grid-column: span 2; }
              .col-span-3 { grid-column: span 3; }
              .field { margin-bottom: 10px; }
              .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
              .value { font-size: 13px; font-weight: 500; color: #0f172a; margin-top: 3px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 12px; }
              th { background-color: #f8fafc; font-weight: 600; color: #475569; border-bottom: 2px solid #cbd5e1; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
              .photo-container { display: flex; gap: 25px; align-items: flex-start; margin-bottom: 25px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
              .photo { width: 120px; height: 120px; border: 1px solid #cbd5e1; border-radius: 8px; object-fit: cover; background: #fff; }
              .photo-placeholder { width: 120px; height: 120px; border: 1px dashed #cbd5e1; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #fff; color: #94a3b8; font-size: 11px; font-weight: 600; text-transform: uppercase; }
              .header-info { flex-grow: 1; }
              .print-footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="header-title">
                <h1>NDPS Offender Dossier</h1>
                <p>Garuda NDPS Intelligence & Monitoring System</p>
              </div>
              <div class="badge">${val(form.category?.replace(/_/g, ' '))}</div>
            </div>
            
            <div class="photo-container">
              ${form.photoUrl ? `<img src="${form.photoUrl}" class="photo" alt="Offender Photo" />` : `<div class="photo-placeholder">No Photo Available</div>`}
              <div class="header-info">
                <div class="grid">
                  <div class="field col-span-2"><div class="label">Full Name</div><div class="value" style="font-size: 18px; font-weight: 700; color: #0f172a;">${val(form.fullName)}</div></div>
                  <div class="field"><div class="label">Alias</div><div class="value" style="font-weight: 600; color: #334155;">${val(form.alias)}</div></div>
                  <div class="field"><div class="label">Father's/Husband's Name</div><div class="value">${val(form.fatherHusbandName)}</div></div>
                  <div class="field"><div class="label">Age</div><div class="value">${val(form.age)} years</div></div>
                  <div class="field"><div class="label">Gender</div><div class="value">${val(form.gender)}</div></div>
                </div>
              </div>
            </div>

            <h2>Administrative & Basic Info</h2>
            <div class="grid">
              <div class="field"><div class="label">Allotted PS</div><div class="value">${val(stationName)}</div></div>
              <div class="field"><div class="label">District</div><div class="value">${val(form.district)}</div></div>
              <div class="field"><div class="label">State</div><div class="value">${val(form.state)}</div></div>
              <div class="field"><div class="label">Occupation</div><div class="value">${val(form.occupation)}</div></div>
              <div class="field"><div class="label">Monthly Income</div><div class="value">${form.monthlyIncome ? '₹' + form.monthlyIncome : '—'}</div></div>
              <div class="field"><div class="label">History Sheet Status</div><div class="value">${val(form.historySheetStatus?.replace(/_/g, ' '))}</div></div>
              <div class="field"><div class="label">Aadhaar No</div><div class="value">${val(form.aadhaarNo)}</div></div>
              <div class="field"><div class="label">Voter ID</div><div class="value">${val(form.voterId)}</div></div>
              <div class="field"><div class="label">PAN Card</div><div class="value">${val(form.panCard)}</div></div>
            </div>

            <h2>Address Details</h2>
            <div class="grid">
              <div class="field col-span-2"><div class="label">Full Address</div><div class="value">${val(form.fullAddress)}</div></div>
              <div class="field"><div class="label">Landmark</div><div class="value">${val(form.landmark)}</div></div>
            </div>

            <h2>Contacts</h2>
            ${form.contacts.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${form.contacts.map(c => `
                    <tr>
                      <td style="font-weight: 500;">${val(c.contactType?.replace(/_/g, ' '))}</td>
                      <td>${val(c.value)}</td>
                      <td style="color: #64748b;">${val(c.notes)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No contacts recorded.</p>'}

            <h2>Social Media Profiles</h2>
            ${form.socialMedia.filter(s => s.value?.trim()).length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${form.socialMedia.filter(s => s.value?.trim()).map(s => `
                    <tr>
                      <td style="font-weight: 500;">${val(s.contactType?.replace(/_/g, ' '))}</td>
                      <td>${val(s.value)}</td>
                      <td style="color: #64748b;">${val(s.notes)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No social media profiles recorded.</p>'}

            <h2>Drug Abuse Profile</h2>
            <div class="grid">
              <div class="field"><div class="label">Addiction Type</div><div class="value">${val(form.addictionType?.replace(/_/g, ' '))}</div></div>
              <div class="field"><div class="label">Consumption Frequency</div><div class="value">${val(form.consumptionFrequency?.replace(/_/g, ' '))}</div></div>
              <div class="field"><div class="label">Source of Procurement</div><div class="value">${val(form.sourceOfProcurement?.replace(/_/g, ' '))}</div></div>
              <div class="field"><div class="label">Mode of Purchase</div><div class="value">${val(form.modeOfPurchase?.replace(/_/g, ' '))}</div></div>
              <div class="field"><div class="label">Section of Law</div><div class="value">${val(form.sectionOfLaw)}</div></div>
              <div class="field col-span-2"><div class="label">Usual Consumption Spot</div><div class="value">${val(form.usualConsumptionSpot)}</div></div>
            </div>

            <h2>Financial Profile</h2>
            ${form.financials.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Bank Name</th>
                    <th>Account No / Value</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${form.financials.map(f => `
                    <tr>
                      <td style="font-weight: 500;">${val(f.finType?.replace(/_/g, ' '))}</td>
                      <td>${val(f.bankName)}</td>
                      <td style="font-family: monospace;">${val(f.value)}</td>
                      <td style="color: #64748b;">${val(f.notes)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No financial details recorded.</p>'}

            <h2>Prior Criminal History</h2>
            ${form.criminalHistories.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Crime No / Year</th>
                    <th>Under Section</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${form.criminalHistories.map(ch => `
                    <tr>
                      <td style="font-weight: 500;">${val(ch.crimeNo)} / ${val(ch.crimeYear)}</td>
                      <td>${val(ch.underSection)}</td>
                      <td>${val(ch.quantityGanja)} kg</td>
                      <td>${val(ch.caseStatus?.replace(/_/g, ' '))}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No prior crime records added.</p>'}

            <h2>Supply Chain Links</h2>
            ${form.supplyChainLinks.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Link Type</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${form.supplyChainLinks.map(lk => `
                    <tr>
                      <td style="font-weight: 500; color: #b45309;">${val(lk.linkType?.replace(/_/g, ' '))}</td>
                      <td style="font-weight: 500;">${val(lk.linkedName)}</td>
                      <td>${val(lk.linkedContact)}</td>
                      <td style="color: #64748b;">${val(lk.notes)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No supply chain links recorded.</p>'}

            <h2>Linked Case History</h2>
            ${cases.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>FIR No</th>
                    <th>Police Station</th>
                    <th>Stage</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${cases.map(c => `
                    <tr>
                      <td style="font-weight: 500;">${val(c.firNo)}</td>
                      <td>${val(c.psName)}</td>
                      <td>${val(c.stage)}</td>
                      <td>${c.caseDate ? new Date(c.caseDate).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No linked cases found in Garuda database.</p>'}

            <h2>Interrogation Sessions</h2>
            ${sessions.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Session Date / Time</th>
                    <th>Interrogating Officer</th>
                    <th>Contraband Source</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${sessions.map(s => `
                    <tr>
                      <td>${new Date(s.sessionAt).toLocaleString('en-IN')}</td>
                      <td style="font-weight: 500;">${val(s.officerName)}</td>
                      <td>${val(s.sourceInfo)}</td>
                      <td style="color: #64748b;">${val(s.notes)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size:12px;color:#64748b;margin:0 0 10px 0;">No interrogation sessions logged.</p>'}

            <div class="print-footer">
              <div>Printed on: ${new Date().toLocaleString('en-IN')}</div>
              <div>CONFIDENTIAL — FOR POLICE USE ONLY</div>
            </div>
          </body>
        </html>
      `);
      w.document.close();
      w.print();
    } catch (err) {
      console.error(err);
      setError('Failed to load profile details for printing');
    }
  };



  const downloadPdfHistorySheet = () => {
    window.open(`${api.defaults.baseURL}/offenders/${id}/history-sheet-pdf`, '_blank');
  };

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async (shouldRedirect = true, sectionName = '') => {
    setError('');
    setSectionErrors({});

    const setFormError = (msg) => {
      if (sectionName) {
        setSectionErrors(prev => ({ ...prev, [sectionName]: msg }));
        const sectionIdMap = {
          'Basic Information': 'section-basic',
          'Address Details': 'section-address',
          'Phone & Email Contacts': 'section-contacts',
          'Social Media & Messaging Profiles': 'section-social',
          'Drug Profile': 'section-drug',
          'Financial Details': 'section-financial',
          'Criminal History': 'section-criminal',
          'Supply Chain Links': 'section-links'
        };
        const targetId = sectionIdMap[sectionName];
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setError(msg);
      }
    };

    const isSection = (sec) => !sectionName || sectionName === sec;

    // Basic Information validation:
    if (isSection('Basic Information')) {
      if (!form.fullName.trim()) { setFormError('Full name is required'); return; }
      if (!form.psId) { setFormError('Police station is required'); return; }

      // Strict Aadhaar validation
      const aadhaarVal = (form.aadhaarNo || '').trim();
      if (aadhaarVal) {
        const isMasked = aadhaarVal.includes('X') || aadhaarVal.includes('x') || aadhaarVal.includes('*');
        if (isMasked) {
          const cleanMasked = aadhaarVal.replace(/[^a-zA-Z0-9*]/g, '');
          if (cleanMasked.length !== 12) {
            setFormError('Aadhaar must be exactly 12 digits');
            return;
          }
        } else {
          if (!/^\d{12}$/.test(aadhaarVal)) {
            setFormError('Aadhaar must be exactly 12 digits and contain only numbers');
            return;
          }
        }
      }

      if (!isValidText(form.fullName)) { setFormError('Full Name contains invalid special characters'); return; }
      if (!isValidText(form.alias)) { setFormError('Alias contains invalid special characters'); return; }
      if (!isValidText(form.fatherHusbandName)) { setFormError("Father/Husband's Name contains invalid special characters"); return; }
      if (form.age && !isValidNumeric(form.age)) { setFormError('Age must be a valid number'); return; }
      if (!isValidText(form.occupation)) { setFormError('Occupation contains invalid special characters'); return; }
      if (form.monthlyIncome && !isValidNumeric(form.monthlyIncome)) { setFormError('Monthly Income must be a valid number'); return; }
      if (!isValidText(form.voterId)) { setFormError('Voter ID contains invalid special characters'); return; }
      if (form.panCard && !isValidPan(form.panCard)) { setFormError('PAN Card must be exactly 10 alphanumeric characters'); return; }
    }

    // Address Details validation:
    if (isSection('Address Details')) {
      if (!isValidText(form.landmark)) { setFormError('Landmark contains invalid special characters'); return; }
      if (!isValidText(form.district)) { setFormError('District contains invalid special characters'); return; }
      if (!isValidText(form.state)) { setFormError('State contains invalid special characters'); return; }
    }

    // Contacts validation:
    if (isSection('Phone & Email Contacts')) {
      for (const c of (form.contacts || [])) {
        if (c.contactType === 'GMAIL') {
          if (c.value?.trim()) {
            if (!isValidEmail(c.value.trim())) {
              setFormError('Please enter a valid Gmail/email address');
              return;
            }
          }
        } else {
          if (c.phoneDigits?.trim()) {
            const cleanDigits = c.phoneDigits.replace(/[^0-9]/g, '');
            const countryConfig = COUNTRY_CODES.find(cc => cc.code === c.countryCode) || { length: 10 };
            if (cleanDigits.length !== countryConfig.length) {
              setFormError(`Phone number for ${c.contactType.replace('_', ' ')} must be exactly ${countryConfig.length} digits for ${c.countryCode}`);
              return;
            }
          }
        }
      }
    }

    // Social Media validation:
    if (isSection('Social Media & Messaging Profiles')) {
      for (const s of (form.socialMedia || [])) {
        if (s.value?.trim()) {
          if (!isValidUpiId(s.value.trim())) {
            setFormError(`Social media profile for ${s.contactType} contains invalid characters`);
            return;
          }
        }
      }
    }

    // Drug Profile validation:
    if (isSection('Drug Profile')) {
      if (!isValidSectionOfLaw(form.sectionOfLaw)) { setFormError('Section of Law contains invalid special characters'); return; }
    }

    // Financial validation:
    if (isSection('Financial Details')) {
      const financials = form.financials || [];
      for (const f of financials) {
        if (f.finType === 'BANK_ACCOUNT_NO' && f.value?.trim()) {
          if (!f.ifscValue?.trim()) {
            setFormError('An IFSC Code is required for the Bank Account Number.');
            return;
          }
        }
        if (f.finType === 'UPI_ID' && f.value?.trim()) {
          if (!f.upiMobileValue?.trim()) {
            setFormError('A UPI Linked Phone Number is required for the UPI ID.');
            return;
          }
        }
      }
    }

    // Criminal History validation:
    if (isSection('Criminal History')) {
      for (const ch of (form.criminalHistories || [])) {
        if (ch.previousCrNo && !isValidText(ch.previousCrNo)) { setFormError('Previous CR No contains invalid characters'); return; }
        if (ch.previousPs && !isValidText(ch.previousPs)) { setFormError('Previous PS contains invalid characters'); return; }
        if (ch.sectionsOfLaw && !isValidSectionOfLaw(ch.sectionsOfLaw)) { setFormError('Criminal History Section of Law contains invalid characters'); return; }
        if (ch.caseStage && !isValidText(ch.caseStage)) { setFormError('Case Stage contains invalid characters'); return; }
      }
    }

    // Supply Chain Links validation:
    if (isSection('Supply Chain Links')) {
      for (const l of (form.supplyChainLinks || [])) {
        if (l.linkedName && !isValidText(l.linkedName)) { setFormError('Linked person name contains invalid characters'); return; }
        if (l.linkedContact && !isValidPhone(l.linkedContact)) { setFormError('Linked person contact must contain only numbers'); return; }
      }
    }

    const financials = form.financials || [];
    const flattenedFinancials = [];
    financials.forEach(f => {
      if (f.finType === 'BANK_ACCOUNT_NO') {
        flattenedFinancials.push({
          finType: 'BANK_ACCOUNT_NO',
          value: f.value || '',
          bankName: f.bankName || '',
          notes: f.notes || ''
        });
        if (f.ifscValue?.trim()) {
          flattenedFinancials.push({
            finType: 'IFSC_CODE',
            value: f.ifscValue.trim(),
            bankName: f.bankName || '',
            notes: f.notes || ''
          });
        }
      } else if (f.finType === 'UPI_ID') {
        flattenedFinancials.push({
          finType: 'UPI_ID',
          value: f.value || '',
          bankName: f.bankName || '',
          notes: f.notes || ''
        });
        if (f.upiMobileValue?.trim()) {
          flattenedFinancials.push({
            finType: 'UPI_LINKED_MOBILE',
            value: f.upiMobileValue.trim(),
            bankName: f.bankName || '',
            notes: f.notes || ''
          });
        }
      } else {
        flattenedFinancials.push({
          finType: f.finType,
          value: f.value || '',
          bankName: f.bankName || '',
          notes: f.notes || ''
        });
      }
    });

    setSaving(true);
    try {
      const { socialMedia, ...restForm } = form;
      const combinedContacts = [
        ...(form.contacts || [])
          .filter(c => c.contactType === 'GMAIL' ? c.value?.trim() : c.phoneDigits?.trim())
          .map(c => {
            if (c.contactType === 'GMAIL') {
              return { contactType: c.contactType, value: c.value.trim(), notes: c.notes || '' };
            } else {
              const cleanDigits = c.phoneDigits.replace(/[^0-9]/g, '');
              return { contactType: c.contactType, value: `${c.countryCode}${cleanDigits}`, notes: c.notes || '' };
            }
          }),
        ...(form.socialMedia || [])
          .filter(s => s.value?.trim())
          .map(s => ({ contactType: s.contactType, value: s.value.trim(), notes: s.notes || '' }))
      ];
      let body = {};
      if (sectionName === 'Basic Information') {
        body = {
          slNo: form.slNo,
          psId: form.psId ? Number(form.psId) : null,
          fullName: form.fullName,
          alias: form.alias,
          fatherHusbandName: form.fatherHusbandName,
          age: form.age ? Number(form.age) : null,
          gender: form.gender,
          category: form.category,
          occupation: form.occupation,
          monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
          aadhaarNo: form.aadhaarNo,
          voterId: form.voterId,
          panCard: form.panCard,
          photoUrl: form.photoUrl,
          previousCrimeHistory: form.previousCrimeHistory,
          historySheetStatus: form.historySheetStatus
        };
      } else if (sectionName === 'Address Details') {
        body = {
          fullAddress: form.fullAddress,
          landmarkArea: form.landmark || form.landmarkArea,
          district: form.district,
          state: form.state
        };
      } else if (sectionName === 'Phone & Email Contacts' || sectionName === 'Social Media & Messaging Profiles') {
        body = { contacts: combinedContacts };
      } else if (sectionName === 'Drug Profile') {
        body = {
          addictionType: form.addictionType,
          consumptionFrequency: form.consumptionFrequency,
          sourceOfProcurement: form.sourceOfProcurement,
          testResult: form.testResult,
          modeOfPurchase: form.modeOfPurchase,
          usualConsumptionSpot: form.usualConsumptionSpot,
          sectionOfLaw: form.sectionOfLaw
        };
      } else if (sectionName === 'Financial Details') {
        body = { financials: flattenedFinancials };
      } else if (sectionName === 'Criminal History') {
        body = { criminalHistories: form.criminalHistories };
      } else if (sectionName === 'Supply Chain Links') {
        body = { supplyChainLinks: form.supplyChainLinks };
      } else {
        body = {
          ...restForm,
          landmarkArea: form.landmark || form.landmarkArea,
          age: form.age ? Number(form.age) : null,
          monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : null,
          psId: form.psId ? Number(form.psId) : null,
          contacts: combinedContacts,
          financials: flattenedFinancials
        };
      }
      if (isEdit) {
        const url = sectionName ? `/offenders/${id}?section=${encodeURIComponent(sectionName)}` : `/offenders/${id}`;
        const res = await api.put(url, body);
        const serverMsg = res.data?.message;
        const isPending = res.data?.data?.isPendingApproval;
        const successMsg = serverMsg || (sectionName ? `${sectionName} updated successfully!` : 'Profile updated successfully!');
        setSnackbar({ type: isPending ? 'info' : 'success', message: successMsg });
      } else {
        const res = await api.post('/offenders', body);
        const newId = res.data?.data?.id;
        setSnackbar({ type: 'success', message: 'Profile created successfully!' });
        if (newId && !shouldRedirect) {
          navigate(`/offenders/${newId}/edit`, { replace: true });
        }
      }
      if (shouldRedirect) {
        setTimeout(() => {
          navigate('/offenders');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save';
      setFormError(msg);
      setSnackbar({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  // Contact helpers
  const addContact = () => set('contacts', [...form.contacts, { contactType:'MOBILE_PRIMARY', countryCode:'+91', phoneDigits:'', notes:'' }]);
  const removeContact = (i) => set('contacts', form.contacts.filter((_, j) => j !== i));
  const updateContact = (i, key, val) => {
    const c = [...form.contacts]; c[i] = { ...c[i], [key]: val }; set('contacts', c);
  };

  // Social media helpers
  const addSocialMedia = () => set('socialMedia', [...form.socialMedia, { contactType:'WHATSAPP', value:'', notes:'' }]);
  const removeSocialMedia = (i) => set('socialMedia', form.socialMedia.filter((_, j) => j !== i));
  const updateSocialMedia = (i, key, val) => {
    const s = [...form.socialMedia]; s[i] = { ...s[i], [key]: val }; set('socialMedia', s);
  };

  // Criminal history helpers
  const addCrimHistory = () => set('criminalHistories', [...form.criminalHistories, { previousCrNo:'', previousPs:'', sectionsOfLaw:'', caseStage:'', notes:'' }]);
  const removeCrimHistory = (i) => set('criminalHistories', form.criminalHistories.filter((_, j) => j !== i));
  const updateCrimHistory = (i, key, val) => {
    const c = [...form.criminalHistories]; c[i] = { ...c[i], [key]: val }; set('criminalHistories', c);
  };

  // Supply chain helpers
  const addLink = () => set('supplyChainLinks', [...form.supplyChainLinks, { linkType:'CO_CONSUMER', linkedName:'', linkedContact:'', notes:'', linkedOffenderId:null }]);
  const removeLink = (i) => set('supplyChainLinks', form.supplyChainLinks.filter((_, j) => j !== i));
  const updateLink = (i, key, val) => {
    const c = [...form.supplyChainLinks]; c[i] = { ...c[i], [key]: val }; set('supplyChainLinks', c);
  };

  // Financial helpers
  const addFinancial = () => set('financials', [...form.financials, { finType:'BANK_ACCOUNT_NO', value:'', ifscValue:'', upiMobileValue:'', bankName:'', notes:'' }]);
  const removeFinancial = (i) => set('financials', form.financials.filter((_, j) => j !== i));
  const updateFinancial = (i, key, val) => {
    const c = [...form.financials]; c[i] = { ...c[i], [key]: val }; set('financials', c);
  };

  // Photo upload handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setCameraActive(true);
      
      // Wait for React to render and mount the video element before setting srcObject
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
    const formData = new FormData();
    formData.append('photo', file);
    setUploadingPhoto(true);
    setError('');
    try {
      const res = await api.post('/offenders/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.data?.url) {
        set('photoUrl', res.data.data.url);
      } else {
        setError('Upload succeeded but no URL was returned');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); };
  }, []);

  const inp = "w-full px-4 py-2.5 rounded-full text-sm outline-none shadow-xs";
  const sel = "w-full px-4 py-2.5 rounded-full text-sm outline-none cursor-pointer shadow-xs";

  const renderField = (label, value, children) => {
    const childId = children?.props?.id;
    return (
      <div>
        {isView ? (
          <span className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-400)' }}>{label}</span>
        ) : (
          <label htmlFor={childId} className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-400)' }}>{label}</label>
        )}
        {isView ? (
          <div className="px-4 py-2.5 rounded-full text-sm font-semibold shadow-xs" style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-700)', color: 'var(--color-garuda-100)', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
            {value || '—'}
          </div>
        ) : (
          children
        )}
      </div>
    );
  };

  const pageTitle = isNew
    ? 'Add New Profile'
    : isEdit
    ? (form.category === 'CONSUMER' ? 'Edit Consumer Profile' : 'Edit Offender Profile')
    : (form.category === 'CONSUMER' ? 'Consumer Details' : 'Offender Details');

  const quickAccessSections = [
    { id: 'section-basic', label: 'Basic Info', show: true },
    { id: 'section-address', label: 'Address Details', show: true },
    { id: 'section-contacts', label: 'Contacts', show: true },
    { id: 'section-social', label: 'Social Media', show: true },
    { id: 'section-drug', label: 'Drug Profile', show: true },
    { id: 'section-financial', label: 'Financial Details', show: true },
    { id: 'section-criminal', label: 'Criminal History', show: true },
    { id: 'section-links', label: 'Supply Chain Links', show: true },
    { id: 'section-cases', label: 'Case History', show: isEdit || isView },
    { id: 'section-interrogation', label: 'Interrogation', show: isEdit || isView },
    { id: 'section-imei', label: 'IMEI Register', show: isEdit || isView },
  ].filter(s => s.show);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      {/* Floating Sticky Action Icons */}
      <div className="flex justify-end sticky top-4 z-40 h-0 overflow-visible pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto mr-4 sm:mr-6 lg:mr-0">
          {isView && perms.hasPermission('OFFENDER_EDIT') && isSamePS && (
            <button
              onClick={() => navigate(`/offenders/${id}/edit`)}
              title="Edit Profile"
              className="p-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-500), var(--color-accent-400))' }}
            >
              <EditIcon size={18} />
            </button>
          )}
          {(isEdit || isView) && (
            <button 
              type="button" 
              onClick={printProfile} 
              title="Print Profile"
              className="p-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center text-white"
              style={{ background: '#475569' }}
            >
              <PrintIcon size={18} />
            </button>
          )}
          <button 
            onClick={() => navigate('/offenders')} 
            title="Go Back"
            className="p-2.5 rounded-xl border-none cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shadow-md flex items-center justify-center text-white"
            style={{ background: '#334155' }}
          >
            <BackIcon size={18} />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-garuda-50)' }}>
            {pageTitle}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-garuda-400)' }}>
            {isView ? 'View profile details and associated records' : 'Fill in the information across all sections'}
          </p>
        </div>
      </div>

      {isCrossPSEditRestricted && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-3.5 shadow-md">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 font-black text-xl flex items-center justify-center shrink-0 select-none">
            ⚠️
          </div>
          <div>
            <h4 className="font-bold text-sm text-amber-200">Access Restricted — Read-Only Mode</h4>
            <p className="text-xs text-amber-300/90 mt-0.5 font-medium">
              This record belongs to another police station ({stations.find(s => String(s.id) === String(form.psId))?.name || 'Other PS'}). You have <strong>Read-Only access</strong> and cannot edit records outside your assigned police station.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
          {error}
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left Form Fields */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          
          {/* Division 1: Basic Information */}
          {sectionErrors['Basic Information'] && (
            <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
              {sectionErrors['Basic Information']}
            </div>
          )}
          <div id="section-basic" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-6 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Basic Information</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Basic Information')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Photograph Side */}
            <div className="flex-shrink-0 flex flex-col items-center">
              {isView ? (
                <div className="w-48 h-48 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
                  {form.photoUrl ? (
                    <img src={form.photoUrl} alt="Subject" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 font-bold bg-slate-800">No Photo</div>
                  )}
                </div>
              ) : (
                <div className="w-full min-w-[240px] flex flex-col items-center">
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1.5 w-full text-left" style={{ color: 'var(--color-garuda-400)' }}>Subject Photograph</span>
                  <div className="flex flex-col gap-3 p-4 rounded-xl border w-full items-center justify-center" style={{ background: 'var(--color-garuda-700)', borderColor: 'var(--color-garuda-600)' }}>
                    {form.photoUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                          <img src={form.photoUrl} alt="Subject Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => set('photoUrl', '')}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs text-red-400 font-bold opacity-0 hover:opacity-100 transition-opacity cursor-pointer border-none"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-green-400">✓ Uploaded</p>
                          <p className="text-[10px] mt-1" style={{ color: 'var(--color-garuda-400)' }}>Hover image to remove</p>
                        </div>
                      </div>
                    ) : cameraActive ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-700 bg-black">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          {uploadingPhoto && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                              <span className="text-xs text-slate-300 animate-pulse">Uploading…</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 w-full">
                          <button type="button" onClick={capturePhoto} disabled={uploadingPhoto}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold border-none cursor-pointer flex items-center justify-center gap-1.5">
                            📸 Capture
                          </button>
                          <button type="button" onClick={stopCamera} disabled={uploadingPhoto}
                            className="px-4 py-2 rounded-lg text-xs font-semibold border-none cursor-pointer" style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 w-full">
                        <button type="button" onClick={startCamera} disabled={uploadingPhoto}
                          className="w-full px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all border hover:scale-[1.02] active:scale-[0.98]"
                          style={{ background: 'rgba(233,115,25,0.08)', color: '#e97319', borderColor: 'rgba(233,115,25,0.25)' }}>
                          Capture
                        </button>
                        <div className="text-center text-xs font-semibold" style={{ color: 'var(--color-garuda-400)' }}>or</div>
                        <div className="w-full">
                          <label htmlFor="photo-upload-input" className="w-full px-4 py-2.5 rounded-lg text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all border text-center hover:scale-[1.02] active:scale-[0.98]"
                            style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-100)', borderColor: 'var(--color-garuda-500)' }}>
                            Upload
                            <input 
                              id="photo-upload-input"
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileChange} 
                              disabled={uploadingPhoto}
                              className="hidden" 
                            />
                          </label>
                        </div>
                        {uploadingPhoto && <span className="text-xs animate-pulse text-center font-semibold" style={{ color: 'var(--color-garuda-400)' }}>Uploading…</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Basic fields Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderField("Serial No", form.slNo, <input id="slNo" name="slNo" className={inp} style={inputStyle} value={form.slNo} onChange={e => set('slNo', e.target.value)} />)}
              {renderField("Police Station *", stations.find(ps => String(ps.id) === String(form.psId))?.name, 
                <CustomSelect
                  value={form.psId}
                  onChange={e => set('psId', e.target.value)}
                  options={[{ value: '', label: 'Select PS' }, ...stations.map(ps => ({ value: String(ps.id), label: ps.name }))]}
                />
              )}
              {renderField("Full Name *", form.fullName, <input id="fullName" name="fullName" className={inp} style={inputStyle} value={form.fullName} onChange={e => set('fullName', e.target.value)} />)}
              {renderField("Alias", form.alias, <input id="alias" name="alias" className={inp} style={inputStyle} value={form.alias} onChange={e => set('alias', e.target.value)} />)}
              {renderField("Father/Husband Name", form.fatherHusbandName, <input id="fatherHusbandName" name="fatherHusbandName" className={inp} style={inputStyle} value={form.fatherHusbandName} onChange={e => set('fatherHusbandName', e.target.value)} />)}
              {renderField("Age", form.age, <input id="age" name="age" type="number" className={inp} style={inputStyle} value={form.age} onChange={e => set('age', e.target.value)} />)}
              {renderField("Gender", form.gender, 
                <CustomSelect
                  value={form.gender}
                  onChange={e => set('gender', e.target.value)}
                  options={[{ value: '', label: 'Select Gender' }, ...GENDERS.map(g => ({ value: g, label: g }))]}
                />
              )}
              {renderField("Category", form.category?.replace('_', ' '), 
                <CustomSelect
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  options={[{ value: '', label: 'Select Category' }, ...CATEGORIES.map(c => ({ value: c, label: c.replace(/_/g, ' ') }))]}
                />
              )}
              {renderField("Occupation", form.occupation, <input id="occupation" name="occupation" className={inp} style={inputStyle} value={form.occupation} onChange={e => set('occupation', e.target.value)} />)}
              {renderField("Monthly Income (₹)", form.monthlyIncome ? `₹${form.monthlyIncome}` : '', <input id="monthlyIncome" name="monthlyIncome" type="number" className={inp} style={inputStyle} value={form.monthlyIncome} onChange={e => set('monthlyIncome', e.target.value)} />)}
              <div>
                {isView ? (
                  <span className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-400)' }}>Aadhaar No</span>
                ) : (
                  <label htmlFor="aadhaarNo" className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-garuda-400)' }}>Aadhaar No</label>
                )}
                {isView ? (
                  <div className="flex gap-2">
                    <div className="px-3 py-2 rounded-lg text-sm font-semibold flex-1" style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-700)', color: 'var(--color-garuda-100)', minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                      {form.aadhaarNo || '—'}
                    </div>
                    {aadhaarMasked && perms.hasMinRole('CI') && (
                      <button type="button" onClick={revealAadhaar} className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-100)' }}>
                        Reveal
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input id="aadhaarNo" name="aadhaarNo" maxLength={12} className={`${inp} flex-1`} style={inputStyle} value={form.aadhaarNo} onChange={e => set('aadhaarNo', e.target.value)} readOnly={isEdit && aadhaarMasked && !aadhaarRevealed} />
                    {isEdit && aadhaarMasked && perms.hasMinRole('CI') && (
                      <button type="button" onClick={revealAadhaar} className="px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap" style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-100)' }}>
                        Reveal
                      </button>
                    )}
                  </div>
                )}
              </div>
              {renderField("Voter ID", form.voterId, <input id="voterId" name="voterId" className={inp} style={inputStyle} value={form.voterId} onChange={e => set('voterId', e.target.value)} />)}
              {renderField("PAN Card", form.panCard, <input id="panCard" name="panCard" maxLength={10} className={inp} style={inputStyle} value={form.panCard} onChange={e => set('panCard', e.target.value)} />)}
            </div>
          </div>
        </div>

        {/* Division 2: Address Details */}
        {sectionErrors['Address Details'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Address Details']}
          </div>
        )}
        <div id="section-address" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Address Details</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Address Details')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              {renderField("Full Address", form.fullAddress, <textarea id="fullAddress" name="fullAddress" rows={3} className={inp} style={inputStyle} value={form.fullAddress} onChange={e => set('fullAddress', e.target.value)} />)}
            </div>
            {renderField("Landmark", form.landmark, <input id="landmark" name="landmark" className={inp} style={inputStyle} value={form.landmark} onChange={e => set('landmark', e.target.value)} />)}
            {renderField("District", form.district, <input id="district" name="district" className={inp} style={inputStyle} value={form.district} onChange={e => set('district', e.target.value)} />)}
            {renderField("State", form.state, <input id="state" name="state" className={inp} style={inputStyle} value={form.state} onChange={e => set('state', e.target.value)} />)}
          </div>
        </div>

        {/* Division 3: Contacts */}
        {sectionErrors['Phone & Email Contacts'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Phone & Email Contacts']}
          </div>
        )}
        <div id="section-contacts" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Phone & Email Contacts</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Phone & Email Contacts')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          {isView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.contacts.map((c, i) => (
                <div key={i} className="p-3 rounded-lg border relative" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                  <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded animate-fade-in" style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}>#{i + 1}</span>
                  <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>{c.contactType?.replace('_', ' ')}</span>
                  <span className="block text-sm font-semibold mt-1 animate-fade-in" style={{ color: 'var(--color-garuda-100)' }}>
                    {c.contactType === 'GMAIL' ? (c.value || '—') : `${c.countryCode || '+91'} ${c.phoneDigits || ''}`}
                  </span>
                  {c.notes && <span className="block text-[11px] mt-0.5 animate-fade-in" style={{ color: 'var(--color-garuda-300)' }}>Note: {c.notes}</span>}
                </div>
              ))}
              {form.contacts.length === 0 && <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>No contacts added.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {form.contacts.map((c, i) => {
                const isEmail = c.contactType === 'GMAIL';
                return (
                  <div key={i} className="flex flex-col md:flex-row gap-3 items-center p-3 rounded-lg" style={{ background: 'var(--color-garuda-700)' }}>
                    <div className="flex items-center gap-2.5 w-full md:w-auto">
                      <span className="flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full" style={{ background: 'var(--color-garuda-800)', color: 'var(--color-garuda-300)' }}>{i + 1}</span>
                      <div className="w-40">
                        <CustomSelect
                          value={c.contactType}
                          onChange={e => updateContact(i, 'contactType', e.target.value)}
                          options={CORE_CONTACT_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                        />
                      </div>
                    </div>
                    {isEmail ? (
                      <input className="flex-1 px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="e.g. email@gmail.com" value={c.value || ''} onChange={e => updateContact(i, 'value', e.target.value)} />
                    ) : (
                      <div className="flex-1 flex gap-2 w-full">
                        <div className="w-28">
                          <CustomSelect
                            value={c.countryCode || '+91'}
                            onChange={e => updateContact(i, 'countryCode', e.target.value)}
                            options={COUNTRY_CODES.map(cc => ({ value: cc.code, label: cc.code }))}
                          />
                        </div>
                        <input 
                          className="flex-1 px-3 py-2.5 rounded text-sm w-full" 
                          style={inputStyle} 
                          placeholder="e.g. 9848012345" 
                          value={c.phoneDigits || ''} 
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            updateContact(i, 'phoneDigits', val);
                          }} 
                          maxLength={COUNTRY_CODES.find(cc => cc.code === (c.countryCode || '+91'))?.length || 10}
                        />
                      </div>
                    )}
                    <input className="w-full md:w-40 px-3 py-2.5 rounded text-sm" style={inputStyle} placeholder="Notes" value={c.notes||''} onChange={e => updateContact(i, 'notes', e.target.value)} />
                    <button type="button" onClick={() => removeContact(i)} className="px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] self-end md:self-start w-full md:w-auto">✕ Remove</button>
                  </div>
                );
              })}
              <button type="button" onClick={addContact} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>+ Add Contact</button>
            </div>
          )}
        </div>

        {/* Division 3.5: Social Media */}
        {sectionErrors['Social Media & Messaging Profiles'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Social Media & Messaging Profiles']}
          </div>
        )}
        <div id="section-social" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Social Media & Messaging Profiles</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Social Media & Messaging Profiles')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          {isView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.socialMedia
                .filter(s => s.value?.trim())
                .map((s, i) => (
                  <div key={i} className="p-3 rounded-lg border relative animate-fade-in" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}>#{i + 1}</span>
                    <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>{s.contactType?.replace('_', ' ')}</span>
                    <span className="block text-sm font-semibold mt-1" style={{ color: 'var(--color-garuda-100)' }}>{s.value || '—'}</span>
                    {s.notes && <span className="block text-[11px] mt-0.5" style={{ color: 'var(--color-garuda-300)' }}>Note: {s.notes}</span>}
                  </div>
                ))}
              {form.socialMedia.filter(s => s.value?.trim()).length === 0 && (
                <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>No social media profiles added.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {form.socialMedia.map((s, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-3 items-center p-3.5 rounded-lg border" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <span className="flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full animate-fade-in" style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}>{i + 1}</span>
                    <div className="w-44">
                      <CustomSelect
                        value={s.contactType}
                        onChange={e => updateSocialMedia(i, 'contactType', e.target.value)}
                        options={SOCIAL_CONTACT_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                      />
                    </div>
                  </div>
                  <input className="flex-1 px-3 py-2 rounded-lg text-sm w-full outline-none" style={inputStyle} placeholder="Username or Profile Link" value={s.value} onChange={e => updateSocialMedia(i, 'value', e.target.value)} />
                  <input className="w-full md:w-64 px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} placeholder="Notes" value={s.notes||''} onChange={e => updateSocialMedia(i, 'notes', e.target.value)} />
                  <button type="button" onClick={() => removeSocialMedia(i)} className="px-4 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1 w-full md:w-auto">✕ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addSocialMedia} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>+ Add Social Media Profile</button>
            </div>
          )}
        </div>

        {/* Division 4: Drug Profile */}
        {sectionErrors['Drug Profile'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Drug Profile']}
          </div>
        )}
        <div id="section-drug" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Drug Profile Details</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Drug Profile')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Addiction Type", form.addictionType?.replace(/_/g, ' '),
              <CustomSelect
                value={form.addictionType}
                onChange={e => set('addictionType', e.target.value)}
                options={[{ value: '', label: 'Select Addiction Type' }, ...ADDICTION_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))]}
              />
            )}
            {renderField("Consumption Frequency", form.consumptionFrequency,
              <CustomSelect
                value={form.consumptionFrequency}
                onChange={e => set('consumptionFrequency', e.target.value)}
                options={[{ value: '', label: 'Select Frequency' }, ...CONSUMPTION_FREQS.map(f => ({ value: f, label: f }))]}
              />
            )}
            {renderField("Source of Procurement", form.sourceOfProcurement?.replace(/_/g, ' '),
              <CustomSelect
                value={form.sourceOfProcurement}
                onChange={e => set('sourceOfProcurement', e.target.value)}
                options={[{ value: '', label: 'Select Source' }, ...PROCUREMENT_SOURCES.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))]}
              />
            )}
            {renderField("Test Result", form.testResult, 
              <CustomSelect
                value={form.testResult}
                onChange={e => set('testResult', e.target.value)}
                options={[{ value: '', label: 'Select Test Result' }, ...TEST_RESULTS.map(r => ({ value: r, label: r }))]}
              />
            )}
            {renderField("Mode of Purchase", form.modeOfPurchase, 
              <CustomSelect
                value={form.modeOfPurchase}
                onChange={e => set('modeOfPurchase', e.target.value)}
                options={[{ value: '', label: 'Select Mode' }, ...PURCHASE_MODES.map(m => ({ value: m, label: m }))]}
              />
            )}
            {renderField("Usual Consumption Spot", form.usualConsumptionSpot, <input id="usualConsumptionSpot" name="usualConsumptionSpot" className={inp} style={inputStyle} value={form.usualConsumptionSpot} onChange={e => set('usualConsumptionSpot', e.target.value)} />)}
            {renderField("Section of Law", form.sectionOfLaw, <input id="sectionOfLaw" name="sectionOfLaw" className={inp} style={inputStyle} value={form.sectionOfLaw} onChange={e => set('sectionOfLaw', e.target.value)} placeholder="e.g. Section 8(c) r/w 20(b)(ii)(A)" />)}
          </div>
        </div>

        {/* Division 5: Financials */}
        {sectionErrors['Financial Details'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Financial Details']}
          </div>
        )}
        <div id="section-financial" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Financial Details</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Financial Details')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          {isView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.financials.map((f, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-1" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                  <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>{f.finType?.replace(/_/g, ' ')}</span>
                  <span className="block text-sm font-semibold" style={{ color: 'var(--color-garuda-100)' }}>{f.value || '—'}</span>
                  {f.finType === 'BANK_ACCOUNT_NO' && f.ifscValue && (
                    <p className="text-xs" style={{ color: 'var(--color-garuda-200)' }}>IFSC: <span className="font-mono">{f.ifscValue}</span></p>
                  )}
                  {f.finType === 'UPI_ID' && f.upiMobileValue && (
                    <p className="text-xs" style={{ color: 'var(--color-garuda-200)' }}>Linked Phone: {f.upiMobileValue}</p>
                  )}
                  {f.bankName && <p className="text-[11px]" style={{ color: 'var(--color-garuda-200)' }}>Bank: {f.bankName}</p>}
                  {f.notes && <p className="text-[11px]" style={{ color: 'var(--color-garuda-300)' }}>Note: {f.notes}</p>}
                </div>
              ))}
              {form.financials.length === 0 && <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>No financial details added.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>Bank accounts, UPI IDs, and other financial details linked to this person.</p>
              {form.financials.map((fin, i) => (
                <div key={i} className="p-4 rounded-lg space-y-3" style={{ background: 'var(--color-garuda-700)' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-garuda-400)' }}>Entry #{i + 1}</span>
                    <button type="button" onClick={() => removeFinancial(i)} className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]">✕ Remove</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Field label="Type">
                      <CustomSelect
                        value={fin.finType}
                        onChange={e => updateFinancial(i, 'finType', e.target.value)}
                        options={FIN_TYPES}
                      />
                    </Field>
                    
                    <Field label={fin.finType === 'BANK_ACCOUNT_NO' ? 'Account Number' : fin.finType === 'UPI_ID' ? 'UPI ID' : 'Value'}>
                      <input className={inp} style={inputStyle} placeholder={fin.finType === 'UPI_ID' ? 'e.g. name@upi' : 'Enter value'} value={fin.value} onChange={e => updateFinancial(i, 'value', e.target.value)} />
                    </Field>

                    {fin.finType === 'BANK_ACCOUNT_NO' && (
                      <Field label="IFSC Code *">
                        <input className={inp} style={inputStyle} placeholder="e.g. SBIN0001234" value={fin.ifscValue || ''} onChange={e => updateFinancial(i, 'ifscValue', e.target.value)} />
                      </Field>
                    )}

                    {fin.finType === 'UPI_ID' && (
                      <Field label="UPI Linked Phone Number *">
                        <input 
                          className={inp} 
                          style={inputStyle} 
                          placeholder="e.g. 9848012345" 
                          value={fin.upiMobileValue || ''} 
                          onChange={e => updateFinancial(i, 'upiMobileValue', e.target.value.replace(/[^0-9]/g, ''))} 
                          maxLength={10}
                        />
                      </Field>
                    )}

                    <Field label="Bank Name">
                      <input className={inp} style={inputStyle} placeholder="e.g. State Bank of India" value={fin.bankName} onChange={e => updateFinancial(i, 'bankName', e.target.value)} />
                    </Field>
                    
                    <Field label="Notes">
                      <input className={inp} style={inputStyle} placeholder="Optional notes" value={fin.notes} onChange={e => updateFinancial(i, 'notes', e.target.value)} />
                    </Field>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addFinancial} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>+ Add Financial Detail</button>
            </div>
          )}
        </div>

        {/* Division 6: Criminal History */}
        {sectionErrors['Criminal History'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Criminal History']}
          </div>
        )}
        <div id="section-criminal" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Criminal History</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Criminal History')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          {isView ? (
            <div className="space-y-4">
              <div className="flex gap-6 flex-wrap">
                <div>
                  <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>Has Crime History</span>
                  <span className="block text-sm font-semibold mt-1" style={{ color: 'var(--color-garuda-100)' }}>{form.previousCrimeHistory ? 'Yes' : 'No'}</span>
                </div>
                {form.historySheetStatus && (
                  <div>
                    <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>History Sheet Status</span>
                    <span className="block text-sm font-semibold mt-1" style={{ color: 'var(--color-garuda-100)' }}>{form.historySheetStatus}</span>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b text-xs uppercase font-bold" style={{ borderColor: 'var(--color-garuda-700)', color: 'var(--color-garuda-400)' }}>
                      <th className="py-2">CR No.</th>
                      <th className="py-2">Previous PS</th>
                      <th className="py-2">Sections of Law</th>
                      <th className="py-2">Case Stage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.criminalHistories.map((ch, i) => (
                      <tr key={i} className="border-b text-sm" style={{ borderColor: 'var(--color-garuda-700)', color: 'var(--color-garuda-200)' }}>
                        <td className="py-2 font-semibold" style={{ color: 'var(--color-garuda-100)' }}>{ch.previousCrNo || '—'}</td>
                        <td className="py-2">{ch.previousPs || '—'}</td>
                        <td className="py-2">{ch.sectionsOfLaw || '—'}</td>
                        <td className="py-2">{ch.caseStage || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {form.criminalHistories.length === 0 && <p className="text-sm mt-2" style={{ color: 'var(--color-garuda-400)' }}>No criminal history records added.</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center mb-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={labelStyle}>
                  <input type="checkbox" checked={form.previousCrimeHistory} onChange={e => set('previousCrimeHistory', e.target.checked)} />
                  Previous crime history exists
                </label>
                <Field label="History Sheet Status"><input className={inp + ' w-full sm:w-48'} style={inputStyle} value={form.historySheetStatus} onChange={e => set('historySheetStatus', e.target.value)} /></Field>
              </div>
              {form.criminalHistories.map((ch, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-lg" style={{ background: 'var(--color-garuda-700)' }}>
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="CR No" value={ch.previousCrNo} onChange={e => updateCrimHistory(i, 'previousCrNo', e.target.value)} />
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="Previous PS" value={ch.previousPs} onChange={e => updateCrimHistory(i, 'previousPs', e.target.value)} />
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="Sections of Law" value={ch.sectionsOfLaw} onChange={e => updateCrimHistory(i, 'sectionsOfLaw', e.target.value)} />
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="Case Stage" value={ch.caseStage} onChange={e => updateCrimHistory(i, 'caseStage', e.target.value)} />
                  <button type="button" onClick={() => removeCrimHistory(i)} className="px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1 sm:col-span-2 md:col-span-1">✕ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addCrimHistory} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>+ Add Record</button>
            </div>
          )}
        </div>

        {/* Division 7: Supply Chain Links */}
        {sectionErrors['Supply Chain Links'] && (
          <div className="px-4 py-3 rounded-lg text-sm mb-3" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.3)' }}>
            {sectionErrors['Supply Chain Links']}
          </div>
        )}
        <div id="section-links" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
          <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Supply Chain Links</h3>
            {!isView && (
              <button 
                type="button" 
                onClick={() => handleSubmit(false, 'Supply Chain Links')} 
                className="px-4 py-1.5 rounded-full text-xs font-black text-white border-none cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Update Section
              </button>
            )}
          </div>
          {isView ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {form.supplyChainLinks.map((lk, i) => (
                <div key={i} className="p-3 rounded-lg border space-y-1" style={{ background: 'var(--color-garuda-900)', borderColor: 'var(--color-garuda-700)' }}>
                  <span className="block text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--color-garuda-400)' }}>{lk.linkType?.replace('_', ' ')}</span>
                  <span className="block text-sm font-semibold" style={{ color: 'var(--color-garuda-100)' }}>{lk.linkedName || '—'}</span>
                  {lk.linkedContact && <p className="text-[11px]" style={{ color: 'var(--color-garuda-200)' }}>Contact: {lk.linkedContact}</p>}
                  {lk.notes && <p className="text-[11px]" style={{ color: 'var(--color-garuda-300)' }}>Note: {lk.notes}</p>}
                </div>
              ))}
              {form.supplyChainLinks.length === 0 && <p className="text-sm" style={{ color: 'var(--color-garuda-400)' }}>No supply chain links added.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {form.supplyChainLinks.map((lk, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 p-3 rounded-lg" style={{ background: 'var(--color-garuda-700)' }}>
                  <CustomSelect
                    value={lk.linkType}
                    onChange={e => updateLink(i, 'linkType', e.target.value)}
                    options={LINK_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                  />
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="Name" value={lk.linkedName||''} onChange={e => updateLink(i, 'linkedName', e.target.value)} />
                  <input 
                    className="px-3 py-2.5 rounded text-sm w-full" 
                    style={inputStyle} 
                    placeholder="Contact" 
                    value={lk.linkedContact||''} 
                    onChange={e => updateLink(i, 'linkedContact', e.target.value.replace(/[^0-9]/g, ''))} 
                    maxLength={10}
                  />
                  <input className="px-3 py-2.5 rounded text-sm w-full" style={inputStyle} placeholder="Notes" value={lk.notes||''} onChange={e => updateLink(i, 'notes', e.target.value)} />
                  <button type="button" onClick={() => removeLink(i)} className="px-3 py-2.5 rounded-lg text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1 sm:col-span-2 md:col-span-1">✕ Remove</button>
                </div>
              ))}
              <button type="button" onClick={addLink} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
                style={{ background: 'var(--color-garuda-600)', color: 'var(--color-garuda-200)' }}>+ Add Link</button>
            </div>
          )}
        </div>

        {/* Division 8: Case History (Edit & View only) */}
        {(isEdit || isView) && (
          <div id="section-cases" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <div className="flex justify-between items-center mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent-400)' }}>Case History</h3>
              <button 
                type="button" 
                onClick={downloadPdfHistorySheet} 
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white border-none cursor-pointer bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download History Sheet
              </button>
            </div>
            <OffenderCaseHistory offenderId={id} isEdit={isEdit} />
          </div>
        )}

        {/* Division 9: Interrogation (Edit & View only) */}
        {(isEdit || isView) && (
          <div id="section-interrogation" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)', color: 'var(--color-accent-400)' }}>Interrogation Sessions</h3>
            <OffenderInterrogationPanel offenderId={id} />
          </div>
        )}

        {/* Division 10: IMEI Register (Edit & View only) */}
        {(isEdit || isView) && (
          <div id="section-imei" className="card rounded-xl p-6" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b" style={{ borderColor: 'var(--color-garuda-700)', color: 'var(--color-accent-400)' }}>IMEI Register</h3>
            <ImeiPanel offenderId={id} isEdit={isEdit} />
          </div>
        )}
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
          <div className="rounded-xl p-4 border space-y-2" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
            <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'var(--color-garuda-700)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-garuda-300)' }}>
                Quick Notes
              </span>
            </div>
            <textarea
              name="notes"
              value={form.notes || quickNotes || ''}
              onChange={(e) => {
                const val = e.target.value;
                setQuickNotes(val);
                setForm(prev => ({ ...prev, notes: val }));
              }}
              rows={4}
              placeholder="Type quick offender notes or remarks to save..."
              className="w-full p-2.5 rounded-lg text-xs outline-none resize-none"
              style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-600)', color: 'var(--color-garuda-100)' }}
              disabled={isView}
            />
          </div>
        </div>
      </div>

      {/* Footer Submit Button */}
      {!isView && (
        <div className="flex justify-end pt-4">
          <button onClick={handleSubmit} disabled={saving}
            className="px-8 py-3 rounded-full text-sm font-black text-slate-950 cursor-pointer transition-all whitespace-nowrap shadow-lg shadow-amber-500/25 active:scale-95 border-none"
            style={{ background: saving ? 'var(--color-garuda-600)' : 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            {saving ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      )}

      {/* Floating Status Snackbar Toast */}
      {snackbar && (
        <div 
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 scale-100 ${
            snackbar.type === 'success' 
              ? 'border-emerald-500 bg-emerald-950/90 text-emerald-100' 
              : 'border-red-500 bg-red-950/90 text-red-100'
          }`}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {snackbar.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <span className="text-sm font-semibold">{snackbar.message}</span>
          <button 
            type="button" 
            onClick={() => setSnackbar(null)} 
            className="ml-4 text-xs font-bold opacity-75 hover:opacity-100 cursor-pointer bg-transparent border-none text-current"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
