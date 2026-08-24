import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import apLogo from '../assets/Appolice(emblem).png';
import garudaLogo from '../assets/Garuda_logo.png';
import cmPhoto from '../assets/hcYSD6hIE5ps-20Aagn4hwbA_zFMHouPHepwjcXoZss.avif';
import apEmblem from '../assets/Emblem_of_Andhra_Pradesh.svg.png';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import api from '../api/axios';
import GlobalLoader from './GlobalLoader';
import {
  IconDashboard, IconOffender, IconConsumer, IconCases, IconFieldStaff,
  IconSurveillance, IconFinance, IconNetwork, IconReports, IconMap,
  IconTrash, IconEdit, IconUsers, IconBuilding, IconAuditLog, IconImport,
  IconShield, IconVehicle, IconDatabase,
} from './Icons';

/**
 * Build navigation items dynamically based on user permissions AND department.
 * Items only appear if the user has the required permission + department.
 * SP/ASP do NOT get blanket access to Intelligence items — they must be
 * in the correct department.
 * Grouped by section for visual clarity.
 */
function useNavItems() {
  const perms = usePermissions();

  // All roles see operational sections
  // SP also sees Administration section
  // Department-restricted items check the user's actual department
  const sections = [
    {
      title: 'Operations',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: IconDashboard, show: true },
        { path: '/cases', label: 'Cases', icon: IconCases, show: true },
        { path: '/consumers', label: 'Consumers', icon: IconConsumer, show: true },
        { path: '/offenders', label: 'Offenders', icon: IconOffender, show: true },
        { path: '/vehicles-seized', label: 'Vehicles Seized', icon: IconVehicle, show: true },
        { path: '/enforcement', label: 'Enforcement', icon: IconShield, show: true },
        {
          path: '/mobile', label: 'Field Staff', icon: IconFieldStaff,
          show: false
        },
        {
          path: '/south-india-databank', label: 'South India Data Bank', icon: IconDatabase,
          show: true
        },
        {
          path: '/approvals', label: 'Commit Approvals', icon: IconAuditLog,
          show: perms.isSHO
        },
        {
          path: '/approval-progress', label: 'Approval Status', icon: IconAuditLog,
          show: perms.role === 'CONSTABLE' || perms.isStationLevel
        },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        {
          path: '/surveillance', label: 'Surveillance', icon: IconSurveillance,
          show: false // Phase 2 — hidden for Phase 1 deployment (was: perms.canViewAllTech || perms.canAddTechIntel)
        },
        {
          path: '/finance', label: 'Financial', icon: IconFinance,
          show: false // Phase 2 — hidden for Phase 1 deployment (was: perms.canViewAllFinance)
        },
        {
          path: '/network', label: 'Network Map', icon: IconNetwork,
          show: false // Phase 2 — hidden for Phase 1 deployment (was: perms.canViewAllNetwork || perms.canBuildNetwork)
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          path: '/reports', label: 'Reports', icon: IconReports,
          show: perms.canViewAllReports || perms.canBuildCustomReport
        },
        {
          path: '/district-analytics', label: 'District Analytics', icon: IconMap,
          show: perms.canViewDistrictAnalytics
        },
      ],
    },
  ];

  // SP (system admin) also sees Administration section
  if (perms.isSP) {
    sections.push({
      title: 'Administration',
      items: [
        { path: '/admin/users', label: 'User Management', icon: IconUsers, show: true },
        { path: '/admin/offenders', label: 'Delete Offender', icon: IconTrash, show: true },
        { path: '/admin/teams', label: 'Team Management', icon: IconBuilding, show: true },
        { path: '/admin/audit-logs', label: 'Audit Logs', icon: IconAuditLog, show: true },
        { path: '/admin/import', label: 'DPR Import', icon: IconImport, show: true },
      ],
    });
  }

  return sections
    .map(section => ({
      ...section,
      items: section.items.filter(item => item.show),
    }))
    .filter(section => section.items.length > 0);
}

/**
 * Role badge color mapping for the header — all 15 roles.
 */
const ROLE_COLORS = {
  SP: { bg: '#8b5cf6', text: '#fff' },
  ASP: { bg: '#6366f1', text: '#fff' },
  SDPO: { bg: '#3b82f6', text: '#fff' },
  SHO: { bg: '#22c55e', text: '#fff' },
  CONSTABLE: { bg: '#6b7280', text: '#fff' },
};

/** Display-friendly role labels */
const ROLE_LABELS = {
  SP: 'SP',
  ASP: 'ASP',
  SDPO: 'SDPO (DSP)',
  SHO: 'SHO (CI/SI)',
  CONSTABLE: 'Constable',
};

/** Display-friendly department labels */
const DEPT_LABELS = {
  POLICE: 'Police',
  CYBER_ANALYTICS: 'Cyber Analytics',
  EXCISE: 'Excise',
};

/** Full roles labels for dropdown profile header */
const ROLE_FULL_LABELS = {
  SP: 'Superintendent of Police (SP)',
  ASP: 'Assistant Superintendent of Police (ASP)',
  SDPO: 'Sub-Divisional Police Officer (SDPO/DSP)',
  SHO: 'Station House Officer (SHO/CI/SI)',
  CONSTABLE: 'Police Constable',
};

/** Full department labels for dropdown profile badge */
const DEPT_FULL_LABELS = {
  POLICE: 'Police Department',
  CYBER_ANALYTICS: 'Cyber Analytics (STF)',
  EXCISE: 'Excise Department',
}; export default function Layout() {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [policeStationName, setPoliceStationName] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', badgeNumber: '', photoUrl: '' });
  const [photoPreview, setPhotoPreview] = useState('');
  const fileInputRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [darkMode] = useState(() => {
    return localStorage.getItem('dart_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (user?.policeStationId) {
      api.get('/police-stations')
        .then(res => {
          const matched = res.data?.data?.find(s => String(s.id) === String(user.policeStationId));
          if (matched) {
            setPoliceStationName(matched.name);
          }
        })
        .catch(err => console.error('Failed to fetch police station name:', err));
    }
  }, [user?.policeStationId]);

  const navSections = useNavItems();
  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.CONSTABLE;
  const roleLabel = ROLE_LABELS[user?.role] || user?.role;
  const deptLabel = DEPT_LABELS[user?.department] || user?.department;

  // Password policy live validation
  const passwordChecks = useMemo(() => {
    const p = passwordForm.newPassword;
    return [
      { label: '10-18 characters', pass: p.length >= 10 && p.length <= 18 },
      { label: 'One uppercase letter (A-Z)', pass: /[A-Z]/.test(p) },
      { label: 'One lowercase letter (a-z)', pass: /[a-z]/.test(p) },
      { label: 'One digit (0-9)', pass: /[0-9]/.test(p) },
      { label: 'One special character (!@#$%...)', pass: /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?\/\\`~]/.test(p) },
      { label: 'No spaces', pass: p.length === 0 || !/\s/.test(p) },
    ];
  }, [passwordForm.newPassword]);

  const allPasswordChecksPass = passwordForm.newPassword.length > 0 && passwordChecks.every(c => c.pass);
  const passwordsMatch = passwordForm.newPassword && passwordForm.newPassword === passwordForm.confirmPassword;

  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setShowCamera(true);
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please grant camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraError('');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(dataUrl);
      setProfileForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      stopCamera();
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        setProfileMsg({
          type: 'error',
          text: `Profile photo must be under 500 KB (ideally 200 KB - 500 KB). Selected file is ${(file.size / 1024).toFixed(0)} KB.`
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setProfileMsg({ type: '', text: '' });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setProfileForm((prev) => ({ ...prev, photoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    setProfileForm((prev) => ({ ...prev, photoUrl: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openProfileModal = () => {
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      badgeNumber: user?.badgeNumber || '',
      photoUrl: user?.photoUrl || '',
    });
    setPhotoPreview(user?.photoUrl || '');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setProfileMsg({ type: '', text: '' });
    setPasswordMsg({ type: '', text: '' });
    setShowNewPassword(false);
    setDropdownOpen(false);
    setShowCamera(false);
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await api.put('/auth/profile', {
        fullName: profileForm.fullName,
        email: profileForm.email ? profileForm.email.trim() : null,
        phoneNumber: profileForm.phoneNumber ? profileForm.phoneNumber.trim().replace(/[\s\-]/g, '') : null,
        badgeNumber: profileForm.badgeNumber,
        photoUrl: photoPreview !== undefined ? photoPreview : (profileForm.photoUrl || null),
      });
      await refreshUser();
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordSaving(true);
    setPasswordMsg({ type: '', text: '' });

    if (!allPasswordChecksPass) {
      setPasswordMsg({ type: 'error', text: 'New password does not meet policy requirements' });
      setPasswordSaving(false);
      return;
    }
    if (!passwordsMatch) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      setPasswordSaving(false);
      return;
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      const violations = err.response?.data?.violations;
      setPasswordMsg({ type: 'error', text: violations ? violations.join('. ') : msg });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Backdrop overlay on mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:static md:flex md:flex-col ${sidebarOpen ? 'md:w-64' : 'md:w-16'
          } transition-all duration-300`}
        style={{ background: '#FE9A00', borderRight: '1px solid rgba(0,0,0,0.15)' }}
      >
        {/* Brand */}
        <div className={`flex items-center ${sidebarOpen || mobileSidebarOpen ? 'justify-between px-4' : 'justify-center px-2'} md:justify-center py-5`} style={{ borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
          <img
            src={apLogo}
            alt="AP Police Logo"
            className={`${sidebarOpen || mobileSidebarOpen ? 'w-24 h-24' : 'w-12 h-12'} object-contain flex-shrink-0 bg-white rounded-full p-0.5 transition-all duration-300`}
          />
          {/* Close button on mobile */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-black hover:bg-black/10 md:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Items — grouped by section, conditionally rendered based on role + department */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {navSections.map((section, si) => (
            <div key={section.title} className={si > 0 ? 'mt-5' : ''}>
              {(sidebarOpen || mobileSidebarOpen) && (
                <p
                  className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
                  style={{ color: 'rgba(0,0,0,0.65)' }}
                >
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = location.pathname === item.path ||
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                  const NavIcon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      id={`nav-${item.path.replace(/\//g, '-').replace(/^-/, '')}`}
                      onClick={() => setMobileSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                      style={{
                        background: active ? 'rgba(0,0,0,0.14)' : 'transparent',
                        color: active ? '#000000' : 'rgba(0,0,0,0.85)',
                      }}
                      onMouseOver={(e) => { if (!active) e.currentTarget.style.background = 'rgba(0,0,0,0.07)'; }}
                      onMouseOut={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <NavIcon size={18} color={active ? '#000000' : 'rgba(0,0,0,0.85)'} />
                      {(sidebarOpen || mobileSidebarOpen) && <span style={{ color: active ? '#000000' : 'rgba(0,0,0,0.85)' }}>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile in Sidebar */}
        <div className="relative" style={{ borderTop: '1px solid rgba(0,0,0,0.15)' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center gap-3 p-3 text-black hover:bg-black/10 transition-colors cursor-pointer select-none text-left"
          >
            {/* Avatar Image or Initials */}
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm bg-black/15 text-black border border-black/20 flex-shrink-0 overflow-hidden">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'RK'
              )}
            </div>
            {/* Name/Details */}
            {(sidebarOpen || mobileSidebarOpen) && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs truncate m-0 text-black">
                  {user?.fullName || 'Rama Krishna'}
                </p>
                <p className="text-[10px] text-black/75 font-semibold truncate mt-0.5 mb-0">
                  {(roleLabel || 'ASP')} | {(deptLabel || 'STF')}
                </p>
              </div>
            )}
            {/* Chevron */}
            {(sidebarOpen || mobileSidebarOpen) && (
              <svg
                className={`w-3.5 h-3.5 text-black/75 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
              </svg>
            )}
          </button>

          {/* Floating Dropdown for Sidebar Profile */}
          {dropdownOpen && (
            <>
              {/* Overlay backdrop */}
              <div
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setDropdownOpen(false)}
              />

              <div
                id="user-profile-dropdown"
                className="absolute z-50 rounded-xl border shadow-lg overflow-hidden text-left bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700/60"
                style={{
                  bottom: '100%',
                  left: (sidebarOpen || mobileSidebarOpen) ? '12px' : '64px',
                  width: (sidebarOpen || mobileSidebarOpen) ? 'calc(100% - 24px)' : '280px',
                  marginBottom: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                }}
              >
                {/* User Header Section */}
                <div className="p-4 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 shadow-xs mb-2 select-none overflow-hidden">
                    {user?.photoUrl ? (
                      <img src={user.photoUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.fullName ? user.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'RK'
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white truncate w-full" style={{ fontSize: '15px', margin: 0 }}>
                    {user?.fullName || 'Rama Krishna'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs truncate w-full mt-0.5">
                    {ROLE_FULL_LABELS[user?.role] || 'Assistant Superintendent of Police (ASP)'}
                  </p>
                  <div className="mt-2.5">
                    <span className="inline-block text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30">
                      {DEPT_FULL_LABELS[user?.department] || 'STF - Special Task Force'}
                    </span>
                  </div>
                </div>

                {/* Allotted PS Info */}
                <div className="px-4 py-3 border-t border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider" style={{ margin: 0 }}>
                      Allotted PS / Unit
                    </p>
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold truncate mt-0.5" style={{ margin: 0 }}>
                      {policeStationName || (user?.policeStationId ? `PS ID: ${user.policeStationId}` : 'HQ Command Center')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-2 bg-gray-50/50 dark:bg-gray-900/10 space-y-1">
                  {/* Update Profile Button */}
                  <button
                    onClick={openProfileModal}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg font-bold transition-all duration-150 cursor-pointer border-none bg-transparent"
                    style={{ fontSize: '13px' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Update Profile
                  </button>
                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg font-bold transition-all duration-150 cursor-pointer border-none bg-transparent"
                    style={{ fontSize: '13px' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout Session
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toggle & Version Footer */}
        <div
          className="hidden md:flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid rgba(0,0,0,0.15)' }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sm transition-colors cursor-pointer bg-transparent border-none p-0 text-black/75 hover:text-black font-bold"
          >
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
          {sidebarOpen && (
            <span className="text-black/65 font-extrabold select-none text-[10px] uppercase tracking-widest">
              Version 1.6.33
            </span>
          )}
        </div>
      </aside>

      {/* ---- Main Content ---- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header
          className="grid grid-cols-3 items-center px-2 sm:px-6 py-2 md:py-3 min-h-[70px] md:min-h-[101px] gap-2 sm:gap-4 flex-shrink-0"
          style={{ background: 'var(--color-header-bg, #fff)', borderBottom: '1px solid var(--color-garuda-700)' }}
        >
          {/* Left section: Hamburger and Garuda Logo */}
          <div className="flex items-center gap-1.5 sm:gap-4 h-full justify-start">
            {/* Hamburger menu for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden cursor-pointer flex items-center justify-center"
              aria-label="Open sidebar"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img
              src={garudaLogo}
              alt="Garuda Logo"
              className="h-9 sm:h-18 md:h-24 max-w-[110px] sm:max-w-none object-contain"
            />
          </div>

          {/* Middle section: Centered AP State Emblem */}
          <div className="flex items-center justify-center">
            <img
              src={apEmblem}
              alt="Andhra Pradesh State Emblem"
              className="h-9 sm:h-22 object-contain"
            />
          </div>

          {/* Right section: CM Photo */}
          <div className="flex items-center justify-end">
            <img
              src={cmPhoto}
              alt="AP CM Photo"
              className="h-11 sm:h-20 md:h-28 object-contain rounded-md shadow-md border border-gray-200/50 dark:border-slate-800"
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative" style={{ background: 'var(--color-garuda-900)' }}>
          <GlobalLoader />
          <Outlet />
        </main>
      </div>

      {/* ---- Update Profile Modal ---- */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="absolute inset-0" onClick={() => setShowProfileModal(false)}></div>
          <div className="rounded-3xl relative w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">Update Profile</h2>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Profile Avatar & Live Webcam Capture Section */}
            <div className="flex flex-col items-center justify-center pt-5 pb-1 px-6">
              {!showCamera ? (
                <>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group w-24 h-24 rounded-full border-4 border-amber-500/30 dark:border-amber-500/20 shadow-xl overflow-hidden cursor-pointer transition-all hover:scale-105"
                  >
                    {photoPreview || profileForm.photoUrl || user?.photoUrl ? (
                      <img 
                        src={photoPreview || profileForm.photoUrl || user?.photoUrl} 
                        alt="Profile Avatar" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-3xl select-none">
                        {(profileForm.fullName?.[0] || user?.fullName?.[0] || user?.username?.[0] || 'P').toUpperCase()}
                      </div>
                    )}
                    {/* Overlay hover effect with Camera Icon */}
                    <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      <span className="text-[10px] font-extrabold mt-1 uppercase tracking-wider">Change</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={handlePhotoSelect} 
                    className="hidden" 
                  />

                  {/* Action Buttons: Upload File | Capture Photo | Remove Photo */}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                    >
                      📁 Upload
                    </button>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      Capture
                    </button>
                    {(photoPreview || profileForm.photoUrl || user?.photoUrl) && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 rounded-full text-xs font-extrabold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 mt-2 font-medium">
                    JPG/PNG under 500KB (ideally 200–500 KB)
                  </p>
                </>
              ) : (
                /* Live Camera Feed Container */
                <div className="w-full space-y-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl animate-fade-in">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      Live Webcam Feed
                    </span>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer bg-transparent border-none"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {cameraError ? (
                    <div className="p-4 text-xs font-bold text-rose-400 bg-rose-950/40 rounded-xl border border-rose-900/40 text-center">
                      {cameraError}
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />

                  {!cameraError && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 py-2.5 rounded-full font-black text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                      >
                        📸 Snap Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2.5 rounded-full font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Read-only Info */}
            <div className="mx-6 my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-3.5 shadow-2xs">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Username</p>
                <p className="text-xs font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">{user?.username}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Role</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{ROLE_FULL_LABELS[user?.role] || user?.role}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Department</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{DEPT_FULL_LABELS[user?.department] || user?.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Police Station</p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{policeStationName || 'HQ Command Center'}</p>
              </div>
            </div>

            {/* Editable Profile Section */}
            <div className="px-6 py-4 space-y-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Profile Details</h3>
              {profileMsg.text && (
                <div
                  className="px-3.5 py-2.5 rounded-2xl text-xs font-bold animate-fade-in"
                  style={{
                    background: profileMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: profileMsg.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${profileMsg.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  }}
                >
                  {profileMsg.text}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="officer@appolice.gov.in"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  value={profileForm.phoneNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="10-digit mobile number"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Badge Number</label>
                <input
                  type="text"
                  value={profileForm.badgeNumber}
                  onChange={(e) => setProfileForm({ ...profileForm, badgeNumber: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="Optional"
                />
              </div>
              <button
                type="button"
                onClick={handleProfileSave}
                disabled={profileSaving || !profileForm.fullName.trim()}
                className="w-full py-3 rounded-full font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            {/* Change Password Section */}
            <div className="px-6 py-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Change Password</h3>
              {passwordMsg.text && (
                <div
                  className="px-3.5 py-2.5 rounded-2xl text-xs font-bold animate-fade-in"
                  style={{
                    background: passwordMsg.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: passwordMsg.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
                  }}
                >
                  {passwordMsg.text}
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pr-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none bg-transparent border-none cursor-pointer"
                    tabIndex="-1"
                  >
                    {showNewPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    )}
                  </button>
                </div>
                {/* Password Policy Indicators */}
                {passwordForm.newPassword.length > 0 && (
                  <div className="mt-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Password Policy</p>
                    {passwordChecks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                        <span className={check.pass ? 'text-emerald-500 font-extrabold' : 'text-rose-500 font-extrabold'}>
                          {check.pass ? '✓' : '✕'}
                        </span>
                        <span className={check.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-none transition-all shadow-2xs"
                  placeholder="Re-enter new password"
                />
                {passwordForm.confirmPassword && !passwordsMatch && (
                  <p className="text-xs font-bold mt-1.5 text-rose-500">Passwords do not match</p>
                )}
                {passwordForm.confirmPassword && passwordsMatch && (
                  <p className="text-xs font-bold mt-1.5 text-emerald-500">✓ Passwords match</p>
                )}
              </div>
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={passwordSaving || !passwordForm.currentPassword || !allPasswordChecksPass || !passwordsMatch}
                className="w-full py-3 rounded-full font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
