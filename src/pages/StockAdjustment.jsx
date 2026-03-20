import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
    SlidersHorizontal,
    Save,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight,
    ClipboardList
} from 'lucide-react';

const StockAdjustment = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingHistory, setFetchingHistory] = useState(true);

    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustedQty, setAdjustedQty] = useState('');
    const [reason, setReason] = useState('');
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [historySearch, setHistorySearch] = useState('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');

    useEffect(() => {
        fetchInventory();
        fetchAdjustments();
    }, []);

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            setInventoryItems(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[StockAdjustment] fetchInventory', err);
        }
    };

    const fetchAdjustments = async () => {
        setFetchingHistory(true);
        try {
            const res = await api.get('/inventory/adjustments');
            setAdjustments(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[StockAdjustment] fetchAdjustments', err);
        } finally {
            setFetchingHistory(false);
        }
    };

    const handleItemChange = (e) => {
        const idx = e.target.value;
        if (idx === '') {
            setSelectedItem(null);
            setAdjustedQty('');
            return;
        }
        const item = inventoryItems[parseInt(idx, 10)];
        setSelectedItem(item);
        setAdjustedQty(String(item.quantity));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedItem) return setError('Please select an item.');
        const adjQty = parseInt(adjustedQty, 10);
        if (isNaN(adjQty) || adjQty < 0) return setError('Adjusted stock must be a non-negative number.');
        if (!reason.trim()) return setError('Reason is required.');

        setLoading(true);
        setError('');
        try {
            await api.post('/inventory/adjust', {
                productId: selectedItem.id,
                warehouseId: selectedItem.warehouse?.id,
                adjusted_quantity: adjQty,
                reason: reason.trim()
            });
            setSuccess(true);
            setSelectedItem(null);
            setAdjustedQty('');
            setReason('');
            await fetchInventory();
            await fetchAdjustments();
            setTimeout(() => setSuccess(false), 4000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Adjustment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const diff = selectedItem != null && adjustedQty !== ''
        ? parseInt(adjustedQty, 10) - selectedItem.quantity
        : null;

    const filteredAdjustments = useMemo(() => {
        const query = historySearch.trim().toLowerCase();
        return adjustments.filter((adj) => {
            const direction = adj.adjusted_quantity > adj.previous_quantity
                ? 'INCREASE'
                : adj.adjusted_quantity < adj.previous_quantity
                    ? 'DECREASE'
                    : 'NO_CHANGE';

            const matchesSearch =
                !query ||
                String(adj.item_name || '').toLowerCase().includes(query) ||
                String(adj.reason || '').toLowerCase().includes(query);
            const matchesDirection = historyTypeFilter === 'ALL' || historyTypeFilter === direction;

            return matchesSearch && matchesDirection;
        });
    }, [adjustments, historySearch, historyTypeFilter]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Stock Adjustment</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                    Correct inventory quantities with a traceable reason
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Form */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
                        {success && (
                            <div className="absolute top-0 left-0 right-0 bg-emerald-500 text-white py-2.5 text-center text-xs font-black uppercase tracking-widest z-10 flex items-center justify-center space-x-2">
                                <CheckCircle2 size={14} />
                                <span>Stock adjusted successfully — inventory updated</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={`p-8 space-y-6 ${success ? 'pt-14' : ''}`}>
                            {error && (
                                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Item selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Item
                                </label>
                                <div className="relative">
                                    <SlidersHorizontal size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        onChange={handleItemChange}
                                        defaultValue=""
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                                    >
                                        <option value="">— Select inventory item —</option>
                                        {inventoryItems.map((item, idx) => (
                                            <option key={`${item.id}-${item.warehouse?.id}`} value={idx}>
                                                {item.name}
                                                {item.sku ? ` (${item.sku})` : ''}
                                                {item.warehouse?.name ? ` — ${item.warehouse.name}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Current Stock (read-only) */}
                            {selectedItem && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Current Stock
                                        </label>
                                        <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-700">
                                            {selectedItem.quantity}
                                        </div>
                                    </div>

                                    {/* Adjusted Stock */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            Adjusted Stock
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={adjustedQty}
                                            onChange={e => { setAdjustedQty(e.target.value); setError(''); }}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                            placeholder="Enter new quantity"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Difference indicator */}
                            {diff !== null && !isNaN(diff) && (
                                <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-bold ${
                                    diff === 0
                                        ? 'bg-slate-50 text-slate-500'
                                        : diff > 0
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                    <ArrowRight size={14} />
                                    <span>
                                        {diff === 0
                                            ? 'No change'
                                            : diff > 0
                                                ? `+${diff} units will be added`
                                                : `${diff} units will be removed`}
                                    </span>
                                </div>
                            )}

                            {/* Reason */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Reason <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={e => { setReason(e.target.value); setError(''); }}
                                    rows={3}
                                    placeholder="e.g. Physical count discrepancy, damaged goods, data entry correction…"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !selectedItem}
                                    className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    <span>{loading ? 'Saving…' : 'Save Adjustment'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Side panel: recent adjustments */}
                <div className="xl:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-2">
                            <ClipboardList size={16} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">Recent Adjustments</span>
                        </div>
                        <div className="px-6 py-4 border-b border-slate-100 grid grid-cols-1 gap-3">
                            <input
                                type="text"
                                value={historySearch}
                                onChange={(e) => setHistorySearch(e.target.value)}
                                placeholder="Search item or reason"
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            />
                            <select
                                value={historyTypeFilter}
                                onChange={(e) => setHistoryTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            >
                                <option value="ALL">All adjustment types</option>
                                <option value="INCREASE">Increases only</option>
                                <option value="DECREASE">Decreases only</option>
                                <option value="NO_CHANGE">No-change records</option>
                            </select>
                        </div>
                        {fetchingHistory ? (
                            <div className="py-8 text-center text-slate-400 text-xs">Loading…</div>
                        ) : adjustments.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs">No adjustments yet</div>
                        ) : filteredAdjustments.length === 0 ? (
                            <div className="py-8 text-center text-slate-400 text-xs">No adjustments matched your search/filter</div>
                        ) : (
                            <ul className="divide-y divide-slate-50 max-h-[520px] overflow-y-auto">
                                {filteredAdjustments.slice(0, 20).map(adj => (
                                    <li key={adj.id} className="px-6 py-4 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-800 truncate">{adj.item_name}</span>
                                            <span className={`text-xs font-bold ml-2 shrink-0 ${
                                                adj.adjusted_quantity > adj.previous_quantity
                                                    ? 'text-emerald-600'
                                                    : adj.adjusted_quantity < adj.previous_quantity
                                                        ? 'text-red-500'
                                                        : 'text-slate-400'
                                            }`}>
                                                {adj.previous_quantity} → {adj.adjusted_quantity}
                                            </span>
                                        </div>
                                        {adj.reason && (
                                            <p className="text-xs text-slate-500 truncate">{adj.reason}</p>
                                        )}
                                        <p className="text-xs text-slate-400">{formatDate(adj.created_at)}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockAdjustment;
