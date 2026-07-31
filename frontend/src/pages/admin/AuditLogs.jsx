/**
 * GARUDA — Audit Logs Page (Admin Only)
 * 
 * Full audit trail viewer with filtering by action, entity type, and user.
 * Clean executive UI with readable typography and soft contrast.
 */
import { useState, useEffect, Fragment } from 'react';
import api from '../../api/axios';
import CustomSelect from '../../components/CustomSelect';

const ACTION_COLORS = {
  CREATE:             '#16a34a',
  UPDATE:             '#2563eb',
  DELETE:             '#dc2626',
  LOGIN:              '#7c3aed',
  LOGOUT:             '#4b5563',
  DELETION_FLAGGED:   '#d97706',
  DELETION_ESCALATED: '#ea580c',
  DELETION_REQUESTED: '#2563eb',
  DELETION_APPROVED:  '#16a34a',
  DELETION_EXECUTED:  '#dc2626',
  DELETION_REJECTED:  '#dc2626',
  EDIT_REQUESTED:     '#d97706',
  EDIT_APPROVED:      '#16a34a',
  EDIT_REJECTED:      '#dc2626',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: '', entityType: '' });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState({});

  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({ ...prev, [sessionId]: !prev[sessionId] }));
  };

  const groupLogsIntoSessions = (rawLogs) => {
    const grouped = [];
    const active = {};

    for (let i = 0; i < rawLogs.length; i++) {
      const log = rawLogs[i];
      const userId = log.user?.id || 'SYSTEM';

      if (active[userId]) {
        const session = active[userId];
        const lastLog = session.actions[session.actions.length - 1];

        const lastTime = new Date(lastLog.timestamp).getTime();
        const currTime = new Date(log.timestamp).getTime();
        const dateChanged = new Date(lastLog.timestamp).toDateString() !== new Date(log.timestamp).toDateString();
        const threshold = 30 * 60 * 1000; // 30 minutes

        if (dateChanged || Math.abs(lastTime - currTime) > threshold || log.action === 'LOGOUT') {
          grouped.push({ ...session, actions: session.actions.reverse() });
          delete active[userId];
        }
      }

      if (!active[userId]) {
        active[userId] = {
          id: `sess_${userId}_${log.id}`,
          user: log.user,
          endTime: log.timestamp,
          startTime: log.timestamp,
          actions: [],
          loginLog: null,
          logoutLog: null,
          ipAddress: log.ipAddress,
        };
      }

      const session = active[userId];
      session.actions.push(log);
      session.startTime = log.timestamp;

      if (log.action === 'LOGOUT') {
        session.logoutLog = log;
      } else if (log.action === 'LOGIN') {
        session.loginLog = log;
        grouped.push({ ...session, actions: session.actions.reverse() });
        delete active[userId];
      }
    }

    Object.values(active).forEach(session => {
      grouped.push({ ...session, actions: session.actions.reverse() });
    });

    grouped.sort((a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime());

    return grouped;
  };

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), size: '30' });
      if (filters.action) params.append('action', filters.action);
      if (filters.entityType) params.append('entityType', filters.entityType);

      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      const rawLogs = res.data.data.content || [];
      setLogs(rawLogs);
      setSessions(groupLogsIntoSessions(rawLogs));
      setTotalPages(res.data.data.totalPages || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Complete system audit trail — every action is logged
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4 flex-wrap items-center">
        <CustomSelect
          id="filter-action"
          value={filters.action}
          onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(0); }}
          placeholder="All Actions"
          className="w-full sm:w-56"
          options={[
            { value: '', label: 'All Actions' },
            ...Object.keys(ACTION_COLORS).map(a => ({ value: a, label: a }))
          ]}
        />
        <CustomSelect
          id="filter-entity"
          value={filters.entityType}
          onChange={(e) => { setFilters({ ...filters, entityType: e.target.value }); setPage(0); }}
          placeholder="All Entities"
          className="w-full sm:w-56"
          options={[
            { value: '', label: 'All Entities' },
            { value: 'ADMINISTRATION', label: 'ADMINISTRATION' },
            { value: 'INTELLIGENCE', label: 'INTELLIGENCE' },
            { value: 'OPERATIONS', label: 'OPERATIONS' },
            { value: 'REPORTS_ANALYSIS', label: 'REPORTS ANALYSIS' }
          ]}
        />
      </div>

      {/* Logs Table Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-slate-500 animate-pulse">
            Loading audit sessions...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-4">Timestamp</th>
                  <th className="px-5 py-4">Action</th>
                  <th className="px-5 py-4">Entity</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sessions.map((session, i) => (
                  <Fragment key={session.id}>
                    {/* Session Summary Row */}
                    <tr
                      onClick={() => toggleSession(session.id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs text-slate-400 font-bold">
                            {expandedSessions[session.id] ? '▼' : '▶'}
                          </span>
                          <div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">{new Date(session.startTime).toLocaleString('en-IN')}</div>
                            {session.loginLog && session.logoutLog && (
                              <div className="text-[11px] text-slate-400 font-medium">
                                to {new Date(session.endTime).toLocaleTimeString('en-IN')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          USER SESSION
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-white font-bold">{session.actions.length}</strong> actions logged
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {session.user?.name || '—'}
                        {session.user?.role && (
                          <span className="text-xs text-slate-400 font-normal ml-1">({session.user.role})</span>
                        )}
                      </td>
                      <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {session.logoutLog ? 'Session ended' : (session.loginLog?.details || 'Session active')}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate-500 font-medium">
                        {session.ipAddress || '—'}
                      </td>
                    </tr>

                    {/* Nested Actions Rows */}
                    {expandedSessions[session.id] && (
                      <tr className="bg-slate-50/80 dark:bg-slate-900/60">
                        <td colSpan={6} className="p-0">
                          <div className="px-8 py-3 border-l-4 border-amber-500 my-2 ml-6 mr-6 bg-white dark:bg-slate-850 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-xs text-left">
                              <tbody>
                                {session.actions.map((log) => (
                                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-750 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500 w-44">
                                      {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                                    </td>
                                    <td className="py-2.5 px-3 w-36">
                                      <span className="font-bold px-2 py-0.5 rounded text-[11px]" style={{ color: ACTION_COLORS[log.action] || '#64748b' }}>
                                        {log.action}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 w-52">
                                      {log.entityType}
                                      {log.entityId && <span className="text-slate-400 font-mono ml-1">#{log.entityId}</span>}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-medium">
                                      {log.details || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm font-medium text-slate-500">
                      No audit sessions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-all disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-xs transition-all disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
