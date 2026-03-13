import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Package,
    ShoppingCart,
    BarChart3,
    AlertTriangle,
    Bell,
    TrendingUp,
    ChevronRight,
    Globe,
    Factory,
    Boxes,
    FileText,
    ArrowRightLeft
} from 'lucide-react';
import mitioLogo from '../assets/logo.png';
import DashboardCard from '../components/dashboard/DashboardCard';
import QuickActionsMenu from '../components/dashboard/QuickActionsMenu';
import NotificationPanel from '../components/dashboard/NotificationPanel';

const INDUSTRIAL_PERFORMANCE_DATA = [
    { month: 1, label: 'JAN', year: 2026, plant: 'SITE-A', productionOutput: 420, marketAbsorption: 388, efficiency: 92.4 },
    { month: 2, label: 'FEB', year: 2026, plant: 'SITE-A', productionOutput: 468, marketAbsorption: 421, efficiency: 89.9 },
    { month: 3, label: 'MAR', year: 2026, plant: 'SITE-A', productionOutput: 455, marketAbsorption: 430, efficiency: 94.5 },
    { month: 4, label: 'APR', year: 2026, plant: 'SITE-A', productionOutput: 512, marketAbsorption: 471, efficiency: 92.0 },
    { month: 5, label: 'MAY', year: 2026, plant: 'SITE-A', productionOutput: 536, marketAbsorption: 504, efficiency: 94.0 },
    { month: 6, label: 'JUN', year: 2026, plant: 'SITE-A', productionOutput: 548, marketAbsorption: 518, efficiency: 94.5 },
    { month: 7, label: 'JUL', year: 2026, plant: 'SITE-A', productionOutput: 501, marketAbsorption: 458, efficiency: 91.4 },
    { month: 8, label: 'AUG', year: 2026, plant: 'SITE-A', productionOutput: 563, marketAbsorption: 524, efficiency: 93.1 },
    { month: 9, label: 'SEP', year: 2026, plant: 'SITE-A', productionOutput: 520, marketAbsorption: 479, efficiency: 92.1 },
    { month: 10, label: 'OCT', year: 2026, plant: 'SITE-A', productionOutput: 584, marketAbsorption: 548, efficiency: 93.8 },
    { month: 11, label: 'NOV', year: 2026, plant: 'SITE-A', productionOutput: 556, marketAbsorption: 513, efficiency: 92.3 },
    { month: 12, label: 'DEC', year: 2026, plant: 'SITE-A', productionOutput: 602, marketAbsorption: 571, efficiency: 94.9 },
];

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [industrialView, setIndustrialView] = useState('monthly');

    const annualIndustrialData = useMemo(() => {
        const grouped = INDUSTRIAL_PERFORMANCE_DATA.reduce((accumulator, item) => {
            const key = `${item.year}-${item.plant}`;
            const current = accumulator.get(key) || {
                label: String(item.year),
                year: item.year,
                plant: item.plant,
                productionOutput: 0,
                marketAbsorption: 0,
                samples: 0,
            };

            current.productionOutput += item.productionOutput;
            current.marketAbsorption += item.marketAbsorption;
            current.samples += 1;
            accumulator.set(key, current);
            return accumulator;
        }, new Map());

        return Array.from(grouped.values()).map((item) => ({
            ...item,
            efficiency: item.productionOutput > 0 ? (item.marketAbsorption / item.productionOutput) * 100 : 0,
        }));
    }, []);

    const activeIndustrialData = industrialView === 'annual' ? annualIndustrialData : INDUSTRIAL_PERFORMANCE_DATA;
    const maxIndustrialOutput = Math.max(...activeIndustrialData.map((item) => item.productionOutput), 1);

    const quickActions = [
        {
            label: 'Create Production Batch',
            description: 'Launch production batch workflow',
            path: '/production/create-batch',
            icon: Factory
        },
        {
            label: 'Add Inventory Stock',
            description: 'Receive new inventory into stores',
            path: '/inventory/add-stock',
            icon: Boxes
        },
        {
            label: 'Create Sales Order',
            description: 'Start a new customer sales order',
            path: '/sales/create-order',
            icon: FileText
        },
        {
            label: 'Transfer Warehouse Stock',
            description: 'Move stock between warehouse nodes',
            path: '/warehouse/transfer',
            icon: ArrowRightLeft
        },
        {
            label: 'Generate Production Report',
            description: 'Open the production analytics console',
            path: '/reports/production',
            icon: BarChart3
        }
    ];

    const intelligenceAlerts = [
        {
            type: 'SECURITY',
            msg: 'Payment terminal at Nakulabye synchronized.',
            time: '12m',
            path: '/system/status'
        },
        {
            type: 'CRITICAL',
            msg: 'Emergency restock required for MDF-18.',
            time: '45m',
            isAlert: true,
            path: '/inventory/restock'
        },
        {
            type: 'NETWORK',
            msg: 'New supply chain node added in Jinja.',
            time: '3h',
            path: '/warehouse/locations'
        }
    ].map((alert) => ({
        ...alert,
        onClick: () => navigate(alert.path)
    }));

    const handleIndustrialBarClick = (item) => {
        const params = new URLSearchParams({
            year: String(item.year),
            plant: item.plant,
        });

        if (industrialView === 'monthly' && item.month) {
            params.set('month', String(item.month));
        }

        navigate(`/reports/production?${params.toString()}`);
    };

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
                        <QuickActionsMenu actions={quickActions} navigate={navigate} />
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
                    <DashboardCard
                        title="Total Inventory"
                        value={(stats?.totalInventory || 0).toLocaleString()}
                        subtitle="Stock Units"
                        icon={Package}
                        trend="+4.2%"
                        isPositive={true}
                        gradient="from-blue-50/50"
                        onClick={() => navigate('/inventory')}
                    />
                    <DashboardCard
                        title="Today's Sales"
                        value={`UGX ${(stats?.monthlyRevenue || 0).toLocaleString()}`}
                        subtitle="Daily Revenue"
                        icon={BarChart3}
                        trend="Real-time"
                        isPositive={true}
                        gradient="from-indigo-50/50"
                        onClick={() => navigate('/sales/orders')}
                    />
                    <DashboardCard
                        title="Pending Orders"
                        value={stats.activeOrders}
                        subtitle="Awaiting Fulfilment"
                        icon={ShoppingCart}
                        trend="Active"
                        isPositive={false}
                        gradient="from-slate-50/50"
                        onClick={() => navigate('/sales/pending')}
                    />
                    <DashboardCard
                        title="Low Stock Alerts"
                        value={stats.pendingDeliveries}
                        subtitle="Below Minimum Level"
                        icon={AlertTriangle}
                        trend="Action Req"
                        isAlert={stats.pendingDeliveries > 0}
                        gradient="from-rose-50/50"
                        onClick={() => navigate('/inventory/low-stock')}
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
                                    <button
                                        type="button"
                                        onClick={() => setIndustrialView('monthly')}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md tracking-wider transition-colors ${industrialView === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        MONTHLY
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIndustrialView('annual')}
                                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md tracking-wider transition-colors ${industrialView === 'annual' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        ANNUAL
                                    </button>
                                </div>
                            </div>

                            <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Interactive Report Drilldown</p>
                                    <p className="mt-1 text-xs font-bold text-slate-600">Click any {industrialView === 'annual' ? 'year' : 'month'} to open the filtered production report.</p>
                                </div>
                                <div className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 shadow-sm">
                                    View: {industrialView}
                                </div>
                            </div>

                            <div className="h-72 flex items-end justify-between space-x-4 pb-4">
                                {activeIndustrialData.map((item) => (
                                    <button
                                        key={`${item.year}-${item.month || 'annual'}-${item.plant}`}
                                        type="button"
                                        onClick={() => handleIndustrialBarClick(item)}
                                        className="flex-1 flex flex-col items-center group/bar relative h-full justify-end cursor-pointer focus:outline-none"
                                        aria-label={`Open production report for ${item.label} at ${item.plant}`}
                                    >
                                        <div className="absolute -top-24 left-1/2 z-10 hidden w-44 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-white shadow-2xl group-hover/bar:block group-focus/bar:block">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">{item.label}{industrialView === 'monthly' ? ` ${item.year}` : ''}</p>
                                            <p className="mt-2 text-[11px] font-bold text-slate-100">Production output: {item.productionOutput.toLocaleString()} units</p>
                                            <p className="mt-1 text-[11px] font-bold text-slate-200">Market absorption: {item.marketAbsorption.toLocaleString()} units</p>
                                            <p className="mt-1 text-[11px] font-bold text-emerald-300">Efficiency: {item.efficiency.toFixed(1)}%</p>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-t-lg relative h-full overflow-hidden border border-transparent group-hover/bar:border-blue-100 transition-colors">
                                            <div
                                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-700 via-blue-500 to-blue-400 rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-110 group-hover/bar:scale-[1.02]"
                                                style={{ height: `${Math.max((item.productionOutput / maxIndustrialOutput) * 100, 12)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-tighter">{item.label}</span>
                                        <span className="mt-1 text-[10px] font-bold text-slate-400">{item.efficiency.toFixed(1)}% eff.</span>
                                    </button>
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
                                    <button
                                        type="button"
                                        onClick={() => navigate('/reports/production')}
                                        className="mt-8 flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                    >
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
                        <NotificationPanel alerts={intelligenceAlerts} />

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
                            <button
                                type="button"
                                onClick={() => navigate('/analytics')}
                                className="w-full mt-10 py-3 bg-white/10 hover:bg-white/20 transition-all rounded-xl text-[10px] font-black uppercase tracking-[0.25em] border border-white/10"
                            >
                                Full Manifest
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

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
