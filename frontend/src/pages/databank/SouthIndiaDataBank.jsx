import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import api from '../../api/axios';
import southIndiaMap from '../../assets/south-india-map-slide1.png';
import { 
  IconSearch, IconWarning, IconPlus, IconClipboard, IconArrowRight, 
  IconRefresh, IconShield, IconMap, IconUsers, IconBuilding, IconVehicle 
} from '../../components/Icons';

const STATES = [
  { code: 'ALL', name: 'All States', color: 'bg-slate-500 text-white' },
  { code: 'AP', name: 'Andhra Pradesh', color: 'bg-orange-500 text-white border-orange-600' },
  { code: 'TS', name: 'Telangana', color: 'bg-pink-500 text-white border-pink-600' },
  { code: 'KA', name: 'Karnataka', color: 'bg-yellow-500 text-slate-900 border-yellow-600' },
  { code: 'TN', name: 'Tamil Nadu', color: 'bg-red-500 text-white border-red-600' },
  { code: 'KL', name: 'Kerala', color: 'bg-emerald-600 text-white border-emerald-700' }
];

const INITIAL_LO_OFFENDERS = [
  {
    id: 1, crNo: '145/2024', secOfLaw: 'Sec 20(b)(ii)(C) NDPS Act',
    policeStation: 'Chittoor I-Town', psDistrict: 'Chittoor',
    accusedDetails: 'A1. Nagaraju Naik, Age 32, S/O Ramaiah Naik',
    mandal: 'Chittoor', accusedDistrict: 'Chittoor', state: 'AP',
    // legacy fields kept for dossier modal & search
    name: 'Nagaraju Naik', district: 'Chittoor', contraband: 'Ganja & Red Sanders',
    casesCount: 7, lastSighting: '2026-07-05', risk: 'High',
    aadhaar: 'XXXX-XXXX-1234', phone: '+91 99887 76655',
    vehicles: 'AP-03-TX-5432 (Mahindra Scorpio - White)',
    associates: 'Govindaswamy, Ramu Naik',
    history: [
      { fir: 'FIR 145/2024', ps: 'Chittoor I-Town', sections: 'Sec 20(b)(ii)(C) NDPS Act', date: '2024-09-05' },
      { fir: 'FIR 202/2025', ps: 'Palamaner PS', sections: 'Sec 20(b)(ii)(C) NDPS Act', date: '2025-11-20' }
    ]
  },
  {
    id: 2, crNo: '44/2025', secOfLaw: 'Sec 20(b)(ii)(B) NDPS Act',
    policeStation: 'Coimbatore B1', psDistrict: 'Coimbatore',
    accusedDetails: 'A1. Karthik Raja, Age 28, S/O Rajkumar',
    mandal: 'Coimbatore South', accusedDistrict: 'Coimbatore', state: 'TN',
    name: 'Karthik Raja', district: 'Coimbatore', contraband: 'Ganja (Sativa)',
    casesCount: 3, lastSighting: '2026-06-25', risk: 'High',
    aadhaar: 'XXXX-XXXX-8921', phone: '+91 98453 12345',
    vehicles: 'TN-37-BY-8822 (Tata Safari - Black)',
    associates: 'Ranganathan, Murugan',
    history: [
      { fir: 'FIR 44/2025', ps: 'Coimbatore B1', sections: 'Sec 20(b)(ii)(B) NDPS Act', date: '2025-04-12' },
      { fir: 'FIR 112/2025', ps: 'Salem Town', sections: 'Sec 20(b)(ii)(C) NDPS Act', date: '2025-08-30' },
      { fir: 'FIR 08/2026', ps: 'Madurai Othakadai', sections: 'Sec 20(b)(ii)(C) NDPS Act', date: '2026-01-15' }
    ]
  },
  {
    id: 3, crNo: '201/2024', secOfLaw: 'Sec 22(c) NDPS Act',
    policeStation: 'Electronic City', psDistrict: 'Bengaluru Rural',
    accusedDetails: 'A1. Devendra Gowda, Age 35, S/O Basavanna',
    mandal: 'Anekal', accusedDistrict: 'Bengaluru Rural', state: 'KA',
    name: 'Devendra Gowda', district: 'Bengaluru Rural', contraband: 'MDMA Crystals',
    casesCount: 5, lastSighting: '2026-07-02', risk: 'High',
    aadhaar: 'XXXX-XXXX-4532', phone: '+91 88764 99201',
    vehicles: 'KA-51-MD-9080 (Hyundai Creta - White)',
    associates: 'Santhosh M., Vinay Kumar',
    history: [
      { fir: 'FIR 201/2024', ps: 'Electronic City', sections: 'Sec 22(c) NDPS Act', date: '2024-11-05' },
      { fir: 'FIR 15/2025', ps: 'Kengeri PS', sections: 'Sec 22(b) NDPS Act', date: '2025-02-18' }
    ]
  },
  {
    id: 4, crNo: '110/2024', secOfLaw: 'Sec 20(b)(ii)(C) NDPS Act',
    policeStation: 'Khammam Urban', psDistrict: 'Khammam',
    accusedDetails: 'A1. Srinivas Rao, Age 40, S/O Venkata Rao',
    mandal: 'Khammam', accusedDistrict: 'Khammam', state: 'TS',
    name: 'Srinivas Rao', district: 'Khammam', contraband: 'Ganja (Liquid / Oil)',
    casesCount: 4, lastSighting: '2026-07-04', risk: 'High',
    aadhaar: 'XXXX-XXXX-9876', phone: '+91 77654 32109',
    vehicles: 'TS-04-ER-2244 (Mahindra Bolero)',
    associates: 'K. Mallesh, Venkatesh',
    history: [
      { fir: 'FIR 110/2024', ps: 'Khammam Urban', sections: 'Sec 20(b)(ii)(C) NDPS Act', date: '2024-07-19' },
      { fir: 'FIR 56/2025', ps: 'Wyra PS', sections: 'Sec 20(b)(ii)(B) NDPS Act', date: '2025-05-04' }
    ]
  },
  {
    id: 5, crNo: '32/2025', secOfLaw: 'Sec 20(b)(ii)(A) NDPS Act',
    policeStation: 'Walayar', psDistrict: 'Palakkad',
    accusedDetails: 'A1. Faizal Rahim, Age 30, S/O Abdul Rahim',
    mandal: 'Walayar', accusedDistrict: 'Palakkad', state: 'KL',
    name: 'Faizal Rahim', district: 'Palakkad', contraband: 'Hashish Oil',
    casesCount: 2, lastSighting: '2026-06-12', risk: 'Medium',
    aadhaar: 'XXXX-XXXX-1102', phone: '+91 90442 88310',
    vehicles: 'KL-09-AH-4112 (Royal Enfield - Bullet)',
    associates: 'Subair P.K., Jaleel',
    history: [
      { fir: 'FIR 32/2025', ps: 'Walayar', sections: 'Sec 20(b)(ii)(A) NDPS Act', date: '2025-03-22' },
      { fir: 'FIR 184/2025', ps: 'Thrissur West', sections: 'Sec 22(b) NDPS Act', date: '2025-12-10' }
    ]
  },
  {
    id: 6, crNo: '88/2024', secOfLaw: 'Sec 22(c) NDPS Act',
    policeStation: 'Madurai City', psDistrict: 'Madurai',
    accusedDetails: 'A1. Arivalagan P., Age 27, S/O Palani',
    mandal: 'Madurai South', accusedDistrict: 'Madurai', state: 'TN',
    name: 'Arivalagan P.', district: 'Madurai', contraband: 'Methamphetamine',
    casesCount: 6, lastSighting: '2026-06-30', risk: 'High',
    aadhaar: 'XXXX-XXXX-6712', phone: '+91 94441 55670',
    vehicles: 'TN-59-Z-0099 (Maruti Swift - Red)',
    associates: 'Selvam, Kathir',
    history: [
      { fir: 'FIR 88/2024', ps: 'Madurai City', sections: 'Sec 22(c) NDPS Act', date: '2024-08-11' },
      { fir: 'FIR 244/2025', ps: 'Trichy Junction', sections: 'Sec 22(c) NDPS Act', date: '2025-10-23' }
    ]
  },
  {
    id: 7, crNo: '12/2026', secOfLaw: 'Sec 22(a) NDPS Act',
    policeStation: 'Kalpetta PS', psDistrict: 'Wayanad',
    accusedDetails: 'A1. Justin Joseph, Age 24, S/O Joseph K.',
    mandal: 'Kalpetta', accusedDistrict: 'Wayanad', state: 'KL',
    name: 'Justin Joseph', district: 'Wayanad', contraband: 'MDMA Pills',
    casesCount: 1, lastSighting: '2026-07-01', risk: 'Low',
    aadhaar: 'XXXX-XXXX-3345', phone: '+91 98950 44221',
    vehicles: 'KL-12-Q-7788 (Yamaha R15 - Blue)',
    associates: 'Nikhil George',
    history: [
      { fir: 'FIR 12/2026', ps: 'Kalpetta PS', sections: 'Sec 22(a) NDPS Act', date: '2026-02-28' }
    ]
  }
];

const INITIAL_GRP_OFFENDERS = [
  {
    id: 11,
    name: "Suresh Pillai",
    state: "KA",
    district: "Yasvantpur Rly Stn",
    contraband: "MDMA Crystals",
    casesCount: 3,
    lastSighting: "2026-06-18",
    risk: "High",
    aadhaar: "XXXX-XXXX-7711",
    phone: "+91 91234 56789",
    vehicles: "Transit via Train 12627 (Karnataka Exp)",
    associates: "Kumar S., Murthy",
    history: [
      { fir: "GRP 12/2025", ps: "Yasvantpur Rly PS", sections: "Sec 22(c) NDPS Act", date: "2025-05-10" },
      { fir: "GRP 89/2025", ps: "Bangalore City GRP", sections: "Sec 22(c) NDPS Act", date: "2025-11-12" }
    ]
  },
  {
    id: 12,
    name: "M. D. Rafi",
    state: "TS",
    district: "Secunderabad Junction",
    contraband: "Commercial Ganja",
    casesCount: 4,
    lastSighting: "2026-07-01",
    risk: "High",
    aadhaar: "XXXX-XXXX-3344",
    phone: "+91 70133 99881",
    vehicles: "Transit via Train 17230 (Sabari Express)",
    associates: "Feroz Khan",
    history: [
      { fir: "GRP 44/2024", ps: "Secunderabad GRP", sections: "Sec 20(b)(ii)(C) NDPS Act", date: "2024-09-18" },
      { fir: "GRP 05/2026", ps: "Kazipet GRP", sections: "Sec 20(b)(ii)(B) NDPS Act", date: "2026-01-20" }
    ]
  },
  {
    id: 13,
    name: "K. Ranganathan",
    state: "TN",
    district: "Chennai Central",
    contraband: "Charas Blocks",
    casesCount: 2,
    lastSighting: "2026-06-29",
    risk: "Medium",
    aadhaar: "XXXX-XXXX-5522",
    phone: "+91 94440 22110",
    vehicles: "Transit via Train 12670 (Ganga Kaveri Exp)",
    associates: "Dhanasekar",
    history: [
      { fir: "GRP 95/2025", ps: "Chennai Central GRP", sections: "Sec 20(b)(ii)(B) NDPS Act", date: "2025-07-04" }
    ]
  },
  {
    id: 14,
    name: "Biju Kurian",
    state: "KL",
    district: "Palakkad GRP",
    contraband: "Hashish Oil",
    casesCount: 2,
    lastSighting: "2026-07-03",
    risk: "Medium",
    aadhaar: "XXXX-XXXX-6677",
    phone: "+91 98460 33445",
    vehicles: "Transit via Train 12626 (Kerala Express)",
    associates: "Rijo George",
    history: [
      { fir: "GRP 18/2025", ps: "Palakkad GRP", sections: "Sec 20(b)(ii)(A) NDPS Act", date: "2025-02-15" }
    ]
  },
  {
    id: 15,
    name: "Yogesh Yadav",
    state: "AP",
    district: "Vijayawada Junction",
    contraband: "Orissa-origin Ganja",
    casesCount: 5,
    lastSighting: "2026-07-04",
    risk: "High",
    aadhaar: "XXXX-XXXX-9900",
    phone: "+91 88990 11223",
    vehicles: "Transit via Train 12840 (Howrah Mail)",
    associates: "Subba Rao, Panda Ji",
    history: [
      { fir: "GRP 101/2024", ps: "Vijayawada GRP", sections: "Sec 20(b)(ii)(C) NDPS Act", date: "2024-10-02" },
      { fir: "GRP 12/2025", ps: "Visakhapatnam GRP", sections: "Sec 20(b)(ii)(C) NDPS Act", date: "2025-03-14" }
    ]
  }
];

const INITIAL_PE_OFFENDERS = [
  {
    id: 21,
    name: "Dr. Ramachandran",
    state: "TN",
    district: "SIPCOT Ranipet",
    contraband: "Methamphetamine Lab",
    casesCount: 6,
    lastSighting: "2026-06-20",
    risk: "High",
    aadhaar: "XXXX-XXXX-1155",
    phone: "+91 95000 88776",
    vehicles: "TN-23-AJ-9000 (Bolero Pickup)",
    associates: "Loganathan, Chemicals Raja",
    history: [
      { fir: "EXC 80/2024", ps: "Excise Intell Wing Madras", sections: "Sec 22(c) NDPS Act (Precursor)", date: "2024-05-18" },
      { fir: "EXC 04/2025", ps: "Vellore Excise Stn", sections: "Sec 22(c) NDPS Act", date: "2025-01-22" }
    ]
  },
  {
    id: 22,
    name: "Venkata Raju",
    state: "AP",
    district: "Chittoor Excise",
    contraband: "Liquid Ganja Concentrate",
    casesCount: 3,
    lastSighting: "2026-07-02",
    risk: "Medium",
    aadhaar: "XXXX-XXXX-2266",
    phone: "+91 99088 12345",
    vehicles: "AP-03-EE-1122 (Toyota Hilux)",
    associates: "Excise-wanted Kuppam gang",
    history: [
      { fir: "EXC 142/2025", ps: "Chittoor Excise Stn", sections: "Sec 20(b)(ii)(B) NDPS Act", date: "2025-08-30" }
    ]
  },
  {
    id: 23,
    name: "Hanumanthappa",
    state: "KA",
    district: "Jigani Industrial Area",
    contraband: "Alprazolam Powder",
    casesCount: 4,
    lastSighting: "2026-06-25",
    risk: "High",
    aadhaar: "XXXX-XXXX-3377",
    phone: "+91 80112 33445",
    vehicles: "KA-53-Z-8800 (Eicher Truck)",
    associates: "Chemical Lab Chemists",
    history: [
      { fir: "EXC 55/2025", ps: "Excise Enforcement B'lore", sections: "Sec 22(c) NDPS Act", date: "2025-06-02" }
    ]
  },
  {
    id: 24,
    name: "K. Prabhakar",
    state: "TS",
    district: "Shamshabad Excise",
    contraband: "Hydroponic Ganja",
    casesCount: 2,
    lastSighting: "2026-06-30",
    risk: "Medium",
    aadhaar: "XXXX-XXXX-4488",
    phone: "+91 91009 88776",
    vehicles: "TS-07-EX-4455 (Skoda Kushaq)",
    associates: "Vikas Reddy",
    history: [
      { fir: "EXC 09/2026", ps: "Excise Range Shamshabad", sections: "Sec 20(b)(ii)(A) NDPS Act", date: "2026-02-14" }
    ]
  },
  {
    id: 25,
    name: "Shaji Mathew",
    state: "KL",
    district: "Idukki Border",
    contraband: "High Grade Hashish",
    casesCount: 3,
    lastSighting: "2026-07-05",
    risk: "High",
    aadhaar: "XXXX-XXXX-5599",
    phone: "+91 94470 55667",
    vehicles: "KL-06-Z-1010 (Jeep Compass)",
    associates: "Sunny Idukki",
    history: [
      { fir: "EXC 33/2025", ps: "Idukki Excise Range", sections: "Sec 20(b)(ii)(C) NDPS Act", date: "2025-03-20" }
    ]
  }
];

// INITIAL_ALERTS and INITIAL_OPERATIONS removed — page is now a pure state-level directory

export default function SouthIndiaDataBank() {
  const perms = usePermissions();
  
  // Tab states
  const [activeBranch, setActiveBranch] = useState('LO'); // 'LO' | 'GRP' | 'PE'
  
  // Independent state selectors for each branch
  const [loState, setLoState] = useState('ALL');
  const [grpState, setGrpState] = useState('ALL');
  const [peState, setPeState] = useState('ALL');

  const [searchQuery, setSearchQuery] = useState('');

  // Offenders state split by department
  const [loOffenders, setLoOffenders] = useState(INITIAL_LO_OFFENDERS);
  const [grpOffenders, setGrpOffenders] = useState(INITIAL_GRP_OFFENDERS);
  const [peOffenders, setPeOffenders] = useState(INITIAL_PE_OFFENDERS);


  // Modals state
  const [dossierOffender, setDossierOffender] = useState(null);
  const [reportingOffender, setReportingOffender] = useState(null);
  const [sightingForm, setSightingForm] = useState({
    location: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    vehicleUsed: '',
    description: '',
    reporterName: perms.user?.fullName || 'Duty Officer',
    reporterRank: perms.user?.role || 'SHO'
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mainEl = document.querySelector('main.overflow-y-auto');
    if (!mainEl) return;

    const handleScroll = () => {
      if (mainEl.scrollTop > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    mainEl.addEventListener('scroll', handleScroll);
    return () => {
      mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await api.get('/offenders/databank/records');
        if (response.data && response.data.success) {
          const fetched = response.data.data || [];
          const loFromDB = fetched.filter(item => item.branch === 'LO').map(item => ({ ...item, id: `db_${item.id}` }));
          const grpFromDB = fetched.filter(item => item.branch === 'GRP').map(item => ({ ...item, id: `db_${item.id}` }));
          const peFromDB = fetched.filter(item => item.branch === 'PE').map(item => ({ ...item, id: `db_${item.id}` }));

          setLoOffenders([...loFromDB, ...INITIAL_LO_OFFENDERS]);
          setGrpOffenders([...grpFromDB, ...INITIAL_GRP_OFFENDERS]);
          setPeOffenders([...peFromDB, ...INITIAL_PE_OFFENDERS]);
        }
      } catch (error) {
        console.error('Failed to fetch databank records:', error);
      }
    };
    fetchRecords();
  }, []);

  // Helper properties to get currently active branch configuration
  const activeOffendersList = activeBranch === 'LO' ? loOffenders : activeBranch === 'GRP' ? grpOffenders : peOffenders;
  const currentBranchStateFilter = activeBranch === 'LO' ? loState : activeBranch === 'GRP' ? grpState : peState;

  const handleStateFilterChange = (stateCode) => {
    if (activeBranch === 'LO') setLoState(stateCode);
    else if (activeBranch === 'GRP') setGrpState(stateCode);
    else setPeState(stateCode);
  };

  // Sighting submission handler
  const handleSightingSubmit = (e) => {
    e.preventDefault();
    
    // Add new alert mimicking a lookout bulletin
    const newAlert = {
      id: Date.now(),
      source: `${activeBranch} Border Cell (${sightingForm.reporterName})`,
      type: "Sighting Logged",
      text: `Sighting reported for [${activeBranch}] accused ${reportingOffender.name}: spotted at ${sightingForm.location} on ${sightingForm.date} at ${sightingForm.time}. Notes: ${sightingForm.description || 'None'}. Vehicle: ${sightingForm.vehicleUsed || 'Not specified'}.`,
      date: `${sightingForm.date} ${sightingForm.time}`
    };

    // Alert logged (would be sent to backend in production)

    // Update offender's last sighting date in the correct list
    if (activeBranch === 'LO') {
      setLoOffenders(prev => prev.map(o => o.id === reportingOffender.id ? { ...o, lastSighting: sightingForm.date } : o));
    } else if (activeBranch === 'GRP') {
      setGrpOffenders(prev => prev.map(o => o.id === reportingOffender.id ? { ...o, lastSighting: sightingForm.date } : o));
    } else {
      setPeOffenders(prev => prev.map(o => o.id === reportingOffender.id ? { ...o, lastSighting: sightingForm.date } : o));
    }

    setToastMessage(`Sighting for ${reportingOffender.name} has been successfully logged & dispatched to inter-state alerts.`);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);

    // Reset and Close
    setReportingOffender(null);
    setSightingForm({
      location: '',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      vehicleUsed: '',
      description: '',
      reporterName: perms.user?.fullName || 'Duty Officer',
      reporterRank: perms.user?.role || 'SHO'
    });
  };

  // Filter offenders for currently selected branch
  const filteredOffenders = activeOffendersList.filter(offender => {
    const stateMapping = {
      'andhra pradesh': 'AP',
      'telangana': 'TS',
      'karnataka': 'KA',
      'tamil nadu': 'TN',
      'kerala': 'KL',
      'ap': 'AP',
      'ts': 'TS',
      'ka': 'KA',
      'tn': 'TN',
      'kl': 'KL'
    };
    const offenderStateCode = stateMapping[(offender.state || '').toLowerCase().trim()] || offender.state;
    const matchesState = currentBranchStateFilter === 'ALL' || offenderStateCode === currentBranchStateFilter;
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      (offender.name || '').toLowerCase().includes(query) ||
      (offender.accusedDetails || '').toLowerCase().includes(query) ||
      (offender.crNo || '').toLowerCase().includes(query) ||
      (offender.policeStation || '').toLowerCase().includes(query) ||
      (offender.district || '').toLowerCase().includes(query) ||
      (offender.psDistrict || '').toLowerCase().includes(query) ||
      (offender.accusedDistrict || '').toLowerCase().includes(query) ||
      (offender.mandal || '').toLowerCase().includes(query) ||
      (offender.secOfLaw || '').toLowerCase().includes(query) ||
      (offender.aadhaar || '').includes(query) ||
      (offender.phone || '').includes(query) ||
      (offender.vehicles || '').toLowerCase().includes(query) ||
      (offender.contraband || '').toLowerCase().includes(query);

    return matchesState && matchesSearch;
  });

  // Department Branch Sidebar Items Configuration
  const sidebarBranches = [
    {
      id: 'LO',
      label: 'L&O Police NDPS Data',
      desc: 'Law & Order Police records',
      count: loOffenders.length,
      activeClass: 'bg-[#f15a24] border-[#f15a24] text-white shadow-md',
      inactiveClass: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-[#f15a24] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 shadow-sm',
      labelClassSelected: 'text-white',
      labelClassInactive: 'text-[#f15a24]',
      badgeClassSelected: 'bg-[#d3400a] text-white',
      badgeClassInactive: 'bg-[#d1fae5] text-[#065f46]',
      descClassSelected: 'text-white/80',
      descClassInactive: 'text-slate-500 dark:text-slate-400',
      stateDotClass: 'bg-[#ffbb80]'
    },
    {
      id: 'GRP',
      label: 'GRP NDPS Data',
      desc: 'Railway police transit logs',
      count: grpOffenders.length,
      activeClass: 'bg-[#3f51b5] border-[#3f51b5] text-white shadow-md',
      inactiveClass: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-[#3f51b5] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 shadow-sm',
      labelClassSelected: 'text-white',
      labelClassInactive: 'text-[#3f51b5]',
      badgeClassSelected: 'bg-[#283593] text-white',
      badgeClassInactive: 'bg-[#d1fae5] text-[#065f46]',
      descClassSelected: 'text-white/80',
      descClassInactive: 'text-slate-500 dark:text-slate-400',
      stateDotClass: 'bg-[#c5cae9]'
    },
    {
      id: 'PE',
      label: 'P&E NDPS Data',
      desc: 'Prohibition & Excise alerts',
      count: peOffenders.length,
      activeClass: 'bg-[#047857] border-[#047857] text-white shadow-md',
      inactiveClass: 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-[#047857] hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 shadow-sm',
      labelClassSelected: 'text-white',
      labelClassInactive: 'text-[#047857]',
      badgeClassSelected: 'bg-[#064e3b] text-white',
      badgeClassInactive: 'bg-[#d1fae5] text-[#065f46]',
      descClassSelected: 'text-white/80',
      descClassInactive: 'text-slate-500 dark:text-slate-400',
      stateDotClass: 'bg-[#a7f3d0]'
    }
  ];

  const renderBranchSelector = (isMobile = false) => (
    <div 
      className="p-5 rounded-2xl border text-slate-900 shadow-lg space-y-4"
      style={{ backgroundColor: '#8bc53f', borderColor: '#74a634' }}
    >
      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-1">
        {isMobile ? 'Branch Database (Mobile)' : 'Branch Database'}
      </h3>

      <div className="flex flex-col gap-3">
        {sidebarBranches.map(branch => {
          const isSelected = activeBranch === branch.id;
          return (
            <button
              key={branch.id}
              onClick={() => {
                setActiveBranch(branch.id);
                if (isMobile) setMobileMenuOpen(false);
              }}
              className={`w-full text-left p-4 rounded-xl border border-l-4 transition-all flex items-start cursor-pointer ${
                isSelected ? branch.activeClass : branch.inactiveClass
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">
                  <span className={`truncate ${isSelected ? branch.labelClassSelected : branch.labelClassInactive}`}>
                    {branch.label}
                  </span>
                </div>
                <div className={`text-[11px] mt-1 line-clamp-1 ${
                  isSelected ? branch.descClassSelected : branch.descClassInactive
                }`}>
                  {branch.desc}
                </div>
                {isSelected && (
                  <div className="mt-2 text-[10px] font-bold text-white/90 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${branch.stateDotClass}`}></span>
                    State: {STATES.find(s=>s.code === (branch.id === 'LO' ? loState : branch.id === 'GRP' ? grpState : peState))?.name}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Helper Block */}
      <div 
        className="p-4 rounded-xl border text-[#1b3d1b] text-[11px] leading-relaxed"
        style={{ backgroundColor: '#e9f5db', borderColor: '#cce2b4' }}
      >
        <p className="font-bold text-[#0f3d0f] uppercase text-[9px] tracking-wide mb-1">
          Department Scope
        </p>
        State selection filters remain preserved for each branch as you switch between Law & Order, GRP, and Excise databases.
      </div>
    </div>
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-6 min-h-screen text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-950/50 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-100 shadow-xl animate-bounce">
          <IconShield size={20} className="text-emerald-600 dark:text-emerald-400" />
          <div className="text-sm font-semibold">{toastMessage}</div>
        </div>
      )}

      {/* Main Content Area (Left/Center) */}
      <div className="flex-1 space-y-6 min-w-0">
        
        {/* Header */}
        <div 
          className="flex flex-row items-center justify-between gap-6 p-6 rounded-2xl border border-blue-100 dark:border-blue-950/30 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(139,92,246,0.05))',
          }}
        >
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              South India NDPS Data Bank
            </h1>
          </div>
          <div className="flex-shrink-0">
            <img 
              src={southIndiaMap} 
              alt="South India Map" 
              className="h-28 w-auto object-contain rounded-lg shadow-xs" 
            />
          </div>
        </div>

        {/* State-Wise KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { code: 'AP', name: 'Andhra Pradesh', colorClass: 'border-orange-100 dark:border-orange-950/40 bg-orange-50/5 text-orange-600 dark:text-orange-400' },
            { code: 'TS', name: 'Telangana', colorClass: 'border-pink-100 dark:border-pink-950/40 bg-pink-50/5 text-pink-600 dark:text-pink-400' },
            { code: 'KA', name: 'Karnataka', colorClass: 'border-yellow-100 dark:border-yellow-950/40 bg-yellow-50/5 text-yellow-600 dark:text-yellow-400' },
            { code: 'TN', name: 'Tamil Nadu', colorClass: 'border-red-100 dark:border-red-950/40 bg-red-50/5 text-red-600 dark:text-red-400' },
            { code: 'KL', name: 'Kerala', colorClass: 'border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/5 text-emerald-600 dark:text-emerald-400' }
          ].map(state => {
            const list = activeOffendersList.filter(o => o.state === state.code);
            const accusedCount = list.length;
            const casesCount = list.reduce((sum, o) => sum + o.casesCount, 0);
            return (
              <div 
                key={state.code} 
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${state.colorClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wide opacity-80">{state.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900/10 dark:bg-white/10 text-slate-800 dark:text-slate-200">
                    {state.code}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Accused:</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{accusedCount}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">Cases:</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-white">{casesCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Directory Content (no sub-tabs — pure state-level directory) */}
        <div className="space-y-4">
            
            {/* Search Filters Bar */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <IconSearch size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search Cr. No., Accused, Police Station, District..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* State Select */}
              <div className="w-full md:w-48">
                <select
                  value={currentBranchStateFilter}
                  onChange={(e) => handleStateFilterChange(e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {STATES.map(st => (
                    <option key={st.code} value={st.code}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* States Selector Tags (Scoped to active branch) */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wide">
                Filter State ({activeBranch} Desk):
              </span>
              {STATES.map(st => (
                <button
                  key={st.code}
                  onClick={() => handleStateFilterChange(st.code)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                    currentBranchStateFilter === st.code
                      ? `${st.color} border-slate-700 dark:border-white shadow-sm`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st.name}
                </button>
              ))}
            </div>

            {/* Directory Table — AP State L&O Police Schema */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="px-4 py-3 whitespace-nowrap">Cr. No.</th>
                      <th className="px-4 py-3 whitespace-nowrap">Sec of Law</th>
                      <th className="px-4 py-3 whitespace-nowrap">Police Station</th>
                      <th className="px-4 py-3 whitespace-nowrap">District</th>
                      <th className="px-4 py-3 whitespace-nowrap min-w-[200px]">Accused Details</th>
                      <th className="px-4 py-3 whitespace-nowrap">Mandal</th>
                      <th className="px-4 py-3 whitespace-nowrap">Accused District</th>
                      <th className="px-4 py-3 whitespace-nowrap">State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                    {filteredOffenders.length > 0 ? (
                      filteredOffenders.map(offender => (
                        <tr key={offender.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3 font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                            {offender.crNo}
                          </td>
                          <td className="px-4 py-3 text-slate-700 dark:text-slate-300 max-w-[180px]">
                            <span className="line-clamp-2">{offender.secOfLaw}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {offender.policeStation}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {offender.psDistrict}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900 dark:text-white text-[11px]">{offender.accusedDetails}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{offender.phone} | {offender.aadhaar}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {offender.mandal}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {offender.accusedDistrict}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                              STATES.find(s => s.code === offender.state)?.color
                            }`}>
                              {offender.state}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-5 py-10 text-center text-slate-400">
                          No suspects found matching filters for this branch.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

      </div>

      {/* Right Sidebar Area (Sticky Wrapper) */}
      <div className="hidden xl:block w-full xl:w-64 flex-shrink-0 xl:sticky xl:top-6 self-start space-y-4">
        
        {/* Sticky Header that animates down/in when scrolled */}
        <div 
          className={`transition-all duration-500 ease-out overflow-hidden ${
            scrolled 
              ? 'max-h-40 opacity-100 transform translate-y-0 scale-100' 
              : 'max-h-0 opacity-0 transform -translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <div 
            className="p-4 rounded-2xl border text-slate-900 shadow-md flex items-center justify-between gap-3"
            style={{ backgroundColor: '#8bc53f', borderColor: '#74a634' }}
          >
            <h2 className="text-sm font-black tracking-tight text-emerald-950 leading-tight">
              South India NDPS Data Bank
            </h2>
          </div>
        </div>

        {/* Desktop Sidebar: renders inline */}
        {renderBranchSelector(false)}

      </div>

      {/* MODAL: OFFENDER DOSSIER */}
      {dossierOffender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <IconUsers size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Inter-State Suspect Dossier</h3>
                  <p className="text-xs text-slate-400 font-medium">Cross-border Narcotics Intelligence Network [{activeBranch}]</p>
                </div>
              </div>
              <button 
                onClick={() => setDossierOffender(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                ✕ Close
              </button>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              
              {/* Primary Suspect Details */}
              <div className="grid md:grid-cols-3 gap-6 items-start">
                
                {/* Photo Mock / State Badge */}
                <div className="bg-slate-50 dark:bg-slate-950/80 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-black text-xl mb-3">
                    {dossierOffender.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{dossierOffender.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">ID: #{activeBranch}-NDPS-98{dossierOffender.id}</div>
                  
                  <span className={`mt-3 inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                    STATES.find(s => s.code === dossierOffender.state)?.color
                  }`}>
                    {STATES.find(s => s.code === dossierOffender.state)?.name}
                  </span>
                </div>

                {/* Profile Grid */}
                <div className="md:col-span-2 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Aadhaar Reference</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{dossierOffender.aadhaar}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Primary Mobile</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{dossierOffender.phone}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Regional Area / Hub</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{dossierOffender.district}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 font-semibold uppercase text-[10px]">Risk Categorisation</div>
                      <div className="font-bold text-red-600 dark:text-red-400 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> {dossierOffender.risk}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Transit / Vehicle logs</div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1.5">
                      <IconVehicle size={14} className="text-pink-500" />
                      {dossierOffender.vehicles}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-semibold uppercase text-[10px]">Linked Co-Accused & Associates</div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {dossierOffender.associates}
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrest & Case History Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">Inter-State Case Register ({dossierOffender.history.length})</h4>
                <div className="space-y-3">
                  {dossierOffender.history.map((record, ri) => (
                    <div key={ri} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 flex justify-between gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-blue-600 dark:text-blue-400">{record.fir}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">| Location: {record.ps}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Sections Applied: {record.sections}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 whitespace-nowrap self-start">
                        Date: {record.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Action Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex justify-end">
              <button
                onClick={() => setDossierOffender(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Dossier Validated
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT INTERSTATE SIGHTING */}
      {reportingOffender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl animate-fade-in">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 animate-pulse">
                  <IconWarning size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Report Sighting / Intel</h3>
                  <p className="text-xs text-slate-400 font-medium">Log sighting for {reportingOffender.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setReportingOffender(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm font-bold p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSightingSubmit} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sighting Date</label>
                  <input
                    type="date"
                    required
                    value={sightingForm.date}
                    onChange={(e) => setSightingForm({...sightingForm, date: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sighting Time</label>
                  <input
                    type="time"
                    required
                    value={sightingForm.time}
                    onChange={(e) => setSightingForm({...sightingForm, time: e.target.value})}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Location Checkpost / Border Point</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Naraharipet Border Checkpost, Chittoor"
                  value={sightingForm.location}
                  onChange={(e) => setSightingForm({...sightingForm, location: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Vehicle Sighted (If different from Dossier)</label>
                <input
                  type="text"
                  placeholder="e.g. TN-59-Z-0099 (Maruti Swift - Red)"
                  value={sightingForm.vehicleUsed}
                  onChange={(e) => setSightingForm({...sightingForm, vehicleUsed: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Detailed Description / Movement Direction</label>
                <textarea
                  rows="3"
                  placeholder="Describe suspect clothing, direction of movement, other associates spotted together..."
                  value={sightingForm.description}
                  onChange={(e) => setSightingForm({...sightingForm, description: e.target.value})}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg border border-slate-100 dark:border-slate-800/80">
                <span className="block font-bold text-slate-600 dark:text-slate-300">Reporting Officer credentials:</span>
                <span className="text-slate-500 mt-1 block">{sightingForm.reporterName} ({sightingForm.reporterRank}) — STF Border Command</span>
              </div>

              {/* Submit Footer */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setReportingOffender(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <IconClipboard size={14} /> Log & Dispatch Alert
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile Menu */}
      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="xl:hidden fixed bottom-6 right-6 z-40 bg-[#8bc53f] hover:bg-[#74a634] text-emerald-950 p-4 rounded-full shadow-2xl border border-[#74a634] flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
        title="Quick Menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Drawer Overlay for Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-xs bg-slate-900/90 backdrop-blur-md h-full shadow-2xl p-6 flex flex-col gap-4 overflow-y-auto border-l border-slate-800">
            {/* Close Header */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded-lg cursor-pointer transition-all"
              >
                ✕ Close
              </button>
            </div>

            {/* Mobile Sidebar: renders inside drawer */}
            {renderBranchSelector(true)}
          </div>
        </div>
      )}

    </div>
  );
}
