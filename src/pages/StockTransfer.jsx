import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Truck,
    ArrowRight,
    Package,
    Calendar,
    FileText,
    MapPin,
    CheckCircle,
    AlertCircle,
    ChevronDown
} from 'lucide-react';

const StockTransfer = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        sourceWarehouse: '',
        destWarehouse: '',
        productId: '',
        quantity: '',
        transferDate: new Date().toISOString().split('T')[0],
        remarks: ''
    });

    // Data State
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const wRes = await api.get('/warehouses');
                setWarehouses(wRes.data);

                const pRes = await api.get('/products');
                setProducts(pRes.data);
            } catch (err) {
                console.error("Failed to load transfer data", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/transfers', {
                productId: formData.productId,
                fromWarehouseId: formData.sourceWarehouse,
                toWarehouseId: formData.destWarehouse,
                quantity: formData.quantity,
                // notes: formData.remarks // backend doesn't support notes in body on create yet, but we are good.
            });

            setSuccess(true);
            setLoading(false);
            setFormData({
                sourceWarehouse: '',
                destWarehouse: '',
                productId: '',
                quantity: '',
                transferDate: new Date().toISOString().split('T')[0],
                remarks: ''
            });

            setTimeout(() => setSuccess(false), 3000);

        } catch (err) {
            console.error(err);
            setLoading(false);
            setError(err.response?.data?.msg || 'Transfer Failed. check stock levels.');
        }
    };

    // Derived Display Helpers
    const getWarehouseName = (id) => warehouses.find(w => w.id.toString() === id.toString())?.name || '...';
    const isFormValid = formData.sourceWarehouse && formData.destWarehouse && formData.productId && formData.quantity && formData.transferDate && (formData.sourceWarehouse !== formData.destWarehouse);

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-3xl w-full space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Stock Transfer Order</h2>
                    <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-wider">
                        Internal Logistics & Distribution
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    {success && (
                        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white py-2 text-center text-xs font-black uppercase tracking-widest animate-fade-in-down z-10">
                            <span className="flex items-center justify-center space-x-2">
                                <CheckCircle size={14} />
                                <span>Transfer Executed Successfully</span>
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="absolute top-0 left-0 right-0 bg-rose-500 text-white py-2 text-center text-xs font-black uppercase tracking-widest animate-fade-in-down z-10">
                            <span className="flex items-center justify-center space-x-2">
                                <AlertCircle size={14} />
                                <span>{error}</span>
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">

                        {/* Section 1: Logistics Route */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                                Logistics Route
                            </h3>
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <MapPin size={12} className="text-rose-500" />
                                        <span>Source Warehouse</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="sourceWarehouse"
                                            value={formData.sourceWarehouse}
                                            onChange={handleChange}
                                            className="w-full bg-rose-50/30 border border-rose-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Origin --</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-300 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="hidden md:flex flex-col items-center justify-center text-slate-300 pt-7">
                                    <ArrowRight size={24} strokeWidth={3} />
                                </div>

                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <MapPin size={12} className="text-emerald-500" />
                                        <span>Destination Warehouse</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="destWarehouse"
                                            value={formData.destWarehouse}
                                            onChange={handleChange}
                                            className="w-full bg-emerald-50/30 border border-emerald-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Destination --</option>
                                            {warehouses.filter(w => w.id.toString() !== formData.sourceWarehouse.toString()).map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Consignment Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                                Consignment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Package size={12} className="text-blue-500" />
                                        <span>Product Selection</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="productId"
                                            value={formData.productId}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Select Item --</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <span>Quantity to Move</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="1"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Calendar size={12} className="text-blue-500" />
                                        <span>Transfer Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="transferDate"
                                        value={formData.transferDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <FileText size={12} className="text-blue-500" />
                                        <span>Remarks</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="remarks"
                                        value={formData.remarks}
                                        onChange={handleChange}
                                        placeholder="Optional notes..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Inventory Movement Summary Visualization */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Movement Summary</h4>

                            {isFormValid ? (
                                <div className="flex items-center space-x-4 text-sm font-medium text-slate-600">
                                    <span className="font-bold text-rose-600">{getWarehouseName(formData.sourceWarehouse)}</span>
                                    <div className="flex flex-col items-center px-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase mb-1">Moving</span>
                                        <div className="h-0.5 w-16 bg-slate-300 relative">
                                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-blue-600 mt-1">{formData.quantity} Units</span>
                                    </div>
                                    <span className="font-bold text-emerald-600">{getWarehouseName(formData.destWarehouse)}</span>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                                    <AlertCircle size={14} />
                                    <span>Complete the form to preview the transfer route</span>
                                </div>
                            )}
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={loading || !isFormValid}
                            className={`w-full flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                            ) : (
                                <>
                                    <Truck size={16} />
                                    <span>Execute Transfer</span>
                                </>
                            )}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default StockTransfer;
