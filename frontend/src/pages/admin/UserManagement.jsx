/**
 * GARUDA — User Management Page (Admin Only)
 * 
 * Full CRUD for user accounts with role assignment and PS assignment.
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
  const [form, setForm] = useState({ username: '', password: '', fullName: '', role: 'CONSTABLE', policeStationId: '', department: 'POLICE', badgeNumber: '', district: '', divisionId: '' });
  const [formError, setFormError] = useState('');
  const [formViolations, setFormViolations] = useState([]);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('users');
  const [settings, setSettings] = useState({
    CHARGE_SHEET_DUE_DAYS_COMMERCIAL: '180',
    CHARGE_SHEET_DUE_DAYS_NON_COMMERCIAL: '60',
    ABSCONDER_ALERT_THRESHOLD_DAYS: '30',
    COURT_HEARING_REMINDER_DAYS: '1'
  });
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchSettingsAndHealth = async () => {
    setHealthLoading(true);
    try {
      const [settingsRes, healthRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/system-health')
      ]);
      if (settingsRes.data.data) setSettings(settingsRes.data.data);
      if (healthRes.data.data) setHealth(healthRes.data.data);
    } catch (err) {
      console.error('Failed to fetch settings/health:', err);
    } finally {
      setHealthLoading(false);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/settings', settings);
      alert('Threshold settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    }
  };

  useEffect(() => {
    if (activeTab === 'health') {
      fetchSettingsAndHealth();
    }
  }, [activeTab]);

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

  const fetchData = async () => {
    try {
      const [usersRes, psRes] = await Promise.all([
        api.get('/admin/users?size=500'), // Ensure we fetch enough or all
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormViolations([]);
    setSaving(true);
    try {
      const payload = {
        fullName: form.fullName,
        role: form.role,
        department: form.department,
        badgeNumber: form.badgeNumber || null,
        policeStationId: (form.role !== 'SP' && form.role !== 'ASP' && form.role !== 'SDPO') ? (form.policeStationId || null) : null,
        district: (form.role === 'SP' || form.role === 'ASP') ? (form.district || null) : null,
        divisionId: (form.role === 'SDPO') ? (form.divisionId || null) : null,
        ...(form.password && { password: form.password }),
      };
      if (editUser) {
        await api.put(`/admin/users/${editUser.id}`, payload);
      } else {
        await api.post('/admin/users', {
          ...payload,
          username: form.username,
          password: form.password,
        });
      }
      setShowForm(false);
      setEditUser(null);
      setForm({ username: '', password: '', fullName: '', role: 'CONSTABLE', policeStationId: '', department: 'POLICE', badgeNumber: '', district: '', divisionId: '' });
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
    setForm({
      username: user.username,
      password: '',
      fullName: user.fullName,
      role: user.role,
      department: user.department || 'POLICE',
      badgeNumber: user.badgeNumber || '',
      policeStationId: user.policeStationId || '',
      district: user.district || '',
      divisionId: user.divisionId || '',
    });
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
      const nameMatch = u.fullName?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query);
      const stationMatch = 'headquarters'.includes(query) || 'hq'.includes(query) || 'specialized'.includes(query);
      return nameMatch || stationMatch;
    });

    stations.forEach(station => {
      const stationMatch = station.name?.toLowerCase().includes(query) || station.psCode?.toLowerCase().includes(query);
      const stationUsers = users.filter(u => u.policeStationId === station.id);
      
      const matchingUsers = stationUsers.filter(u => {
        if (stationMatch) return true;
        return u.fullName?.toLowerCase().includes(query) || u.username?.toLowerCase().includes(query);
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            System Administration
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            User management and system configurations
          </p>
        </div>
        <button
          onClick={() => { setEditUser(null); setForm({ username: '', password: '', fullName: '', role: 'CONSTABLE', policeStationId: '', department: 'POLICE', badgeNumber: '', district: '', divisionId: '' }); setShowForm(true); }}
          className="px-4 py-2 text-xs font-extrabold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          + Add Officer
        </button>
      </div>

      <>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => { setShowForm(false); setEditUser(null); }}></div>
          <div
            className="rounded-xl p-6 relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-garuda-100)' }}>
              {editUser ? 'Edit Officer' : 'Add New Officer'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  disabled={!!editUser}
                  required={!editUser}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>
                  Password {editUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editUser}
                  className="input w-full"
                />
                {/* Password Policy Indicators */}
                {form.password.length > 0 && (
                  <div className="mt-2 p-2.5 rounded-lg space-y-0.5" style={{ background: 'var(--color-garuda-900)', border: '1px solid var(--color-garuda-700)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-garuda-500)' }}>Password Policy</p>
                    {[
                      { label: '10-18 characters', pass: form.password.length >= 10 && form.password.length <= 18 },
                      { label: 'Uppercase (A-Z)', pass: /[A-Z]/.test(form.password) },
                      { label: 'Lowercase (a-z)', pass: /[a-z]/.test(form.password) },
                      { label: 'Digit (0-9)', pass: /[0-9]/.test(form.password) },
                      { label: 'Special char (!@#$%...)', pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/.test(form.password) },
                      { label: 'No spaces', pass: !/\s/.test(form.password) },
                    ].map((check, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px]">
                        <span style={{ color: check.pass ? '#22c55e' : '#f87171' }}>{check.pass ? '✓' : '✕'}</span>
                        <span style={{ color: check.pass ? '#86efac' : 'var(--color-garuda-400)' }}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Full Name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                  className="input w-full"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Role</label>
                <CustomSelect
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  options={ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] || r }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Department</label>
                <CustomSelect
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  options={DEPARTMENTS.map(d => ({ value: d, label: DEPT_LABELS[d] || d }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Badge Number</label>
                <input
                  type="text"
                  value={form.badgeNumber}
                  onChange={(e) => setForm({ ...form, badgeNumber: e.target.value })}
                  placeholder="Optional"
                  className="input w-full"
                />
              </div>
              {(form.role === 'SP' || form.role === 'ASP') && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>District</label>
                  <CustomSelect
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    options={[{ value: '', label: '— Select District —' }, ...uniqueDistricts.map(d => ({ value: d, label: d }))]}
                  />
                </div>
              )}
              {form.role === 'SDPO' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>SDPO Station / Subdivision</label>
                  <CustomSelect
                    value={form.divisionId}
                    onChange={(e) => setForm({ ...form, divisionId: e.target.value })}
                    options={[{ value: '', label: '— Select SDPO Subdivision —' }, ...uniqueSdpos.map(s => ({ value: s, label: s }))]}
                  />
                </div>
              )}
              {form.role !== 'SP' && form.role !== 'ASP' && form.role !== 'SDPO' && (
                <div className="md:col-span-2">
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-garuda-300)' }}>Police Station</label>
                  <CustomSelect
                    value={form.policeStationId}
                    onChange={(e) => setForm({ ...form, policeStationId: e.target.value })}
                    options={[{ value: '', label: '— Select Police Station —' }, ...stations.map(s => ({ value: String(s.id), label: `${s.name} (${s.psCode})` }))]}
                  />
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditUser(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
                  style={{ background: 'var(--color-garuda-700)', color: 'var(--color-garuda-300)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--color-accent-500)', color: '#fff' }}
                >
                  {saving ? 'Saving...' : editUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
            {formError && (
              <div className="mt-3 space-y-1">
                <p className="text-sm" style={{ color: '#f87171' }}>{formError}</p>
                {formViolations.length > 0 && (
                  <ul className="text-xs space-y-0.5 pl-4" style={{ color: '#fca5a5' }}>
                    {formViolations.map((v, i) => <li key={i} className="list-disc">{v}</li>)}
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
            placeholder="Search officers by name, username, or police station (name/code)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
              className="rounded-xl overflow-hidden flex flex-col break-inside-avoid mb-6 animate-pulse"
              style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}
            >
              <div className="px-5 py-4 flex justify-between items-center border-b" style={{ background: 'var(--color-garuda-600)', borderColor: 'var(--color-garuda-700)' }}>
                <div className="w-1/3 h-5 bg-slate-700 rounded"></div>
                <div className="w-1/6 h-5 bg-slate-700 rounded"></div>
              </div>
              <div className="flex-1 p-5 space-y-3">
                <div className="h-4 bg-slate-700/60 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700/60 rounded w-1/2"></div>
                <div className="h-4 bg-slate-700/60 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !searchQuery.trim() && (!selectedState || !selectedDistrict) ? (
        // Empty State (No selection)
        <div 
          className="flex flex-col items-center justify-center p-12 rounded-xl text-center"
          style={{ background: 'var(--color-garuda-800)', border: '1px dashed var(--color-garuda-700)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'var(--color-garuda-600)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4.07 15.95 4.07 12C4.07 11.83 4.08 11.66 4.09 11.5H11V19.93ZM13 19.93V11.5H19.91C19.92 11.66 19.93 11.83 19.93 12C19.93 15.95 16.95 19.43 13 19.93ZM19.74 9.5H13V4.26C16.39 5.05 19.04 7.54 19.74 9.5ZM11 4.26V9.5H4.26C4.96 7.54 7.61 5.05 11 4.26Z" fill="var(--color-garuda-400)"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--color-garuda-200)' }}>Please select a State and District, or use the search bar above</h3>
          <p className="text-sm mt-2" style={{ color: 'var(--color-garuda-400)' }}>Use the filters above to navigate through locations.</p>
        </div>
      ) : filteredStationsWithUsers.length === 0 ? (
        // Empty State (No stations/officers found)
        <div 
          className="flex flex-col items-center justify-center p-12 rounded-xl text-center"
          style={{ background: 'var(--color-garuda-800)', border: '1px dashed var(--color-garuda-600)' }}
        >
          <div className="text-4xl mb-3" style={{ color: 'var(--color-garuda-400)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--color-garuda-200)' }}>No police stations or officers matched your search</h3>
        </div>
      ) : (
        // Masonry Grid of Police Stations (No empty vertical gaps)
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {filteredStationsWithUsers.map(station => (
            <div 
              key={station.id} 
              className="break-inside-avoid inline-block w-full mb-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all overflow-hidden flex flex-col"
            >
              {/* Card Header (Full Orange Banner Bar) */}
              <div className="bg-amber-500 px-5 py-3.5 flex justify-between items-center gap-3">
                <div className="min-w-0 flex items-center gap-2">
                  <h3 className="text-sm font-black text-white truncate">
                    {station.name}
                  </h3>
                  <span className="text-[11px] font-mono font-extrabold text-white/90 bg-black/20 px-2 py-0.5 rounded-md">
                    {station.psCode}
                  </span>
                </div>
                <div className="text-xs font-black text-white bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full whitespace-nowrap border border-white/30">
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

                      {/* Minimal Dot Status */}
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{u.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    {/* Middle Row: Unified Monochromatic Badges */}
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
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        {u.isActive && (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                          >
                            Deactivate
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
      )
    }
    </>
</div>
  );
}