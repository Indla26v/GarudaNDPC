import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../../api/axios';
import { usePermissions } from '../../../hooks/usePermissions';

export function useOffenderForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const perms = usePermissions();

  const isEdit = location.pathname.endsWith('/edit');
  const isNew = location.pathname.endsWith('/new') || (!id && !isEdit);
  const isView = !isEdit && !isNew && !!id;

  const [aadhaarRevealed, setAadhaarRevealed] = useState(false);
  const [stations, setStations] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    slNo: '', psId: '', fullName: '', alias: '', fatherHusbandName: '',
    age: '', gender: '', category: '',
    fullAddress: '', landmark: '', district: '', state: '',
    occupation: '', monthlyIncome: '',
    addictionType: '', consumptionFrequency: '', sourceOfProcurement: '',
    testResult: '', modeOfPurchase: '', usualConsumptionSpot: '', sectionOfLaw: '',
    aadhaarNo: '', voterId: '', panCard: '', photoUrl: '',
    previousCrimeHistory: false, historySheetStatus: '',
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

  const fetchStations = useCallback(async () => {
    try {
      const r = await api.get('/police-stations');
      setStations(r.data.data || []);
    } catch {}
  }, []);

  const fetchOffender = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api.get(`/offenders/${id}`);
      const d = r.data.data;
      setForm({
        slNo: d.slNo || '', psId: d.psId || '', fullName: d.fullName || '',
        alias: d.alias || '', fatherHusbandName: d.fatherHusbandName || '',
        age: d.age || '', gender: d.gender || '', category: d.category || '',
        fullAddress: d.fullAddress || '', landmark: d.landmark || '',
        district: d.district || '', state: d.state || '',
        occupation: d.occupation || '', monthlyIncome: d.monthlyIncome || '',
        addictionType: d.addictionType || '', consumptionFrequency: d.consumptionFrequency || '',
        sourceOfProcurement: d.sourceOfProcurement || '', testResult: d.testResult || '',
        modeOfPurchase: d.modeOfPurchase || '', usualConsumptionSpot: d.usualConsumptionSpot || '',
        sectionOfLaw: d.sectionOfLaw || '', aadhaarNo: d.aadhaarNo || '',
        voterId: d.voterId || '', panCard: d.panCard || '', photoUrl: d.photoUrl || '',
        previousCrimeHistory: d.previousCrimeHistory || false,
        historySheetStatus: d.historySheetStatus || '',
        contacts: d.contacts || [],
        socialMedia: d.socialMedia || [],
        financials: d.financials || [],
        criminalHistories: d.criminalHistories || [],
        supplyChainLinks: d.supplyChainLinks || [],
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load offender');
    }
  }, [id]);

  useEffect(() => {
    fetchStations();
    if (isEdit || isView) fetchOffender();
  }, [id, isEdit, isView, fetchStations, fetchOffender]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return {
    id, isEdit, isNew, isView, perms,
    form, setForm, handleChange,
    stations, saving, setSaving,
    error, setError, snackbar, setSnackbar,
    uploadingPhoto, setUploadingPhoto,
    aadhaarRevealed, setAadhaarRevealed,
    navigate,
  };
}
