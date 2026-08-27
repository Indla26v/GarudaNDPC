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
  searchable = false,
  align = 'left',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // Reset search and auto-focus when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      if (searchable || normalizedOptions.length > 8) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, searchable, normalizedOptions.length]);

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

  const showSearch = searchable || normalizedOptions.length > 8;

  const filteredOptions = showSearch && searchTerm.trim()
    ? normalizedOptions.filter(opt =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : normalizedOptions;

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={containerRef} className={`relative ${className.includes('w-') ? '' : 'inline-block'} ${className}`.trim()}>
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
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
        className={`w-full h-10 flex items-center justify-between gap-2.5 px-4 py-2 text-xs font-bold rounded-full border transition-all cursor-pointer select-none ${
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
        <div className={`absolute ${alignClass} z-50 mt-2 min-w-full w-max max-w-[280px] max-h-64 overflow-y-auto rounded-2xl border border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-850 shadow-2xl p-1.5 animate-fade-in text-xs font-medium backdrop-blur-md`}>
          {showSearch && (
            <div className="p-1.5 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-850/95 backdrop-blur-sm z-10">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3.5 py-2.5 text-slate-400 text-center font-medium">
              {searchTerm ? 'No matches found' : 'No options available'}
            </div>
          ) : (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full text-left px-3.5 py-2 rounded-xl flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <span className="truncate font-semibold">{opt.label}</span>
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
