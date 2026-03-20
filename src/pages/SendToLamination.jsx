import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const BOARD_TYPES = ['AG', 'LAM', 'RS', 'BLAM', 'BG', 'CG'];

export default function SendToLamination() {
    const [stock, setStock] = useState([]);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({ board_type: 'AG', quantity: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [historySearch, setHistorySearch] = useState('');
    const [historyTypeFilter, setHistoryTypeFilter] = useState('ALL');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [stockRes, histRes] = await Promise.all([
                api.get('/warehouse/stock'),
                api.get('/warehouse/lamination-transfer'),
            ]);
            setStock(Array.isArray(stockRes.data) ? stockRes.data : []);
            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
        } catch {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const stockMap = Object.fromEntries(stock.map(s => [s.board_type, s.quantity]));
    const available = stockMap[form.board_type] ?? 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const qty = parseInt(form.quantity, 10);
        if (!qty || qty <= 0) { setError('Enter a valid quantity.'); return; }
        if (qty > available) { setError(`Insufficient stock. Available: ${available} sheets.`); return; }

        setSubmitting(true);
        try {
            await api.post('/warehouse/lamination-transfer', { board_type: form.board_type, quantity: qty });
            setSuccess(`${qty} sheets of ${form.board_type} sent to lamination.`);
            setForm(f => ({ ...f, quantity: '' }));
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Transfer failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredHistory = useMemo(() => {
        const query = historySearch.trim().toLowerCase();
        return history.filter((entry) => {
            const boardType = String(entry.board_type || '').toUpperCase();
            const matchesSearch =
                !query ||
                boardType.toLowerCase().includes(query) ||
                String(entry.id || '').toLowerCase().includes(query);
            const matchesType = historyTypeFilter === 'ALL' || boardType === historyTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [history, historySearch, historyTypeFilter]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Warehouse → Send to Lamination</h1>

            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">{success}</div>}

            {/* TRANSFER FORM */}
            <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">New Transfer</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Board Type</label>
                            <select
                                value={form.board_type}
                                onChange={e => setForm(f => ({ ...f, board_type: e.target.value, quantity: '' }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            >
                                {BOARD_TYPES.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
                            <input
                                type="number"
                                min="1"
                                max={available}
                                value={form.quantity}
                                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                                placeholder="Enter quantity"
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    {/* Stock availability indicator */}
                    <div className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 w-fit
                        ${available === 0 ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'}`}>
                        <span className="font-medium">Available stock ({form.board_type}):</span>
                        <span className="font-bold">{loading ? '…' : `${available.toLocaleString()} sheets`}</span>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting || available === 0}
                        className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Sending…' : 'Send to Lamination'}
                    </button>
                </form>
            </section>

            {/* CURRENT STOCK DASHBOARD */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Current Warehouse Stock</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {BOARD_TYPES.map(type => (
                        <div key={type}
                            className={`bg-white rounded-lg border shadow-sm p-4 text-center
                                ${form.board_type === type ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-gray-200'}`}>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{type}</p>
                            <p className={`text-2xl font-bold ${(stockMap[type] ?? 0) === 0 ? 'text-red-500' : 'text-indigo-700'}`}>
                                {loading ? '…' : (stockMap[type] !== undefined ? stockMap[type].toLocaleString() : '0')}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">sheets</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* TRANSFER HISTORY */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Transfer History</h2>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        placeholder="Search by board type or transfer id"
                        className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                    <select
                        value={historyTypeFilter}
                        onChange={(e) => setHistoryTypeFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    >
                        <option value="ALL">All board types</option>
                        {BOARD_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : history.length === 0 ? (
                    <p className="text-gray-500 italic">No transfers yet.</p>
                ) : filteredHistory.length === 0 ? (
                    <p className="text-gray-500 italic">No transfer history matched your search/filter.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Board Type</th>
                                    <th className="px-4 py-3 text-right">Quantity</th>
                                    <th className="px-4 py-3">Transfer Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredHistory.map(h => (
                                    <tr key={h.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-500">{h.id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">
                                                {h.board_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700">{h.quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(h.transfer_date).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
