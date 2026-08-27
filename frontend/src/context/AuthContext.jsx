import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useIdleTimeout } from '../hooks/useIdleTimeout';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('garuda_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [sessionValidated, setSessionValidated] = useState(false);
  const validatingRef = useRef(false);

  const isAuthenticated = !!user;

  /**
   * Validate session against the server.
   * Called on app mount and when the tab regains focus after idle.
   */
  const validateSession = useCallback(async () => {
    if (validatingRef.current) {
      setSessionValidated(true);
      return;
    }

    validatingRef.current = true;
    try {
      const res = await api.get('/auth/me');
      const serverUser = res.data.data;
      const userData = {
        username: serverUser.username,
        positionLabel: serverUser.positionLabel || null,
        fullName: serverUser.fullName || 'Vacant',
        officerId: serverUser.officerId || null,
        email: serverUser.email || null,
        phoneNumber: serverUser.phoneNumber || serverUser.phone_number || null,
        role: serverUser.role,
        department: serverUser.department || null,
        policeStationId: serverUser.policeStationId || serverUser.police_station_id || null,
        divisionId: serverUser.divisionId || serverUser.division_id || null,
        district: serverUser.district || null,
        badgeNumber: serverUser.badgeNumber || serverUser.badge_number || null,
        mustChangePassword: serverUser.mustChangePassword ?? false,
        passwordExpiresAt: serverUser.passwordExpiresAt || null,
      };
      localStorage.setItem('garuda_user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('garuda_user');
        setUser(null);
      }
    } finally {
      validatingRef.current = false;
      setSessionValidated(true);
    }
  }, []);

  // Callable function to refresh user data (e.g., after profile update)
  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      const serverUser = res.data.data;
      const userData = {
        username: serverUser.username,
        positionLabel: serverUser.positionLabel || null,
        fullName: serverUser.fullName || 'Vacant',
        officerId: serverUser.officerId || null,
        email: serverUser.email || null,
        phoneNumber: serverUser.phoneNumber || serverUser.phone_number || null,
        role: serverUser.role,
        department: serverUser.department || null,
        policeStationId: serverUser.policeStationId || serverUser.police_station_id || null,
        divisionId: serverUser.divisionId || serverUser.division_id || null,
        district: serverUser.district || null,
        badgeNumber: serverUser.badgeNumber || serverUser.badge_number || null,
        mustChangePassword: serverUser.mustChangePassword ?? false,
        passwordExpiresAt: serverUser.passwordExpiresAt || null,
      };
      localStorage.setItem('garuda_user', JSON.stringify(userData));
      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, []);

  const markPasswordChanged = useCallback((updatedUserData) => {
    setUser((prev) => {
      const base = updatedUserData || prev;
      if (!base) return null;
      const updated = { ...base, mustChangePassword: false };
      localStorage.setItem('garuda_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Direct login setter after OTP verification
  const setAuthenticatedUser = useCallback((userData) => {
    localStorage.setItem('garuda_user', JSON.stringify(userData));
    setUser(userData);
    setSessionValidated(true);
  }, []);

  // Validate session on initial mount
  useEffect(() => {
    const stored = localStorage.getItem('garuda_user');
    if (stored) {
      validateSession();
    } else {
      setSessionValidated(true);
    }
  }, [validateSession]);

  // Re-validate when tab regains focus after being hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, validateSession]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      const data = res.data.data;

      // ── 60-Day Expiry Redirection Trigger ──
      if (data.passwordExpired) {
        return {
          success: false,
          passwordExpired: true,
          mustChangePassword: true,
          username: data.username,
          resetToken: data.resetToken,
          maskedEmail: data.maskedEmail,
          message: data.message || 'Your 60-day password cycle has expired. A verification code has been sent to your department email.',
        };
      }

      const userData = {
        username: data.username,
        positionLabel: data.positionLabel || null,
        fullName: data.fullName || 'Vacant',
        officerId: data.officerId || null,
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        role: data.role,
        department: data.department || null,
        policeStationId: data.policeStationId || null,
        divisionId: data.divisionId || null,
        district: data.district || null,
        badgeNumber: data.badgeNumber || null,
        mustChangePassword: data.mustChangePassword ?? false,
        passwordExpiresAt: data.passwordExpiresAt || null,
      };
      localStorage.setItem('garuda_user', JSON.stringify(userData));
      setUser(userData);
      setSessionValidated(true);
      return { success: true, mustChangePassword: data.mustChangePassword ?? false };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async (reason) => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('garuda_user');
    setUser(null);
    if (reason === 'idle') {
      sessionStorage.setItem('garuda_idle_logout', 'true');
    }
  }, []);

  // Auto-logout after 15 minutes of inactivity
  useIdleTimeout(
    () => logout('idle'),
    15 * 60 * 1000,
    isAuthenticated
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        sessionValidated,
        login,
        logout,
        refreshUser,
        markPasswordChanged,
        setAuthenticatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
