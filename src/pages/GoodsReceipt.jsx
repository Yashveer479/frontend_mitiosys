import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Save,
    Package,
    Calendar,
    FileText,
    Layers,
    ChevronDown,
    CheckCircle,
    AlertCircle,
    ClipboardList
} from 'lucide-react';

const GoodsReceipt = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [purchaseItems, setPurchaseItems] = useState([]);
    const [recentGRNs, setRecentGRNs] = useState([]);

    const [formData, setFormData] = useState({
        purchase_order_id: '',
        purchase_item_id: '',
        received_quantity: '',
        received_date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [poRes, grnRes] = await Promise.all([
                    api.get('/purchase-orders'),
                    api.get('/goods-receipt')
                ]);
                setPurchaseOrders(poRes.data);
                setRecentGRNs(grnRes.data.slice(0, 10));
            } catch (err) {
                console.error('Failed to fetch initial data', err);
            }
        };
        fetchInitialData();
    }, []);

    const handlePOChange = (e) => {
        const poId = e.target.value;
        const selectedPO = purchaseOrders.find(po => String(po.id) === String(poId));
        setFormData(prev => ({ ...prev, purchase_order_id: poId, purchase_item_id: '' }));
        setPurchaseItems(selectedPO?.items || []);
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/goods-receipt', {
                purchase_order_id: parseInt(formData.purchase_order_id, 10),
                purchase_item_id: parseInt(formData.purchase_item_id, 10),
                received_quantity: parseInt(formData.received_quantity, 10),
                received_date: formData.received_date,
                notes: formData.notes
            });
            setSuccess(true);
            // Refresh recent GRNs
            const grnRes = await api.get('/goods-receipt');
            setRecentGRNs(grnRes.data.slice(0, 10));
            setFormData({
                purchase_order_id: '',
                purchase_item_id: '',
                received_quantity: '',
                received_date: new Date().toISOString().split('T')[0],
                notes: ''
            });
            setPurchaseItems([]);
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create goods receipt. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Goods Receipt Note</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                    Record inbound stock from purchase orders
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                        {success && (
                            <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white py-2 text-center text-xs font-black uppercase tracking-widest z-10">
                                <span className="flex items-center justify-center space-x-2">
                                    <CheckCircle size={14} />
                                    <span>Goods Receipt Created — Inventory Updated</span>
                                </span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {error && (
                                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Purchase Order */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                    <FileText size={12} className="text-blue-500" />
                                    <span>Purchase Order</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="purchase_order_id"
                                        value={formData.purchase_order_id}
                                        onChange={handlePOChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none"
                                        required
                                    >
                                        <option value="">-- Select Purchase Order --</option>
                                        {purchaseOrders.map(po => (
                                            <option key={po.id} value={po.id}>
                                                PO #{po.id} — {po.supplier?.name || 'Unknown Supplier'} ({po.status})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Item */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                    <Package size={12} className="text-blue-500" />
                                    <span>Item</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="purchase_item_id"
                                        value={formData.purchase_item_id}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
                                        required
                                        disabled={!formData.purchase_order_id}
                                    >
                                        <option value="">-- Select Item --</option>
                                        {purchaseItems.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.item_name} (Ordered: {item.quantity})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                                {!formData.purchase_order_id && (
                                    <p className="text-[11px] text-slate-400 font-medium">Select a purchase order first</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Received Quantity */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Layers size={12} className="text-blue-500" />
                                        <span>Received Quantity</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="received_quantity"
                                        value={formData.received_quantity}
                                        onChange={handleChange}
                                        min="1"
                                        placeholder="0"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>

                                {/* Received Date */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                        <Calendar size={12} className="text-blue-500" />
                                        <span>Received Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="received_date"
                                        value={formData.received_date}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center space-x-1">
                                    <FileText size={12} className="text-blue-500" />
                                    <span>Notes (Optional)</span>
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Quality notes, condition on arrival, etc."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-xl py-4 font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent" />
                                ) : (
                                    <>
                                        <Save size={16} />
                                        <span>Confirm & Add to Inventory</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent GRNs Panel */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                            <ClipboardList size={14} />
                            <span>Recent Receipts</span>
                        </h3>
                        {recentGRNs.length === 0 ? (
                            <p className="text-sm text-slate-400 text-center py-8">No receipts recorded yet</p>
                        ) : (
                            <div className="space-y-3">
                                {recentGRNs.map(grn => (
                                    <div key={grn.id} className="border border-slate-100 rounded-xl p-3 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700">
                                                {grn.purchaseItem?.item_name || `Item #${grn.purchase_item_id}`}
                                            </span>
                                            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                                                +{grn.received_quantity}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            PO #{grn.purchase_order_id} · {new Date(grn.received_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoodsReceipt;
