import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Check, X, AlertCircle, Clock, 
    User, Send, MessageSquare, History, CheckCircle2, Layers, Calendar
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PurchaseRequestDetails = ({ requestId, onBack, onUpdate }) => {
    const { user } = useAuth();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/requests/${requestId}`);
            setRequest(res.data);
        } catch (err) {
            console.error('Error fetching PR details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [requestId]);

    const handleAction = async (action) => {
        if (!comment.trim() && action === 'reject') {
            alert('Please provide a comment for rejection.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post(`/requests/${requestId}/${action}`, { comment });
            setComment('');
            fetchDetails();
            onUpdate();
        } catch (err) {
            console.error(`Error during ${action}:`, err);
            alert(err.response?.data?.msg || `Failed to ${action} request`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="py-20 text-center text-slate-400 font-bold">Loading...</div>;
    if (!request) return <div className="py-20 text-center text-rose-500 font-bold">Request not found.</div>;

    const effectiveApprovalLevel =
        user?.approval_level ||
        (typeof user?.role === 'string' && ['pm', 'gm', 'dm'].includes(user.role.toLowerCase())
            ? user.role.toUpperCase()
            : 'NONE');

    const canApprove = (
        (effectiveApprovalLevel === 'PM' && request.status === 'PENDING_PM_APPROVAL') ||
        (effectiveApprovalLevel === 'GM' && request.status === 'PENDING_GM_APPROVAL') ||
        (effectiveApprovalLevel === 'DM' && request.status === 'PENDING_DM_APPROVAL')
    );

    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-black text-xs uppercase tracking-widest transition-all">
                    <ArrowLeft size={16} />
                    <span>Back to List</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PR ID:</span>
                    <span className="font-mono text-sm font-black text-blue-600">#PR-{request.id}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left column: Info */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{request.title}</h2>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">{request.request_type}</span>
                            <PriorityBadge priority={request.priority} />
                            <StatusBadge status={request.status} />
                        </div>
                    </section>

                    <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Description / Justification</h3>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                            {request.description || "No description provided."}
                        </p>
                    </section>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoItem label="Requested By" value={request.requester?.name} icon={User} />
                        <InfoItem label="Department" value={request.department || 'N/A'} icon={Layers} />
                        <InfoItem label="Quantity" value={request.quantity} icon={Send} />
                        <InfoItem label="Created Date" value={new Date(request.createdAt || request.created_at).toLocaleString()} icon={Calendar} />
                    </div>

                    {/* Timeline / History */}
                    <section>
                        <div className="flex items-center gap-2 mb-6">
                            <History size={18} className="text-blue-600" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Approval History</h3>
                        </div>
                        <div className="space-y-4">
                            {request.logs?.length === 0 ? (
                                <p className="text-slate-400 text-xs italic">No activity logs yet.</p>
                            ) : (
                                request.logs.map((log, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white relative">
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                                            log.action === 'approve' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                                        }`}>
                                            {log.action === 'approve' ? <Check size={16} /> : <X size={16} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">
                                                    {log.action === 'approve' ? 'Approved' : 'Rejected'} by {log.approver?.name}
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

                {/* Right column: Actions */}
                <div className="space-y-6">
                    {canApprove && (
                        <div className="bg-white rounded-2xl border-2 border-blue-100 p-6 shadow-xl shadow-blue-600/5">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <AlertCircle size={18} className="text-blue-500" />
                                Review Action
                            </h3>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment or justification (required for rejection)..."
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 mb-4 resize-none h-32"
                            ></textarea>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => handleAction('approve')}
                                    disabled={actionLoading}
                                    className="w-full bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle2 size={18} />
                                    <span>Approve</span>
                                </button>
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={actionLoading}
                                    className="w-full bg-white text-rose-500 border-2 border-rose-100 font-black py-3 rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <X size={18} />
                                    <span>Reject</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Workflow Status</h3>
                        <div className="space-y-6">
                            <WorkflowStep 
                                label="Project Manager" 
                                status={
                                    request.status === 'PENDING_PM_APPROVAL' ? 'active' : 
                                    request.pm_approved_by ? 'completed' : 
                                    request.status === 'REJECTED' ? 'failed' : 'pending'
                                } 
                                user={request.pmApprover?.name}
                            />
                            <WorkflowStep 
                                label="General Manager" 
                                status={
                                    request.status === 'PENDING_GM_APPROVAL' ? 'active' : 
                                    request.gm_approved_by ? 'completed' : 
                                    request.status === 'REJECTED' && (request.status === 'PENDING_GM_APPROVAL' || request.gm_approved_by) ? 'failed' : 'pending'
                                } 
                                user={request.gmApprover?.name}
                            />
                            <WorkflowStep 
                                label="Director Manager" 
                                status={
                                    request.status === 'PENDING_DM_APPROVAL' ? 'active' : 
                                    request.dm_approved_by ? 'completed' : 
                                    request.status === 'REJECTED' && (request.status === 'PENDING_DM_APPROVAL' || request.dm_approved_by) ? 'failed' : 'pending'
                                } 
                                user={request.dmApprover?.name}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowStep = ({ label, status, user }) => {
    const configs = {
        active: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
        completed: { icon: Check, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
        pending: { icon: Clock, color: 'text-slate-300', bg: 'bg-slate-50', border: 'border-slate-100' },
        failed: { icon: X, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${config.bg} ${config.border} ${config.color}`}>
                <Icon size={14} strokeWidth={3} />
            </div>
            <div>
                <p className={`text-[11px] font-black uppercase tracking-tight ${status === 'active' ? 'text-blue-600' : 'text-slate-500'}`}>{label}</p>
                {user && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Approved by: {user}</p>}
                {!user && status === 'active' && <p className="text-[10px] font-bold text-amber-500 mt-0.5 italic">Awaiting Action</p>}
                {!user && status === 'pending' && <p className="text-[10px] font-bold text-slate-300 mt-0.5">Queue</p>}
            </div>
        </div>
    );
};

const InfoItem = ({ label, value, icon: Icon }) => (
    <div>
        <div className="flex items-center gap-1.5 mb-1.5">
            <Icon size={12} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
);

const PriorityBadge = ({ priority }) => {
    const config = {
        High: 'bg-rose-50 text-rose-500 border-rose-100',
        Medium: 'bg-amber-50 text-amber-500 border-amber-100',
        Low: 'bg-slate-50 text-slate-400 border-slate-100'
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${config[priority]}`}>
            {priority}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const configs = {
        PENDING_PM_APPROVAL: { label: 'Pending PM', color: 'bg-amber-100 text-amber-600' },
        PENDING_GM_APPROVAL: { label: 'Pending GM', color: 'bg-blue-100 text-blue-600' },
        PENDING_DM_APPROVAL: { label: 'Pending DM', color: 'bg-indigo-100 text-indigo-600' },
        APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-600' },
        REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-600' }
    };
    const config = configs[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${config.color}`}>
            {config.label}
        </span>
    );
};

export default PurchaseRequestDetails;
