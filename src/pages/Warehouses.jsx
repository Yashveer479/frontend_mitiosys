import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Warehouse as WarehouseIcon,
    MapPin,
    User,
    Phone,
    Plus,
    Edit2,
    Trash2,
    BarChart,
    TrendingUp,
    ChevronRight,
    Search,
    Filter,
    X,
    Save,
    AlertCircle
} from 'lucide-react';

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentWarehouse, setCurrentWarehouse] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: 10000,
        managerName: '',
        contact: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

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

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Warehouse Name is required';
        if (!formData.location) errors.location = 'Location is required';
        if (!formData.capacity || formData.capacity < 0) errors.capacity = 'Capacity must be a positive number';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenModal = (warehouse = null) => {
        if (warehouse) {
            setCurrentWarehouse(warehouse);
            setFormData({
                name: warehouse.name || '',
                location: warehouse.location || '',
                capacity: warehouse.capacity || 10000,
                managerName: warehouse.managerName || '',
                contact: warehouse.contact || ''
            });
        } else {
            setCurrentWarehouse(null);
            setFormData({
                name: '',
                location: '',
                capacity: 10000,
                managerName: '',
                contact: ''
            });
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentWarehouse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            if (currentWarehouse) {
                // Edit
                await api.put(`/warehouses/${currentWarehouse.id}`, formData);
            } else {
                // Add
                await api.post('/warehouses', formData);
            }
            await fetchWarehouses();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save warehouse", err);
            alert("Failed to save warehouse. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
            try {
                await api.delete(`/warehouses/${id}`);
                setWarehouses(warehouses.filter(w => w.id !== id));
            } catch (err) {
                console.error("Failed to delete warehouse", err);
                alert("Failed to delete warehouse.");
            }
        }
    };

    const filteredWarehouses = Array.isArray(warehouses) ? warehouses.filter(w =>
        w && ((w.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (w.location || '').toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

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
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
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
                                        <tr key={w.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                                        <WarehouseIcon size={18} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{w.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industrial SITE-ID: {(w.id || 'N/A').toString().slice(-4).toUpperCase()}</p>
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
                                                        <span>Manager: <span className="text-blue-600 font-black">{w.managerName || 'Unassigned'}</span></span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-500 italic">
                                                        <Phone size={12} className="text-slate-300" />
                                                        <span>{w.contact || 'No Contact'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal(w)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(w.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                    >
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

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    {currentWarehouse ? 'Update Facility Profile' : 'Commission New Facility'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Warehouse Name */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Facility Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full bg-slate-50 border ${formErrors.name ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`}
                                            placeholder="e.g. North Point Distribution Center"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {formErrors.name && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.name}</p>}
                                    </div>

                                    {/* Location */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Geo-Location / Address <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className={`w-full bg-slate-50 border ${formErrors.location ? 'border-rose-300' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all`}
                                                placeholder="e.g. Gulu Industrial Park"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.location && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.location}</p>}
                                    </div>

                                    {/* Capacity */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Max Capacity (SQFT) <span className="text-rose-500">*</span></label>
                                        <div className="relative">
                                            <BarChart size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="number"
                                                className={`w-full bg-slate-50 border ${formErrors.capacity ? 'border-rose-300' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all`}
                                                placeholder="10000"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.capacity && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.capacity}</p>}
                                    </div>

                                    {/* Manager Name */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Site Manager</label>
                                        <div className="relative">
                                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder="e.g. Sarah Connor"
                                                value={formData.managerName}
                                                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Contact Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder="+256 700 000000"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {saving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>{currentWarehouse ? 'Update Facility' : 'Commission Facility'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
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
