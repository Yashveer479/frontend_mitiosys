import React from 'react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const DashboardCard = ({ title, value, subtitle, icon: Icon, trend, isPositive, isAlert, gradient, onClick }) => (
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
        className="bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${isAlert ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-blue-50 text-blue-600 shadow-blue-100'} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center space-x-1 text-[10px] font-black tracking-widest uppercase ${isAlert ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {trend === 'Critical' ? <AlertTriangle size={12} strokeWidth={3} /> : isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                    <span>{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest opacity-60">{subtitle}</p>
                <div className="mt-4 flex items-center text-[11px] font-black uppercase tracking-[0.18em] text-blue-600 opacity-0 transition-all duration-300 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0">
                    <span>View Details</span>
                    <span className="ml-2">&rarr;</span>
                </div>
            </div>
        </div>
    </div>
);

export default DashboardCard;