import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    ClipboardCheck,
    Save,
    AlertTriangle,
    CheckCircle,
    Search,
    RotateCcw,
    FileText
} from 'lucide-react';

const StockReconciliation = () => {
    const [items, setItems] = useState([]);
    const [filter, setFilter] = useState('');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mock Data: Initial Load
        const mockInventory = [
            { id: 1, name: 'MDF Board 18mm - High Density', sku: 'MDF-18-HD', systemStock: 450, physicalStock: 450, remarks: '' },
            { id: 2, name: 'Plywood 12mm - Marine Grade', sku: 'PLY-12-MG', systemStock: 320, physicalStock: 320, remarks: '' },
            { id: 3, name: 'Wood Glue - Industrial 20L', sku: 'GLU-IND-20', systemStock: 85, physicalStock: 80, remarks: 'Leaking barrel discarded' }, // Initial mismatch example
            { id: 4, name: 'Melamine Faced Board - White', sku: 'MFB-WHT-18', systemStock: 200, physicalStock: 200, remarks: '' },
            { id: 5, name: 'Teak Veneer Sheet', sku: 'VNR-TEAK', systemStock: 50, physicalStock: 52, remarks: 'Found extra in warehouse B' }, // Surplus example
        ];
        setItems(mockInventory);
    }, []);

    const handlePhysicalChange = (id, value) => {
        const newValue = parseInt(value) || 0;
        setItems(items.map(item =>
            item.id === id ? { ...item, physicalStock: newValue } : item
        ));
    };

    const handleRemarkChange = (id, value) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, remarks: value } : item
        ));
    };

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1500);
    };

    const handleReset = () => {
        if (window.confirm('Reset all physical counts to match system stock?')) {
            setItems(items.map(item => ({ ...item, physicalStock: item.systemStock, remarks: '' })));
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(filter.toLowerCase()) ||
        item.sku.toLowerCase().includes(filter.toLowerCase())
    );

    const discrepancies = items.filter(i => i.systemStock !== i.physicalStock).length;

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Stock Reconciliation</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Inventory Control</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Audit & Adjustments</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        {discrepancies > 0 && (
                            <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center animate-pulse">
                                <AlertTriangle size={14} className="mr-2" />
                                {discrepancies} Mismatches Found
                            </div>
                        )}
                        <button
                            onClick={handleReset}
                            className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Reset to System Stock"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className={`flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                            ) : saved ? (
                                <>
                                    <CheckCircle size={16} className="text-emerald-400" />
                                    <span>Adjustments Saved</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Finalize Audit</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col min-h-[600px]">

                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="relative w-96">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by Product Name or SKU..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                            Audit period: <span className="text-slate-900">Feb 2026</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">#</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Product Details</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32 bg-slate-100">System Stock</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center w-32 bg-blue-50/50 border-x border-blue-100">Physical Count</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-32">Difference</th>
                                    <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredItems.map((item, index) => {
                                    const diff = item.physicalStock - item.systemStock;
                                    const hasMismatch = diff !== 0;

                                    return (
                                        <tr key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${hasMismatch ? 'bg-rose-50/30' : ''}`}>
                                            <td className="py-4 px-6 text-xs font-bold text-slate-300">{index + 1}</td>
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.sku}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center bg-slate-50/50">
                                                <span className="font-bold text-slate-600 text-sm">{item.systemStock}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center border-x border-slate-100 bg-white">
                                                <input
                                                    type="number"
                                                    value={item.physicalStock}
                                                    onChange={(e) => handlePhysicalChange(item.id, e.target.value)}
                                                    className={`w-20 text-center py-1.5 rounded-lg border-2 text-sm font-bold focus:outline-none transition-all ${hasMismatch
                                                            ? 'border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-500'
                                                            : 'border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-500'
                                                        }`}
                                                />
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`text-sm font-black px-3 py-1 rounded-full ${diff === 0 ? 'text-slate-300 bg-slate-100' :
                                                        diff > 0 ? 'text-emerald-600 bg-emerald-100' :
                                                            'text-rose-600 bg-rose-100'
                                                    }`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={item.remarks}
                                                        onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                                                        placeholder={hasMismatch ? "Required..." : "Optional notes"}
                                                        className={`w-full bg-transparent border-b-2 py-1 text-xs font-medium focus:outline-none transition-all ${hasMismatch
                                                                ? 'border-rose-200 placeholder-rose-300 text-rose-800 focus:border-rose-500'
                                                                : 'border-slate-100 placeholder-slate-300 text-slate-600 focus:border-blue-400'
                                                            }`}
                                                    />
                                                    {hasMismatch && !item.remarks && (
                                                        <AlertTriangle size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-rose-400 animate-pulse pointer-events-none" />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredItems.length === 0 && (
                            <div className="text-center py-20 text-slate-400 text-sm font-medium">
                                No items found matching your search.
                            </div>
                        )}
                    </div>

                    {/* Footer Summary */}
                    <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
                        <span>Showing {filteredItems.length} items</span>
                        <div className="flex space-x-6">
                            <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 mr-2"></span> Matches: {items.length - discrepancies}</span>
                            <span className="flex items-center text-rose-600"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> Mismatches: {discrepancies}</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StockReconciliation;
