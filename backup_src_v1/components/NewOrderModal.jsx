import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Package, Globe, Tag, Info } from 'lucide-react';

const NewOrderModal = ({ isOpen, onClose, onRefresh }) => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        transactionType: 'Local Sales',
        exportDestination: '',
        items: []
    });

    const [currentItem, setCurrentItem] = useState({
        productId: '',
        quantity: 1,
        price: 0
    });

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const [custRes, prodRes] = await Promise.all([
                    api.get('/customers'),
                    api.get('/inventory')
                ]);
                setCustomers(custRes.data);
                setProducts(prodRes.data);
            };
            fetchData();
        }
    }, [isOpen]);

    const handleAddItem = () => {
        if (!currentItem.productId || currentItem.quantity <= 0) return;
        const prod = products.find(p => p._id === currentItem.productId);
        setFormData({
            ...formData,
            items: [...formData.items, { ...currentItem, name: prod.name, thickness: prod.thickness, finish: prod.finish }]
        });
        setCurrentItem({ productId: '', quantity: 1, price: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/orders', formData);
            onRefresh();
            onClose();
        } catch (err) {
            alert(err.response?.data?.msg || 'Error creating order');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Create Sales Order</h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Commercial Transaction Initiation</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg transition-all text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Client / Entity</label>
                            <select
                                required
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                            >
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Channel</label>
                            <select
                                value={formData.transactionType}
                                onChange={(e) => setFormData({ ...formData, transactionType: e.target.value, exportDestination: e.target.value === 'Direct Export' ? formData.exportDestination : '' })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                            >
                                <option value="Local Sales">Local Sales (Domestic)</option>
                                <option value="Direct Export">Direct Export (Regional)</option>
                            </select>
                        </div>
                    </div>

                    {formData.transactionType === 'Direct Export' && (
                        <div className="p-5 bg-primary/5 border border-primary/10 rounded-lg animate-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center space-x-2 text-primary mb-4">
                                <Globe size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Export Transaction Details</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, exportDestination: 'Rwanda' })}
                                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formData.exportDestination === 'Rwanda' ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'
                                        }`}
                                >Rwanda Hub</button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, exportDestination: 'Kenya' })}
                                    className={`py-2 rounded-lg text-xs font-semibold transition-all ${formData.exportDestination === 'Kenya' ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'
                                        }`}
                                >Kenya Hub</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory Allocation</h3>
                            <div className="text-[9px] font-medium text-slate-400 flex items-center gap-1"><Info size={10} /> Dimensions: 8ft x 4ft STD</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Attribute</label>
                                <select
                                    value={currentItem.productId}
                                    onChange={(e) => setCurrentItem({ ...currentItem, productId: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold"
                                >
                                    <option value="">Select MDF Type</option>
                                    {products.map(p => <option key={p._id} value={p._id}>{p.name} - {p.thickness} ({p.finish})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Vol. Units</label>
                                <input
                                    type="number"
                                    value={currentItem.quantity}
                                    onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
                            >Add Item</button>
                        </div>

                        <div className="space-y-3">
                            {formData.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-primary/5 text-primary rounded-lg"><Tag size={14} /></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-none mb-1">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{item.thickness} • {item.finish} • QTY: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) })}
                                        className="text-rose-500 hover:text-rose-700 p-2"
                                    ><X size={16} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider mr-2">Order Total</span>
                        <span className="text-lg font-bold text-slate-800">TBD on Sync</span>
                    </div>
                    <div className="flex space-x-4">
                        <button onClick={onClose} className="px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600">Cancel</button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || formData.items.length === 0 || !formData.customerId}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Complete Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewOrderModal;
