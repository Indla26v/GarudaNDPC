import { useState, useEffect } from 'react';
import api from '../../api/axios';

const getAvatarColor = (name) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'
  ];
  if (!name) return colors[0];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
};

export default function DeleteOffender() {
  const [offenders, setOffenders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedOffender, setSelectedOffender] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchOffenders();
  }, [page]);

  const fetchOffenders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/offenders`, {
        params: {
          query: searchQuery,
          page,
          size: 10
        }
      });
      const data = res.data.data;
      setOffenders(data.content || data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch offender database records');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (page === 0) {
      fetchOffenders();
    } else {
      setPage(0);
    }
  };

  const initiateDelete = (offender) => {
    setSelectedOffender(offender);
    setConfirmText('');
    setDeleteReason('');
    setShowConfirmModal(true);
  };

  const handleDeleteExecute = async () => {
    if (confirmText !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }
    if (!deleteReason.trim()) {
      alert('Please provide a reason for the deletion');
      return;
    }

    setDeleting(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.delete(`/admin/offenders/${selectedOffender.id}`);
      setSuccessMsg(`Offender profile "${selectedOffender.fullName || selectedOffender.full_name}" has been permanently deleted.`);
      setShowConfirmModal(false);
      setSelectedOffender(null);
      setPage(0);
      fetchOffenders();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete the offender profile');
      setShowConfirmModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const inputStyle = {
    background: 'var(--color-garuda-900)',
    border: '1px solid var(--color-garuda-700)',
    color: 'var(--color-garuda-50)'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Direct Database Deletion</h1>
        <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">
          Permanently purge offender profiles and all corresponding relation records from the database. Fully audited operation.
        </p>
      </div>

      {successMsg && (
        <div className="px-4 py-3 rounded-lg text-sm border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm border bg-rose-500/10 text-rose-400 border-rose-500/20">
          {error}
        </div>
      )}

      {/* Search Header */}
      <form onSubmit={handleSearchSubmit} className="p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--color-garuda-800)', border: '1px solid var(--color-garuda-700)' }}>
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search offender profile to delete (by Name, Alias, Aadhaar, PAN, FIR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-10"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
        >
          Search
        </button>
      </form>

      {/* Offenders List Table */}
      <div className="rounded-xl overflow-hidden shadow-lg border" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-garuda-700)' }}>
                <th className="text-left px-4 py-3 font-medium text-slate-700 dark:text-slate-300">SL No.</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Police Station</th>
                <th className="text-left px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Primary Contact</th>
                <th className="text-right px-4 py-3 font-medium text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 animate-pulse">
                    Searching offender records...
                  </td>
                </tr>
              ) : (
                <>
                  {offenders.map((off, idx) => (
                    <tr
                      key={off.id}
                      className="border-b transition-colors"
                      style={{
                        borderColor: 'var(--color-garuda-700)',
                        background: idx % 2 === 0 ? 'transparent' : 'var(--color-garuda-600)'
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">{off.slNo || `SL-${off.id}`}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {off.photoUrl ? (
                            <img src={off.photoUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: getAvatarColor(off.fullName || off.full_name) }}>
                              {(off.fullName || off.full_name || 'O').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="block font-semibold">{off.fullName || off.full_name}</span>
                            {off.alias && <span className="block text-xs text-slate-500 dark:text-slate-400 font-normal">Alias: {off.alias}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          {off.category || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{off.psName || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{off.mobile || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => initiateDelete(off)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-red-500/20 border-none"
                          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                        >
                          ✕ Delete Profile
                        </button>
                      </td>
                    </tr>
                  ))}

                  {offenders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                        No offenders matched your search query.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400">Page {page + 1} of {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {showConfirmModal && selectedOffender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border p-6 space-y-4 animate-scale-up" style={{ background: 'var(--color-garuda-800)', borderColor: 'var(--color-garuda-700)' }}>
            <div className="flex items-center gap-2.5 text-rose-500 pb-2 border-b border-slate-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold">Irreversible Database Deletion</h3>
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
              <p>
                You are about to permanently delete offender profile:
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {selectedOffender.fullName || selectedOffender.full_name} ({selectedOffender.slNo || `SL-${selectedOffender.id}`})
              </p>
              <p className="text-xs text-rose-400 font-semibold bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                Warning: This will purge all associated contact numbers, ID docs, asset listings, intelligence files, interrogation reports, and link records from the database.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-700 dark:text-slate-300">Reason for deletion *</label>
                <textarea
                  rows={2}
                  className="input w-full text-sm rounded-lg"
                  placeholder="State official reason for record purge..."
                  style={inputStyle}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Type <span className="font-mono text-rose-400 font-bold">DELETE</span> to confirm *
                </label>
                <input
                  type="text"
                  className="input w-full text-sm rounded-lg font-mono"
                  placeholder="DELETE"
                  style={inputStyle}
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting || confirmText !== 'DELETE' || !deleteReason.trim()}
                onClick={handleDeleteExecute}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white cursor-pointer bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Purge Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
