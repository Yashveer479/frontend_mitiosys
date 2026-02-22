import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ClipboardCheck,
    Save,
    AlertTriangle,
    CheckCircle2,
    Search,
    History,
    Package,
    Warehouse,
    Loader2
} from 'lucide-react';

const StockAudit = () => {
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [auditHistory, setAuditHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [systemQty, setSystemQty] = useState(0);
    const [physicalQty, setPhysicalQty] = useState('');
    const [notes, setNotes] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchInitialData();
        fetchHistory();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [prodRes, wareRes] = await Promise.all([
                api.get('/products'),
                api.get('/warehouses')
            ]);
            setProducts(prodRes.data);
            setWarehouses(wareRes.data);
        } catch (err) {
            console.error("Failed to fetch initial data", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/inventory/audit/history');
            setAuditHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history", err);
        }
    };

    // When product/warehouse selected, find system stock
    useEffect(() => {
        if (selectedProduct && selectedWarehouse) {
            // In a real app, we might need a specific endpoint to get stock for P+W
            // For now, let's look it up from the products list if it contains inventory, 
            // or fetch inventory specifically. 
            // The /inventory endpoint returns flattened items. Let's use that if possible 
            // or just hit the product details again.
            // Simplified: Fetch inventory for this specific combo.
            checkSystemStock();
        }
    }, [selectedProduct, selectedWarehouse]);

    const checkSystemStock = async () => {
        try {
            // We can reuse the inventory endpoint or filter client side if we loaded all inventory.
            // Let's assume we filter client side from a full inventory fetch for better UX in this scale
            const res = await api.get('/inventory');
            const item = res.data.find(i =>
                i.id === parseInt(selectedProduct) &&
                i.warehouse?.id === parseInt(selectedWarehouse)
            );
            setSystemQty(item ? item.quantity : 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/inventory/audit', {
                productId: selectedProduct,
                warehouseId: selectedWarehouse,
                systemQty,
                physicalQty: parseInt(physicalQty),
                notes
            });

            setSubmitted(true);
            fetchHistory(); // Refresh history

            // Reset form partially
            setPhysicalQty('');
            setNotes('');
            setTimeout(() => setSubmitted(false), 3000);
        } catch (err) {
            console.error("Audit failed", err);
            alert("Failed to save audit record");
        } finally {
            setLoading(false);
        }
    };

    const discrepancy = physicalQty ? parseInt(physicalQty) - systemQty : 0;
    const isDiscrepancy = discrepancy !== 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Stock Reconciliation</h1>
                    <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Inventory</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-blue-600">Audit & Control</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Audit Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6 flex items-center">
                                <ClipboardCheck className="mr-2 text-blue-500" size={18} />
                                New Audit Record
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Warehouse</label>
                                    <div className="relative">
                                        <select
                                            value={selectedWarehouse}
                                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none"
                                            required
                                        >
                                            <option value="">Select Warehouse...</option>
                                            {warehouses.map(w => (
                                                <option key={w.id} value={w.id}>{w.name}</option>
                                            ))}
                                        </select>
                                        <Warehouse size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Product</label>
                                    <div className="relative">
                                        <select
                                            value={selectedProduct}
                                            onChange={(e) => setSelectedProduct(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none"
                                            required
                                        >
                                            <option value="">Select Product...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                            ))}
                                        </select>
                                        <Package size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {selectedProduct && selectedWarehouse && (
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center">
                                        <span className="text-xs font-bold text-blue-700">System Quantity</span>
                                        <span className="text-xl font-black text-blue-900">{systemQty}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Physical Count</label>
                                    <input
                                        type="number"
                                        value={physicalQty}
                                        onChange={(e) => setPhysicalQty(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                        placeholder="Enter actual quantity found"
                                        required
                                    />
                                </div>

                                {physicalQty && (
                                    <div className={`p-4 rounded-xl border flex items-center space-x-3 ${isDiscrepancy ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                                        {isDiscrepancy ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide">{isDiscrepancy ? 'Discrepancy Detected' : 'Stock Matches'}</p>
                                            <p className="text-sm font-medium">Difference: {discrepancy > 0 ? `+${discrepancy}` : discrepancy}</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Audit Notes</label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 focus:outline-none focus:border-blue-500 h-24 resize-none"
                                        placeholder="Explain any variance..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-black uppercase tracking-widest text-xs shadow-lg transition-all active:scale-95 ${submitted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> :
                                        submitted ? <><CheckCircle2 size={16} /> <span>Audit Saved</span></> :
                                            <><Save size={16} /> <span>Save Audit Record</span></>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center">
                                    <History className="mr-2 text-slate-400" size={18} />
                                    Audit History
                                </h3>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search history..."
                                        className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100">
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Warehouse</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">System</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Physical</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Diff</th>
                                            <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performed By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {auditHistory.map(audit => (
                                            <tr key={audit.id} className="group hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 text-xs font-bold text-slate-500">
                                                    {new Date(audit.audit_date).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 text-sm font-bold text-slate-700">{audit.Product?.name}</td>
                                                <td className="py-4 text-xs font-medium text-slate-600">{audit.Warehouse?.name}</td>
                                                <td className="py-4 text-sm font-bold text-slate-500 text-right">{audit.system_quantity}</td>
                                                <td className="py-4 text-sm font-bold text-slate-900 text-right">{audit.physical_quantity}</td>
                                                <td className="py-4 text-right">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black ${audit.difference === 0 ? 'bg-emerald-50 text-emerald-600' :
                                                            audit.difference > 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {audit.difference > 0 ? `+${audit.difference}` : audit.difference}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-xs font-bold text-slate-400">{audit.performedBy || 'System'}</td>
                                            </tr>
                                        ))}
                                        {auditHistory.length === 0 && (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-slate-400 text-sm italic">No audit records found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StockAudit;
