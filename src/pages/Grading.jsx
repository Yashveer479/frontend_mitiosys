import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

const GRADES = [
    { key: 'AG_quantity', label: 'AG', desc: 'Plain Sell' },
    { key: 'LAM_quantity', label: 'LAM', desc: 'Lamination' },
    { key: 'RS_quantity', label: 'RS', desc: 'Reject Sale' },
    { key: 'BLAM_quantity', label: 'BLAM', desc: 'Laminated Boards' },
    { key: 'BG_quantity', label: 'BG', desc: 'Board Grade' },
];

const emptyGrades = () => ({ AG_quantity: '', LAM_quantity: '', RS_quantity: '', BLAM_quantity: '', BG_quantity: '' });

const Grading = () => {
    const [batches, setBatches] = useState([]);
    const [sandingMap, setSandingMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [recordFilter, setRecordFilter] = useState('ALL');

    // Modal state
    const [modalBatch, setModalBatch] = useState(null);
    const [grades, setGrades] = useState(emptyGrades());
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);

    const fetchBatches = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/production/batches');
            const sandingBatches = (Array.isArray(res.data) ? res.data : []).filter(b => b.status === 'SANDING_PROCESSED');
            setBatches(sandingBatches);

            // Fetch latest sanding record for each batch to get output quantity
            const map = {};
            await Promise.all(sandingBatches.map(async (b) => {
                try {
                    const sRes = await api.get(`/production/sanding/${b.id}`);
                    if (sRes.data && sRes.data.length > 0) {
                        map[b.id] = sRes.data[0];
                    }
                } catch (_) { /* skip */ }
            }));
            setSandingMap(map);
        } catch (err) {
            setError('Failed to load batches');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBatches(); }, [fetchBatches]);

    const openModal = (batch) => {
        setModalBatch(batch);
        setGrades(emptyGrades());
        setModalError(null);
    };

    const closeModal = () => {
        setModalBatch(null);
        setGrades(emptyGrades());
        setModalError(null);
    };

    const sandingOutput = modalBatch && sandingMap[modalBatch.id]
        ? parseInt(sandingMap[modalBatch.id].output_quantity, 10)
        : 0;

    const totalGraded = GRADES.reduce((sum, g) => sum + (parseInt(grades[g.key], 10) || 0), 0);
    const diff = totalGraded - sandingOutput;
    const isBalanced = totalGraded === sandingOutput;

    const handleGradeChange = (key, value) => {
        setGrades(prev => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setModalError(null);

        if (!isBalanced) {
            setModalError(`Total graded (${totalGraded}) must equal sanding output (${sandingOutput})`);
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/production/grading', {
                batch_id: modalBatch.id,
                AG_quantity: parseInt(grades.AG_quantity, 10) || 0,
                LAM_quantity: parseInt(grades.LAM_quantity, 10) || 0,
                RS_quantity: parseInt(grades.RS_quantity, 10) || 0,
                BLAM_quantity: parseInt(grades.BLAM_quantity, 10) || 0,
                BG_quantity: parseInt(grades.BG_quantity, 10) || 0,
            });
            closeModal();
            fetchBatches();
        } catch (err) {
            setModalError(err?.response?.data?.msg || 'Failed to submit grading');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredBatches = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return batches.filter((batch) => {
            const hasSandingRecord = Boolean(sandingMap[batch.id]);
            const matchesSearch = !query || String(batch.batch_number || '').toLowerCase().includes(query);
            const matchesRecord =
                recordFilter === 'ALL' ||
                (recordFilter === 'WITH_RECORD' && hasSandingRecord) ||
                (recordFilter === 'WITHOUT_RECORD' && !hasSandingRecord);

            return matchesSearch && matchesRecord;
        });
    }, [batches, sandingMap, searchTerm, recordFilter]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Production</h1>
                <p className="text-sm text-slate-500 mt-1">Grading — categorize boards by quality and purpose</p>
            </div>

            {/* Batches Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Batches Ready for Grading</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Stage: SANDING_PROCESSED → GRADED</p>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by batch number"
                            className="md:col-span-2 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        />
                        <select
                            value={recordFilter}
                            onChange={(e) => setRecordFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        >
                            <option value="ALL">All records</option>
                            <option value="WITH_RECORD">With sanding output</option>
                            <option value="WITHOUT_RECORD">Missing sanding output</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">Loading batches…</div>
                ) : error ? (
                    <div className="px-6 py-10 text-center text-red-500 text-sm">{error}</div>
                ) : batches.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">
                        No batches awaiting grading. Complete sanding first.
                    </div>
                ) : filteredBatches.length === 0 ? (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">
                        No grading batches matched your search/filter.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-6 py-3 text-left">Batch Number</th>
                                    <th className="px-6 py-3 text-right">Sanding Output</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredBatches.map(b => {
                                    const sp = sandingMap[b.id];
                                    return (
                                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-slate-800">{b.batch_number}</td>
                                            <td className="px-6 py-3 text-right font-medium text-emerald-600">
                                                {sp ? sp.output_quantity : '—'}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => openModal(b)}
                                                    className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    Grade Batch
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Grading legend */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Grade Reference</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {GRADES.map(g => (
                        <div key={g.key} className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-base font-bold text-primary">{g.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{g.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {modalBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 z-10">
                        <h2 className="text-lg font-semibold text-slate-800 mb-1">Grade Batch</h2>
                        <p className="text-sm text-slate-500 mb-1">
                            Batch: <span className="font-medium text-slate-700">{modalBatch.batch_number}</span>
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            Total boards to grade: <span className="font-semibold text-slate-700">{sandingOutput}</span>
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {GRADES.map(g => (
                                    <div key={g.key}>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            {g.label} <span className="text-xs text-slate-400 font-normal">— {g.desc}</span>
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={grades[g.key]}
                                            onChange={e => handleGradeChange(g.key, e.target.value)}
                                            placeholder="0"
                                            className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Total vs Required */}
                            <div className={`px-4 py-3 rounded-lg border text-sm ${isBalanced
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                : 'border-amber-300 bg-amber-50 text-amber-700'
                                }`}>
                                <div className="flex justify-between">
                                    <span>Total graded:</span>
                                    <span className="font-semibold">{totalGraded}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span>Required (sanding output):</span>
                                    <span className="font-semibold">{sandingOutput}</span>
                                </div>
                                {!isBalanced && (
                                    <p className="mt-2 text-xs font-medium">
                                        {diff > 0 ? `${diff} too many` : `${Math.abs(diff)} remaining to assign`}
                                    </p>
                                )}
                                {isBalanced && (
                                    <p className="mt-2 text-xs font-medium">✓ Quantities balanced</p>
                                )}
                            </div>

                            {modalError && (
                                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {modalError}
                                </p>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !isBalanced}
                                    className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
                                >
                                    {submitting ? 'Saving…' : 'Confirm Grading'}
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

export default Grading;
