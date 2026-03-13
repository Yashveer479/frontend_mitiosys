import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const ThicknessProcessing = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [modalBatch, setModalBatch] = useState(null);
    const [rejectedQty, setRejectedQty] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);

    const fetchBatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/production/batches');
            // Only show RAW batches for processing
            setBatches((Array.isArray(res.data) ? res.data : []).filter(b => b.status === 'RAW'));
        } catch (err) {
            setError('Failed to load batches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBatches(); }, [fetchBatches]);

    const openModal = (batch) => {
        setModalBatch(batch);
        setRejectedQty('0');
        setModalError(null);
    };

    const closeModal = () => {
        setModalBatch(null);
        setRejectedQty('');
        setModalError(null);
    };

    const inputQty = modalBatch ? modalBatch.raw_quantity : 0;
    const rejQty = parseInt(rejectedQty, 10) || 0;
    const remaining = inputQty - rejQty;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError(null);
        if (rejQty < 0) {
            setModalError('Rejected quantity cannot be negative');
            return;
        }
        if (rejQty > inputQty) {
            setModalError(`Rejected quantity cannot exceed input quantity (${inputQty})`);
            return;
        }
        setSubmitting(true);
        try {
            await api.post('/production/thickness', {
                batch_id: modalBatch.id,
                rejected_quantity: rejQty
            });
            closeModal();
            fetchBatches();
        } catch (err) {
            setModalError(err?.response?.data?.msg || 'Failed to process batch');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Production</h1>
                <p className="text-sm text-slate-500 mt-1">Thickness Processing — reduce and record rejected boards</p>
            </div>

            {/* Batches Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">RAW Batches Awaiting Thickness Processing</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Stage: RAW → next stage: Sanding</p>
                </div>

                {loading ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">Loading batches…</div>
                ) : error ? (
                    <div className="px-6 py-10 text-center text-red-500 text-sm">{error}</div>
                ) : batches.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">
                        No RAW batches available. All batches have been processed or no batches exist yet.
                    </div>
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
                                    <th className="px-6 py-3 text-center">Action</th>
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
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => openModal(b)}
                                                className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                Process Thickness
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Dialog */}
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 z-10">
                        <h2 className="text-lg font-semibold text-slate-800 mb-1">Thickness Processing</h2>
                        <p className="text-sm text-slate-500 mb-6">
                            Batch: <span className="font-medium text-slate-700">{modalBatch.batch_number}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Input Quantity (readonly) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Input Quantity
                                </label>
                                <input
                                    type="number"
                                    value={inputQty}
                                    readOnly
                                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                                />
                            </div>

                            {/* Rejected Quantity */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Rejected Quantity <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={inputQty}
                                    value={rejectedQty}
                                    onChange={e => setRejectedQty(e.target.value)}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                    required
                                />
                            </div>

                            {/* Remaining (live calculation) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Remaining Quantity
                                </label>
                                <div className={`px-3 py-2 rounded-lg border text-sm font-semibold ${remaining < 0
                                    ? 'border-red-300 bg-red-50 text-red-600'
                                    : 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                    }`}>
                                    {remaining}
                                </div>
                            </div>

                            {modalError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {modalError}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || remaining < 0}
                                    className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                                >
                                    {submitting ? 'Processing…' : 'Confirm Processing'}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThicknessProcessing;
