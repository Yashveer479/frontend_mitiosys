import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users,
    Search,
    Plus,
    MoreHorizontal,
    Edit2,
    Trash2,
    Filter,
    Download,
    Mail,
    Phone,
    MapPin,
    Hash,
    ChevronDown,
    Circle
} from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/customers');
                setCustomers(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Customer Relations</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>CRM</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Enterprise Registry</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            <Plus size={16} strokeWidth={3} />
                            <span>Add Customer</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Locate customer by name, company or ID..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                        <button className="flex items-center space-x-2 px-4 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                            <Filter size={14} />
                            <span>Filters</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Intelligence</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Address</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCustomers.map((c) => (
                                    <tr key={c._id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                                    {c.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{c.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.company}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span>{c.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                    <Phone size={12} className="text-slate-300" />
                                                    <span>{c.phone}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
                                                <div className="text-[11px] font-bold text-slate-600 max-w-[200px] leading-tight flex flex-col">
                                                    <span>Kampala Industrial Park</span>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Uganda</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                                <Hash size={10} className="text-slate-300" />
                                                <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-tighter">UG-TAX-{Math.floor(1000 + Math.random() * 9000)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${Math.random() > 0.1
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-rose-50 text-rose-600 border-rose-100'
                                                }`}>
                                                <Circle size={4} className="mr-1.5 fill-current" />
                                                {Math.random() > 0.1 ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCustomers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic tracking-tight">No Customers Located</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Adjust your refinement parameters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Customers;
