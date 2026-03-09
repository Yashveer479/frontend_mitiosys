import React, { useState, useEffect } from 'react';
import api from '../services/api';
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
    PieChart,
    Loader2
} from 'lucide-react';

const Analytics = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [loading, setLoading] = useState(true);
    const [salesReport, setSalesReport] = useState([]);
    const [inventoryReport, setInventoryReport] = useState([]);
    const [customerReport, setCustomerReport] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        stockTurnover: '0x'
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [salesRes, invRes, custRes, summaryRes] = await Promise.all([
                    api.get('/reports/sales'),
                    api.get('/reports/inventory'),
                    api.get('/reports/customers'),
                    api.get('/reports/summary')
                ]);

                setSalesReport(salesRes.data);
                setInventoryReport(invRes.data);
                setCustomerReport(custRes.data);

                // Process Summary
                const totalRev = salesRes.data.reduce((sum, s) => sum + parseFloat(s.total), 0);
                const totalCount = salesRes.data.reduce((sum, s) => sum + parseInt(s.count), 0);

                setSummary({
                    totalRevenue: totalRev,
                    totalOrders: totalCount,
                    avgOrderValue: totalCount > 0 ? (totalRev / totalCount).toFixed(0) : 0,
                    stockTurnover: '4.2x' // Static for now
                });
            } catch (err) {
                console.error("Failed to fetch analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Derived KPI Data
    const kpis = [
        { label: 'Total Revenue', value: `UGX ${((summary?.totalRevenue || 0) / 1000000).toFixed(1)}M`, change: '+12.5%', trend: 'up', icon: DollarSign, color: 'blue' },
        { label: 'Total Orders', value: (summary?.totalOrders || 0).toLocaleString(), change: '+8.2%', trend: 'up', icon: Package, color: 'emerald' },
        { label: 'Avg. Order Value', value: `UGX ${((summary?.avgOrderValue || 0) / 1000).toFixed(0)}K`, change: '-2.1%', trend: 'down', icon: BarChart3, color: 'rose' },
        { label: 'Stock Turnover', value: summary?.stockTurnover || '0x', change: '+0.8x', trend: 'up', icon: TrendingUp, color: 'indigo' }
    ];

    // Chart Data mapping
    const salesDataPoints = salesReport.length > 0 ? salesReport.map(s => (parseFloat(s.total) / 1000000).toFixed(1)) : [0, 0, 0, 0, 0, 0];

    // Inventory Mix processing
    const categories = [...new Set(inventoryReport.map(i => i.category))];
    const categoryData = categories.map(cat => {
        const total = inventoryReport.filter(i => i.category === cat).reduce((sum, i) => sum + i.stock, 0);
        const grandTotal = inventoryReport.reduce((sum, i) => sum + i.stock, 0);
        return {
            name: cat,
            value: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
            color: cat === 'MDF' ? 'bg-blue-500' : 'bg-emerald-500'
        };
    }).filter(c => c.value > 0);

    const topProductsReport = customerReport.slice(0, 4).map(c => ({
        name: c.name,
        sales: `UGX ${(c.totalSpend / 1000000).toFixed(1)}M`,
        volume: `${c.orders} orders`
    }));

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6 relative">
            {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</span>
                    </div>
                </div>
            )}
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
                            {/* SVG Path for smoother look */}
                            <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                                <path
                                    d={`M0,${256 - (salesDataPoints[0] * 2)} ${salesDataPoints.map((val, i) => `L${(i / (salesDataPoints.length - 1)) * 100}%,${256 - (val * 2)}`).join(' ')}`}
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
                                    d={`M0,${256 - (salesDataPoints[0] * 2)} ${salesDataPoints.map((val, i) => `L${(i / (salesDataPoints.length - 1)) * 100}%,${256 - (val * 2)}`).join(' ')} V256 H0 Z`}
                                    fill="url(#gradient)"
                                    stroke="none"
                                />
                            </svg>

                            {/* Tooltip Hover Area (Visual Only) */}
                            {salesDataPoints.map((val, i) => (
                                <div key={i} className="group relative h-full w-full flex items-end z-10 cursor-pointer">
                                    <div className="w-full bg-transparent hover:bg-slate-900/5 transition-colors rounded-t-lg"></div>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap">
                                        UGX {val}M
                                    </div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-[10px] font-bold text-slate-400">
                                        {salesReport[i]?.date ? new Date(salesReport[i].date).toLocaleDateString() : i + 1}
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
                            {categoryData.length > 0 ? categoryData.map((cat, index) => (
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
                            )) : <div className="text-center text-slate-400 text-xs py-10">No inventory data available.</div>}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Insights</h4>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                Analysis shows the current distribution across categories. Total items in stock: <span className="font-bold text-blue-600">{(inventoryReport || []).reduce((sum, i) => sum + (i.stock || 0), 0).toLocaleString()}</span> units.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h3 className="text-lg font-black text-slate-900">Top Performing Customers</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Most Valuable Partnerships</p>
                        </div>
                        <button className="text-blue-600 text-xs font-bold uppercase tracking-wider hover:underline flex items-center">
                            View All Data <ArrowUpRight size={12} className="ml-1" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">Rank</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Name</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Order Count</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Value</th>
                                    <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {customerReport.slice(0, 5).map((customer, index) => (
                                    <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 text-xs font-black text-slate-300 group-hover:text-blue-500">#{index + 1}</td>
                                        <td className="py-4 text-sm font-bold text-slate-700">{customer.name}</td>
                                        <td className="py-4 text-sm font-bold text-slate-600 text-right">{customer.orders}</td>
                                        <td className="py-4 text-sm font-black text-slate-900 text-right">UGX {((customer.totalSpend || 0) / 1000).toLocaleString()}K</td>
                                        <td className="py-4 text-right">
                                            <div className="inline-flex items-center space-x-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                <TrendingUp size={12} />
                                                <span>Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customerReport.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-slate-400 text-sm italic">No data available for the selected period.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
