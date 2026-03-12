import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ShoppingBag,
    Search,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    X,
    Save,
    AlertCircle,
    Eye,
    Package,
    Filter
} from 'lucide-react';

const STATUS_COLORS = {
    pending:   'bg-amber-50 text-amber-600 border-amber-200',
    approved:  'bg-blue-50 text-blue-600 border-blue-200',
    received:  'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
};

const emptyItem = () => ({ item_name: '', quantity: 1, price: '' });

const PurchaseOrders = () => {
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // Create modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ supplier_id: '', status: 'pending' });
    const [items, setItems] = useState([emptyItem()]);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // Detail modal state
    const [detailOrder, setDetailOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
        fetchSuppliers();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/purchase-orders');
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Item row handlers
    const handleItemChange = (idx, field, value) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItems(prev => [...prev, emptyItem()]);

    const removeItem = (idx) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const lineTotal = (item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.price) || 0;
        return qty * price;
    };

    const grandTotal = items.reduce((sum, item) => sum + lineTotal(item), 0);

    const validateForm = () => {
        const errors = {};
        if (!formData.supplier_id) errors.supplier_id = 'Supplier is required';
        items.forEach((item, idx) => {
            if (!item.item_name.trim()) errors[`item_name_${idx}`] = 'Item name required';
            if (!item.quantity || Number(item.quantity) < 1) errors[`quantity_${idx}`] = 'Min 1';
            if (!item.price || Number(item.price) < 0) errors[`price_${idx}`] = 'Invalid price';
        });
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenModal = () => {
        setFormData({ supplier_id: '', status: 'pending' });
        setItems([emptyItem()]);
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setSaving(true);
        try {
            await api.post('/purchase-orders', {
                supplier_id: formData.supplier_id,
                status: formData.status,
                items: items.map(i => ({
                    item_name: i.item_name,
                    quantity: parseInt(i.quantity),
                    price: parseFloat(i.price)
                }))
            });
            await fetchOrders();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to create purchase order', err);
            alert('Failed to create purchase order. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const filtered = (Array.isArray(orders) ? orders : []).filter(o => {
        const supplierName = (o.supplier?.name || '').toLowerCase();
        const term = searchTerm.toLowerCase();
        return supplierName.includes(term) || String(o.id).includes(term) || (o.status || '').includes(term);
    });

    const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Purchase Orders</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Inventory</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Purchase Orders</span>
                        </nav>
                    </div>
                    <button
                        onClick={handleOpenModal}
                        className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={16} strokeWidth={3} />
                        <span>New Purchase Order</span>
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['pending', 'approved', 'received', 'cancelled'].map(status => {
                        const safeOrders = Array.isArray(orders) ? orders : [];
                        const count = safeOrders.filter(o => o.status === status).length;
                        const total = safeOrders.filter(o => o.status === status).reduce((s, o) => s + Number(o.total_amount), 0);
                        return (
                            <div key={status} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{status}</p>
                                <p className="text-2xl font-black text-slate-900">{count}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-1">₹{fmt(total)}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by supplier, order ID, or status..."
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
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">PO #</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map(order => (
                                    <React.Fragment key={order.id}>
                                        <tr className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-black text-slate-900">PO-{String(order.id).padStart(4, '0')}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100">
                                                        {(order.supplier?.name || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-800">{order.supplier?.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center space-x-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Package size={11} />
                                                    <span>{(order.items || []).length} items</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-black text-slate-900">₹{fmt(order.total_amount)}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_COLORS[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[11px] font-bold text-slate-500">
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                    title="View items"
                                                >
                                                    {expandedId === order.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {/* Expandable items row */}
                                        {expandedId === order.id && (
                                            <tr>
                                                <td colSpan={7} className="px-6 pb-5 pt-0 bg-slate-50/70">
                                                    <div className="rounded-xl border border-slate-200 overflow-hidden mt-1">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                                    <th className="px-4 py-3 text-left">Item Name</th>
                                                                    <th className="px-4 py-3 text-right">Qty</th>
                                                                    <th className="px-4 py-3 text-right">Unit Price</th>
                                                                    <th className="px-4 py-3 text-right">Line Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                                {(order.items || []).map(item => (
                                                                    <tr key={item.id}>
                                                                        <td className="px-4 py-3 font-semibold text-slate-800">{item.item_name}</td>
                                                                        <td className="px-4 py-3 text-right font-bold text-slate-600">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-right font-bold text-slate-600">₹{fmt(item.price)}</td>
                                                                        <td className="px-4 py-3 text-right font-black text-slate-900">₹{fmt(Number(item.price) * Number(item.quantity))}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr className="bg-slate-50 border-t border-slate-200">
                                                                    <td colSpan={3} className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</td>
                                                                    <td className="px-4 py-3 text-right font-black text-blue-700 text-sm">₹{fmt(order.total_amount)}</td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <ShoppingBag size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic tracking-tight">No Purchase Orders Found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Create your first purchase order to get started</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create PO Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">New Purchase Order</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Create a new purchase order with items</p>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Supplier & Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                        Supplier <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={formData.supplier_id}
                                        onChange={e => setFormData(p => ({ ...p, supplier_id: e.target.value }))}
                                        className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all ${formErrors.supplier_id ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.supplier_id && (
                                        <p className="flex items-center space-x-1 text-[10px] font-bold text-rose-500 mt-1.5">
                                            <AlertCircle size={10} /><span>{formErrors.supplier_id}</span>
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white transition-all"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="received">Received</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            {/* Items Section */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        Items <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center space-x-1.5 text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-all"
                                    >
                                        <Plus size={12} strokeWidth={3} />
                                        <span>Add Item</span>
                                    </button>
                                </div>

                                {/* Item Header */}
                                <div className="grid grid-cols-12 gap-2 px-3 mb-1">
                                    <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Item Name</div>
                                    <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty</div>
                                    <div className="col-span-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Price (₹)</div>
                                    <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</div>
                                </div>

                                <div className="space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-2 items-start">
                                            <div className="col-span-5">
                                                <input
                                                    type="text"
                                                    placeholder="Item name"
                                                    value={item.item_name}
                                                    onChange={e => handleItemChange(idx, 'item_name', e.target.value)}
                                                    className={`w-full px-3 py-2.5 text-xs bg-slate-50 border rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all ${formErrors[`item_name_${idx}`] ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="1"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                                                    className={`w-full px-3 py-2.5 text-xs bg-slate-50 border rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all ${formErrors[`quantity_${idx}`] ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={item.price}
                                                    onChange={e => handleItemChange(idx, 'price', e.target.value)}
                                                    className={`w-full px-3 py-2.5 text-xs bg-slate-50 border rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 transition-all ${formErrors[`price_${idx}`] ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                                />
                                            </div>
                                            <div className="col-span-1 flex items-center justify-between">
                                                <span className="text-[11px] font-black text-slate-700 whitespace-nowrap">
                                                    ₹{lineTotal(item).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="col-span-1 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    disabled={items.length === 1}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Grand Total */}
                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</span>
                                    <span className="text-xl font-black text-blue-700">₹{grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Footer Buttons */}
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
                                    <span>{saving ? 'Creating...' : 'Create Purchase Order'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
