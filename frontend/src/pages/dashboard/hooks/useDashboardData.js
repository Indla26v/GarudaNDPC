import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axios';
import { usePermissions } from '../../../hooks/usePermissions';

export function useDashboardData() {
  const perms = usePermissions();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  const fetchSummary = useCallback(async (range = timeRange, force = false) => {
    setLoading(true);
    setError('');
    try {
      const url = `/dashboard/summary?timeRange=${range}${force ? '&force=true' : ''}`;
      const res = await api.get(url);
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchSummary(timeRange);
  }, [timeRange, fetchSummary]);

  return {
    data,
    loading,
    error,
    timeRange,
    setTimeRange,
    refresh: () => fetchSummary(timeRange, true),
    perms,
  };
}
