import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const initialForm = {
    level: '',
    approval_type: 'PR',
    min_amount: '',
    max_amount: '',
    escalation_to: '',
    remarks: ''
};

const sanitizeApproverValue = (value) => {
    const normalized = String(value ?? '').trim();
    if (!normalized) return null;
    if (normalized === '-' || normalized.toLowerCase() === 'null' || normalized.toLowerCase() === 'undefined') {
        return null;
    }
    return normalized;
};

const ApprovalMatrix = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [matrix, setMatrix] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [requests, setRequests] = useState([]);
    const [submittingRequest, setSubmittingRequest] = useState(false);
    const [requestSearch, setRequestSearch] = useState('');
    const [requestStatusFilter, setRequestStatusFilter] = useState('ALL');
    const [requestTypeFilter, setRequestTypeFilter] = useState('ALL');

    const loadData = async () => {
        setLoading(true);
        try {
            const matrixRes = await api.get('/admin/approval-matrix');
            setMatrix(Array.isArray(matrixRes.data) ? matrixRes.data : []);
        } catch (err) {
            console.error('Failed to load approval matrix data:', err);
            alert(err?.response?.data?.msg || 'Failed to load matrix data');
        } finally {
            setLoading(false);
        }
    };

    const loadRequests = async () => {
        try {
            const res = await api.get('/unified-requests');
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load unified requests:', err);
        }
    };

    useEffect(() => {
        loadData();
        loadRequests();
    }, []);

    const onChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const showSuccess = (msg) => {
        setSuccessMsg(msg);
        window.setTimeout(() => {
            setSuccessMsg('');
        }, 2500);
    };

    const saveMatrix = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                level: Number(form.level),
                approval_type: form.approval_type,
                min_amount: Number(form.min_amount),
                max_amount: form.max_amount === '' ? null : Number(form.max_amount),
                escalation_to: form.escalation_to ? String(form.escalation_to).trim() : null,
                remarks: form.remarks || null
            };

            if (editingId) {
                await api.put(`/admin/approval-matrix/${editingId}`, payload);
                showSuccess('Matrix rule updated successfully.');
            } else {
                await api.post('/admin/approval-matrix', payload);
                showSuccess('Matrix rule saved successfully.');
            }

            setForm(initialForm);
            setEditingId(null);
            await loadData();
        } catch (err) {
            console.error('Failed to save approval matrix:', err);
            alert(err?.response?.data?.msg || 'Failed to save matrix entry');
        } finally {
            setSaving(false);
        }
    };

    const startEdit = (row) => {
        setEditingId(row.id);
        setForm({
            level: String(row.level || ''),
            approval_type: row.approval_type || 'PR',
            min_amount: String(row.min_amount ?? ''),
            max_amount: row.max_amount === null || row.max_amount === undefined ? '' : String(row.max_amount),
            escalation_to: row.escalation_to || '',
            remarks: row.remarks || ''
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm(initialForm);
    };

    const deleteMatrix = async (id) => {
        const confirmed = window.confirm('Delete this matrix rule?');
        if (!confirmed) return;

        try {
            await api.delete(`/admin/approval-matrix/${id}`);
            if (editingId === id) {
                cancelEdit();
            }
            showSuccess('Matrix rule deleted successfully.');
            await loadData();
        } catch (err) {
            console.error('Failed to delete matrix entry:', err);
            alert(err?.response?.data?.msg || 'Failed to delete matrix entry');
        }
    };

    const deleteRequest = async (requestId) => {
        const confirmed = window.confirm(`Delete REQ-${requestId}? This will remove full approval history for this request.`);
        if (!confirmed) return;

        try {
            await api.delete(`/unified-requests/${requestId}`);
            showSuccess(`REQ-${requestId} deleted successfully.`);
            await loadRequests();
        } catch (err) {
            console.error('Failed to delete request:', err);
            alert(err?.response?.data?.msg || 'Failed to delete request');
        }
    };

    const generateRequest = async () => {
        if (!form.min_amount) {
            alert('Please enter a Min Amount to simulate a request.');
            return;
        }
        setSubmittingRequest(true);
        try {
            const payload = { 
                title: `Automated Request (${form.approval_type}) for $${form.min_amount}`, 
                type: form.approval_type === 'BOTH' || form.approval_type === 'PR / PO' ? 'PR' : form.approval_type, 
                quantity: 1, 
                invoice_amount: Number(form.min_amount), 
                department: '' 
            };
            const res = await api.post('/unified-requests', payload);
            const levels = Number(res?.data?.workflow?.levels || 0);
            const mailAttempted = Boolean(res?.data?.email?.attempted);
            const mailSuccess = Boolean(res?.data?.email?.success);
            const mailReason = String(res?.data?.email?.reason || '').trim();

            let msg = `Request generated with ${levels} approval level${levels === 1 ? '' : 's'}.`;
            if (mailAttempted && mailSuccess) {
                msg += ' Initial approval email sent.';
            } else if (mailAttempted && !mailSuccess && mailReason === 'smtp_not_configured') {
                msg += ' Approval flow created, but SMTP is not configured so email was skipped.';
            } else if (mailAttempted && !mailSuccess && mailReason) {
                msg += ` Approval flow created, but initial email failed (${mailReason}).`;
            }

            showSuccess(msg);
            await loadRequests();
        } catch (err) {
            console.error('Failed to generate request:', err);
            alert(err?.response?.data?.msg || 'Failed to generate request');
        } finally {
            setSubmittingRequest(false);
        }
    };

    const filteredRequests = useMemo(() => {
        const query = String(requestSearch || '').trim().toLowerCase();

        return requests.filter((req) => {
            const type = String(req.type || '').toUpperCase();
            const status = String(req.status || '').toUpperCase();

            if (requestTypeFilter !== 'ALL' && type !== requestTypeFilter) {
                return false;
            }

            if (requestStatusFilter !== 'ALL' && status !== requestStatusFilter) {
                return false;
            }

            if (!query) {
                return true;
            }

            const searchable = [
                `req-${req.id}`,
                req.title,
                req.type,
                req.status,
                req.department,
                req.invoice_amount
            ]
                .map((v) => String(v || '').toLowerCase())
                .join(' ');

            return searchable.includes(query);
        });
    }, [requests, requestSearch, requestStatusFilter, requestTypeFilter]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Approval Workflow</h1>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Configure matrix rules and generate requests dynamically.</p>
                    </div>
                </div>

                {successMsg && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        {successMsg}
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-black text-slate-800 tracking-tight">Matrix Rules & Simulation Engine</h2>
                    <form onSubmit={saveMatrix} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Level
                            <input
                                type="number"
                                min="1"
                                value={form.level}
                                onChange={(e) => onChange('level', e.target.value)}
                                required
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Approval Type
                            <select
                                value={form.approval_type}
                                onChange={(e) => onChange('approval_type', e.target.value)}
                                required
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            >
                                <option value="PR">PR</option>
                                <option value="PO">PO</option>
                                <option value="PR / PO">PR / PO</option>
                                <option value="BOTH">Both</option>
                            </select>
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Min Amount
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.min_amount}
                                onChange={(e) => onChange('min_amount', e.target.value)}
                                required
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Max Amount
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.max_amount}
                                onChange={(e) => onChange('max_amount', e.target.value)}
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                placeholder="Leave empty for Unlimited"
                            />
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Escalation Level
                            <input
                                type="text"
                                value={form.escalation_to}
                                onChange={(e) => onChange('escalation_to', e.target.value)}
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                placeholder="e.g. Level 2 or Final Approval"
                            />
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:col-span-2">
                            Remarks
                            <input
                                type="text"
                                value={form.remarks}
                                onChange={(e) => onChange('remarks', e.target.value)}
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex justify-between items-center sm:flex-row flex-col gap-4">
                        <button
                            type="button"
                            onClick={generateRequest}
                            disabled={submittingRequest || saving}
                            className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-black uppercase tracking-wider hover:bg-indigo-100 disabled:opacity-60 transition-colors sm:w-auto w-full"
                        >
                            {submittingRequest ? 'Generating...' : 'Simulate Request'}
                        </button>
                        <div className="flex justify-end gap-3 sm:w-auto w-full">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-300"
                                >
                                    Cancel Edit
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={saving || submittingRequest}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : editingId ? 'Update Matrix' : 'Save Matrix'}
                            </button>
                        </div>
                    </div>
                </form>

                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Configured Rules</h2>
                    </div>
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="h-48 flex items-center justify-center text-slate-500 text-sm font-semibold">Loading matrix...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Approver</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Range</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {matrix.map((row) => (
                                        (() => {
                                            const displayName = sanitizeApproverValue(row.user_name) || sanitizeApproverValue(row.approver_name);
                                            const displayEmail = sanitizeApproverValue(row.resolved_approver_email) || sanitizeApproverValue(row.approver_email);
                                            return (
                                        <tr key={row.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-900">{row.level}</td>
                                            <td className="py-3 px-4 text-xs font-medium text-slate-700">
                                                {displayName ? (
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{displayName}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{displayEmail || '-'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100 italic">
                                                        Dynamic (Level {row.level})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.approval_type || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.min_amount} - {row.max_amount ?? 'Unlimited'}</td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(row)}
                                                    className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wide hover:bg-blue-200"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteMatrix(row.id)}
                                                    className="ml-2 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wide hover:bg-rose-200"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                            );
                                        })()
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Request History</h2>
                    </div>
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                type="text"
                                value={requestSearch}
                                onChange={(e) => setRequestSearch(e.target.value)}
                                placeholder="Search by REQ, title, type, amount..."
                                className="md:col-span-2 w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                            <select
                                value={requestStatusFilter}
                                onChange={(e) => setRequestStatusFilter(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                            <div className="flex gap-2">
                                <select
                                    value={requestTypeFilter}
                                    onChange={(e) => setRequestTypeFilter(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm"
                                >
                                    <option value="ALL">All Type</option>
                                    <option value="PR">PR</option>
                                    <option value="PO">PO</option>
                                    <option value="BOTH">BOTH</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRequestSearch('');
                                        setRequestStatusFilter('ALL');
                                        setRequestTypeFilter('ALL');
                                    }}
                                    className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Req ID</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Title</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                                    <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-8 text-center text-sm text-slate-500 font-semibold">No requests match current search/filter.</td>
                                    </tr>
                                ) : filteredRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3 px-4 text-sm font-bold text-slate-900">REQ-{req.id}</td>
                                        <td className="py-3 px-4 text-sm font-medium text-slate-800">{req.title}</td>
                                        <td className="py-3 px-4 text-sm font-bold text-indigo-600">{req.type}</td>
                                        <td className="py-3 px-4 text-sm text-slate-700">${Number(req.invoice_amount).toLocaleString()}</td>
                                        <td className="py-3 px-4 text-sm text-slate-600">{req.department || '-'}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{req.status}</span>
                                        </td>
                                        <td className="py-3 px-4 text-xs font-medium text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => navigate(`/admin/approval-matrix/history/${req.id}`)}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wide hover:bg-slate-200"
                                            >
                                                History
                                            </button>
                                            <button
                                                onClick={() => deleteRequest(req.id)}
                                                className="ml-2 px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wide hover:bg-rose-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            </div>
    );
};

export default ApprovalMatrix;
