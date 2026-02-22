import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Save,
    Package,
    Calendar,
    MapPin,
    FileText,
    Hash,
    Layers,
    ChevronDown,
    CheckCircle
} from 'lucide-react';

const GoodsReceipt = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        product: '',
        quantity: '',
        batchNumber: '',
        productionDate: '',
        warehouse: '',
        remarks: ''
    });

    // Mock Data for Dropdowns (In a real app, these would be fetched)
    const [warehouses, setWarehouses] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch warehouses and mock products for the dropdowns
        const fetchData = async () => {
            try {
                const wRes = await api.get('/warehouses');
                setWarehouses(wRes.data);

                // Fetching inventory to get list of products, or ideally a /products endpoint
                const pRes = await api.get('/inventory');
                // Extract unique product names for the dropdown
                const uniqueProducts = [...new Set(pRes.data.map(p => p.name))];
                setProducts(uniqueProducts);
            } catch (err) {
                console.error("Failed to fetch form data sources", err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setFormData({
                product: '',
                quantity: '',
                batchNumber: '',
                productionDate: '',
                warehouse: '',
                remarks: ''
            });
            setTimeout(() => setSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8">

                {/* Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Goods Receipt Note</h2>
                    <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-wider">
                        Inbound Stock Entry & Verification
                    </p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                    {success && (
                        <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white py-2 text-center text-xs font-black uppercase tracking-widest animate-fade-in-down">
                            <span className="flex items-center justify-center space-x-2">
                                <CheckCircle size={14} />
                                <span>Stock Successfully Registered</span>
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">

                        {/* Section: Product Details */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                                Product Identification
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Package size={12} className="text-blue-500" />
                                        <span>Select Product</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="product"
                                            value={formData.product}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Choose Item --</option>
                                            {products.map((p, idx) => (
                                                <option key={idx} value={p}>{p}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Layers size={12} className="text-blue-500" />
                                        <span>Quantity Received</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Batch & Logistics */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">
                                Tracking & Location
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Hash size={12} className="text-blue-500" />
                                        <span>Batch / Lot Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="batchNumber"
                                        value={formData.batchNumber}
                                        onChange={handleChange}
                                        placeholder="e.g. BATCH-2026-X12"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Calendar size={12} className="text-blue-500" />
                                        <span>Production Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="productionDate"
                                        value={formData.productionDate}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <MapPin size={12} className="text-blue-500" />
                                        <span>Target Warehouse</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="warehouse"
                                            value={formData.warehouse}
                                            onChange={handleChange}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">-- Select Facility --</option>
                                            {warehouses.map((w, idx) => (
                                                <option key={idx} value={w.id}>{w.name} ({w.location})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Remarks */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                <FileText size={12} className="text-blue-500" />
                                <span>Remarks / Quality Notes</span>
                            </label>
                            <textarea
                                name="remarks"
                                value={formData.remarks}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Enter any additional details regarding shipment condition or quality checks..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none"
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Confirm & Add to Inventory</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GoodsReceipt;
