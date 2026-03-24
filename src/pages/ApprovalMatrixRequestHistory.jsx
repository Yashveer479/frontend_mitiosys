import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const StatusBadge = ({ status }) => {
    const normalized = String(status || '').toUpperCase();
    const cls = normalized === 'APPROVED'
        ? 'bg-emerald-100 text-emerald-700'
        : normalized === 'REJECTED'
            ? 'bg-rose-100 text-rose-700'
            : normalized === 'ESCALATED'
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-amber-100 text-amber-700';

    return (
        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${cls}`}>
            {normalized || 'UNKNOWN'}
        </span>
    );
};

const formatDateTime = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString();
};

const ApprovalMatrixRequestHistory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [details, setDetails] = useState(null);

    useEffect(() => {
        let active = true;

        const loadDetails = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/unified-requests/${id}/history-details`);
                if (!active) return;
                setDetails(res.data || null);
            } catch (err) {
                if (!active) return;
                console.error('Failed to load request history details:', err);
                setError(err?.response?.data?.msg || 'Failed to load request history details');
            } finally {
                if (active) setLoading(false);
            }
        };

        loadDetails();
        return () => {
            active = false;
        };
    }, [id]);

    const request = details?.request || null;
    const logs = useMemo(() => {
        const list = Array.isArray(details?.logs) ? details.logs : [];
        return [...list].sort((a, b) => Number(a.level || 0) - Number(b.level || 0));
    }, [details]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] p-6">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-sm font-semibold text-slate-500">
                    Loading request history...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] p-6">
                <div className="max-w-7xl mx-auto space-y-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/approval-matrix')}
                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-200"
                    >
                        Back
                    </button>
                    <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-sm font-semibold text-rose-700">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">REQ-{request?.id} History</h1>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Detailed workflow, matrix and escalation audit trail.</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/approval-matrix')}
                        className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-200"
                    >
                        Back To Matrix
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Request Details</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div><span className="text-slate-400 font-semibold">Title:</span> <span className="text-slate-800 font-semibold">{request?.title || '-'}</span></div>
                        <div><span className="text-slate-400 font-semibold">Type:</span> <span className="text-slate-800 font-semibold">{request?.type || '-'}</span></div>
                        <div><span className="text-slate-400 font-semibold">Invoice Amount:</span> <span className="text-slate-800 font-semibold">${Number(request?.invoice_amount || 0).toLocaleString()}</span></div>
                        <div><span className="text-slate-400 font-semibold">Department:</span> <span className="text-slate-800 font-semibold">{request?.department || '-'}</span></div>
                        <div><span className="text-slate-400 font-semibold">Status:</span> <StatusBadge status={request?.status} /></div>
                        <div><span className="text-slate-400 font-semibold">Created:</span> <span className="text-slate-800 font-semibold">{formatDateTime(request?.createdAt)}</span></div>
                        <div className="md:col-span-2 lg:col-span-3">
                            <span className="text-slate-400 font-semibold">Requester:</span>{' '}
                            <span className="text-slate-800 font-semibold">{request?.requester?.name || '-'} ({request?.requester?.email || '-'})</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Matching Matrix Rules</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Approver</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Min</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Max</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Escalation To</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(details?.matchingRules || []).length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-6 px-4 text-sm text-slate-500">No matching matrix rules found for this request.</td>
                                    </tr>
                                ) : (details?.matchingRules || []).map((row) => (
                                    <tr key={row.id}>
                                        <td className="py-3 px-4 text-sm font-semibold text-slate-800">L{row.level}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{row.approver_name || row.approver_email || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{row.approval_type || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{row.min_amount}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{row.max_amount ?? 'Unlimited'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{row.escalation_to || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Approval And Escalation Timeline</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Approver</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Action Time</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Remarks</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-6 px-4 text-sm text-slate-500">No approval log entries found.</td>
                                    </tr>
                                ) : logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="py-3 px-4 text-sm font-semibold text-slate-800">L{log.level}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{log.approver_name || log.approver_email || '-'}</td>
                                        <td className="py-3 px-4"><StatusBadge status={log.status} /></td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(log.timestamp)}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{log.remarks || '-'}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">{formatDateTime(log.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Escalated Events</h2>
                    </div>
                    <div className="p-6 text-sm text-slate-700">
                        {(details?.escalationHistory || []).length === 0 ? (
                            <p className="text-slate-500">No escalation events found.</p>
                        ) : (
                            <ul className="space-y-2">
                                {(details?.escalationHistory || []).map((item) => (
                                    <li key={item.id} className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                                        L{item.level} escalated for {item.approver_name || item.approver_email || '-'} at {formatDateTime(item.updatedAt || item.timestamp || item.createdAt)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalMatrixRequestHistory;
