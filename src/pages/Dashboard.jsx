import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
    Package,
    ShoppingCart,
    BarChart3,
    LayoutDashboard,
    AlertTriangle,
    Clock,
    Bell,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Circle,
    ChevronRight,
    Globe
} from 'lucide-react';
import mitioLogo from '../assets/logo.png';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/reports/summary');
                setStats(res.data);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError(true);
                // Fallback stats to prevent crash if backend fails
                setStats({
                    totalInventory: 0,
                    monthlyRevenue: 0,
                    activeOrders: 0,
                    pendingDeliveries: 0,
                    totalOrders: 0
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12 animate-in fade-in duration-300">
            <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-10">

                {/* Ultra-Premium Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 transform hover:rotate-[-2deg] transition-transform">
                            <img src={mitioLogo} alt="Mitiosys Logo" className="h-10 w-auto" />
                        </div>
                        <div className="h-12 w-px bg-slate-200 hidden lg:block"></div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Executive Dashboard</h1>
                            <div className="flex items-center space-x-2 text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px]">
                                <Globe size={12} className="text-blue-600" />
                                <span>Global Operations Control</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-xl border border-white shadow-sm flex items-center space-x-3 text-xs font-bold text-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span>Real-Time: <span className="text-slate-400">Sync Active</span></span>
                        </div>
                        <button className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                            <Bell size={20} />
                        </button>
                    </div>
                </div>

                {/* KPI Grid with Subtle Gradients */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <KPICard
                        title="Total Inventory"
                        value={(stats?.totalInventory || 0).toLocaleString()}
                        subtitle="Stock Units"
                        icon={Package}
                        trend="+4.2%"
                        isPositive={true}
                        gradient="from-blue-50/50"
                    />
                    <KPICard
                        title="Today's Sales"
                        value={`UDX ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                        subtitle="Daily Revenue"
                        icon={BarChart3}
                        trend="Real-time"
                        isPositive={true}
                        gradient="from-indigo-50/50"
                    />
                    <KPICard
                        title="Pending Orders"
                        value={stats.activeOrders}
                        subtitle="Awaiting Fulfilment"
                        icon={ShoppingCart}
                        trend="Active"
                        isPositive={false}
                        gradient="from-slate-50/50"
                    />
                    <KPICard
                        title="Low Stock Alerts"
                        value={stats.pendingDeliveries}
                        subtitle="Below Minimum Level"
                        icon={AlertTriangle}
                        trend="Action Req"
                        isAlert={stats.pendingDeliveries > 0}
                        gradient="from-rose-50/50"
                    />
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column (Charts) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Interactive Sales Performance */}
                        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 group">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Industrial Performance</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Output vs Market Absorption</p>
                                </div>
                                <div className="flex bg-slate-50 p-1 rounded-lg">
                                    <button className="px-3 py-1.5 text-[10px] font-bold bg-white shadow-sm rounded-md text-slate-900 tracking-wider">MONTHLY</button>
                                    <button className="px-3 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider hover:text-slate-600 transition-colors">ANNUAL</button>
                                </div>
                            </div>

                            <div className="h-72 flex items-end justify-between space-x-4 pb-4">
                                {[45, 70, 50, 95, 75, 85, 60, 80, 55, 90, 75, 100].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">
                                        <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all transform group-hover/bar:-translate-y-2 pointer-events-none z-10">
                                            {h}%
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-t-lg relative h-full overflow-hidden">
                                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110" style={{ height: `${h}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-tighter">{['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][i]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Network Status Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-2xl shadow-lg shadow-slate-200/40 border border-slate-100">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6">Regional Distribution</h3>
                                <div className="space-y-6">
                                    <DistItem label="Main Factory SITE-A" value="62%" color="bg-blue-600" />
                                    <DistItem label="Kampala 6th HUB" value="24%" color="bg-blue-400" />
                                    <DistItem label="Jinja Logistics Center" value="14%" color="bg-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl shadow-2xl shadow-blue-600/30 text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-150 transition-transform duration-1000">
                                    <TrendingUp size={160} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Quarterly Projection</h3>
                                    <p className="text-4xl font-black tracking-tighter leading-none">+28.5%</p>
                                    <p className="text-blue-100 text-xs mt-4 font-medium leading-relaxed">System projects a significant increase in inter-depot requirements for the next cycle.</p>
                                    <button className="mt-8 flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                        <span>View Models</span>
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Glassmorphism Operational Hub) */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Notifications Card */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                                    <Bell size={16} className="text-blue-600" />
                                    <span>Intelligence</span>
                                </h3>
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            </div>
                            <div className="divide-y divide-slate-50">
                                <NotificationItem
                                    type="SECURITY"
                                    msg="Payment terminal at Nakulabye synchronized."
                                    time="12m"
                                />
                                <NotificationItem
                                    type="CRITICAL"
                                    msg="Emergency restock required for MDF-18."
                                    time="45m"
                                    isAlert={true}
                                />
                                <NotificationItem
                                    type="NETWORK"
                                    msg="New supply chain node added in Jinja."
                                    time="3h"
                                />
                            </div>
                        </div>

                        {/* Operational Activity with Glassmorphism feel */}
                        <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-blue-600/5 pointer-events-none"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center space-x-3 opacity-90">
                                <TrendingUp size={16} className="text-blue-400" />
                                <span>Operation Log</span>
                            </h3>
                            <div className="space-y-8">
                                <LogItem user="Sarah K." action="Dispatched" target="ORD-9281" time="14:20" dark={true} />
                                <LogItem user="James M." action="Audited" target="SITE-A HUB" time="13:45" dark={true} />
                                <LogItem user="System" action="Optimized" target="Sync Cycle" time="12:00" dark={true} />
                            </div>
                            <button className="w-full mt-10 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-[0.25em] border border-white/10"> Full Manifest </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ title, value, subtitle, icon: Icon, trend, isPositive, isAlert, gradient }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 relative overflow-hidden group`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${isAlert ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-blue-50 text-blue-600 shadow-blue-100'} shadow-lg transition-transform duration-500 group-hover:scale-110`}>
                    <Icon size={22} strokeWidth={2.5} />
                </div>
                <div className={`flex items-center space-x-1 text-[10px] font-black tracking-widest uppercase ${isAlert ? 'text-rose-600' : isPositive ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                    {trend === 'Critical' ? <AlertTriangle size={12} strokeWidth={3} /> : isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                    <span>{trend}</span>
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
                <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest opacity-60">{subtitle}</p>
            </div>
        </div>
    </div>
);

const DistItem = ({ label, value, color }) => (
    <div className="space-y-3">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>{label}</span>
            <span className="text-slate-900">{value}</span>
        </div>
        <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
            <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: value }}></div>
        </div>
    </div>
);

const NotificationItem = ({ type, msg, time, isAlert }) => (
    <div className="p-5 hover:bg-slate-50/80 transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-2">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isAlert ? 'text-rose-600' : 'text-blue-600'}`}>{type}</span>
            <span className="text-[9px] font-black text-slate-400">{time}</span>
        </div>
        <p className="text-xs font-bold text-slate-700 leading-tight group-hover:text-slate-900">{msg}</p>
    </div>
);

const LogItem = ({ user, action, target, time, dark }) => (
    <div className="flex items-start space-x-4 group cursor-default">
        <div className={`w-10 h-10 rounded-xl ${dark ? 'bg-white/5 border border-white/10 text-white/40' : 'bg-slate-50 text-slate-400'} flex items-center justify-center text-xs font-black transition-all group-hover:bg-blue-600 group-hover:text-white shrink-0 shadow-lg`}>
            {user.split(' ')[0][0]}
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between h-4">
                <span className={`text-xs font-black ${dark ? 'text-white/90' : 'text-slate-900'} leading-none`}>{user}</span>
                <span className="text-[9px] font-black text-slate-500 opacity-60 tracking-wider">{time}</span>
            </div>
            <p className={`text-[11px] ${dark ? 'text-white/50' : 'text-slate-500'} mt-1 font-medium`}>
                {action} <span className={`font-black ${dark ? 'text-blue-400' : 'text-blue-600'}`}>{target}</span>
            </p>
        </div>
    </div>
);

export default Dashboard;
