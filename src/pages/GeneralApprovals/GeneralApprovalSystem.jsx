import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Paperclip, Clock, CheckCircle, XCircle, Send, AlertCircle, Search } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toServerUrl } from '../../services/urlConfig';

const LEVEL_OPTIONS = ['PM', 'GM', 'DM'];

const statusLabel = (status) => String(status || '').replaceAll('_', ' ');

const GeneralApprovalSystem = () => {
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        title: '',
        description: '',
        department: '',
        first_level: 'PM',
        second_level: 'GM',
        third_level: 'DM'
    });
    const [attachment, setAttachment] = useState(null);

    const selected = useMemo(
        () => items.find((entry) => String(entry.id) === String(routeId || '')) || null,
        [items, routeId]
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return items;
        const q = search.toLowerCase();
        return items.filter((entry) => {
            return (
                String(entry.id).includes(q) ||
                String(entry.title || '').toLowerCase().includes(q) ||
                String(entry.status || '').toLowerCase().includes(q) ||
                String(entry.requester?.name || '').toLowerCase().includes(q)
            );
        });
    }, [items, search]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get('/general-approvals');
            setItems(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err?.response?.data?.msg || 'Failed to load general approvals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');

        const levels = [form.first_level, form.second_level, form.third_level];
        if (new Set(levels).size !== 3) {
            setError('PM, GM and DM must each be selected exactly once in the sequence.');
            return;
        }

        if (!attachment) {
            setError('Please upload a PDF or Excel file.');
            return;
        }

        const extension = (attachment.name || '').split('.').pop()?.toLowerCase() || '';
        const validExt = ['pdf', 'xls', 'xlsx'];
        if (!validExt.includes(extension)) {
            setError('Only .pdf, .xls, .xlsx files are allowed.');
            return;
        }

        if (attachment.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = new FormData();
            payload.append('title', form.title);
            payload.append('description', form.description);
            payload.append('department', form.department);
            payload.append('first_level', form.first_level);
            payload.append('second_level', form.second_level);
            payload.append('third_level', form.third_level);
            payload.append('attachment', attachment);

            await api.post('/general-approvals/create', payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setForm({
                title: '',
                description: '',
                department: '',
                first_level: 'PM',
                second_level: 'GM',
                third_level: 'DM'
            });
            setAttachment(null);
            navigate('/general-approvals');
            fetchItems();
        } catch (err) {
            setError(err?.response?.data?.msg || 'Failed to create general approval request');
        } finally {
            setSubmitting(false);
        }
    };

    const showCreate = routeId === 'new';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">General Approval</h1>
                    <p className="text-sm text-slate-500 font-medium">Upload a PDF/Excel file and define custom PM-GM-DM approval order.</p>
                </div>
                <button
                    onClick={() => navigate('/general-approvals/new')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                >
                    <Plus size={18} />
                    <span>New General Approval</span>
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {showCreate ? (
                <form onSubmit={handleCreate} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                    <h2 className="text-lg font-black text-slate-800">Create General Approval Request</h2>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            placeholder="Enter request title"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">1st Approval</label>
                            <select
                                value={form.first_level}
                                onChange={(e) => setForm((p) => ({ ...p, first_level: e.target.value }))}
                                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            >
                                {LEVEL_OPTIONS.map((level) => <option key={`first-${level}`} value={level}>{level}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">2nd Approval</label>
                            <select
                                value={form.second_level}
                                onChange={(e) => setForm((p) => ({ ...p, second_level: e.target.value }))}
                                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            >
                                {LEVEL_OPTIONS.map((level) => <option key={`second-${level}`} value={level}>{level}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase mb-2">3rd Approval</label>
                            <select
                                value={form.third_level}
                                onChange={(e) => setForm((p) => ({ ...p, third_level: e.target.value }))}
                                className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            >
                                {LEVEL_OPTIONS.map((level) => <option key={`third-${level}`} value={level}>{level}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Department</label>
                        <input
                            type="text"
                            value={form.department}
                            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50"
                            placeholder="e.g. Procurement"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Description</label>
                        <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 resize-none"
                            placeholder="Add context for approvers"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-500 uppercase mb-2">Attachment (PDF/Excel)</label>
                        <input
                            type="file"
                            accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-black flex items-center gap-2 disabled:opacity-60"
                        >
                            <Send size={16} />
                            <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/general-approvals')}
                            className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by id, title, status, requester"
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-8 text-sm text-slate-500">Loading...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-8 text-sm text-slate-500">No general approval requests found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        <th className="px-4 py-3 text-xs text-slate-500">ID</th>
                                        <th className="px-4 py-3 text-xs text-slate-500">Title</th>
                                        <th className="px-4 py-3 text-xs text-slate-500">Flow</th>
                                        <th className="px-4 py-3 text-xs text-slate-500">Status</th>
                                        <th className="px-4 py-3 text-xs text-slate-500">Attachment</th>
                                        <th className="px-4 py-3 text-xs text-slate-500">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((entry) => (
                                        <tr key={entry.id} className="border-t border-slate-100">
                                            <td className="px-4 py-3 text-sm font-bold text-blue-700">GA-{entry.id}</td>
                                            <td className="px-4 py-3 text-sm text-slate-800">
                                                <div className="font-semibold">{entry.title}</div>
                                                <div className="text-xs text-slate-500">{entry.requester?.name || 'Unknown requester'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700">{entry.first_level} {'->'} {entry.second_level} {'->'} {entry.third_level}</td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                                                    {entry.status?.includes('PENDING') ? <Clock size={12} /> : entry.status === 'APPROVED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                    {statusLabel(entry.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {entry.attachment?.file_path ? (
                                                    <a
                                                        href={toServerUrl(entry.attachment.file_path) || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 font-semibold inline-flex items-center gap-1"
                                                    >
                                                        <Paperclip size={12} />
                                                        <span>Open</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{new Date(entry.createdAt || entry.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {selected && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-lg font-black text-slate-800">GA-{selected.id} Details</h3>
                    <p className="text-sm text-slate-600 mt-2">{selected.description || 'No description'}</p>
                </div>
            )}
        </div>
    );
};

export default GeneralApprovalSystem;
