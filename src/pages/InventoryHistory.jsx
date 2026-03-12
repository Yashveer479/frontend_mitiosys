import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, RefreshCw, Filter, ArrowUp, ArrowDown } from 'lucide-react';

const ACTION_COLORS = {
    PURCHASE:   'bg-blue-100 text-blue-700',
    PRODUCTION: 'bg-purple-100 text-purple-700',
    TRANSFER:   'bg-amber-100 text-amber-700',
    LAMINATION: 'bg-pink-100 text-pink-700',
    ADJUSTMENT: 'bg-slate-100 text-slate-700',
    SALE:       'bg-red-100 text-red-700',
};

const ACTION_TYPES = ['ALL', 'PURCHASE', 'PRODUCTION', 'TRANSFER', 'LAMINATION', 'ADJUSTMENT', 'SALE'];

const InventoryHistory = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [search, setSearch] = useState('');

    const fetchHistory = async () => {
        try {
            const params = filter !== 'ALL' ? { action_type: filter, limit: 500 } : { limit: 500 };
            const res = await api.get('/inventory/history', { params });
            setRecords(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[InventoryHistory]', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchHistory();
    }, [filter]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    const displayed = records.filter(r =>
        !search || r.item_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(r.reference_id || '').toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
            ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory History</h2>
                    <p className="mt-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                        Full audit trail of all inventory movements
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                    <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                    <Filter size={14} className="text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search item or reference…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="text-sm outline-none w-52 text-slate-700"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {ACTION_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilter(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                                filter === type
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="py-16 text-center text-slate-400 text-sm font-medium">Loading history…</div>
                ) : displayed.length === 0 ? (
                    <div className="py-16 flex flex-col items-center space-y-2 text-slate-400">
                        <History size={36} className="text-slate-200" />
                        <span className="text-sm font-medium">No history records found</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                                    <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reference</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {displayed.map((r) => (
                                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="px-6 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                                            {formatDate(r.created_at)}
                                        </td>
                                        <td className="px-6 py-3 font-semibold text-slate-800">
                                            {r.item_name}
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${ACTION_COLORS[r.action_type] || 'bg-slate-100 text-slate-600'}`}>
                                                {r.action_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <span className={`inline-flex items-center space-x-1 font-bold text-sm ${r.quantity >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {r.quantity >= 0
                                                    ? <ArrowUp size={12} />
                                                    : <ArrowDown size={12} />}
                                                <span>{Math.abs(r.quantity)}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                                            {r.reference_id || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 font-medium">
                            Showing {displayed.length} record{displayed.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventoryHistory;
