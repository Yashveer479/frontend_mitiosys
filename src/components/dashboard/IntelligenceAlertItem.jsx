import React from 'react';
import { ChevronRight } from 'lucide-react';

const IntelligenceAlertItem = ({ type, msg, time, isAlert, onClick }) => (
    <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick?.();
            }
        }}
        className="p-5 transition-all cursor-pointer group hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
    >
        <div className="flex items-center justify-between mb-2">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isAlert ? 'text-rose-600' : 'text-blue-600'}`}>{type}</span>
            <span className="text-[9px] font-black text-slate-400">{time}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-slate-700 leading-tight transition-colors group-hover:text-slate-950">{msg}</p>
            <ChevronRight size={14} className="shrink-0 text-slate-300 transition-all group-hover:text-blue-600 group-hover:translate-x-0.5" />
        </div>
    </div>
);

export default IntelligenceAlertItem;