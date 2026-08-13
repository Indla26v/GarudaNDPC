import React from 'react';

/**
 * Ultra-clean floating vertical pill pagination control.
 * Matches the executive design specification with top count, up/down chevrons,
 * and active amber squircle page numbers.
 */
export default function FloatingPagination({ page, totalPages, setPage, loading = false }) {
  if (totalPages <= 1 || loading) return null;

  return (
    <div 
      className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 z-50 flex flex-row sm:flex-col items-center gap-2 p-2 sm:p-2.5 rounded-full shadow-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all animate-fade-in"
      style={{ minWidth: '46px' }}
    >
      {/* Top Page Count Indicator */}
      <div className="flex flex-col items-center select-none px-1">
        <span className="text-[11px] font-mono font-black text-slate-700 dark:text-slate-300 tracking-tight">
          {page + 1}/{totalPages}
        </span>
        <div className="w-4 h-[1px] bg-slate-200 dark:bg-slate-800 mt-1 hidden sm:block" />
      </div>

      {/* Up Arrow (Previous Page) */}
      <button
        type="button"
        onClick={() => setPage((prev) => Math.max(0, prev - 1))}
        disabled={page === 0 || loading}
        title="Previous Page"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
        </svg>
      </button>

      {/* Vertical Page List */}
      <div className="flex flex-row sm:flex-col gap-1.5 items-center">
        {Array.from({ length: totalPages }).map((_, index) => {
          if (
            totalPages <= 6 ||
            index < 2 ||
            index === totalPages - 1 ||
            (index >= page - 1 && index <= page + 1)
          ) {
            const isCurrent = page === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index)}
                className={`w-8 h-8 flex items-center justify-center rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-105 border border-amber-400'
                    : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs'
                }`}
              >
                {index + 1}
              </button>
            );
          }
          if (
            (index === 2 && page > 2) ||
            (index === totalPages - 2 && page < totalPages - 3)
          ) {
            return (
              <span key={`ellipsis-${index}`} className="text-slate-400 dark:text-slate-500 text-center select-none text-[11px] tracking-widest font-black py-0.5">
                •••
              </span>
            );
          }
          return null;
        })}
      </div>

      {/* Down Arrow (Next Page) */}
      <button
        type="button"
        onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
        disabled={page === totalPages - 1 || loading}
        title="Next Page"
        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
