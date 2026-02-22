import React, { useState } from 'react';
import {
    BarChart3,
    TrendingUp,
    Package,
    DollarSign,
    Calendar,
    Download,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    PieChart
} from 'lucide-react';

const Analytics = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');

    // Mock KPI Data
    const kpis = [
        { label: 'Total Revenue', value: 'UGX 124.5M', change: '+12.5%', trend: 'up', icon: DollarSign, color: 'blue' },
        { label: 'Total Orders', value: '1,284', change: '+8.2%', trend: 'up', icon: Package, color: 'emerald' },
        { label: 'Avg. Order Value', value: 'UGX 96K', change: '-2.1%', trend: 'down', icon: BarChart3, color: 'rose' },
        { label: 'Stock Turnover', value: '4.2x', change: '+0.8x', trend: 'up', icon: TrendingUp, color: 'indigo' }
    ];

    // Mock Chart Data
    const salesData = [45, 52, 38, 65, 42, 58, 70, 62, 80, 75, 85, 90]; // Simple trend points
    const categoryData = [
        { name: 'MDF Boards', value: 45, color: 'bg-blue-500' },
        { name: 'Plywood', value: 30, color: 'bg-emerald-500' },
        { name: 'Adhesives', value: 15, color: 'bg-amber-500' },
        { name: 'Fittings', value: 10, color: 'bg-slate-500' }
    ];

    const topProducts = [
        { name: 'MDF 18mm High Density', sales: 'UGX 45M', volume: '1,200 units' },
        { name: 'Marine Plywood 12mm', sales: 'UGX 32M', volume: '850 units' },
        { name: 'Industrial Wood Glue 20L', sales: 'UGX 15M', volume: '400 units' },
        { name: 'Melamine Faced Board', sales: 'UGX 12M', volume: '300 units' },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Business Analytics</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Intelligence</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Performance Reports</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                            >
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Quarter</option>
                                <option>This Year</option>
                            </select>
                            <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                        <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95">
                            <Download size={14} />
                            <span>Export Report</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Decorative Background Icon */}
                            <kpi.icon className={`absolute -right-4 -bottom-4 w-24 h-24 text-${kpi.color}-50 opacity-50 group-hover:scale-110 transition-transform duration-500`} />

                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                                    <kpi.icon size={20} />
                                </div>
                                <div className={`flex items-center space-x-1 text-xs font-bold ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    <span>{kpi.change}</span>
                                    {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{kpi.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sales Trend (Line Chart Mock) */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Revenue Trend</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Sales Performance Over Time</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-xs font-bold text-slate-500">Current Period</span>
                            </div>
                        </div>

                        {/* CSS-only Line Chart Visualization */}
                        <div className="h-64 w-full flex items-end justify-between space-x-2 px-2 relative">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-slate-50"></div>
                                ))}
                            </div>

                            {/* Bars mimicking a trend (simpler than SVG path for pure CSS reliability, or use SVG) */}
                            {/* Using SVG Path for smoother look */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path
                                    d={`M0,${256 - (salesData[0] / 100 * 256)} ${salesData.map((val, i) => `L${(i / (salesData.length - 1)) * 100}%,${256 - (val / 100 * 256)}`).join(' ')}`}
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="drop-shadow-lg"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={`M0,${256 - (salesData[0] / 100 * 256)} ${salesData.map((val, i) => `L${(i / (salesData.length - 1)) * 100}%,${256 - (val / 100 * 256)}`).join(' ')} V256 H0 Z`}
                                    fill="url(#gradient)"
                                    stroke="none"
                                />
                            </svg>

                            {/* Tooltip Hover Area (Visual Only) */}
                            {salesData.map((val, i) => (
                                <div key={i} className="group relative h-full w-full flex items-end z-10 cursor-pointer">
                                    <div className="w-full bg-transparent hover:bg-slate-900/5 transition-colors rounded-t-lg"></div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
                                        UGX {val}M
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-[10px] font-bold text-slate-400">
                                        {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Mix (Donut/Bar Mock) */}
                    <div className="lg:col-span-1 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Inventory Mix</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Stock Distribution</p>
                            </div>
                            <PieChart size={20} className="text-slate-300" />
                        </div>

                        <div className="space-y-6">
                            {categoryData.map((cat, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-slate-700">{cat.name}</span>
                                        <span className="text-slate-500">{cat.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${cat.color} rounded-full`}
                                            style={{ width: `${cat.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Insights</h4>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                <span className="font-bold text-blue-600">MDF Boards</span> remain the dominant category, driving 45% of total stock value. Consider restocking <span className="font-bold text-amber-600">Adhesives</span> as turnover has increased by 15% this month.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Top Performing Products</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Highest Revenue Generators</p>
                        </div>
                        <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline flex items-center">
                            View All Products <ArrowUpRight size={12} className="ml-1" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Rank</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sales Volume</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Revenue</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {topProducts.map((product, index) => (
                                    <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 text-xs font-black text-slate-300 group-hover:text-blue-500">#{index + 1}</td>
                                        <td className="py-4 text-sm font-bold text-slate-700">{product.name}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600 text-right">{product.volume}</td>
                                        <td className="py-4 text-sm font-black text-slate-900 text-right">{product.sales}</td>
                                        <td className="py-4 text-right">
                                            <div className="inline-flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                <TrendingUp size={12} />
                                                <span>Rising</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
