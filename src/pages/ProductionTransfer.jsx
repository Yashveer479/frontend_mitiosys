import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const BOARD_TYPES = ['AG', 'LAM', 'RS', 'BLAM', 'BG', 'CG'];

export default function ProductionTransfer() {
    const [batches, setBatches] = useState([]);
    const [gradings, setGradings] = useState({});
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [transferring, setTransferring] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [detailFilter, setDetailFilter] = useState('ALL');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [batchRes, stockRes] = await Promise.all([
                api.get('/production/batches'),
                api.get('/warehouse/stock'),
            ]);
            const graded = Array.isArray(batchRes.data) ? batchRes.data.filter(b => b.status === 'GRADED') : [];
            setBatches(graded);
            setStock(Array.isArray(stockRes.data) ? stockRes.data : []);

            // fetch grading detail for each graded batch
            const gradingMap = {};
            await Promise.all(
                graded.map(async b => {
                    try {
                        const r = await api.get(`/production/grading/${b.id}`);
                        if (r.data && r.data.length > 0) gradingMap[b.id] = r.data[0];
                    } catch (_) { /* ignore */ }
                })
            );
            setGradings(gradingMap);
        } catch (err) {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleTransfer = async (batch_id) => {
        setTransferring(batch_id);
        setError('');
        setSuccess('');
        try {
            await api.post('/warehouse/transfer', { batch_id });
            setSuccess(`Batch #${batch_id} transferred to warehouse.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Transfer failed.');
        } finally {
            setTransferring(null);
        }
    };

    const stockMap = Object.fromEntries(stock.map(s => [s.board_type, s.quantity]));

    const filteredBatches = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return batches.filter((batch) => {
            const hasDetails = Boolean(gradings[batch.id]);
            const matchesSearch =
                !query ||
                String(batch.batch_number || '').toLowerCase().includes(query) ||
                String(batch.id || '').toLowerCase().includes(query);
            const matchesDetail =
                detailFilter === 'ALL' ||
                (detailFilter === 'WITH_DETAILS' && hasDetails) ||
                (detailFilter === 'WITHOUT_DETAILS' && !hasDetails);
            return matchesSearch && matchesDetail;
        });
    }, [batches, gradings, searchTerm, detailFilter]);

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Production → Warehouse Transfer</h1>

            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">{success}</div>}

            {/* GRADED BATCHES TABLE */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Graded Batches Awaiting Transfer</h2>
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by batch id or batch number"
                        className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                    <select
                        value={detailFilter}
                        onChange={(e) => setDetailFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    >
                        <option value="ALL">All batches</option>
                        <option value="WITH_DETAILS">With grading details</option>
                        <option value="WITHOUT_DETAILS">Missing grading details</option>
                    </select>
                </div>
                {loading ? (
                    <p className="text-gray-500">Loading...</p>
                ) : batches.length === 0 ? (
                    <p className="text-gray-500 italic">No batches ready for transfer.</p>
                ) : filteredBatches.length === 0 ? (
                    <p className="text-gray-500 italic">No transfer batches matched your search/filter.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Batch #</th>
                                    <th className="px-4 py-3">Batch No</th>
                                    <th className="px-4 py-3 text-right">AG</th>
                                    <th className="px-4 py-3 text-right">LAM</th>
                                    <th className="px-4 py-3 text-right">RS</th>
                                    <th className="px-4 py-3 text-right">BLAM</th>
                                    <th className="px-4 py-3 text-right">BG</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredBatches.map(b => {
                                    const g = gradings[b.id];
                                    return (
                                        <tr key={b.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{b.id}</td>
                                            <td className="px-4 py-3 text-gray-600">{b.batch_number}</td>
                                            {['AG_quantity','LAM_quantity','RS_quantity','BLAM_quantity','BG_quantity'].map(col => (
                                                <td key={col} className="px-4 py-3 text-right text-gray-700">
                                                    {g ? (g[col] ?? 0) : <span className="text-gray-300">—</span>}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleTransfer(b.id)}
                                                    disabled={transferring === b.id || !g}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {transferring === b.id ? 'Transferring…' : 'Transfer to Warehouse'}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* WAREHOUSE STOCK DASHBOARD */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Current Warehouse Stock</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {BOARD_TYPES.map(type => (
                        <div key={type} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 text-center">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{type}</p>
                            <p className="text-2xl font-bold text-indigo-700">
                                {stockMap[type] !== undefined ? stockMap[type].toLocaleString() : '—'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">sheets</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
