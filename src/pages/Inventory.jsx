import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Plus,
    Filter,
    Search,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    ChevronDown,
    MoreHorizontal,
    ArrowUpDown,
    Download,
    X,
    Save,
    RefreshCw
} from 'lucide-react';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        sku: '',
        warehouseId: '',
        quantity: 0,
        batchNumber: ''
    });
    const [saving, setSaving] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        warehouse: 'All',
        type: 'All',
        thickness: 'All',
        finish: 'All'
    });

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
        fetchAuxData();

        // Refresh when user comes back to this tab
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchData, 30000);

        return () => {
            window.removeEventListener('focus', handleFocus);
            clearInterval(interval);
        };
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/inventory');
            setProducts(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const fetchAuxData = async () => {
        try {
            const wRes = await api.get('/warehouses');
            setWarehouses(wRes.data);
            const pRes = await api.get('/products');
            setAvailableProducts(pRes.data);
        } catch (err) {
            console.error("Failed to fetch aux data", err);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            sku: '',
            warehouseId: '',
            quantity: 0,
            batchNumber: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const selectedProduct = availableProducts.find(p => p.sku === formData.sku);
            const payload = {
                ...formData,
                name: selectedProduct?.name || 'Unknown',
                category: selectedProduct?.category || 'General',
                price: selectedProduct?.price || 0
            };

            await api.post('/inventory', payload);
            setSearchTerm(''); // clear search so the updated item is visible
            await fetchData();
            handleCloseModal();
        } catch (err) {
            const detail = err.response?.data?.detail || err.response?.data?.msg || 'Please check inputs.';
            console.error('Failed to add stock', err);
            alert(`Failed to add stock: ${detail}`);
        } finally {
            setSaving(false);
        }
    };

    // Unique values for dropdowns
    const uniqueWarehouses = ['All', ...new Set(products.map(p => p.warehouse?.name).filter(Boolean))];
    const uniqueTypes = ['All', ...new Set(products.map(p => p.type).filter(Boolean))];
    const uniqueThickness = ['All', ...new Set(products.map(p => p.thickness).filter(Boolean))];
    const uniqueFinishes = ['All', ...new Set(products.map(p => p.finish).filter(Boolean))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = !searchTerm ||
            p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.sku || p._id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.batchNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesWarehouse = filters.warehouse === 'All' || p.warehouse?.name === filters.warehouse;
        const matchesType = filters.type === 'All' || p.type === filters.type;
        const matchesThickness = filters.thickness === 'All' || p.thickness === filters.thickness;
        const matchesFinish = filters.finish === 'All' || p.finish === filters.finish;

        return matchesSearch && matchesWarehouse && matchesType && matchesThickness && matchesFinish;
    });

    const getStatusColor = (qty) => {
        if (qty > 300) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (qty >= 100) return 'bg-amber-50 text-amber-600 border-amber-100';
        return 'bg-rose-50 text-rose-600 border-rose-100';
    };

    const getStatusIcon = (qty) => {
        if (qty > 300) return <CheckCircle size={10} className="mr-1.5" />;
        if (qty >= 100) return <AlertTriangle size={10} className="mr-1.5" />;
        return <XCircle size={10} className="mr-1.5" />;
    };

    const getStatusLabel = (qty) => {
        if (qty > 300) return 'Optimal';
        if (qty >= 100) return 'Low Stock';
        return 'Critical';
    };

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
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Inventory Control</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Supply Chain</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Stock Master</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Refresh inventory"
                            className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-60"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                        </button>
                        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                            <Download size={14} />
                            <span>Export Data</span>
                        </button>
                        <button
                            onClick={handleOpenModal}
                            className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} />
                            <span>Receive Stock</span>
                        </button>
                    </div>
                </div>

                {/* Advanced Filtering Control Panel */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col xl:flex-row gap-5 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Scan by SKU, Name, Batch No..."
                            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <FilterDropdown label="Warehouse" options={uniqueWarehouses} value={filters.warehouse} onChange={(val) => setFilters({ ...filters, warehouse: val })} />
                        <FilterDropdown label="Type" options={uniqueTypes} value={filters.type} onChange={(val) => setFilters({ ...filters, type: val })} />
                        <FilterDropdown label="Thickness" options={uniqueThickness} value={filters.thickness} onChange={(val) => setFilters({ ...filters, thickness: val })} />
                        <FilterDropdown label="Finish" options={uniqueFinishes} value={filters.finish} onChange={(val) => setFilters({ ...filters, finish: val })} />

                        <button className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Reset Filters" onClick={() => setFilters({ warehouse: 'All', type: 'All', thickness: 'All', finish: 'All' })}>
                            <Filter size={16} className="rotate-45" />
                        </button>
                    </div>
                </div>

                {/* Intelligent Stock Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Specifications</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warehouse Node</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Batch Info</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Stock Level</th>

                                    <th className="px-6 py-5 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredProducts.map((p) => (
                                    <tr key={p.id + (p.warehouse?.id || 'unassigned')} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                                    <Package size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{p.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">SKU: {(p._id || p.sku || '').toString().slice(-6).toUpperCase()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex self-start px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${p.type === 'Laminated' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                    {p.type}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-600">{p.thickness} - {p.finish}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-bold text-slate-500">{p.warehouse?.name || 'Unassigned'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-black text-slate-700 font-mono tracking-tight">{p.batchNumber || '-'}</span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{p.lastUpdated ? new Date(p.lastUpdated).toLocaleDateString() : '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-black text-slate-900 text-sm tracking-tight">{p.quantity.toLocaleString()}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase ml-1">Units</span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <button className="text-slate-300 hover:text-blue-600 transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Stock Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">Receive Inventory</h3>
                                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Product</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none transition-all"
                                            value={formData.sku}
                                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Product...</option>
                                            {availableProducts.map(prod => (
                                                <option key={prod.id} value={prod.sku}>{prod.name} ({prod.sku})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Target Warehouse</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none transition-all"
                                            value={formData.warehouseId}
                                            onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Warehouse...</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Quantity Received</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                            placeholder="0"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Batch Number</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold font-mono text-slate-700 focus:outline-none focus:border-blue-500 transition-all uppercase"
                                            placeholder="BATCH-001"
                                            value={formData.batchNumber}
                                            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-4"
                                >
                                    {saving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Update Inventory</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterDropdown = ({ label, options, value, onChange }) => (
    <div className="relative group">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-xl px-4 py-3 pr-10 hover:bg-white hover:border-blue-200 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer min-w-[140px]"
        >
            {options.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
            ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
        <span className="absolute -top-2 left-3 bg-white px-1 text-[9px] font-black text-slate-300 uppercase tracking-wider pointer-events-none group-hover:text-blue-500 transition-colors">
            {label}
        </span>
    </div>
);

export default Inventory;
