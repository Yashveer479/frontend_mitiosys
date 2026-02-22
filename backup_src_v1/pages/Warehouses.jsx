import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Warehouse as WarehouseIcon,
    MapPin,
    User,
    Phone,
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    BarChart,
    TrendingUp,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const res = await api.get('/warehouses');
                setWarehouses(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchWarehouses();
    }, []);

    const filteredWarehouses = warehouses.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">

                {/* Executive Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Warehouse Network</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Sourcing</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Site Management</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            <Plus size={16} strokeWidth={3} />
                            <span>Add Warehouse</span>
                        </button>
                    </div>
                </div>

                {/* Operations Control Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Locate site by name or regional identifier..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={14} />
                        <span>Regional Filter</span>
                    </button>
                </div>

                {/* Warehouse Intelligence Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinate / Location</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Capacity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Site Management</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredWarehouses.map((w) => {
                                    // Mock capacity calculation for visual effect
                                    const capacityUsed = Math.floor(Math.random() * 85) + 10;
                                    return (
                                        <tr key={w._id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                                        <WarehouseIcon size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{w.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industrial SITE-ID: {w._id.toString().slice(-4).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-start space-x-2">
                                                    <MapPin size={12} className="text-blue-500 mt-0.5" />
                                                    <span className="text-[11px] font-bold text-slate-600 leading-tight">{w.location}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="w-full space-y-2">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                        <span>{capacityUsed}% Utilized</span>
                                                        <span className="text-slate-900">{(w.capacity || 10000).toLocaleString()} SQFT</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${capacityUsed > 80 ? 'bg-rose-500' : 'bg-blue-600'
                                                                }`}
                                                            style={{ width: `${capacityUsed}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-900">
                                                        <User size={12} className="text-slate-300" />
                                                        <span>Site Manager: <span className="text-blue-600 font-black">Admin One</span></span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 italic">
                                                        <Phone size={12} className="text-slate-300" />
                                                        <span>+256 701 000 000</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95">
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Dashboard Integration Snippet */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <OperationalSummary cardTitle="Total Available Space" value="1.2M SQFT" icon={BarChart} color="text-blue-600" />
                    <OperationalSummary cardTitle="Dispatch Velocity" value="+14% MoM" icon={TrendingUp} color="text-emerald-600" />
                    <OperationalSummary cardTitle="Active Site Nodes" value={warehouses.length} icon={WarehouseIcon} color="text-indigo-600" />
                </div>
            </div>
        </div>
    );
};

const OperationalSummary = ({ cardTitle, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-xl bg-slate-50 ${color}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{cardTitle}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
    </div>
);

export default Warehouses;
