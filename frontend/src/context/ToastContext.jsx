import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const ToastContext = createContext(null);

// Global event bus for imperative toast calls (e.g. from axios interceptors)
const toastListeners = new Set();

export const toast = {
  badRequest: (reason, details = [], title = 'Bad Request — File Rejected') => {
    toastListeners.forEach((fn) =>
      fn({
        type: 'badRequest',
        title,
        reason: typeof reason === 'string' ? reason : reason?.message || 'Invalid request parameters',
        details: Array.isArray(details) ? details : details ? [String(details)] : [],
        duration: 7000,
      })
    );
  },
  error: (message, details = [], title = 'Error') => {
    toastListeners.forEach((fn) =>
      fn({
        type: 'error',
        title,
        reason: typeof message === 'string' ? message : message?.message || 'An error occurred',
        details: Array.isArray(details) ? details : details ? [String(details)] : [],
        duration: 6000,
      })
    );
  },
  warning: (message, title = 'Warning') => {
    toastListeners.forEach((fn) =>
      fn({
        type: 'warning',
        title,
        reason: message,
        duration: 5000,
      })
    );
  },
  success: (message, title = 'Success') => {
    toastListeners.forEach((fn) =>
      fn({
        type: 'success',
        title,
        reason: message,
        duration: 4000,
      })
    );
  },
  info: (message, title = 'Information') => {
    toastListeners.forEach((fn) =>
      fn({
        type: 'info',
        title,
        reason: message,
        duration: 4000,
      })
    );
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toastData) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newToast = {
      id,
      type: toastData.type || 'info',
      title: toastData.title || (toastData.type === 'badRequest' ? 'Bad Request' : 'Notification'),
      reason: toastData.reason || toastData.message || '',
      details: toastData.details || [],
      duration: toastData.duration !== undefined ? toastData.duration : 6000,
      createdAt: Date.now(),
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 simultaneous toasts
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.add(addToast);
    return () => {
      toastListeners.delete(addToast);
    };
  }, [addToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    badRequest: (reason, details, title) => toast.badRequest(reason, details, title),
    error: (msg, details, title) => toast.error(msg, details, title),
    warning: (msg, title) => toast.warning(msg, title),
    success: (msg, title) => toast.success(msg, title),
    info: (msg, title) => toast.info(msg, title),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback to global toast object if rendered outside provider
    return {
      badRequest: toast.badRequest,
      error: toast.error,
      warning: toast.warning,
      success: toast.success,
      info: toast.info,
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
    };
  }
  return ctx;
}

function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] sm:w-full pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast: item, onDismiss }) {
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!item.duration || item.duration <= 0) return;

    const interval = 20;
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / item.duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        onDismiss();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [item.duration, onDismiss]);

  const isBadRequest = item.type === 'badRequest';
  const isError = item.type === 'error' || isBadRequest;
  const isWarning = item.type === 'warning';
  const isSuccess = item.type === 'success';

  // Card theme styling
  let containerBg = 'bg-slate-900/95 border-red-500/40 text-slate-100 shadow-red-950/40';
  let badgeBg = 'bg-red-500/20 text-red-400 border-red-500/30';
  let badgeText = isBadRequest ? 'Bad Request' : 'Security Alert';
  let progressBarColor = 'bg-red-500';
  let iconColor = '#f87171';

  if (isWarning) {
    containerBg = 'bg-slate-900/95 border-amber-500/40 text-slate-100 shadow-amber-950/40';
    badgeBg = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    badgeText = 'Warning';
    progressBarColor = 'bg-amber-500';
    iconColor = '#fbbf24';
  } else if (isSuccess) {
    containerBg = 'bg-slate-900/95 border-emerald-500/40 text-slate-100 shadow-emerald-950/40';
    badgeBg = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    badgeText = 'Success';
    progressBarColor = 'bg-emerald-500';
    iconColor = '#34d399';
  } else if (item.type === 'info') {
    containerBg = 'bg-slate-900/95 border-blue-500/40 text-slate-100 shadow-blue-950/40';
    badgeBg = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    badgeText = 'Info';
    progressBarColor = 'bg-blue-500';
    iconColor = '#60a5fa';
  }

  return (
    <div
      className={`pointer-events-auto rounded-2xl p-4 border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 relative overflow-hidden ${containerBg}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Modern SVG Icon Indicator */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: isError ? 'rgba(239, 68, 68, 0.2)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : isSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
            color: iconColor,
          }}
        >
          {isError ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : isWarning ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : isSuccess ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badgeBg}`}>
              {badgeText}
            </span>
            <h4 className="text-xs font-bold text-slate-100 truncate">{item.title}</h4>
          </div>

          <p className="text-xs text-slate-300 font-medium leading-relaxed break-words">{item.reason}</p>

          {/* Detailed violation items / threats */}
          {item.details && item.details.length > 0 && (
            <div className="mt-2 space-y-1 bg-slate-950/60 p-2 rounded-xl border border-white/5 font-mono text-[11px] text-red-300 max-h-32 overflow-y-auto">
              {item.details.map((d, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-red-400 font-bold">•</span>
                  <span className="flex-1 leading-tight">{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-white rounded-full p-1 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-none"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Countdown Progress Bar */}
      {item.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${progressBarColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
