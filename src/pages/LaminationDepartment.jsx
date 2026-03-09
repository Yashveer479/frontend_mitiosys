import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function LaminationDepartment() {
    const [pending, setPending] = useState(0);
    const [history, setHistory] = useState([]);
    const [form, setForm] = useState({ input_quantity: '', AG_quantity: '', BG_quantity: '', CG_quantity: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [pendRes, histRes] = await Promise.all([
                api.get('/lamination/pending'),
                api.get('/lamination/process'),
            ]);
            setPending(pendRes.data?.available ?? 0);
            setHistory(Array.isArray(histRes.data) ? histRes.data : []);
        } catch {
            setError('Failed to load data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const inputQty  = parseInt(form.input_quantity, 10) || 0;
    const agQty     = parseInt(form.AG_quantity, 10)    || 0;
    const bgQty     = parseInt(form.BG_quantity, 10)    || 0;
    const cgQty     = parseInt(form.CG_quantity, 10)    || 0;
    const totalOut  = agQty + bgQty + cgQty;
    const balanced  = inputQty > 0 && totalOut === inputQty;
    const diff      = inputQty - totalOut;

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (inputQty <= 0) { setError('Input quantity must be greater than 0.'); return; }
        if (inputQty > pending) { setError(`Input exceeds available lamination stock (${pending} sheets).`); return; }
        if (!balanced) { setError(`Total output (${totalOut}) must equal input quantity (${inputQty}).`); return; }

        setSubmitting(true);
        try {
            await api.post('/lamination/process', {
                input_quantity: inputQty,
                AG_quantity: agQty,
                BG_quantity: bgQty,
                CG_quantity: cgQty,
            });
            setSuccess('Lamination process saved successfully.');
            setForm({ input_quantity: '', AG_quantity: '', BG_quantity: '', CG_quantity: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to save.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Lamination Department</h1>

            {/* Available stock banner */}
            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-lg px-5 py-4">
                <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Available for Processing</p>
                    <p className="text-3xl font-bold text-indigo-700">{loading ? '…' : pending.toLocaleString()}</p>
                    <p className="text-xs text-indigo-400 mt-0.5">sheets</p>
                </div>
            </div>

            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded">{success}</div>}

            {/* PROCESS FORM */}
            <section className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-5">Record Lamination Process</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Input quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Input Quantity <span className="text-gray-400">(sheets received)</span></label>
                        <input
                            type="number" name="input_quantity" min="1" max={pending}
                            value={form.input_quantity} onChange={handleChange}
                            placeholder="e.g. 500"
                            className="w-full sm:w-64 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    {/* Output grade inputs */}
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-3">Output by Grade</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { key: 'AG_quantity', label: 'AG', color: 'text-emerald-600' },
                                { key: 'BG_quantity', label: 'BG', color: 'text-blue-600' },
                                { key: 'CG_quantity', label: 'CG', color: 'text-amber-600' },
                            ].map(({ key, label, color }) => (
                                <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                    <label className={`block text-xs font-bold uppercase tracking-wide mb-2 ${color}`}>{label}</label>
                                    <input
                                        type="number" name={key} min="0"
                                        value={form[key]} onChange={handleChange}
                                        placeholder="0"
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Balance panel */}
                    {inputQty > 0 && (
                        <div className={`flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium border
                            ${balanced
                                ? 'bg-green-50 border-green-300 text-green-700'
                                : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                            <span className="text-lg">{balanced ? '✓' : '⚠'}</span>
                            {balanced
                                ? `Balanced — total output matches input (${inputQty} sheets)`
                                : `${Math.abs(diff)} sheet${Math.abs(diff) !== 1 ? 's' : ''} ${diff > 0 ? 'unaccounted' : 'over-allocated'} (output: ${totalOut} / input: ${inputQty})`
                            }
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !balanced}
                        className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {submitting ? 'Saving…' : 'Save Lamination Results'}
                    </button>
                </form>
            </section>

            {/* HISTORY */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Processing History</h2>
                {loading ? (
                    <p className="text-gray-500">Loading…</p>
                ) : history.length === 0 ? (
                    <p className="text-gray-500 italic">No records yet.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Source Type</th>
                                    <th className="px-4 py-3 text-right">Input</th>
                                    <th className="px-4 py-3 text-right text-emerald-600">AG</th>
                                    <th className="px-4 py-3 text-right text-blue-600">BG</th>
                                    <th className="px-4 py-3 text-right text-amber-600">CG</th>
                                    <th className="px-4 py-3">Processed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {history.map(h => (
                                    <tr key={h.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-gray-400">{h.id}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded">
                                                {h.input_board_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-800">{h.input_quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-emerald-700">{h.AG_quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-blue-700">{h.BG_quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right text-amber-700">{h.CG_quantity.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-gray-500">{new Date(h.processed_at).toLocaleString()}</td>
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
