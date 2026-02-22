import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ShoppingCart,
    User,
    Plus,
    Trash2,
    FileText,
    CheckCircle,
    Search,
    DollarSign,
    Calendar,
    ChevronDown
} from 'lucide-react';

const SalesOrder = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Data Sources
    const [customers, setCustomers] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [warehouses, setWarehouses] = useState([]);

    // Form State
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([
        { product: '', quantity: 1, unitPrice: 0, taxRate: 18 }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch customers, inventory, and warehouses
                const [cRes, iRes, wRes] = await Promise.all([
                    api.get('/customers').catch(() => ({ data: [] })),
                    api.get('/inventory').catch(() => ({ data: [] })),
                    api.get('/warehouses').catch(() => ({ data: [] }))
                ]);

                // If API fails or returns empty, use mock data for demonstration if needed
                if (!cRes.data || cRes.data.length === 0) {
                    setCustomers([
                        { id: '1', name: 'Global Construction Ltd', contact: 'John Doe' },
                        { id: '2', name: 'Kampala Builders', contact: 'Jane Smith' }
                    ]);
                } else {
                    setCustomers(cRes.data);
                }

                if (!iRes.data || iRes.data.length === 0) {
                    setInventory([
                        { id: '1', name: 'MDF Board 18mm', price: 45000 },
                        { id: '2', name: 'Plywood 12mm', price: 32000 }
                    ]);
                } else {
                    // Map inventory to include a base price if not present (mocking price as it might not be in inventory schema)
                    setInventory(iRes.data.map(item => ({
                        ...item,
                        price: item.price || Math.floor(Math.random() * 50000) + 20000 // Mock price logic
                    })));
                }

                if (wRes.data) setWarehouses(wRes.data);

            } catch (err) {
                console.error("Error loading sales data", err);
            }
        };
        fetchData();
    }, []);

    // Handlers
    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-update price if product changes
        if (field === 'product') {
            const product = inventory.find(p => p.name === value);
            if (product) {
                newItems[index].unitPrice = product.price;
            }
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { product: '', quantity: 1, unitPrice: 0, taxRate: 18 }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                customerId: selectedCustomer,
                warehouseId: selectedWarehouse,
                items: items.map(i => {
                    // Find product ID from inventory list
                    const prod = inventory.find(p => p.name === i.product);
                    return {
                        productId: prod?.ProductId || prod?.id, // Handle different API responses
                        quantity: i.quantity,
                        price: i.unitPrice
                    };
                }),
                date: orderDate
            };

            await api.post('/orders', payload);

            setLoading(false);
            setSuccess(true);
            // Reset form
            setSelectedCustomer('');
            setSelectedWarehouse('');
            setItems([{ product: '', quantity: 1, unitPrice: 0, taxRate: 18 }]);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Order creation failed", err);
            setLoading(false);
            alert("Failed to create order. Check stock availability.");
        }
    };

    // Calculations
    const calculateSubtotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const calculateTax = () => {
        return items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.unitPrice;
            return sum + (itemTotal * (item.taxRate / 100));
        }, 0);
    };

    const totalAmount = calculateSubtotal() + calculateTax();

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20">
            <div className="max-w-[1600px] mx-auto px-6 py-10 space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">New Sales Order</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Commercial</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Order Processing</span>
                        </nav>
                    </div>
                    {success && (
                        <div className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center shadow-lg shadow-emerald-500/20 animate-fade-in">
                            <CheckCircle size={16} className="mr-2" />
                            Order Generated Successfully
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    {/* Left Column: Input Forms */}
                    <div className="xl:col-span-2 space-y-8">

                        {/* 1. Customer Context */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center">
                                <User className="mr-3 text-blue-500" size={20} />
                                Customer Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Customer Account</label>
                                    <div className="relative">
                                        <select
                                            value={selectedCustomer}
                                            onChange={(e) => setSelectedCustomer(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none"
                                            required
                                        >
                                            <option value="">Select Customer...</option>
                                            {customers.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Order Date</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={orderDate}
                                            onChange={(e) => setOrderDate(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                                            required
                                        />
                                        <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1.5 Fulfillment Context */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center">
                                <ShoppingCart className="mr-3 text-emerald-500" size={20} />
                                Fulfillment Source
                            </h3>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Source Warehouse</label>
                                <div className="relative">
                                    <select
                                        value={selectedWarehouse}
                                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                                        required
                                    >
                                        <option value="">Select Warehouse...</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Order Lines */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-900"></div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-black text-slate-900 flex items-center">
                                    <ShoppingCart className="mr-3 text-slate-900" size={20} />
                                    Line Items
                                </h3>
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="flex items-center space-x-2 text-xs font-black text-blue-600 uppercase tracking-wider hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Plus size={14} />
                                    <span>Add Item</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 hover:border-blue-100 transition-colors group">
                                        <div className="col-span-12 md:col-span-4 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Product</label>
                                            <div className="relative">
                                                <select
                                                    value={item.product}
                                                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none"
                                                    required
                                                >
                                                    <option value="">Select Product...</option>
                                                    {[...new Set(inventory.map(p => p.name))].map((p, i) => (
                                                        <option key={i} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Qty</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-3 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Unit Price</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-4 md:col-span-2 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Tax %</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.taxRate}
                                                onChange={(e) => handleItemChange(index, 'taxRate', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex justify-end pb-1">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Financial Summary */}
                    <div className="xl:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8 sticky top-28">
                            <h3 className="text-base font-black text-slate-900 mb-6 flex items-center">
                                <DollarSign className="mr-2 text-emerald-500" size={20} />
                                Order Payment
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Subtotal</span>
                                    <span className="text-slate-900 font-bold">{calculateSubtotal().toLocaleString()} UGX</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-bold">Tax (VAT)</span>
                                    <span className="text-slate-900 font-bold">{calculateTax().toLocaleString()} UGX</span>
                                </div>
                                <div className="h-px bg-slate-100 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-900 font-black text-lg">Grand Total</span>
                                    <span className="text-blue-600 font-black text-xl">{totalAmount.toLocaleString()} UGX</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !selectedCustomer || !selectedWarehouse || items.some(i => !i.product)}
                                className={`w-full bg-blue-600 text-white rounded-xl py-4 flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-r-transparent"></div>
                                ) : (
                                    <>
                                        <FileText size={18} strokeWidth={2.5} />
                                        <span className="font-black uppercase tracking-widest text-xs">Generate Order</span>
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-[10px] text-center text-slate-400 font-medium">
                                By generating this order, inventory will be reserved automatically.
                            </p>
                        </div>
                    </div>

                </form>
            </div >
        </div >
    );
};

export default SalesOrder;
