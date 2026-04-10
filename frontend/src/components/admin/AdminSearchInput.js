import React from 'react';
import { Search, X } from 'lucide-react';

export default function AdminSearchInput({
  value,
  onChange,
  placeholder,
  testId,
  clearLabel = 'Clear search',
  containerClassName = 'w-full lg:max-w-sm',
}) {
  return (
    <div className={`relative ${containerClassName}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-500" />
      <input
        data-testid={testId}
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-dark-500/40 bg-dark-800 py-2.5 pl-9 pr-10 text-sm text-warm-100 placeholder-warm-500 focus:border-accent/40 focus:outline-none focus:ring-1 focus:ring-accent/20"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-500 hover:text-warm-200"
          aria-label={clearLabel}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
