/**
 * GARUDA NDPS — User & Position Management
 * 
 * Position-based access control with personnel directory, transfer management,
 * 60-day security expiry tracking, and complete audit history.
 */
import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';

const ROLES = ['SP', 'ASP', 'SDPO', 'SHO', 'CONSTABLE'];

const ROLE_LABELS = {
  SP: 'SP',
  ASP: 'ASP',
  SDPO: 'SDPO (DSP)',
  SHO: 'SHO (CI/SI)',
  CONSTABLE: 'Constable',
};

const OFFICER_RANKS = [
  'SP',
  'ASP',
  'DSP',
  'CI',
  'SI',
  'ASI',
  'HC',
  'PC',
];

const DEPARTMENTS = ['POLICE', 'CYBER_ANALYTICS', 'EXCISE'];

const DEPT_LABELS = {
  POLICE: 'Police',
  CYBER_ANALYTICS: 'Cyber Analytics (STF)',
  EXCISE: 'Excise Officer',
};

const ROLE_BADGES = {
  SP:        'text-purple-600 dark:text-purple-400 font-extrabold border border-purple-300/60 dark:border-purple-800/60',
  ASP:       'text-indigo-600 dark:text-indigo-400 font-extrabold border border-indigo-300/60 dark:border-indigo-800/60',
  SDPO:      'text-blue-600 dark:text-blue-400 font-extrabold border border-blue-300/60 dark:border-blue-800/60',
  SHO:       'text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-300/60 dark:border-emerald-800/60',
  CONSTABLE: 'text-slate-600 dark:text-slate-400 font-bold border border-slate-300/60 dark:border-slate-700/60',
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

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('positions'); // 'positions' | 'officers'
  const [users, setUsers] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // Modals
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [editPosition, setEditPosition] = useState(null);
  const [positionForm, setPositionForm] = useState({
    username: '',
    password: '',
    positionLabel: '',
    email: '',
    phoneNumber: '',
    role: 'CONSTABLE',
    policeStationId: '',
    district: '',
    divisionId: '',
    department: 'POLICE',
    isActive: true,
  });

  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [editOfficer, setEditOfficer] = useState(null);
  const [officerForm, setOfficerForm] = useState({
    fullName: '',
    badgeNumber: '',
    rank: 'PC',
    isActive: true,
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTargetPosition, setAssignTargetPosition] = useState(null);
  const [assignForm, setAssignForm] = useState({
    officerId: '',
    transferOrderNo: '',
    notes: '',
  });

  const [showRelieveModal, setShowRelieveModal] = useState(false);
  const [relieveTargetPosition, setRelieveTargetPosition] = useState(null);
  const [relieveNotes, setRelieveNotes] = useState('');

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [selectedPositionDetail, setSelectedPositionDetail] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes, psRes] = await Promise.all([
        api.get('/admin/users?size=500'),
        api.get('/admin/officers?size=500'),
        api.get('/police-stations'),
      ]);

      const uData = uRes.data?.data?.content || uRes.data?.data || [];
      const oData = oRes.data?.data?.content || oRes.data?.data || [];
      const psData = psRes.data?.data?.content || psRes.data?.data || [];

      setUsers(Array.isArray(uData) ? uData : []);
      setOfficers(Array.isArray(oData) ? oData : []);
      setStations(Array.isArray(psData) ? psData : []);
    } catch (err) {
      console.error('Failed to fetch user management data:', err);
      setUsers([]);
      setOfficers([]);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uniqueDistricts = useMemo(() => {
    if (!Array.isArray(stations)) return [...AP_DISTRICTS].sort();
    const dbDistricts = stations.map(s => s?.district).filter(Boolean);
    return [...new Set([...AP_DISTRICTS, ...dbDistricts])].sort();
  }, [stations]);

  const uniqueSdpos = useMemo(() => {
    if (!Array.isArray(stations)) return [];
    return [...new Set(stations.map(s => s?.sdpo).filter(Boolean))].sort();
  }, [stations]);

  // Filtered Positions
  const filteredPositions = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter(u => {
      if (!u) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.positionLabel && u.positionLabel.toLowerCase().includes(q)) ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.officerName && u.officerName.toLowerCase().includes(q)) ||
        (u.badgeNumber && u.badgeNumber.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q));

      const matchesRole = !selectedRole || u.role === selectedRole;
      const matchesDistrict = !selectedDistrict || u.district === selectedDistrict ||
        (Array.isArray(stations) && stations.find(s => String(s?.id) === String(u.policeStationId))?.district === selectedDistrict);

      return matchesSearch && matchesRole && matchesDistrict;
    });
  }, [users, searchQuery, selectedRole, selectedDistrict, stations]);

  // PS-Wise Grouped Positions for Card Layout
  const groupedByStation = useMemo(() => {
    if (!Array.isArray(filteredPositions)) return [];

    const stationMap = new Map();
    // Initialize map with all available stations
    (stations || []).forEach(st => {
      if (!st) return;
      stationMap.set(String(st.id), {
        id: String(st.id),
        name: st.name,
        district: st.district,
        sdpo: st.sdpo,
        code: st.code,
        positions: [],
      });
    });

    const hqGroup = {
      id: 'hq-leadership',
      name: 'District Leadership & Special Units (HQ / STF / Excise)',
      district: 'District HQ',
      sdpo: 'Headquarters',
      isHQ: true,
      positions: [],
    };

    filteredPositions.forEach(pos => {
      if (pos.policeStationId && stationMap.has(String(pos.policeStationId))) {
        stationMap.get(String(pos.policeStationId)).positions.push(pos);
      } else {
        hqGroup.positions.push(pos);
      }
    });

    const result = [];
    if (hqGroup.positions.length > 0) {
      result.push(hqGroup);
    }

    Array.from(stationMap.values()).forEach(group => {
      if (group.positions.length > 0) {
        // Sort positions within station: SHO first, then Constables by label/username
        group.positions.sort((a, b) => {
          if (a.role === 'SHO' && b.role !== 'SHO') return -1;
          if (b.role === 'SHO' && a.role !== 'SHO') return 1;
          return (a.positionLabel || a.username || '').localeCompare(b.positionLabel || b.username || '');
        });
        result.push(group);
      }
    });

    return result;
  }, [filteredPositions, stations]);

  // Filtered Officers
  const filteredOfficers = useMemo(() => {
    if (!Array.isArray(officers)) return [];
    return officers.filter(o => {
      if (!o) return false;
      const q = (searchQuery || '').toLowerCase().trim();
      const posLabel = o.currentPosition?.positionLabel || o.currentPosition?.username || '';
      const matchesSearch = !q ||
        (o.fullName && o.fullName.toLowerCase().includes(q)) ||
        (o.badgeNumber && o.badgeNumber.toLowerCase().includes(q)) ||
        (o.rank && o.rank.toLowerCase().includes(q)) ||
        (posLabel && posLabel.toLowerCase().includes(q));

      const matchesRank = !selectedRole || o.rank === selectedRole;
      return matchesSearch && matchesRank;
    });
  }, [officers, searchQuery, selectedRole]);

  // ── Position Handlers ──
  const openNewPosition = (presetStationId = '', presetDistrict = '', presetDivisionId = '') => {
    setEditPosition(null);
    const station = Array.isArray(stations) ? stations.find(s => String(s?.id) === String(presetStationId)) : null;
    setPositionForm({
      username: '',
      password: generateSecurePassword(),
      positionLabel: '',
      email: '',
      phoneNumber: '',
      role: presetStationId ? 'CONSTABLE' : 'CONSTABLE',
      policeStationId: presetStationId ? String(presetStationId) : '',
      district: presetDistrict || station?.district || '',
      divisionId: presetDivisionId || station?.sdpo || '',
      department: 'POLICE',
      isActive: true,
    });
    setActionError('');
    setShowPositionModal(true);
  };

  const openEditPosition = (pos) => {
    setEditPosition(pos);
    setPositionForm({
      username: pos.username,
      password: '',
      positionLabel: pos.positionLabel || '',
      email: pos.email || '',
      phoneNumber: pos.phoneNumber || '',
      role: pos.role,
      policeStationId: pos.policeStationId ? String(pos.policeStationId) : '',
      district: pos.district || '',
      divisionId: pos.divisionId || '',
      department: pos.department || 'POLICE',
      isActive: pos.isActive,
    });
    setActionError('');
    setShowPositionModal(true);
  };

  const handleSavePosition = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');

    try {
      const payload = {
        username: positionForm.username.trim(),
        positionLabel: positionForm.positionLabel.trim() || undefined,
        email: positionForm.email ? positionForm.email.trim() : null,
        phoneNumber: positionForm.phoneNumber ? positionForm.phoneNumber.trim().replace(/[\s\-]/g, '') : null,
        role: positionForm.role,
        department: positionForm.department,
        policeStationId: positionForm.policeStationId ? positionForm.policeStationId : null,
        district: positionForm.district || null,
        divisionId: positionForm.divisionId || null,
        isActive: positionForm.isActive,
      };

      if (!editPosition) {
        payload.password = positionForm.password;
        await api.post('/admin/users', payload);
        setActionSuccess('Position seat created successfully');
      } else {
        if (positionForm.password) {
          payload.password = positionForm.password;
        }
        await api.put(`/admin/users/${editPosition.id}`, payload);
        setActionSuccess('Position seat updated successfully');
      }

      setShowPositionModal(false);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save position');
    } finally {
      setSaving(false);
    }
  };

  // ── Officer Handlers ──
  const openNewOfficer = () => {
    setEditOfficer(null);
    setOfficerForm({
      fullName: '',
      badgeNumber: '',
      rank: 'PC',
      isActive: true,
    });
    setActionError('');
    setShowOfficerModal(true);
  };

  const openEditOfficer = (officer) => {
    setEditOfficer(officer);
    setOfficerForm({
      fullName: officer.fullName,
      badgeNumber: officer.badgeNumber || '',
      rank: officer.rank,
      isActive: officer.isActive,
    });
    setActionError('');
    setShowOfficerModal(true);
  };

  const handleSaveOfficer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');

    try {
      const payload = {
        fullName: officerForm.fullName.trim(),
        badgeNumber: officerForm.badgeNumber ? officerForm.badgeNumber.trim() : null,
        rank: officerForm.rank,
        isActive: officerForm.isActive,
      };

      if (!editOfficer) {
        await api.post('/admin/officers', payload);
        setActionSuccess('Officer record created successfully');
      } else {
        await api.put(`/admin/officers/${editOfficer.id}`, payload);
        setActionSuccess('Officer record updated successfully');
      }

      setShowOfficerModal(false);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save officer');
    } finally {
      setSaving(false);
    }
  };

  // ── Assignment & Transfer Handlers ──
  const openAssignModal = (pos) => {
    setAssignTargetPosition(pos);
    setAssignForm({
      officerId: '',
      transferOrderNo: '',
      notes: '',
    });
    setActionError('');
    setShowAssignModal(true);
  };

  const handleAssignOfficer = async (e) => {
    e.preventDefault();
    if (!assignForm.officerId) {
      setActionError('Please select an officer');
      return;
    }

    setSaving(true);
    setActionError('');
    try {
      await api.post(`/admin/positions/${assignTargetPosition.id}/assign`, {
        officerId: assignForm.officerId,
        transferOrderNo: assignForm.transferOrderNo ? assignForm.transferOrderNo.trim() : undefined,
        notes: assignForm.notes ? assignForm.notes.trim() : undefined,
      });

      setActionSuccess('Officer assigned successfully');
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to assign officer');
    } finally {
      setSaving(false);
    }
  };

  const openRelieveModal = (pos) => {
    setRelieveTargetPosition(pos);
    setRelieveNotes('');
    setActionError('');
    setShowRelieveModal(true);
  };

  const handleRelieveOfficer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      await api.post(`/admin/positions/${relieveTargetPosition.id}/relieve`, {
        notes: relieveNotes ? relieveNotes.trim() : undefined,
      });

      setActionSuccess('Officer relieved. Seat is now vacant.');
      setShowRelieveModal(false);
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to relieve officer');
    } finally {
      setSaving(false);
    }
  };

  // ── Posting History Modal ──
  const viewPositionHistory = async (pos) => {
    setHistoryTitle(`Posting History — ${pos.positionLabel || pos.username}`);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/admin/positions/${pos.id}/history`);
      setHistoryList(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const viewOfficerHistory = async (officer) => {
    setHistoryTitle(`Career Posting History — ${officer.fullName} (${officer.rank})`);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/admin/officers/${officer.id}`);
      setHistoryList(res.data?.data?.postingHistories || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            User & Position Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage fixed organizational seats, officer directory, personnel transfers, and 60-day security lifecycles
          </p>
        </div>

        {/* 3D Segmented Pill Tabs */}
        <div className="flex items-center p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'positions'
                ? 'text-white shadow-md transform -translate-y-0.5'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={activeTab === 'positions' ? {
              background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
              boxShadow: '0 3px 10px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid #CC7700',
            } : {}}
          >
            Positions / Seats ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('officers')}
            className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'officers'
                ? 'text-white shadow-md transform -translate-y-0.5'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            style={activeTab === 'officers' ? {
              background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
              boxShadow: '0 3px 10px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              border: '1px solid #CC7700',
            } : {}}
          >
            Officer Directory ({officers.length})
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div
          className="p-4 rounded-2xl text-xs font-semibold flex items-center justify-between bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess('')}
            className="text-emerald-400 hover:text-emerald-300 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Control Bar: Filters + View Mode + Action Buttons */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'positions' ? "Search seats, username, label..." : "Search officers, badge, rank..."}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#FE9A00]"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Role / Rank Filter */}
          <CustomSelect
            id="role-rank-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            placeholder={activeTab === 'positions' ? 'All Roles' : 'All Ranks'}
            className="w-36 sm:w-40"
            options={[
              { value: '', label: activeTab === 'positions' ? 'All Roles' : 'All Ranks' },
              ...(activeTab === 'positions' ? ROLES : OFFICER_RANKS).map(r => ({ value: r, label: r }))
            ]}
          />

          {/* District Filter (Positions Only) */}
          {activeTab === 'positions' && (
            <CustomSelect
              id="district-filter"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              placeholder="All Districts"
              className="w-44 sm:w-52"
              options={[
                { value: '', label: 'All Districts' },
                ...uniqueDistricts.map(d => ({ value: d, label: d }))
              ]}
            />
          )}
        </div>

        {/* Action Button (Pill-shaped 3D in #FE9A00) */}
        <div>
          {activeTab === 'positions' ? (
            <button
              type="button"
              onClick={() => openNewPosition()}
              className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md flex items-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
                boxShadow: '0 4px 14px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                border: '1px solid #CC7700',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Position Seat
            </button>
          ) : (
            <button
              type="button"
              onClick={openNewOfficer}
              className="px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md flex items-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                border: '1px solid #047857',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add Officer Record
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Cards View or Table View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          Loading directory data...
        </div>
      ) : activeTab === 'positions' ? (
        /* ── PS-WISE CARDS VIEW (VERTICAL MASONRY 3-COLUMN FLOW) ── */
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {groupedByStation.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 text-xs font-semibold rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                No police station units found matching your search.
              </div>
            ) : (
              groupedByStation.map((group) => {
                const vacantCount = group.positions.filter(p => !p.currentOfficer && (!p.officerName || p.officerName === 'Vacant')).length;
                const totalSeats = group.positions.length;

                return (
                  <div
                    key={group.id}
                    className="break-inside-avoid w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                  >
                    {/* Station Card Header (#FE9A00 Background, Black Typography) */}
                    <div
                      className="p-3.5 border-b border-[#CC7700]/30 flex items-start justify-between gap-2.5 text-slate-950 shadow-xs"
                      style={{
                        background: 'linear-gradient(135deg, #FE9A00 0%, #E68A00 100%)',
                      }}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black/10 text-slate-950 flex items-center justify-center font-bold text-xs border border-black/15 shadow-xs flex-shrink-0 mt-0.5 backdrop-blur-xs">
                          {group.isHQ ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xs font-black text-slate-950 truncate" title={group.name}>
                            {group.name}
                          </h3>
                          <p className="text-[10.5px] text-slate-900/80 truncate mt-0.5 font-bold">
                            {group.district} {group.sdpo ? `• SDPO: ${group.sdpo}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Station Personnel / Position Rows List */}
                    <div className="p-3.5 space-y-2 flex-1">
                      {group.positions.length === 0 ? (
                        <div className="py-6 text-center text-slate-400 text-[11px]">
                          No positions configured
                        </div>
                      ) : (
                        group.positions.map((pos) => {
                          const isOccupied = pos.currentOfficer || (pos.officerName && pos.officerName !== 'Vacant');
                          const officerName = pos.currentOfficer?.fullName || (pos.officerName !== 'Vacant' ? pos.officerName : null);
                          const officerRank = pos.currentOfficer?.rank || pos.role;
                          const isSHO = pos.role === 'SHO';

                          return (
                            <div
                              key={pos.id}
                              onClick={() => setSelectedPositionDetail(pos)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 group hover:border-[#FE9A00]/50 hover:shadow-xs ${
                                isSHO
                                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Role Tag (No Background Color) */}
                                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0 ${
                                  ROLE_BADGES[pos.role] || 'text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                                }`}>
                                  {pos.role}
                                </span>

                                {/* User details */}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                      {isOccupied ? officerName : 'Vacant Seat'}
                                    </span>
                                    {isOccupied && officerRank && (
                                      <span className="text-[10px] text-[#FE9A00] font-bold">
                                        ({officerRank})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] text-slate-400 font-mono truncate">
                                    @{pos.username}
                                  </div>
                                </div>
                              </div>

                              {/* Right: Expiry status dot & manage chevron */}
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {pos.daysUntilExpiry !== null && pos.daysUntilExpiry !== undefined ? (
                                  pos.daysUntilExpiry <= 0 || pos.isPasswordExpired ? (
                                    <span className="w-2 h-2 rounded-full bg-red-500" title="Password Expired" />
                                  ) : pos.daysUntilExpiry <= 10 ? (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title={`Expires in ${pos.daysUntilExpiry}d`} />
                                  ) : (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" title={`Active (${pos.daysUntilExpiry}d)`} />
                                  )
                                ) : null}

                                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-slate-200/60 dark:bg-slate-700 text-slate-500 group-hover:bg-[#FE9A00] group-hover:text-white transition-colors">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* ── OFFICERS TABLE ── */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Officer Name</th>
                  <th className="px-4 py-3.5">Rank & Badge</th>
                  <th className="px-4 py-3.5">Current Posting</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredOfficers.map((officer) => (
                  <tr key={officer.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {officer.fullName}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {officer.rank}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">
                          {officer.badgeNumber || '—'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      {officer.currentPosition ? (
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {officer.currentPosition.positionLabel || officer.currentPosition.label || officer.currentPosition.username}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            @{officer.currentPosition.username}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Unassigned / On Reserve
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      {officer.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Active Service
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => viewOfficerHistory(officer)}
                          title="View Career History"
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => openEditOfficer(officer)}
                          title="Edit Officer Profile"
                          className="p-1.5 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: Position Seat Details & Management ── */}
      {selectedPositionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ROLE_BADGES[selectedPositionDetail.role] || 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'}`}>
                    {selectedPositionDetail.role}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedPositionDetail.positionLabel || selectedPositionDetail.username}
                  </h2>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  @{selectedPositionDetail.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPositionDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Incumbent Officer Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Current Incumbent Officer
                </span>
                {selectedPositionDetail.currentOfficer || (selectedPositionDetail.officerName && selectedPositionDetail.officerName !== 'Vacant') ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#FE9A00] text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                        {selectedPositionDetail.currentOfficer?.fullName
                          ? selectedPositionDetail.currentOfficer.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          : 'OF'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {selectedPositionDetail.currentOfficer?.fullName || selectedPositionDetail.officerName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span className="font-bold text-[#FE9A00]">
                            {selectedPositionDetail.currentOfficer?.rank || selectedPositionDetail.role}
                          </span>
                          {(selectedPositionDetail.currentOfficer?.badgeNumber || selectedPositionDetail.badgeNumber) && (
                            <span>&bull; Badge: {selectedPositionDetail.currentOfficer?.badgeNumber || selectedPositionDetail.badgeNumber}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedPositionDetail;
                          setSelectedPositionDetail(null);
                          openRelieveModal(target);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 border border-amber-200 dark:border-amber-900/40 cursor-pointer"
                      >
                        Relieve
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedPositionDetail;
                          setSelectedPositionDetail(null);
                          openAssignModal(target);
                        }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#FE9A00] bg-[#FE9A00]/10 hover:bg-[#FE9A00]/20 border border-[#FE9A00]/30 cursor-pointer"
                      >
                        Transfer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Vacant Seat (No officer appointed)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const target = selectedPositionDetail;
                        setSelectedPositionDetail(null);
                        openAssignModal(target);
                      }}
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white transition-all transform active:translate-y-0.5 shadow-sm cursor-pointer"
                      style={{
                        background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
                        boxShadow: '0 2px 8px 0 rgba(254, 154, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                        border: '1px solid #CC7700',
                      }}
                    >
                      Assign Officer
                    </button>
                  </div>
                )}
              </div>

              {/* Department Contact Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Department Email
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {selectedPositionDetail.email || 'None set'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Department Phone
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 block">
                    {selectedPositionDetail.phoneNumber || 'None set'}
                  </span>
                </div>
              </div>

              {/* 60-Day Security Expiration */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    60-Day Password Security
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                    {selectedPositionDetail.daysUntilExpiry !== null && selectedPositionDetail.daysUntilExpiry !== undefined
                      ? selectedPositionDetail.daysUntilExpiry <= 0
                        ? 'Password has expired (OTP required on login)'
                        : `Password rotation due in ${selectedPositionDetail.daysUntilExpiry} days`
                      : 'Standard rotation policy'}
                  </span>
                </div>

                {selectedPositionDetail.daysUntilExpiry !== null && selectedPositionDetail.daysUntilExpiry !== undefined ? (
                  selectedPositionDetail.daysUntilExpiry <= 0 || selectedPositionDetail.isPasswordExpired ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                      Expired
                    </span>
                  ) : selectedPositionDetail.daysUntilExpiry <= 10 ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Expires in {selectedPositionDetail.daysUntilExpiry}d
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Active ({selectedPositionDetail.daysUntilExpiry}d)
                    </span>
                  )
                ) : null}
              </div>

              {/* Modal Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedPositionDetail;
                    setSelectedPositionDetail(null);
                    viewPositionHistory(target);
                  }}
                  className="py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Posting History
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = selectedPositionDetail;
                    setSelectedPositionDetail(null);
                    openEditPosition(target);
                  }}
                  className="py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
                    boxShadow: '0 4px 12px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid #CC7700',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Seat Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Position Create / Edit ── */}
      {showPositionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editPosition ? 'Edit Position Seat' : 'Create New Position Seat'}
              </h2>
              <button
                type="button"
                onClick={() => setShowPositionModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSavePosition} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Position Identifier / Username
                </label>
                <input
                  type="text"
                  value={positionForm.username}
                  onChange={(e) => setPositionForm({ ...positionForm, username: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. const-tpt-east-2 or sho-tirupati-east"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                  disabled={Boolean(editPosition)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descriptive Position Label
                </label>
                <input
                  type="text"
                  value={positionForm.positionLabel}
                  onChange={(e) => setPositionForm({ ...positionForm, positionLabel: e.target.value })}
                  placeholder="e.g. Constable #2 (Tirupati East PS)"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  id="position-role"
                  label="Seat Role"
                  value={positionForm.role}
                  onChange={(e) => setPositionForm({ ...positionForm, role: e.target.value })}
                  options={ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] || r }))}
                  triggerClassName="rounded-xl"
                  className="w-full"
                />

                <CustomSelect
                  id="position-department"
                  label="Department"
                  value={positionForm.department}
                  onChange={(e) => setPositionForm({ ...positionForm, department: e.target.value })}
                  options={DEPARTMENTS.map(d => ({ value: d, label: DEPT_LABELS[d] || d }))}
                  triggerClassName="rounded-xl"
                  className="w-full"
                />
              </div>

              <CustomSelect
                id="position-station"
                label="Police Station (For SHO & Constable Seats)"
                value={positionForm.policeStationId}
                onChange={(e) => setPositionForm({ ...positionForm, policeStationId: e.target.value })}
                placeholder="None / Higher Headquarters"
                options={[
                  { value: '', label: 'None / Higher Headquarters' },
                  ...stations.map(s => ({ value: String(s.id), label: `${s.name} (${s.district})` }))
                ]}
                triggerClassName="rounded-xl"
                className="w-full"
              />

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  id="position-district"
                  label="District"
                  value={positionForm.district}
                  onChange={(e) => setPositionForm({ ...positionForm, district: e.target.value })}
                  placeholder="Select District"
                  options={[
                    { value: '', label: 'Select District' },
                    ...uniqueDistricts.map(d => ({ value: d, label: d }))
                  ]}
                  triggerClassName="rounded-xl"
                  className="w-full"
                />

                <CustomSelect
                  id="position-division"
                  label="Subdivision (SDPO)"
                  value={positionForm.divisionId}
                  onChange={(e) => setPositionForm({ ...positionForm, divisionId: e.target.value })}
                  placeholder="Select Subdivision"
                  options={[
                    { value: '', label: 'Select Subdivision' },
                    ...uniqueSdpos.map(s => ({ value: s, label: s }))
                  ]}
                  triggerClassName="rounded-xl"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Email
                  </label>
                  <input
                    type="email"
                    value={positionForm.email}
                    onChange={(e) => setPositionForm({ ...positionForm, email: e.target.value })}
                    placeholder="sho.tirupatieast@appolice.gov.in"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Phone
                  </label>
                  <input
                    type="text"
                    value={positionForm.phoneNumber}
                    onChange={(e) => setPositionForm({ ...positionForm, phoneNumber: e.target.value })}
                    placeholder="9440796000"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Generator for New Seat */}
              {!editPosition && (
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Initial Secure Password
                    </span>
                    <button
                      type="button"
                      onClick={() => setPositionForm({ ...positionForm, password: generateSecurePassword() })}
                      className="text-xs font-bold text-[#FE9A00] hover:text-[#E08500] cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-2 font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                    <span className="flex-1">{positionForm.password}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(positionForm.password);
                        setCopiedPassword(true);
                        setTimeout(() => setCopiedPassword(false), 2000);
                      }}
                      className="text-xs text-[#FE9A00] font-bold hover:underline"
                    >
                      {copiedPassword ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
                    boxShadow: '0 4px 14px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    border: '1px solid #CC7700',
                  }}
                >
                  {saving ? 'Saving...' : editPosition ? 'Save Changes' : 'Create Position Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Officer Create / Edit ── */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {editOfficer ? 'Edit Officer Record' : 'Add New Officer'}
              </h2>
              <button
                type="button"
                onClick={() => setShowOfficerModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveOfficer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={officerForm.fullName}
                  onChange={(e) => setOfficerForm({ ...officerForm, fullName: e.target.value })}
                  placeholder="e.g. K. Srinivasulu"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  id="officer-rank-select"
                  label="Rank"
                  value={officerForm.rank}
                  onChange={(e) => setOfficerForm({ ...officerForm, rank: e.target.value })}
                  options={OFFICER_RANKS.map(r => ({ value: r, label: r }))}
                  triggerClassName="rounded-xl"
                  className="w-full"
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Number / ID
                  </label>
                  <input
                    type="text"
                    value={officerForm.badgeNumber}
                    onChange={(e) => setOfficerForm({ ...officerForm, badgeNumber: e.target.value })}
                    placeholder="e.g. AP-TPT-4402"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !officerForm.fullName.trim()}
                  className="w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid #047857',
                  }}
                >
                  {saving ? 'Saving...' : editOfficer ? 'Save Officer' : 'Add Officer Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Assign Officer to Position (Transfer In) ── */}
      {showAssignModal && assignTargetPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Assign Officer to Position
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  {assignTargetPosition.positionLabel || assignTargetPosition.username}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleAssignOfficer} className="p-6 space-y-4">
              <CustomSelect
                id="assign-officer-select"
                label="Select Incoming Officer"
                value={assignForm.officerId}
                onChange={(e) => setAssignForm({ ...assignForm, officerId: e.target.value })}
                placeholder="Choose an Officer..."
                options={[
                  { value: '', label: 'Choose an Officer...' },
                  ...(Array.isArray(officers) ? officers : []).map(o => ({
                    value: String(o.id),
                    label: `${o.fullName} (${o.rank}) ${o.currentPosition ? `— at ${o.currentPosition.positionLabel || o.currentPosition.label || o.currentPosition.username}` : '— [Reserve]'}`
                  }))
                ]}
                triggerClassName="rounded-xl"
                className="w-full"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Order Number (Optional)
                </label>
                <input
                  type="text"
                  value={assignForm.transferOrderNo}
                  onChange={(e) => setAssignForm({ ...assignForm, transferOrderNo: e.target.value })}
                  placeholder="e.g. D.O. No. 442/2026/SP-TPT"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Notes (Optional)
                </label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                  placeholder="e.g. Regular rotational transfer"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !assignForm.officerId}
                  className="w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #FE9A00 0%, #E08500 100%)',
                    boxShadow: '0 4px 14px 0 rgba(254, 154, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                    border: '1px solid #CC7700',
                  }}
                >
                  {saving ? 'Assigning...' : 'Confirm Transfer & Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Relieve Officer (Vacate Seat) ── */}
      {showRelieveModal && relieveTargetPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Relieve Officer from Seat
              </h2>
              <button
                type="button"
                onClick={() => setShowRelieveModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleRelieveOfficer} className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium space-y-1">
                <p className="font-bold">Are you sure you want to relieve this officer?</p>
                <p className="text-slate-600 dark:text-slate-300">
                  Officer: <strong className="text-slate-900 dark:text-white">{relieveTargetPosition.currentOfficer?.fullName}</strong>
                </p>
                <p className="text-slate-600 dark:text-slate-300">
                  Seat: <strong className="text-slate-900 dark:text-white">{relieveTargetPosition.positionLabel || relieveTargetPosition.username}</strong>
                </p>
                <p className="text-[11px] text-slate-500 mt-2">
                  This will vacate the position seat while maintaining the full historical audit trail.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Relieve Reason / Notes
                </label>
                <textarea
                  value={relieveNotes}
                  onChange={(e) => setRelieveNotes(e.target.value)}
                  placeholder="e.g. Transferred to another division / On deputation"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 px-6 rounded-full font-bold text-xs uppercase tracking-wider text-white transition-all transform active:translate-y-0.5 shadow-md cursor-pointer disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, #d97706 0%, #b45309 100%)',
                    boxShadow: '0 4px 14px 0 rgba(217, 119, 6, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                    border: '1px solid #92400e',
                  }}
                >
                  {saving ? 'Processing...' : 'Confirm Relieve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Posting History Timeline ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {historyTitle}
              </h2>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {historyLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  Loading posting timeline...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                  No posting history records found.
                </div>
              ) : (
                <div className="space-y-4 relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 pl-4">
                  {historyList.map((hist, idx) => (
                    <div key={hist.id || idx} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 ${
                        hist.relievedAt ? 'bg-slate-400 border-slate-200 dark:border-slate-800' : 'bg-emerald-500 border-emerald-200 dark:border-emerald-900 animate-pulse'
                      }`} />

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {hist.officerName || hist.positionLabel || (hist.officer?.fullName || hist.position?.position_label)}
                          </span>
                          {!hist.relievedAt && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Current Posting
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Period: {new Date(hist.appointedAt).toLocaleDateString()} &mdash; {hist.relievedAt ? new Date(hist.relievedAt).toLocaleDateString() : 'Present'}
                        </div>

                        {hist.transferOrderNo && (
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                            Order No: {hist.transferOrderNo}
                          </div>
                        )}

                        {hist.notes && (
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-0.5">
                            "{hist.notes}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}