import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    CalendarDays,
    Factory,
    Hash,
    Cpu,
    Save,
    Plus,
    CheckCircle2,
    AlertCircle,
    Loader2,
    RefreshCw,
    ChevronRight,
    Circle
} from 'lucide-react';

const STATUS_STYLES = {
    PLANNED:     { label: 'Planned',     cls: 'bg-blue-100 text-blue-700' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
    COMPLETED:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700' },
    CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-500' },
};

const PRODUCT_TYPES = [
    'MDF Board - Standard',
    'MDF Board - Thin',
    'MDF Board - Thick',
    'Laminated Board - AG',
    'Laminated Board - BG',
    'Laminated Board - CG',
    'Raw Board',
    'Custom',
];

const MACHINES = [
    'Press Machine 1',
    'Press Machine 2',
    'Laminator A',
    'Laminator B',
    'Sander Unit 1',
    'Sander Unit 2',
    'Thickness Gauge Line',
];

const STATUSES = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const emptyForm = {
    plan_date: new Date().toISOString().split('T')[0],
    product_type: '',
    target_quantity: '',
    machine: '',
    status: 'PLANNED',
};

const ProductionPlanning = () => {
    const [plans, setPlans] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchPlans = async () => {
        setFetching(true);
        try {
            const res = await api.get('/production/plan');
            setPlans(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('[ProductionPlanning] fetch', err);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { fetchPlans(); }, []);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.product_type) return setError('Please select a product type.');
        const qty = parseInt(form.target_quantity, 10);
        if (!qty || qty <= 0) return setError('Target quantity must be a positive number.');

        setLoading(true);
        setError('');
        try {
            const res = await api.post('/production/plan', {
                plan_date: form.plan_date,
                product_type: form.product_type,
                target_quantity: qty,
                machine: form.machine || null,
                status: form.status
            });
            setPlans(prev => [res.data, ...prev]);
            setForm(emptyForm);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3500);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create plan.');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const res = await api.patch(`/production/plan/${id}/status`, { status: newStatus });
            setPlans(prev => prev.map(p => p.id === id ? res.data : p));
        } catch (err) {
            console.error('[ProductionPlanning] status update', err);
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const summary = {
        total: plans.length,
        planned: plans.filter(p => p.status === 'PLANNED').length,
        inProgress: plans.filter(p => p.status === 'IN_PROGRESS').length,
        completed: plans.filter(p => p.status === 'COMPLETED').length,
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Production Planning</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium uppercase tracking-wider">
                    Schedule and manage production runs
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Plans', value: summary.total, color: 'text-slate-700', bg: 'bg-slate-50' },
                    { label: 'Planned', value: summary.planned, color: 'text-blue-700', bg: 'bg-blue-50' },
                    { label: 'In Progress', value: summary.inProgress, color: 'text-amber-700', bg: 'bg-amber-50' },
                    { label: 'Completed', value: summary.completed, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                ].map(card => (
                    <div key={card.label} className={`${card.bg} rounded-2xl px-5 py-4 flex flex-col space-y-1`}>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                        <span className={`text-3xl font-black ${card.color}`}>{card.value}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                {/* Create Plan Form */}
                <div className="xl:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center space-x-2">
                            <Plus size={16} className="text-primary" />
                            <span className="text-sm font-bold text-slate-700">New Production Plan</span>
                        </div>

                        {success && (
                            <div className="mx-6 mt-4 flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-semibold">
                                <CheckCircle2 size={15} />
                                <span>Plan created successfully</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {error && (
                                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center space-x-1"><CalendarDays size={12} /><span>Plan Date</span></span>
                                </label>
                                <input
                                    type="date"
                                    name="plan_date"
                                    value={form.plan_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>

                            {/* Product Type */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center space-x-1"><Factory size={12} /><span>Product Type</span></span>
                                </label>
                                <select
                                    name="product_type"
                                    value={form.product_type}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                                >
                                    <option value="">— Select type —</option>
                                    {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Target Quantity */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center space-x-1"><Hash size={12} /><span>Target Quantity</span></span>
                                </label>
                                <input
                                    type="number"
                                    name="target_quantity"
                                    min="1"
                                    value={form.target_quantity}
                                    onChange={handleChange}
                                    placeholder="e.g. 500"
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>

                            {/* Machine */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    <span className="flex items-center space-x-1"><Cpu size={12} /><span>Machine</span></span>
                                </label>
                                <select
                                    name="machine"
                                    value={form.machine}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none"
                                >
                                    <option value="">— Select machine (optional) —</option>
                                    {MACHINES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                                <div className="flex flex-wrap gap-2">
                                    {STATUSES.map(s => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, status: s }))}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                                form.status === s
                                                    ? STATUS_STYLES[s].cls + ' ring-2 ring-offset-1 ring-current'
                                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                            }`}
                                        >
                                            {STATUS_STYLES[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                                <span>{loading ? 'Saving…' : 'Create Plan'}</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Plans Table */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CalendarDays size={16} className="text-slate-400" />
                                <span className="text-sm font-bold text-slate-700">Production Schedule</span>
                            </div>
                            <button onClick={fetchPlans} disabled={fetching} className="text-slate-400 hover:text-slate-700 transition-colors">
                                <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        {fetching ? (
                            <div className="py-16 text-center text-slate-400 text-sm">Loading plans…</div>
                        ) : plans.length === 0 ? (
                            <div className="py-16 flex flex-col items-center space-y-2 text-slate-400">
                                <Factory size={36} className="text-slate-200" />
                                <span className="text-sm font-medium">No production plans yet</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Type</th>
                                            <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Target Qty</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Machine</th>
                                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {plans.map(plan => (
                                            <tr key={plan.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-5 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">
                                                    {formatDate(plan.plan_date)}
                                                </td>
                                                <td className="px-5 py-3 font-semibold text-slate-800">
                                                    {plan.product_type}
                                                </td>
                                                <td className="px-5 py-3 text-right font-bold text-slate-700">
                                                    {plan.target_quantity?.toLocaleString()}
                                                </td>
                                                <td className="px-5 py-3 text-slate-500 text-xs">
                                                    {plan.machine || <span className="text-slate-300">—</span>}
                                                </td>
                                                <td className="px-5 py-3">
                                                    {updatingId === plan.id ? (
                                                        <Loader2 size={14} className="animate-spin text-slate-400" />
                                                    ) : (
                                                        <select
                                                            value={plan.status}
                                                            onChange={e => handleStatusChange(plan.id, e.target.value)}
                                                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${STATUS_STYLES[plan.status]?.cls || 'bg-slate-100 text-slate-600'}`}
                                                        >
                                                            {STATUSES.map(s => (
                                                                <option key={s} value={s}>{STATUS_STYLES[s].label}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 font-medium">
                                    {plans.length} plan{plans.length !== 1 ? 's' : ''} total
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanning;
