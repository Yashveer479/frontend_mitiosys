import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const BOARD_TYPES = [
    { key: 'AG',   label: 'AG',   desc: 'Anti-Glare',       color: 'emerald' },
    { key: 'LAM',  label: 'LAM',  desc: 'Laminated',        color: 'indigo'  },
    { key: 'RS',   label: 'RS',   desc: 'Raw Sanded',       color: 'sky'     },
    { key: 'BLAM', label: 'BLAM', desc: 'Back Laminated',   color: 'violet'  },
    { key: 'BG',   label: 'BG',   desc: 'Back Gloss',       color: 'blue'    },
    { key: 'CG',   label: 'CG',   desc: 'Clear Gloss',      color: 'amber'   },
];

const COLOR_MAP = {
    emerald: { card: 'border-emerald-200 bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700', num: 'text-emerald-700' },
    indigo:  { card: 'border-indigo-200 bg-indigo-50',   badge: 'bg-indigo-100 text-indigo-700',   num: 'text-indigo-700'  },
    sky:     { card: 'border-sky-200 bg-sky-50',         badge: 'bg-sky-100 text-sky-700',         num: 'text-sky-700'     },
    violet:  { card: 'border-violet-200 bg-violet-50',   badge: 'bg-violet-100 text-violet-700',   num: 'text-violet-700'  },
    blue:    { card: 'border-blue-200 bg-blue-50',       badge: 'bg-blue-100 text-blue-700',       num: 'text-blue-700'    },
    amber:   { card: 'border-amber-200 bg-amber-50',     badge: 'bg-amber-100 text-amber-700',     num: 'text-amber-700'   },
};

export default function WarehouseInventory() {
    const [stock, setStock] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchStock = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/warehouse/final-stock');
            setStock(res.data || {});
            setLastUpdated(new Date());
        } catch {
            setError('Failed to load warehouse stock.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStock(); }, [fetchStock]);

    const total = BOARD_TYPES.reduce((s, { key }) => s + (stock[key] ?? 0), 0);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Warehouse Inventory</h1>
                    {lastUpdated && (
                        <p className="text-xs text-gray-400 mt-1">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchStock}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                    {loading ? 'Refreshing…' : '↻ Refresh'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>
            )}

            {/* Total banner */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-5 flex items-center gap-6">
                <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Stock</p>
                    <p className="text-4xl font-bold text-gray-800">
                        {loading ? '…' : total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">sheets across all board types</p>
                </div>
            </div>

            {/* Stock cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {BOARD_TYPES.map(({ key, label, desc, color }) => {
                    const c = COLOR_MAP[color];
                    const qty = stock[key] ?? 0;
                    const pct = total > 0 ? Math.round((qty / total) * 100) : 0;
                    return (
                        <div key={key} className={`rounded-xl border shadow-sm p-5 ${c.card}`}>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${c.badge}`}>
                                    {label}
                                </span>
                                <span className="text-xs text-gray-400">{pct}%</span>
                            </div>
                            <p className={`text-3xl font-bold ${loading ? 'text-gray-300' : c.num}`}>
                                {loading ? '…' : qty.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{desc}</p>
                            {/* Progress bar */}
                            {!loading && total > 0 && (
                                <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-current ${c.num}`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Table view */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Stock Summary Table</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Board Type</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-right">Quantity (sheets)</th>
                                <th className="px-4 py-3 text-right">Share</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {BOARD_TYPES.map(({ key, label, desc, color }) => {
                                const c = COLOR_MAP[color];
                                const qty = stock[key] ?? 0;
                                const pct = total > 0 ? ((qty / total) * 100).toFixed(1) : '0.0';
                                return (
                                    <tr key={key} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${c.badge}`}>
                                                {label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{desc}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                            {loading ? '…' : qty.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-400">{loading ? '…' : `${pct}%`}</td>
                                    </tr>
                                );
                            })}
                            <tr className="bg-gray-50 font-semibold">
                                <td className="px-4 py-3" colSpan={2}>Total</td>
                                <td className="px-4 py-3 text-right text-gray-800">{loading ? '…' : total.toLocaleString()}</td>
                                <td className="px-4 py-3 text-right text-gray-400">100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
