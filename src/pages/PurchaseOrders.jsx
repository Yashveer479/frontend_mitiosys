import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    ShoppingBag,
    Search,
    Plus,
    ChevronUp,
    X,
    Save,
    Eye,
    Package,
    Upload
} from 'lucide-react';

const ORDER_STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200',
    approved: 'bg-blue-50 text-blue-600 border-blue-200',
    received: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-600 border-rose-200'
};

const REQUEST_STATUS_COLORS = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
};

const emptySupplierForm = {
    supplier1_id: '',
    supplier1_notes: '',
    supplier1_pdf: null,
    supplier2_id: '',
    supplier2_notes: '',
    supplier2_pdf: null,
    supplier3_id: '',
    supplier3_notes: '',
    supplier3_pdf: null
};

const emptyPoRequestForm = {
    title: '',
    description: '',
    approver_scope: 'local',
    target_approval_department: 'GM',
    ...emptySupplierForm
};

const PurchaseOrders = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [poRequests, setPoRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [requestSearch, setRequestSearch] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [poRequestForm, setPoRequestForm] = useState(emptyPoRequestForm);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                await Promise.all([fetchOrders(), fetchSuppliers(), fetchPoRequests()]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        const state = location.state || {};
        if (state.openPoRequestModal) {
            setPoRequestForm({
                ...emptyPoRequestForm,
                ...(state.sourceRequestContext || {})
            });
            setFormErrors({});
            setIsModalOpen(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/purchase-orders');
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await api.get('/suppliers');
            setSuppliers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPoRequests = async () => {
        try {
            const res = await api.get('/purchase-orders/requests');
            setPoRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const filteredOrders = useMemo(() => {
        const term = String(searchTerm || '').toLowerCase();
        return orders.filter((order) => {
            const supplierName = String(order?.supplier?.name || '').toLowerCase();
            const status = String(order?.status || '').toLowerCase();
            return supplierName.includes(term) || String(order?.id || '').includes(term) || status.includes(term);
        });
    }, [orders, searchTerm]);

    const filteredRequests = useMemo(() => {
        const term = String(requestSearch || '').toLowerCase();
        return poRequests.filter((entry) => {
            const status = String(entry?.status || '').toLowerCase();
            const department = String(entry?.source_department || '').toLowerCase();
            const approvedBy = String(entry?.source_approved_by_name || '').toLowerCase();
            const title = String(entry?.title || '').toLowerCase();
            return (
                String(entry?.id || '').includes(term) ||
                status.includes(term) ||
                department.includes(term) ||
                approvedBy.includes(term) ||
                title.includes(term)
            );
        });
    }, [poRequests, requestSearch]);

    const handleOpenModal = (prefill = null) => {
        setPoRequestForm({
            ...emptyPoRequestForm,
            ...(prefill || {})
        });
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const validatePoRequestForm = () => {
        const errors = {};
        if (!poRequestForm.supplier1_id) {
            errors.supplier1_id = 'Supplier 1 is mandatory';
        }
        if (!poRequestForm.target_approval_department) {
            errors.target_approval_department = 'Target approver is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSupplierChange = (field, value) => {
        setPoRequestForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmitPoRequest = async (e) => {
        e.preventDefault();
        if (!validatePoRequestForm()) return;

        const formData = new FormData();
        formData.append('title', poRequestForm.title || 'Purchase Order Request');
        formData.append('description', poRequestForm.description || '');
        formData.append('approver_scope', poRequestForm.approver_scope);
        formData.append('target_approval_department', poRequestForm.target_approval_department);

        formData.append('supplier1_id', poRequestForm.supplier1_id || '');
        formData.append('supplier1_notes', poRequestForm.supplier1_notes || '');
        if (poRequestForm.supplier1_pdf) formData.append('supplier1_pdf', poRequestForm.supplier1_pdf);

        formData.append('supplier2_id', poRequestForm.supplier2_id || '');
        formData.append('supplier2_notes', poRequestForm.supplier2_notes || '');
        if (poRequestForm.supplier2_pdf) formData.append('supplier2_pdf', poRequestForm.supplier2_pdf);

        formData.append('supplier3_id', poRequestForm.supplier3_id || '');
        formData.append('supplier3_notes', poRequestForm.supplier3_notes || '');
        if (poRequestForm.supplier3_pdf) formData.append('supplier3_pdf', poRequestForm.supplier3_pdf);

        setSaving(true);
        try {
            await api.post('/purchase-orders/requests', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchPoRequests();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to create PO request', err);
            alert(err?.response?.data?.msg || 'Failed to create PO request');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">
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
                        <span>New Purchase Order Request</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['pending', 'approved', 'received', 'cancelled'].map((status) => {
                        const count = orders.filter((o) => o.status === status).length;
                        const total = orders.filter((o) => o.status === status).reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
                        return (
                            <div key={status} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{status}</p>
                                <p className="text-2xl font-black text-slate-900">{count}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-1">₹{fmt(total)}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div>
                            <h2 className="text-lg font-black text-slate-900">Pending / Submitted PO Requests</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                Auto-generated after GM/Finance/Commercial approval + manual requests
                            </p>
                        </div>
                        <div className="relative w-full md:w-[360px]">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by id, status, department..."
                                value={requestSearch}
                                onChange={(e) => setRequestSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 border-b border-slate-100">
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">POR #</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Approved By</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Suppliers</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 bg-white">
                                {filteredRequests.map((entry) => (
                                    <React.Fragment key={entry.id}>
                                        <tr className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-4 py-3 text-sm font-black text-slate-900">POR-{String(entry.id).padStart(4, '0')}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-600">
                                                <div>{entry.source_department || 'N/A'}</div>
                                                <div className="text-slate-400 mt-1">{entry.source_section || entry.source_request_module || 'MANUAL'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{entry.source_approved_by_name || entry.approver?.name || 'N/A'}</td>
                                            <td className="px-4 py-3 text-xs font-bold text-slate-700">{(entry.supplierOptions || []).length}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${REQUEST_STATUS_COLORS[entry.status] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                                    {entry.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => navigate(`/inventory/purchase-orders/requests/${entry.id}`)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-[10px] font-black uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition-all"
                                                    title="Open POR details"
                                                >
                                                    <Eye size={13} />
                                                    <span>Open POR Page</span>
                                                </button>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by supplier, order ID, or status..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

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
                                {filteredOrders.map((order) => (
                                    <React.Fragment key={order.id}>
                                        <tr className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-5 text-sm font-black text-slate-900">PO-{String(order.id).padStart(4, '0')}</td>
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
                                            <td className="px-6 py-5 text-sm font-black text-slate-900">₹{fmt(order.total_amount)}</td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${ORDER_STATUS_COLORS[order.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-[11px] font-bold text-slate-500">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View items"
                                                >
                                                    {expandedOrderId === order.id ? <ChevronUp size={16} /> : <Eye size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
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
                                                                {(order.items || []).map((item) => (
                                                                    <tr key={item.id}>
                                                                        <td className="px-4 py-3 font-semibold text-slate-800">{item.item_name}</td>
                                                                        <td className="px-4 py-3 text-right font-bold text-slate-600">{item.quantity}</td>
                                                                        <td className="px-4 py-3 text-right font-bold text-slate-600">₹{fmt(item.price)}</td>
                                                                        <td className="px-4 py-3 text-right font-black text-slate-900">₹{fmt(Number(item.price) * Number(item.quantity))}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
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
                    {filteredOrders.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <ShoppingBag size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic tracking-tight">No Purchase Orders Found</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Approval hone ke baad PO records yahan dikhte hain</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">New Purchase Order Request</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                    1 supplier mandatory, 2 optional, approver route + PDF upload
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPoRequest} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        value={poRequestForm.title}
                                        onChange={(e) => handleSupplierChange('title', e.target.value)}
                                        placeholder="Purchase order title"
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Approver Type</label>
                                    <select
                                        value={poRequestForm.approver_scope}
                                        onChange={(e) => handleSupplierChange('approver_scope', e.target.value)}
                                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                                    >
                                        <option value="local">Local</option>
                                        <option value="import">Import</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                                        Send For Approval To <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={poRequestForm.target_approval_department}
                                        onChange={(e) => handleSupplierChange('target_approval_department', e.target.value)}
                                        className={`w-full px-4 py-3 text-sm bg-slate-50 border rounded-xl font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${formErrors.target_approval_department ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                    >
                                        <option value="GM">General Manager</option>
                                        <option value="FINANCE_MANAGER">Finance Manager</option>
                                        <option value="COMMERCIAL_MANAGER">Commercial Manager</option>
                                    </select>
                                    {formErrors.target_approval_department && (
                                        <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.target_approval_department}</p>
                                    )}
                                </div>
                            </div>

                            {[1, 2, 3].map((idx) => {
                                const supplierIdKey = `supplier${idx}_id`;
                                const supplierNotesKey = `supplier${idx}_notes`;
                                const supplierPdfKey = `supplier${idx}_pdf`;
                                const isMandatory = idx === 1;
                                const file = poRequestForm[supplierPdfKey];
                                return (
                                    <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">
                                                Supplier {idx} {isMandatory ? '(Mandatory)' : '(Optional)'}
                                            </h3>
                                            {file && <span className="text-[10px] font-bold text-blue-600">{file.name}</span>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Supplier</label>
                                                <select
                                                    value={poRequestForm[supplierIdKey]}
                                                    onChange={(e) => handleSupplierChange(supplierIdKey, e.target.value)}
                                                    className={`w-full px-3 py-2.5 text-sm bg-white border rounded-lg font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${isMandatory && formErrors.supplier1_id ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
                                                >
                                                    <option value="">Select Supplier</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                                    ))}
                                                </select>
                                                {isMandatory && formErrors.supplier1_id && (
                                                    <p className="text-[10px] font-bold text-rose-500 mt-1">{formErrors.supplier1_id}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Quotation PDF</label>
                                                <label className="w-full px-3 py-2.5 bg-white border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                                                    <Upload size={14} />
                                                    <span>{file ? 'Replace PDF' : 'Upload PDF'}</span>
                                                    <input
                                                        type="file"
                                                        accept="application/pdf,.pdf"
                                                        className="hidden"
                                                        onChange={(e) => handleSupplierChange(supplierPdfKey, e.target.files?.[0] || null)}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mt-3">
                                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Supplier Notes</label>
                                            <textarea
                                                value={poRequestForm[supplierNotesKey]}
                                                onChange={(e) => handleSupplierChange(supplierNotesKey, e.target.value)}
                                                rows={2}
                                                placeholder="Optional notes for this supplier"
                                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
                                            />
                                        </div>
                                    </div>
                                );
                            })}

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Description (Optional)</label>
                                <textarea
                                    value={poRequestForm.description}
                                    onChange={(e) => handleSupplierChange('description', e.target.value)}
                                    rows={3}
                                    placeholder="Optional description"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 resize-none"
                                />
                            </div>

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
                                    className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
                                >
                                    <Save size={14} />
                                    <span>{saving ? 'Submitting...' : 'Send PO Request For Approval'}</span>
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
