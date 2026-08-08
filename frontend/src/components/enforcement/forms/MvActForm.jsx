import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import CustomSelect from '../../CustomSelect';

export default function MvActForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicle_no: '',
    driver_name: '',
    violation_type: '',
    fine_amount: '',
    challan_no: '',
    remarks: '',
    geo_lat: null,
    geo_lng: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            geo_lat: position.coords.latitude,
            geo_lng: position.coords.longitude
          }));
        },
        (error) => {
          console.log('Geolocation not available:', error);
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vehicle_no || !formData.driver_name || !formData.violation_type || !formData.fine_amount) {
      alert("Please fill in all required fields (*)");
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/enforcement/mv-act', formData);
      alert('MV Act violation logged successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit log');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Vehicle Registration Number *</label>
          <input
            type="text"
            name="vehicle_no"
            value={formData.vehicle_no}
            onChange={handleChange}
            className="input"
            placeholder="e.g. AP39TV1234"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Driver Name *</label>
          <input
            type="text"
            name="driver_name"
            value={formData.driver_name}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Suresh Kumar"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Violation Type *</label>
          <CustomSelect
            value={formData.violation_type}
            onChange={(e) => handleChange({ target: { name: 'violation_type', value: e.target.value } })}
            options={[
              { value: '', label: '-- Select Violation --' },
              { value: 'No Helmet', label: 'No Helmet' },
              { value: 'Triple Riding', label: 'Triple Riding' },
              { value: 'Over Speeding', label: 'Over Speeding' },
              { value: 'Dangerous Driving', label: 'Dangerous Driving' },
              { value: 'No License', label: 'No License' },
              { value: 'Modified Exhaust / Silencer', label: 'Modified Exhaust / Silencer' },
              { value: 'Drunken Driving (Refused Test)', label: 'Drunken Driving (Refused Test)' },
              { value: 'Other Violation', label: 'Other Violation' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Fine Amount (INR) *</label>
          <input
            type="number"
            name="fine_amount"
            value={formData.fine_amount}
            onChange={handleChange}
            className="input"
            placeholder="e.g. 500"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Challan Reference Number</label>
          <input
            type="text"
            name="challan_no"
            value={formData.challan_no}
            onChange={handleChange}
            className="input"
            placeholder="e.g. CH/1093/2026"
          />
        </div>

        {formData.geo_lat && formData.geo_lng && (
          <div className="flex items-center space-x-2 text-xs text-green-400 font-semibold pb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Geo-tagged: {formData.geo_lat.toFixed(5)}, {formData.geo_lng.toFixed(5)}</span>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-garuda-200)' }}>Remarks / Notes</label>
        <textarea
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows="3"
          className="input"
          placeholder="Enter details of vehicle check or special observations..."
        ></textarea>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--color-garuda-700)' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Log'}
        </button>
      </div>
    </form>
  );
}
