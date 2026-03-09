import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Truck,
    User,
    Calendar,
    MapPin,
    Package,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronRight,
    Search
} from 'lucide-react';

const Dispatch = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State for Assignment
    const [dispatchData, setDispatchData] = useState({
        vehicleType: 'Box Truck (10T)',
        vehicleReg: '',
        driverName: '',
        driverContact: '',
        estimatedArrival: ''
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/dispatch/pending');
                setOrders(res.data.map(o => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    customer: o.Customer?.name || 'Unknown',
                    location: o.Customer?.address || 'Start',
                    items: o.totalAmount, // Showing amount as items count surrogate for now
                    status: o.status,
                    date: o.createdAt
                })));
            } catch (err) {
                console.error("Failed to fetch dispatch orders", err);
            }
        };
        fetchOrders();
    }, []);

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setSuccess(false);
        setDispatchData({
            vehicleType: 'Box Truck (10T)',
            vehicleReg: '',
            driverName: '',
            driverContact: '',
            estimatedArrival: ''
        });
    };

    const handleChange = (e) => {
        setDispatchData({ ...dispatchData, [e.target.name]: e.target.value });
    };

    const handleDispatch = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/dispatch', {
                orderId: selectedOrder.id,
                ...dispatchData
            });

            setSuccess(true);
            setTimeout(() => {
                // Remove processed order from list
                setOrders(orders.filter(o => o.id !== selectedOrder.id));
                setSelectedOrder(null);
                setSuccess(false);
                setLoading(false);
            }, 1000);
        } catch (err) {
            console.error("Dispatch failed", err);
            setLoading(false);
            alert("Failed to confirm dispatch");
        }
    };

    // Timeline Helper
    const steps = [
        { label: 'Order Picked', status: 'completed' },
        { label: 'Packed & Stored', status: 'completed' },
        { label: 'Vehicle Assignment', status: 'active' },
        { label: 'In Transit', status: 'pending' },
        { label: 'Delivered', status: 'pending' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Dispatch Control</h1>
                    <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Logistics</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-blue-600">Fleet Management</span>
                    </nav>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Panel: Order Pool */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[800px] flex flex-col">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-4 flex justify-between items-center">
                                <span>Ready for Dispatch</span>
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{orders.length}</span>
                            </h3>

                            <div className="relative mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Order ID..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {orders.map(order => (
                                    <div
                                        key={order.id}
                                        onClick={() => handleOrderSelect(order)}
                                        className={`group cursor-pointer p-4 rounded-xl border transition-all ${selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-200' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedOrder?.id === order.id ? 'text-blue-600' : 'text-slate-500'}`}>{order.orderNumber}</span>
                                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{order.status}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 text-sm mb-1">{order.customer}</h4>
                                        <div className="flex items-center text-xs text-slate-500 space-x-3">
                                            <span className="flex items-center"><MapPin size={12} className="mr-1" /> {order.location}</span>
                                            <span className="flex items-center"><Package size={12} className="mr-1" /> {order.items} items</span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <div className="text-center py-10 text-slate-400 text-sm">No orders pending dispatch.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Assignment & Details */}
                    <div className="lg:col-span-2">
                        {selectedOrder ? (
                            <form onSubmit={handleDispatch} className="space-y-6">

                                {/* 1. Order Context & Timeline */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-1">{selectedOrder.customer}</h2>
                                            <p className="text-sm font-bold text-slate-500 flex items-center">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs mr-3">{selectedOrder.orderNumber}</span>
                                                <MapPin size={14} className="mr-1 text-slate-400" /> {selectedOrder.location}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Order Amount</p>
                                            <p className="text-xl font-black text-slate-900">24 Items</p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative flex items-center justify-between mb-4 px-4">
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                                        {steps.map((step, idx) => (
                                            <div key={idx} className="flex flex-col items-center bg-white px-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${step.status === 'completed' ? 'bg-emerald-500 border-white text-white' :
                                                    step.status === 'active' ? 'bg-blue-600 border-blue-100 text-white shadow-lg ring-2 ring-blue-500/20' :
                                                        'bg-slate-200 border-white text-slate-400'
                                                    }`}>
                                                    {step.status === 'completed' && <CheckCircle size={14} />}
                                                    {step.status === 'active' && <Clock size={14} className="animate-pulse" />}
                                                    {step.status === 'pending' && <div className="w-2 h-2 bg-slate-400 rounded-full"></div>}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase mt-2 tracking-wide ${step.status === 'active' ? 'text-blue-600' : 'text-slate-400'
                                                    }`}>{step.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. Logistics Assignment Form */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-6 flex items-center">
                                        <Truck className="mr-2 text-blue-500" size={18} />
                                        Logistics Assignment
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Vehicle Type</label>
                                            <select
                                                name="vehicleType"
                                                value={dispatchData.vehicleType}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            >
                                                <option>Box Truck (10T)</option>
                                                <option>Pickup Van (2T)</option>
                                                <option>Flatbed Trailer</option>
                                                <option>Motorcycle Courier</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Registration Number</label>
                                            <input
                                                type="text"
                                                name="vehicleReg"
                                                value={dispatchData.vehicleReg}
                                                onChange={handleChange}
                                                placeholder="e.g. UBA 123X"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all uppercase placeholder:normal-case"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Driver Name</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="driverName"
                                                    value={dispatchData.driverName}
                                                    onChange={handleChange}
                                                    placeholder="Assigned Driver"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                    required
                                                />
                                                <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Est. Delivery</label>
                                            <div className="relative">
                                                <input
                                                    type="datetime-local"
                                                    name="estimatedArrival"
                                                    value={dispatchData.estimatedArrival}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-full bg-slate-900 text-white rounded-xl py-4 flex items-center justify-center space-x-2 shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent"></div>
                                        ) : success ? (
                                            <>
                                                <CheckCircle size={18} className="text-emerald-400" />
                                                <span className="font-black uppercase tracking-widest text-xs">Dispatch Confirmed</span>
                                            </>
                                        ) : (
                                            <>
                                                <Truck size={18} strokeWidth={2.5} />
                                                <span className="font-black uppercase tracking-widest text-xs">Confirm assignment & Dispatch</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                            </form>
                        ) : (
                            <div className="h-[800px] bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                                <div className="p-6 bg-slate-50 rounded-full mb-4">
                                    <Truck size={48} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2">No Order Selected</h3>
                                <p className="text-sm font-medium">Select an order from the left to begin assignment.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dispatch;
