import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Plus, Calendar, FileText, Download, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [generating, setGenerating] = useState(false);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleGenerateDoc = async (orderId, type) => {
        setGenerating(type);
        try {
            const res = await api.get(`/documents/${type}/${orderId}`);
            // In a real app, this might open a PDF or show a preview
            // For now, we'll show success
            setTimeout(() => {
                alert(`${type} generated successfully: ${res.data.id}`);
                setGenerating(false);
            }, 1000);
        } catch (err) {
            console.error(err);
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales & Logistics</h1>
                    <p className="text-slate-500 text-sm">Commercial Lifecycle & Documentation</p>
                </div>
                <button
                    onClick={() => navigate('/orders/new')}
                    className="flex items-center space-x-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs shadow-sm"
                >
                    <Plus size={18} />
                    <span>Initiate New Order</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className={`bg-white rounded-lg border transition-all duration-300 ${expandedOrder === order.id ? 'border-primary/30 shadow-md ring-2 ring-primary/5' : 'border-slate-200 shadow-sm hover:border-slate-300'
                            }`}
                    >
                        <div
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="p-6 flex items-center justify-between cursor-pointer"
                        >
                            <div className="flex items-center space-x-6">
                                <div className={`p-3 rounded-lg transition-colors ${expandedOrder === order.id ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    <ShoppingCart size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                        <p className="text-base font-bold text-slate-900 leading-none">{order.Customer?.name || 'Unknown Entity'}</p>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${order.type === 'Sales' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}>
                                            {order.type}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                        <div className="flex items-center space-x-1.5">
                                            <Calendar size={12} />
                                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <span>•</span>
                                        <span>{order.OrderItems?.length || 0} Board Clusters</span>
                                        {order.notes && (
                                            <>
                                                <span>•</span>
                                                <span className="text-primary font-semibold">{order.notes}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-900 tracking-tight mb-1">${order.totalAmount.toLocaleString()}</p>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        order.status === 'Processing' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="text-slate-300">
                                    {expandedOrder === order.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                </div>
                            </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="px-6 pb-8 animate-in slide-in-from-top-2 duration-300">
                                <div className="h-[1px] bg-slate-100 mb-8"></div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Procedural Documentation Pipeline */}
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documentation Workflow</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <DocButton
                                                title="Proforma Invoice"
                                                desc="Secure confirmation"
                                                loading={generating === 'Proforma Invoice'}
                                                onClick={() => handleGenerateDoc(order.id, 'Proforma Invoice')}
                                            />
                                            <DocButton
                                                title="Order Sheet"
                                                desc="Technical specs"
                                                loading={generating === 'Order Sheet'}
                                                onClick={() => handleGenerateDoc(order.id, 'Order Sheet')}
                                            />
                                            <DocButton
                                                title="Tax Invoice"
                                                desc="URA E-Invoicing"
                                                loading={generating === 'Tax Invoice'}
                                                onClick={() => handleGenerateDoc(order.id, 'Tax Invoice')}
                                            />
                                            <DocButton
                                                title="Delivery Note"
                                                desc="Warehouse release"
                                                loading={generating === 'Delivery Note'}
                                                onClick={() => handleGenerateDoc(order.id, 'Delivery Note')}
                                            />
                                        </div>
                                    </div>

                                    {/* Export Specific Details */}
                                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics Visibility</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-wider">Vessel/Vehicle</span>
                                                <span className="font-black text-slate-900">MDF-TRUCK-882</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-bold uppercase tracking-wider">Pick-up Origin</span>
                                                <span className="font-black text-slate-900">Main Factory SITE-B</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500 font-medium uppercase tracking-wider">Compliance Status</span>
                                                <span className="text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Passed
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {orders.length === 0 && (
                    <div className="bg-white rounded-lg border border-slate-200 p-20 text-center shadow-sm">
                        <div className="inline-flex p-6 bg-slate-50 text-slate-200 rounded-lg mb-4">
                            <ShoppingCart size={40} />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No active orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const DocButton = ({ title, desc, onClick, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center space-x-4 p-4 bg-white border border-slate-200 rounded-lg hover:border-primary/30 hover:shadow-md transition-all text-left group disabled:opacity-50"
    >
        <div className={`p-2.5 rounded-lg transition-colors ${loading ? 'bg-primary text-white animate-spin' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary'}`}>
            <FileText size={18} />
        </div>
        <div>
            <p className="text-xs font-bold text-slate-800 leading-none mb-1">{title}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{desc}</p>
        </div>
    </button>
);

export default Orders;
