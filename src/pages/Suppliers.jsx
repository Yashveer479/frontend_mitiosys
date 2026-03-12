import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Truck,
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    ChevronDown,
    X,
    Save,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    Hash
} from 'lucide-react';

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        gst_number: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'Supplier name is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenModal = (supplier = null) => {
        if (supplier) {
            setCurrentSupplier(supplier);
            setFormData({
                name: supplier.name || '',
                phone: supplier.phone || '',
                email: supplier.email || '',
                address: supplier.address || '',
                gst_number: supplier.gst_number || ''
            });
        } else {
            setCurrentSupplier(null);
            setFormData({ name: '', phone: '', email: '', address: '', gst_number: '' });
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentSupplier(null);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            if (currentSupplier) {
                await api.put(`/suppliers/${currentSupplier.id}`, formData);
            } else {
                await api.post('/suppliers', formData);
            }
            await fetchSuppliers();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save supplier', err);
            alert('Failed to save supplier. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
            try {
                await api.delete(`/suppliers/${id}`);
                setSuppliers(prev => prev.filter(s => s.id !== id));
            } catch (err) {
                console.error('Failed to delete supplier', err);
                alert('Failed to delete supplier.');
            }
        }
    };

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.phone || '').includes(searchTerm)
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Supplier Management</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Inventory</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Suppliers</span>
                        </nav>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>Add Supplier</span>
                    </button>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                        <Filter size={14} />
                        <span>Filters</span>
                        <ChevronDown size={14} />
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Name</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">GST</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(s => (
                                    <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                                    {(s.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <p className="text-sm font-black text-slate-900">{s.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                <Phone size={12} className="text-slate-300" />
                                                <span>{s.phone || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                <Mail size={12} className="text-slate-300" />
                                                <span>{s.email || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
                                                <span className="text-[11px] font-bold text-slate-600 max-w-[200px] leading-tight">{s.address || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {s.gst_number ? (
                                                <div className="inline-flex items-center space-x-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                    <Hash size={10} className="text-slate-300" />
                                                    <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-tighter">{s.gst_number}</span>
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-bold">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(s)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <Truck size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic tracking-tight">No Suppliers Found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Add your first supplier to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">
                                    {currentSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                                </h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    {currentSupplier ? 'Update supplier details' : 'Register a new supplier'}
                                </p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                    Supplier Name <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Acme Supplies Ltd."
                                    className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all ${formErrors.name ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                />
                                {formErrors.name && (
                                    <p className="flex items-center space-x-1 text-[10px] font-bold text-rose-500 mt-1.5">
                                        <AlertCircle size={10} /><span>{formErrors.name}</span>
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. +91 98765 43210"
                                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. contact@supplier.com"
                                    className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all ${formErrors.email ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                />
                                {formErrors.email && (
                                    <p className="flex items-center space-x-1 text-[10px] font-bold text-rose-500 mt-1.5">
                                        <AlertCircle size={10} /><span>{formErrors.email}</span>
                                    </p>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Full address..."
                                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all resize-none"
                                />
                            </div>

                            {/* GST Number */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">GST Number</label>
                                <input
                                    type="text"
                                    name="gst_number"
                                    value={formData.gst_number}
                                    onChange={handleChange}
                                    placeholder="e.g. 29ABCDE1234F1Z5"
                                    className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold font-mono focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <Save size={14} />
                                    <span>{saving ? 'Saving...' : currentSupplier ? 'Update Supplier' : 'Save Supplier'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Suppliers;
