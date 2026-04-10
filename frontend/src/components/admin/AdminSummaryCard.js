import React from 'react';

export default function AdminSummaryCard({
  icon: Icon,
  label,
  value,
  accent = 'text-warm-50',
  helper,
  onClick,
  testId,
}) {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      {...(onClick ? { type: 'button', onClick } : {})}
      data-testid={testId}
      className={`rounded-xl border border-dark-500/50 bg-dark-700 p-5 text-left transition-colors ${
        onClick ? 'cursor-pointer hover:border-accent/20 hover:bg-dark-600/50' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-warm-400" />}
        <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-500">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      {helper && <div className="mt-1 text-[11px] text-warm-500">{helper}</div>}
    </Component>
  );
}
