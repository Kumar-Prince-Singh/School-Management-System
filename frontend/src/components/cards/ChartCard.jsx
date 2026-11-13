import React from 'react';

export const ChartCard = ({ title, subtitle, action, children }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[280px]">
        {children}
      </div>
    </div>
  );
};

