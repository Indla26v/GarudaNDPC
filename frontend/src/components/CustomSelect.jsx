/**
 * GARUDA — Custom Executive Select / Dropdown Component
 * 
 * Replaces default browser <select> with a sleek, rounded custom popover menu.
 */
import { useState, useRef, useEffect } from 'react';
import { IconCheck } from './Icons';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  className = '',
  triggerClassName = '',
  disabled = false,
  id,
  name,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Normalize options array into [{ value, label }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.value };
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value)
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSelect = (optValue) => {
    if (disabled) return;
    onChange({ target: { value: optValue, name: name || id } });
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
          {label}
        </label>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-md'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${triggerClassName}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Custom Chevron Icon */}
        <svg
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-amber-500' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 min-w-full w-48 max-h-60 overflow-y-auto rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-2xl p-1.5 animate-fade-in text-xs font-medium backdrop-blur-md">
          {normalizedOptions.length === 0 ? (
            <div className="px-3.5 py-2.5 text-slate-400 text-center font-medium">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <IconCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
