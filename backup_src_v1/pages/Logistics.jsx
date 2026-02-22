import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { ArrowRightLeft, Package, Clock, CheckCircle2, AlertCircle, PlusCircle, Factory, Trash2 } from 'lucide-react';

const Logistics = () => {
    const [transfers, setTransfers] = useState([]);
    const [products, setProducts] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        fromWarehouseId: '',
        toWarehouseId: '',
        quantity: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [transRes, prodRes, whRes] = await Promise.all([
                    api.get('/transfers'),
                    api.get('/inventory'),
                    api.get('/warehouses')
                ]);
                setTransfers(transRes.data);
                setProducts(prodRes.data);
                setWarehouses(whRes.data);
                setLoading(false);
            } catch (err) {
                console.error('Fetch error:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateTransfer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transfers', formData);
            setShowForm(false);
            // Refresh list
            const res = await api.get('/transfers');
            setTransfers(res.data);
        } catch (err) {
            alert(err.response?.data?.msg || 'Error creating transfer');
        }
    };

    const handleReceive = async (id) => {
        try {
            await api.post(`/transfers/${id}/receive`);
            const res = await api.get('/transfers');
            setTransfers(res.data);
        } catch (err) {
            alert(err.response?.data?.msg || 'Error receiving stock');
        }
    };

    if (loading) return <div className="p-8 animate-pulse text-slate-500 font-semibold text-xs text-center">Initialising Logistics Hub...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Logistics Center</h1>
                    <p className="text-slate-500 text-sm">Inter-Depot Movement Management</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs shadow-sm"
                >
                    <PlusCircle size={16} />
                    <span>Initiate Transfer</span>
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-8 rounded-lg border border-slate-200 shadow-lg animate-in slide-in-from-top-4 duration-500">
                    <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Stock Transfer Protocol</h2>
                    <form onSubmit={handleCreateTransfer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Select Product</label>
                            <select
                                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                            >
                                <option value="">Select Item</option>
                                {products.map(p => (
                                    <option key={p._id} value={p._id}>{p.name} ({p.warehouse?.name || 'Factory'})</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Source Depot</label>
                            <select
                                onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                            >
                                <option value="">Select Source</option>
                                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Depot</label>
                            <select
                                onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                            >
                                <option value="">Select Destination</option>
                                {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div className="flex space-x-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Quantity</label>
                                <input
                                    type="number"
                                    placeholder="Qty Units"
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                                />
                            </div>
                            <button className="bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-black transition-all font-bold text-[10px] uppercase tracking-wider">Confirm</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                <th className="px-6 py-4">STO ID / Product</th>
                                <th className="px-6 py-4">Source Depot</th>
                                <th className="px-6 py-4">Direction</th>
                                <th className="px-6 py-4">Destination</th>
                                <th className="px-6 py-4">Qty</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transfers.map((t) => (
                                <tr key={t._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                <Package size={16} />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold text-slate-900 tracking-wide mb-0.5">#{t._id.slice(-6).toUpperCase()}</p>
                                                <p className="text-[10px] font-medium text-slate-500 uppercase">{t.product?.name || 'MDF Boards'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                                            <Factory size={14} className="text-slate-400" />
                                            <span>{t.fromWarehouse?.name || 'Source'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ArrowRightLeft size={16} className="text-slate-300" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                            <span>{t.toWarehouse?.name || 'Target'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] font-bold text-slate-900">{t.quantity}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {t.status === 'Pending' ? (
                                            <span className="flex items-center space-x-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                                <Clock size={12} />
                                                <span>In Transit</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                                <CheckCircle2 size={12} />
                                                <span>Received</span>
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {t.status === 'Pending' ? (
                                            <button
                                                onClick={() => handleReceive(t._id)}
                                                className="bg-primary text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-blue-700 shadow-sm transition-all"
                                            >
                                                Confirm Receipt
                                            </button>
                                        ) : (
                                            <button className="p-2 text-slate-300 hover:text-danger transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {transfers.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="inline-flex p-4 bg-slate-50 text-slate-300 rounded-lg mb-4">
                            <ArrowRightLeft size={24} />
                        </div>
                        <p className="text-slate-400 font-semibold uppercase tracking-wider text-xs">No active movements detected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Logistics;
