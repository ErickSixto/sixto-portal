import React from 'react';

export default function AdminFilterChips({
  options,
  activeValue,
  onChange,
  counts = {},
  testId,
  showClear = false,
  onClear,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap" data-testid={testId}>
      {options.map((option) => {
        const key = option.key;
        const label = option.label;
        const active = activeValue === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-colors ${
              active
                ? 'border-accent/30 bg-accent/15 text-accent'
                : 'border-dark-500/40 bg-dark-800 text-warm-400 hover:border-dark-400 hover:text-warm-200'
            }`}
          >
            {label}
            {typeof counts[key] === 'number' && (
              <span className={`ml-1.5 ${active ? 'text-accent/70' : 'text-warm-600'}`}>{counts[key]}</span>
            )}
          </button>
        );
      })}

      {showClear && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-warm-500 hover:text-warm-200"
        >
          Clear
        </button>
      )}
    </div>
  );
}
