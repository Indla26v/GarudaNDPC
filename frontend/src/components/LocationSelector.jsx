import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import CustomSelect from './CustomSelect';

/**
 * LocationSelector — Cascading State → District → Mandal dropdown
 * built entirely using the application's global CustomSelect UI.
 *
 * Props:
 *   state        - current state name
 *   district     - current district name
 *   mandal       - current mandal name (optional)
 *   onChange     - ({ state, district, mandal, stateCode, districtCode, mandalCode }) => void
 *   showMandal   - whether to render the mandal dropdown (default: true)
 *   disabled     - disable selection
 *   className    - optional container className
 */
export default function LocationSelector({
  state = '',
  district = '',
  mandal = '',
  onChange,
  showMandal = true,
  disabled = false,
  className = ''
}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);

  const [selectedStateCode, setSelectedStateCode] = useState(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState(null);

  // Fetch states on mount
  useEffect(() => {
    api.get('/master/states').then(res => {
      const data = res.data || [];
      setStates(data);
      if (state) {
        const match = data.find(s => s.state_name.toLowerCase() === state.toLowerCase());
        if (match) setSelectedStateCode(match.state_code);
      }
    }).catch(() => {});
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (selectedStateCode) {
      api.get(`/master/districts?state_code=${selectedStateCode}`).then(res => {
        const data = res.data || [];
        setDistricts(data);
        if (district) {
          const match = data.find(d => d.district_name.toLowerCase() === district.toLowerCase());
          if (match) setSelectedDistrictCode(match.district_code);
        }
      }).catch(() => {});
    } else {
      setDistricts([]);
      setSelectedDistrictCode(null);
    }
  }, [selectedStateCode]);

  // Fetch mandals when district changes
  useEffect(() => {
    if (selectedDistrictCode && showMandal) {
      api.get(`/master/mandals?district_code=${selectedDistrictCode}`).then(res => {
        setMandals(res.data || []);
      }).catch(() => {});
    } else {
      setMandals([]);
    }
  }, [selectedDistrictCode, showMandal]);

  const handleStateChange = useCallback((e) => {
    const val = e.target.value;
    const s = states.find(st => st.state_name === val);
    setSelectedStateCode(s ? s.state_code : null);
    setSelectedDistrictCode(null);
    onChange?.({
      state: val,
      district: '',
      mandal: '',
      stateCode: s?.state_code || null,
      districtCode: null,
      mandalCode: null
    });
  }, [onChange, states]);

  const handleDistrictChange = useCallback((e) => {
    const val = e.target.value;
    const d = districts.find(dist => dist.district_name === val);
    setSelectedDistrictCode(d ? d.district_code : null);
    const selectedState = states.find(s => s.state_code === selectedStateCode);
    onChange?.({
      state: selectedState?.state_name || state,
      district: val,
      mandal: '',
      stateCode: selectedStateCode,
      districtCode: d?.district_code || null,
      mandalCode: null
    });
  }, [onChange, states, districts, selectedStateCode, state]);

  const handleMandalChange = useCallback((e) => {
    const val = e.target.value;
    const m = mandals.find(man => man.mandal_name === val);
    const selectedState = states.find(s => s.state_code === selectedStateCode);
    const selectedDistrict = districts.find(d => d.district_code === selectedDistrictCode);
    onChange?.({
      state: selectedState?.state_name || state,
      district: selectedDistrict?.district_name || district,
      mandal: val,
      stateCode: selectedStateCode,
      districtCode: selectedDistrictCode,
      mandalCode: m?.mandal_code || null
    });
  }, [onChange, states, districts, mandals, selectedStateCode, selectedDistrictCode, state, district]);

  const stateOptions = useMemo(() => states.map(s => ({ value: s.state_name, label: s.state_name })), [states]);
  const districtOptions = useMemo(() => districts.map(d => ({ value: d.district_name, label: d.district_name })), [districts]);
  const mandalOptions = useMemo(() => mandals.map(m => ({ value: m.mandal_name, label: m.mandal_name })), [mandals]);

  const selectedStateName = states.find(s => s.state_code === selectedStateCode)?.state_name || state || '';
  const selectedDistrictName = districts.find(d => d.district_code === selectedDistrictCode)?.district_name || district || '';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full ${className}`}>
      <div className="w-full">
        <CustomSelect
          label="State"
          value={selectedStateName}
          onChange={handleStateChange}
          options={stateOptions}
          placeholder="Select State"
          disabled={disabled}
          searchable
          className="w-full"
        />
      </div>
      <div className="w-full">
        <CustomSelect
          label="District"
          value={selectedDistrictName}
          onChange={handleDistrictChange}
          options={districtOptions}
          placeholder={selectedStateCode ? "Select District" : "Select State first"}
          disabled={disabled || !selectedStateCode}
          searchable
          className="w-full"
        />
      </div>
      {showMandal && (
        <div className="w-full">
          <CustomSelect
            label="Mandal"
            value={mandal}
            onChange={handleMandalChange}
            options={mandalOptions}
            placeholder={selectedDistrictCode ? "Select Mandal" : "Select District first"}
            disabled={disabled || !selectedDistrictCode}
            searchable
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
