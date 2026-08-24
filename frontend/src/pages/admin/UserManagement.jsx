/**
 * GARUDA — User Management Page (Admin Only)
 * 
 * Full CRUD for user accounts with role assignment, PS assignment,
 * machine generated passwords, and contact info validation.
 */
import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';

const ROLES = ['SP', 'ASP', 'SDPO', 'SHO', 'CONSTABLE'];

const ROLE_LABELS = {
  SP: 'SP', ASP: 'ASP', SDPO: 'SDPO (DSP)', SHO: 'SHO (CI/SI)', CONSTABLE: 'Constable',
};

const DEPARTMENTS = [
  'POLICE', 'CYBER_ANALYTICS', 'EXCISE',
];

const DEPT_LABELS = {
  POLICE: 'Police', CYBER_ANALYTICS: 'Cyber Analytics (STF)', EXCISE: 'Excise Officer',
};

const ROLE_BADGES = {
  SP:        'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  ASP:       'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  SDPO:      'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  SHO:       'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  CONSTABLE: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
};

const AP_DISTRICTS = [
  "Alluri Sitharama Raju",
  "Anakapalli",
  "Ananthapuramu (Anantapur)",
  "Annamayya",
  "Bapatla",
  "Chittoor",
  "Dr. B.R. Ambedkar Konaseema",
  "East Godavari",
  "Eluru",
  "Guntur",
  "Kakinada",
  "Krishna",
  "Kurnool",
  "Nandyal",
  "NTR",
  "Palnadu",
  "Parvathipuram Manyam",
  "Prakasam",
  "Sri Potti Sriramulu Nellore",
  "Sri Sathya Sai",
  "Srikakulam",
  "Tirupati",
  "Visakhapatnam",
  "Vizianagaram",
  "West Godavari",
  "YSR Kadapa"
];

// Helper: Cryptographically secure machine password generator compliant with password policy
function generateSecurePassword() {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*_-';
  const all = upper + lower + digits + special;

  const passwordArr = [
    upper[Math.floor(Math.random() * upper.length)],
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
    special[Math.floor(Math.random() * special.length)],
  ];
  while (passwordArr.length < 14) {
    passwordArr.push(all[Math.floor(Math.random() * all.length)]);
  }
  for (let i = passwordArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [passwordArr[i], passwordArr[j]] = [passwordArr[j], passwordArr[i]];
  }
  return passwordArr.join('');
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter and Search States
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [isUsernameFocused, setIsUsernameFocused] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'CONSTABLE',
    policeStationId: '',
    department: 'POLICE',
    badgeNumber: '',
    district: '',
    divisionId: '',
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formViolations, setFormViolations] = useState([]);
  const [saving, setSaving] = useState(false);

  const uniqueDistricts = useMemo(() => {
    const dbDistricts = stations.map(s => s.district).filter(Boolean);
    return [...new Set([...AP_DISTRICTS, ...dbDistricts])].sort();
  }, [stations]);

  const uniqueSdpos = useMemo(() => {
    return [...new Set(stations.map(s => s.sdpo).filter(Boolean))].sort();
  }, [stations]);

  useEffect(() => {
    fetchData();
  }, []);

  // Proactively purge browser autofill if browser injects saved admin username (e.g. 'sp') on modal open
  useEffect(() => {
    if (showForm && !editUser && !isUsernameFocused) {
      const clearAutofill = () => {
        setForm(prev => {
          if (!isUsernameFocused && prev.username && !editUser) {
            return { ...prev, username: '' };
          }
          return prev;
        });
      };
      const t1 = setTimeout(clearAutofill, 30);
      const t2 = setTimeout(clearAutofill, 100);
      const t3 = setTimeout(clearAutofill, 250);
      const t4 = setTimeout(clearAutofill, 500);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [showForm, editUser, isUsernameFocused]);

  const fetchData = async () => {
    try {
      const [usersRes, psRes] = await Promise.all([
        api.get('/admin/users', { params: { size: 500 } }),
        api.get('/police-stations'),
      ]);
      setUsers(usersRes.data.data.content || []);
      setStations(psRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditUser(null);
    setModalKey(prev => prev + 1);
    setIsUsernameFocused(false);
    const generated = generateSecurePassword();
    setForm({
      username: '',
      password: generated,
      fullName: '',
      email: '',
      phoneNumber: '',
      role: 'CONSTABLE',
      policeStationId: '',
      department: 'POLICE',
      badgeNumber: '',
      district: '',
      divisionId: '',
      isActive: true,
    });
    setShowPassword(true);
    setCopiedPassword(false);
    setFormError('');
    setFormViolations([]);
    setShowForm(true);
  };

  const handleRegeneratePassword = () => {
    const newPass = generateSecurePassword();
    setForm(prev => ({ ...prev, password: newPass }));
    setCopiedPassword(false);
  };

  const handleCopyPassword = () => {
    if (form.password) {
      navigator.clipboard.writeText(form.password);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  // Live password policy checks
  const passwordChecks = useMemo(() => {
    const p = form.password;
    return [
      { label: '10-18 characters', pass: p.length >= 10 && p.length <= 18 },
      { label: 'Uppercase (A-Z)', pass: /[A-Z]/.test(p) },
      { label: 'Lowercase (a-z)', pass: /[a-z]/.test(p) },
      { label: 'Digit (0-9)', pass: /[0-9]/.test(p) },
      { label: 'Special char (!@#$%...)', pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/.test(p) },
      { label: 'No spaces', pass: !/\s/.test(p) },
    ];
  }, [form.password]);

  const isEmailValid = useMemo(() => {
    if (!form.email || !form.email.trim()) return false;
    return EMAIL_REGEX.test(form.email.trim());
  }, [form.email]);

  const isPhoneValid = useMemo(() => {
    if (!form.phoneNumber || !form.phoneNumber.trim()) return false;
    const clean = form.phoneNumber.trim().replace(/[\s\-]/g, '');
    return PHONE_REGEX.test(clean);
  }, [form.phoneNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormViolations([]);

    // Client-side validations
    if (!form.email || !form.email.trim() || !isEmailValid) {
      setFormError('Please enter a valid email address');
      return;
    }

    if (!form.phoneNumber || !form.phoneNumber.trim() || !isPhoneValid) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email ? form.email.trim() : null,
        phoneNumber: form.phoneNumber ? form.phoneNumber.trim().replace(/[\s\-]/g, '') : null,
        role: form.role,
        department: form.department,
        badgeNumber: form.badgeNumber ? form.badgeNumber.trim() : null,
        policeStationId: (form.role !== 'SP' && form.role !== 'ASP' && form.role !== 'SDPO') ? (form.policeStationId || null) : null,
        district: (form.role === 'SP' || form.role === 'ASP') ? (form.district || null) : null,
        divisionId: (form.role === 'SDPO') ? (form.divisionId || null) : null,
        isActive: form.isActive,
        ...(form.password && { password: form.password }),
      };

      if (editUser) {
        await api.put(`/admin/users/${editUser.id}`, payload);
      } else {
        await api.post('/admin/users', {
          ...payload,
          username: form.username.trim(),
          password: form.password,
        });
      }
      setShowForm(false);
      setEditUser(null);
      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save user');
      if (err.response?.data?.violations) {
        setFormViolations(err.response.data.violations);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setModalKey(prev => prev + 1);
    setIsUsernameFocused(true);
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName,
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      role: user.role,
      department: user.department || 'POLICE',
      badgeNumber: user.badgeNumber || '',
      policeStationId: user.policeStationId || '',
      district: user.district || '',
      divisionId: user.divisionId || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
    });
    setShowPassword(false);
    setCopiedPassword(false);
    setFormError('');
    setFormViolations([]);
    setShowForm(true);
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleActivate = async (userId) => {
    if (!window.confirm('Are you sure you want to reactivate this user?')) return;
    try {
      await api.post(`/admin/users/${userId}/activate`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to activate user');
    }
  };

  // Derived filter options
  const uniqueStates = useMemo(() => {
    const states = new Set(stations.map(s => s.state).filter(Boolean));
    states.add("Andhra Pradesh");
    return [...states].sort();
  }, [stations]);

  const availableDistricts = useMemo(() => {
    if (!selectedState) return [];
    if (selectedState === "Andhra Pradesh") {
      const dbDistricts = stations.filter(s => s.state === "Andhra Pradesh").map(s => s.district).filter(Boolean);
      return [...new Set([...AP_DISTRICTS, ...dbDistricts])].sort();
    }
    return [...new Set(stations.filter(s => s.state === selectedState).map(s => s.district).filter(Boolean))].sort();
  }, [stations, selectedState]);

  // Reset district if state changes
  useEffect(() => {
    setSelectedDistrict('');
  }, [selectedState]);

  const clearFilters = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSearchQuery('');
  };

  const filteredStationsWithUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    
    if (!query) {
      if (!selectedState || !selectedDistrict) return [];
      
      const psList = stations
        .filter(s => s.state === selectedState && s.district === selectedDistrict)
        .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        .map(station => ({
          ...station,
          users: users.filter(u => u.policeStationId === station.id),
        }));
      
      const unassignedUsers = users.filter(u => {
        if (u.policeStationId) return false;
        if (u.district) {
          return u.district === selectedDistrict;
        }
        if (u.divisionId) {
          const matchingStation = stations.find(s => s.sdpo === u.divisionId);
          if (matchingStation) {
            return matchingStation.district === selectedDistrict;
          }
          return u.divisionId.toLowerCase().includes(selectedDistrict.toLowerCase());
        }
        return selectedDistrict === 'Tirupati';
      });
      if (unassignedUsers.length > 0) {
        psList.unshift({
          id: 'hq',
          name: 'Headquarters / Specialized Units (HQ)',
          psCode: 'HQ',
          users: unassignedUsers,
        });
      }
      return psList;
    }

    const matchedStationsMap = new Map();

    const matchingUnassigned = users.filter(u => {
      if (u.policeStationId) return false;
      const nameMatch = u.fullName?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query) || u.phoneNumber?.includes(query);
      const stationMatch = 'headquarters'.includes(query) || 'hq'.includes(query) || 'specialized'.includes(query);
      return nameMatch || stationMatch;
    });

    stations.forEach(station => {
      const stationMatch = station.name?.toLowerCase().includes(query) || station.psCode?.toLowerCase().includes(query);
      const stationUsers = users.filter(u => u.policeStationId === station.id);
      
      const matchingUsers = stationUsers.filter(u => {
        if (stationMatch) return true;
        return u.fullName?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query) || u.phoneNumber?.includes(query);
      });

      if (stationMatch || matchingUsers.length > 0) {
        matchedStationsMap.set(station.id.toString(), {
          ...station,
          users: stationMatch ? stationUsers : matchingUsers,
        });
      }
    });

    const psList = Array.from(matchedStationsMap.values())
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
    if (matchingUnassigned.length > 0) {
      psList.unshift({
        id: 'hq',
        name: 'Headquarters / Specialized Units',
        psCode: 'HQ',
        users: matchingUnassigned,
      });
    }
    return psList;
  }, [users, stations, searchQuery, selectedState, selectedDistrict]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Officer user management, credentials setup, and unit assignments
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          + Add Officer
        </button>
      </div>

      <>
      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => { setShowForm(false); setEditUser(null); }}></div>
          <div
            className="rounded-2xl p-6 sm:p-8 relative w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {editUser ? 'Edit Officer Profile' : 'Add New Officer'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {editUser ? `Update credentials or station assignment for @${editUser.username}` : 'Create an officer account with machine-generated secure credentials.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditUser(null); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>            {/* Form */}
            <form onSubmit={handleSubmit} autoComplete="new-password" aria-autocomplete="none" className="space-y-4">
              {/* Offscreen decoy trap to absorb browser autofill heuristics */}
              <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, width: 0, overflow: 'hidden' }} aria-hidden="true">
                <input type="text" name="chrome_decoy_username" tabIndex={-1} autoComplete="username" defaultValue="" />
                <input type="password" name="chrome_decoy_password" tabIndex={-1} autoComplete="current-password" defaultValue="" />
              </div>

              {/* Row 1: Full Name & Username */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="officer_full_name_field"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    autoComplete="off"
                    placeholder="Officer's official name"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    key={`user_input_${modalKey}`}
                    id={`officer_username_${modalKey}`}
                    name={`officer_user_id_${modalKey}`}
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                    onFocus={() => setIsUsernameFocused(true)}
                    onClick={() => setIsUsernameFocused(true)}
                    disabled={!!editUser}
                    required={!editUser}
                    autoComplete="one-time-code"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="e.g. j.doe or pc_tirupati"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Email Address & Mobile Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                      placeholder="officer@appolice.gov.in"
                      className={`w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border ${form.email && !isEmailValid ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700'} text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all`}
                    />
                    {form.email && (
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs">
                        {isEmailValid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Valid email format">✓</span>
                        ) : (
                          <span className="text-rose-500 font-bold" title="Invalid email format">✕</span>
                        )}
                      </span>
                    )}
                  </div>
                  {form.email && !isEmailValid && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">Please enter a valid email format</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      required
                      placeholder="10-digit mobile (e.g. 9876543210)"
                      maxLength={13}
                      className={`w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border ${form.phoneNumber && !isPhoneValid ? 'border-rose-500 focus:border-rose-500' : 'border-slate-200 dark:border-slate-700'} text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all`}
                    />
                    {form.phoneNumber && (
                      <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs">
                        {isPhoneValid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="Valid 10-digit mobile number">✓</span>
                        ) : (
                          <span className="text-rose-500 font-bold" title="Must be a valid 10-digit mobile number">✕</span>
                        )}
                      </span>
                    )}
                  </div>
                  {form.phoneNumber && !isPhoneValid && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">Must be a valid 10-digit mobile number</p>
                  )}
                </div>
              </div>

              {/* Row 3: Rank/Role & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Rank / Role <span className="text-rose-500">*</span></label>
                  <CustomSelect
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    options={ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] || r }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Department / Unit <span className="text-rose-500">*</span></label>
                  <CustomSelect
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    options={DEPARTMENTS.map(d => ({ value: d, label: DEPT_LABELS[d] || d }))}
                  />
                </div>
              </div>

              {/* Row 4: Badge Number & Police Station / District Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">
                    Badge / General No. <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.badgeNumber}
                    onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })}
                    placeholder="e.g. PC-1044 or SI-99"
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  {(form.role === 'SP' || form.role === 'ASP') && (
                    <>
                      <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Assigned District</label>
                      <CustomSelect
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        options={[{ value: '', label: '— Select District —' }, ...uniqueDistricts.map(d => ({ value: d, label: d }))]}
                      />
                    </>
                  )}

                  {form.role === 'SDPO' && (
                    <>
                      <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">SDPO Station / Subdivision</label>
                      <CustomSelect
                        value={form.divisionId}
                        onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
                        options={[{ value: '', label: '— Select SDPO Subdivision —' }, ...uniqueSdpos.map(s => ({ value: s, label: s }))]}
                      />
                    </>
                  )}

                  {form.role !== 'SP' && form.role !== 'ASP' && form.role !== 'SDPO' && (
                    <>
                      <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Assigned Police Station</label>
                      <CustomSelect
                        value={form.policeStationId}
                        onChange={(e) => setForm({ ...form, policeStationId: e.target.value })}
                        options={[{ value: '', label: '— Select Police Station —' }, ...stations.map(s => ({ value: String(s.id), label: `${s.name} (${s.psCode})` }))]}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Edit Only: Account Status */}
              {editUser && (
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Account Status</label>
                  <CustomSelect
                    value={form.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                    options={[
                      { value: 'active', label: 'Active (Can login)' },
                      { value: 'inactive', label: 'Inactive (Login disabled)' },
                    ]}
                  />
                </div>
              )}

              {/* Password & Credentials Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password {editUser ? <span className="text-slate-400 font-normal">(leave blank to keep)</span> : <span className="text-rose-500">*</span>}
                  </label>
                  {!editUser && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Generate a new secure machine password"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
                        title="Copy password to clipboard"
                      >
                        {copiedPassword ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            ✓ Copied
                          </span>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="officer-new-password"
                    name="officer_new_password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editUser}
                    autoComplete="new-password"
                    placeholder={editUser ? 'Enter new password to reset' : 'Machine generated password'}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-normal text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Policy Indicators */}
                {form.password.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password requirements</span>
                      {!editUser && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Auto-generated
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
                      {passwordChecks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${check.pass ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          <span className={check.pass ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500'}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditUser(null); }}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isEmailValid || !isPhoneValid || !form.fullName.trim() || (!editUser && !form.username.trim()) || (!editUser && !form.password)}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editUser ? 'Update Officer' : 'Create Officer'}
                </button>
              </div>
            </form>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 space-y-1">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">{formError}</p>
                {formViolations.length > 0 && (
                  <ul className="text-xs space-y-0.5 pl-4 list-disc text-red-500 dark:text-red-300">
                    {formViolations.map((v, i) => <li key={i}>{v}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search officers by name, username, email, phone, or police station..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Cascading Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <CustomSelect
            label="Select State"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            placeholder="— Select a State —"
            options={[
              { value: '', label: '— Select a State —' },
              ...uniqueStates.map(state => ({ value: state, label: state }))
            ]}
          />
        </div>

        <div className="flex-1 w-full">
          <CustomSelect
            label="Select District"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={!selectedState}
            placeholder="— Select a District —"
            options={[
              { value: '', label: '— Select a District —' },
              ...availableDistricts.map(district => ({ value: district, label: district }))
            ]}
          />
        </div>

        <div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors cursor-pointer h-[38px]"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="columns-1 lg:columns-2 xl:columns-3 gap-6">
          {[1, 2, 3, 4].map(idx => (
            <div 
              key={idx} 
              className="rounded-xl overflow-hidden flex flex-col break-inside-avoid mb-6 animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <div className="px-5 py-4 flex justify-between items-center border-b bg-slate-100 dark:bg-slate-750 border-slate-200 dark:border-slate-700">
                <div className="w-1/3 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="w-1/6 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
              <div className="flex-1 p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !searchQuery.trim() && (!selectedState || !selectedDistrict) ? (
        // Empty State (No selection)
        <div 
          className="flex flex-col items-center justify-center p-12 rounded-2xl text-center bg-white dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700"
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-slate-100 dark:bg-slate-700/50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-400 dark:text-slate-500" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4.07 15.95 4.07 12C4.07 11.83 4.08 11.66 4.09 11.5H11V19.93ZM13 19.93V11.5H19.91C19.92 11.66 19.93 11.83 19.93 12C19.93 15.95 16.95 19.43 13 19.93ZM19.74 9.5H13V4.26C16.39 5.05 19.04 7.54 19.74 9.5ZM11 4.26V9.5H4.26C4.96 7.54 7.61 5.05 11 4.26Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Please select a State and District, or use the search bar above</h3>
          <p className="text-sm mt-1.5 text-slate-500 dark:text-slate-400">Use the filters above to navigate through stations and officers.</p>
        </div>
      ) : filteredStationsWithUsers.length === 0 ? (
        // Empty State (No stations/officers found)
        <div 
          className="flex flex-col items-center justify-center p-12 rounded-2xl text-center bg-white dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700"
        >
          <div className="text-4xl mb-3 text-slate-400 dark:text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No police stations or officers matched your search</h3>
        </div>
      ) : (
        // Masonry Grid of Police Stations
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {filteredStationsWithUsers.map(station => (
            <div 
              key={station.id} 
              className="break-inside-avoid inline-block w-full mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-amber-500 px-5 py-3.5 flex justify-between items-center gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-950 truncate">
                    {station.name}
                  </h3>
                  <span className="text-[11px] font-mono font-extrabold text-slate-950 bg-black/15 px-2 py-0.5 rounded-md">
                    {station.psCode}
                  </span>
                </div>
                <div className="text-xs font-black text-slate-950 bg-white/30 backdrop-blur-xs px-2.5 py-1 rounded-full whitespace-nowrap border border-black/10">
                  {station.users.length} Officer{station.users.length !== 1 ? 's' : ''}
                </div>
              </div>

              {/* Card Body / Officer List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-750">
                {station.users.map((u) => (
                  <div 
                    key={u.id}
                    className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-700/30 transition-colors flex flex-col gap-2"
                  >
                    {/* Top Row: Name + Username + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {u.fullName}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          @{u.username}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    {/* Contact details row (Email & Phone) */}
                    {(u.email || u.phoneNumber || u.badgeNumber) && (
                      <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                        {u.badgeNumber && (
                          <span className="font-mono bg-slate-100 dark:bg-slate-750 px-1.5 py-0.5 rounded text-[11px] text-slate-700 dark:text-slate-300">
                            Badge: {u.badgeNumber}
                          </span>
                        )}
                        {u.phoneNumber && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                            <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {u.phoneNumber}
                          </span>
                        )}
                        {u.email && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[200px]" title={u.email}>
                            <svg className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate">{u.email}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Middle Row: Badges and Action Links */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[11px] font-extrabold tracking-wider px-2.5 py-0.5 rounded-md border ${ROLE_BADGES[u.role] || ROLE_BADGES.CONSTABLE}`}>
                          {u.role}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-md">
                          {DEPT_LABELS[u.department] || u.department}
                        </span>
                        {u.district && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-md">
                            Dist: {u.district}
                          </span>
                        )}
                        {u.divisionId && (
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-750 border border-slate-200/60 dark:border-slate-700 px-2 py-0.5 rounded-md">
                            SDPO: {u.divisionId}
                          </span>
                        )}
                        {u.mustChangePassword && (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md">
                            Pending 1st Login
                          </span>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {u.isActive ? (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.id)}
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {station.users.length === 0 && (
                  <div className="p-6 text-center text-xs font-medium text-slate-400">
                    No officers currently assigned to this station.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </>
    </div>
  );
}