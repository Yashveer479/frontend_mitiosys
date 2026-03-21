import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const resolveRoleBasis = (user) => {
    const level = String(user?.approval_level || '').toUpperCase();
    if (level === 'PM') return 'Project Manager (PM)';
    if (level === 'GM') return 'General Manager (GM)';
    if (level === 'DM') return 'Director Manager (DM)';

    const role = String(user?.role || '').toLowerCase();
    if (!role) return 'Not Defined';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const initialForm = {
    level: '',
    department: '',
    approver_id: '',
    approval_type: 'PR',
    min_amount: '',
    max_amount: '',
    escalation_to: '',
    remarks: ''
};

const ApprovalMatrix = () => {
    const [form, setForm] = useState(initialForm);
    const [approvers, setApprovers] = useState([]);
    const [matrix, setMatrix] = useState([]);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [approverRes, matrixRes] = await Promise.all([
                api.get('/admin/approvers'),
                api.get('/admin/approval-matrix')
            ]);

            setApprovers(Array.isArray(approverRes.data) ? approverRes.data : []);
            setMatrix(Array.isArray(matrixRes.data) ? matrixRes.data : []);
        } catch (err) {
            console.error('Failed to load approval matrix data:', err);
            alert(err?.response?.data?.msg || 'Failed to load matrix data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const selectedApprover = useMemo(() => {
        const approverId = Number(form.approver_id);
        if (!Number.isInteger(approverId)) return null;
        return approvers.find((item) => item.id === approverId) || null;
    }, [form.approver_id, approvers]);

    const onChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const saveMatrix = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                level: Number(form.level),
                department: form.department || null,
                approver_id: form.approver_id ? Number(form.approver_id) : null,
                approver_name: selectedApprover?.name || null,
                approver_email: selectedApprover?.email || null,
                approval_type: form.approval_type,
                min_amount: Number(form.min_amount),
                max_amount: form.max_amount === '' ? null : Number(form.max_amount),
                escalation_to: form.escalation_to ? String(form.escalation_to).trim() : null,
                remarks: form.remarks || null
            };

            await api.post('/admin/approval-matrix', payload);
            setForm(initialForm);
            await loadData();
        } catch (err) {
            console.error('Failed to save approval matrix:', err);
            alert(err?.response?.data?.msg || 'Failed to save matrix entry');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Approval Matrix</h1>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Configure dynamic PR/PO approval routing</p>
                </div>

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
                            Department
                            <input
                                type="text"
                                value={form.department}
                                onChange={(e) => onChange('department', e.target.value)}
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </label>

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            Select Approver
                            <select
                                value={form.approver_id}
                                onChange={(e) => onChange('approver_id', e.target.value)}
                                required
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            >
                                <option value="">Choose approver</option>
                                {approvers.map((approver) => (
                                    <option key={approver.id} value={approver.id}>
                                        {approver.name} ({approver.email}) - {resolveRoleBasis(approver)}
                                    </option>
                                ))}
                            </select>
                            {selectedApprover && (
                                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                    Role Basis: {resolveRoleBasis(selectedApprover)}
                                </p>
                            )}
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

                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider md:col-span-2 lg:col-span-2">
                            Remarks
                            <input
                                type="text"
                                value={form.remarks}
                                onChange={(e) => onChange('remarks', e.target.value)}
                                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm"
                            />
                        </label>
                    </div>

                    <div className="mt-5 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-wider hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Matrix'}
                        </button>
                    </div>
                </form>

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
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Approver</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                                        <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount Range</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {matrix.map((row) => (
                                        <tr key={row.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-900">{row.level}</td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.department || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.user_name || row.approver_name || row.resolved_approver_email || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.approval_type || '-'}</td>
                                            <td className="py-3 px-4 text-sm text-slate-700">{row.min_amount} - {row.max_amount ?? 'Unlimited'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApprovalMatrix;
