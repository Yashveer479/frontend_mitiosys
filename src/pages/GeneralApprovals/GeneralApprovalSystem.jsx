import React, { useEffect, useMemo, useState } from 'react';
import { 
    Plus, Paperclip, Clock, CheckCircle, XCircle, Send, AlertCircle, Search,
    History, MessageSquare, Check, X, ArrowLeft, ArrowRight, User, Layers, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { toServerUrl } from '../../services/urlConfig';
import { useAuth } from '../../context/AuthContext';

const LEVEL_OPTIONS = ['PM', 'GM', 'DM'];

const statusLabel = (status) => String(status || '').replaceAll('_', ' ');

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</p>
            <p className="text-3xl font-black text-slate-800 tracking-tight mt-1">{value}</p>
        </div>
    </div>
);

const GeneralApprovalSystem = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id: routeId } = useParams();

    const [items, setItems] = useState([]);
    const [detailedRequest, setDetailedRequest] = useState(null);
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
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        myRequests: 0
    });

    const showCreate = routeId === 'new';
    const showDetails = routeId && routeId !== 'new';

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
            const data = Array.isArray(res.data) ? res.data : [];
            setItems(data);

            const pending = data.filter(r => r.status && r.status.startsWith('PENDING')).length;
            const approved = data.filter(r => r.status === 'APPROVED').length;
            const rejected = data.filter(r => r.status === 'REJECTED').length;
            const myRequests = data.filter(r => Number(r.requested_by) === Number(user?.id)).length;

            setStats({ pending, approved, rejected, myRequests });
        } catch (err) {
            setError(err?.response?.data?.msg || 'Failed to load general approvals');
        } finally {
            setLoading(false);
        }
    };

    const fetchDetails = async (id) => {
        try {
            setLoading(true);
            const res = await api.get(`/general-approvals/${id}`);
            setDetailedRequest(res.data);
        } catch (err) {
            console.error('Error fetching details:', err);
            setError('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [user?.id]);

    useEffect(() => {
        if (showDetails) {
            fetchDetails(routeId);
        } else {
            setDetailedRequest(null);
        }
    }, [routeId, showDetails]);


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

    if (showDetails) {
        if (!detailedRequest) {
            return (
                <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                    <p className="font-bold">{loading ? 'Loading details...' : 'Request not found'}</p>
                    <button onClick={() => navigate('/general-approvals')} className="mt-4 text-blue-600 font-bold hover:underline">
                        Back to List
                    </button>
                </div>
            );
        }

        const attachmentUrl = detailedRequest.attachment?.file_path ? toServerUrl(detailedRequest.attachment.file_path) : null;
        
        return (
            <div className="animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <button onClick={() => navigate('/general-approvals')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                        <ArrowLeft size={16} />
                        <span>Back to List</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GA ID:</span>
                        <span className="font-mono text-sm font-black text-blue-600">#GA-{detailedRequest.id}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{detailedRequest.title}</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    detailedRequest.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                    detailedRequest.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                    {detailedRequest.status === 'APPROVED' ? <CheckCircle size={14} /> : detailedRequest.status === 'REJECTED' ? <XCircle size={14} /> : <Clock size={14} />}
                                    {statusLabel(detailedRequest.status)}
                                </span>
                            </div>
                        </section>

                        <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Description / Justification</h3>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                {detailedRequest.description || "No description provided."}
                            </p>
                        </section>

                        {detailedRequest.attachment && (
                            <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Attached File</h3>
                                <p className="text-sm font-semibold text-slate-700 mb-3">
                                    {detailedRequest.attachment.original_name || 'attachment'}
                                </p>
                                {attachmentUrl ? (
                                    <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 text-xs font-black uppercase tracking-wider hover:bg-blue-100 transition-all"
                                    >
                                        <Paperclip size={14} />
                                        <span>Open File</span>
                                    </a>
                                ) : (
                                    <p className="text-xs font-semibold text-rose-500">Attachment file URL is unavailable.</p>
                                )}
                            </section>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested By</h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <User size={16} />
                                    <span>{detailedRequest.requester?.name || 'Unknown'}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Layers size={16} />
                                    <span>{detailedRequest.department || 'N/A'}</span>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created Date</h4>
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <Calendar size={16} />
                                    <span>{new Date(detailedRequest.createdAt || detailedRequest.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <section>
                            <div className="flex items-center gap-2 mb-6">
                                <History size={18} className="text-blue-600" />
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Approval History</h3>
                            </div>
                            <div className="space-y-4">
                                {detailedRequest.logs?.length === 0 ? (
                                    <p className="text-slate-400 text-xs italic">No activity logs yet.</p>
                                ) : (
                                    detailedRequest.logs.map((log, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white relative">
                                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                                                log.action === 'approve'
                                                    ? 'bg-emerald-50 text-emerald-500'
                                                    : log.action === 'comment'
                                                        ? 'bg-blue-50 text-blue-500'
                                                        : 'bg-rose-50 text-rose-500'
                                            }`}>
                                                {log.action === 'approve' ? <Check size={16} /> : log.action === 'comment' ? <MessageSquare size={16} /> : <X size={16} />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                                        {log.action === 'approve' ? 'Approved' : log.action === 'comment' ? 'Comment Added' : 'Rejected'} by {log.approver?.name}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp || log.createdAt || log.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Role: {log.role.toUpperCase()}</p>
                                                {log.comment && (
                                                    <div className="bg-slate-50 p-3 rounded-lg text-xs font-medium text-slate-600 italic">
                                                        "{log.comment}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>
                    {/* Sidebar / Flow Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200">
                             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Approval Flow</h3>
                             <div className="space-y-4">
                                {['first_level', 'second_level', 'third_level'].map((lvlKey, idx) => {
                                    const role = detailedRequest[lvlKey];
                                    const isApproved = 
                                        (idx === 0 && detailedRequest.first_approved_by) ||
                                        (idx === 1 && detailedRequest.second_approved_by) ||
                                        (idx === 2 && detailedRequest.third_approved_by);
                                    
                                    const approverId = 
                                         idx === 0 ? detailedRequest.first_approved_by :
                                         idx === 1 ? detailedRequest.second_approved_by :
                                         idx === 2 ? detailedRequest.third_approved_by : null;

                                    // Try to find approver details if we have logs or included users
                                    // The list response might include approver details as firstApprover etc.
                                    const approverName = 
                                        idx === 0 ? detailedRequest.firstApprover?.name :
                                        idx === 1 ? detailedRequest.secondApprover?.name :
                                        idx === 2 ? detailedRequest.thirdApprover?.name : 'Pending';

                                    return (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                                isApproved ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-300'
                                            }`}>
                                                {isApproved ? <Check size={14} strokeWidth={3} /> : <span className="text-xs font-black">{idx + 1}</span>}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-black uppercase tracking-wider ${isApproved ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                    {role} Approval
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-500">
                                                    {isApproved ? (approverName || 'Approved') : 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">General Approval</h1>
                    <p className="text-sm text-slate-500 font-medium">Upload a PDF/Excel file and define custom PM-GM-DM approval order.</p>
                </div>
                {!showCreate && (
                    <button
                        onClick={() => navigate('/general-approvals/new')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
                    >
                        <Plus size={18} />
                        <span>New General Approval</span>
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            {!showCreate && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard title="Pending Approvals" value={stats.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
                    <StatsCard title="Approved Requests" value={stats.approved} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
                    <StatsCard title="Rejected" value={stats.rejected} icon={XCircle} color="bg-rose-50 text-rose-600" />
                    <StatsCard title="My Submissions" value={stats.myRequests} icon={User} color="bg-blue-50 text-blue-600" />
                </div>
            )}

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
                                        <tr 
                                            key={entry.id} 
                                            onClick={() => navigate(`/general-approvals/${entry.id}`)}
                                            className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                                        >
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
                                                    <span className="text-blue-600 font-semibold inline-flex items-center gap-1">
                                                        <Paperclip size={12} />
                                                        <span>Attached</span>
                                                    </span>
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
        </div>
    );
};

export default GeneralApprovalSystem;
