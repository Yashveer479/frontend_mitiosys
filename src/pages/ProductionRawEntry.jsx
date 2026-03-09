import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ProductionRawEntry = () => {
    const [batchNumber, setBatchNumber] = useState('');
    const [rawQuantity, setRawQuantity] = useState('');
    const [thickness, setThickness] = useState('');
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/production/batches');
            setBatches(res.data);
        } catch (err) {
            setError('Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            const payload = {
                batch_number: batchNumber.trim(),
                raw_quantity: parseInt(rawQuantity, 10),
                thickness: thickness !== '' ? parseFloat(thickness) : null
            };
            const res = await api.post('/production/batch', payload);
            setBatches(prev => [res.data, ...prev]);
            setBatchNumber('');
            setRawQuantity('');
            setThickness('');
        } catch (err) {
            setError(err?.response?.data?.msg || 'Failed to create batch');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Production</h1>
                <p className="text-sm text-slate-500 mt-1">Raw Board Entry — MDF batch intake</p>
            </div>

            {/* Create Batch Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-xl">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">New Raw Board Batch</h2>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Batch Number <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={batchNumber}
                            onChange={(e) => setBatchNumber(e.target.value)}
                            placeholder="e.g. MDF-2026-001"
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Raw Quantity (sheets) <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={rawQuantity}
                            onChange={(e) => setRawQuantity(e.target.value)}
                            type="number"
                            min="1"
                            placeholder="e.g. 500"
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Thickness (mm)
                        </label>
                        <input
                            value={thickness}
                            onChange={(e) => setThickness(e.target.value)}
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="e.g. 18.000"
                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                        {submitting ? 'Creating…' : 'Create Batch'}
                    </button>
                </form>
            </div>

            {/* Batches Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Raw Board Batches</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Stage: RAW — next stage: Thickness Processing</p>
                </div>

                {loading ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">Loading batches…</div>
                ) : batches.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">No batches yet. Create the first one above.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-6 py-3 text-left">Batch Number</th>
                                    <th className="px-6 py-3 text-right">Raw Quantity</th>
                                    <th className="px-6 py-3 text-right">Thickness (mm)</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-left">Created Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {batches.map(b => (
                                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-800">{b.batch_number}</td>
                                        <td className="px-6 py-3 text-right text-slate-600">{b.raw_quantity}</td>
                                        <td className="px-6 py-3 text-right text-slate-600">
                                            {b.thickness != null ? parseFloat(b.thickness).toFixed(3) : '—'}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-slate-500">
                                            {new Date(b.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductionRawEntry;
