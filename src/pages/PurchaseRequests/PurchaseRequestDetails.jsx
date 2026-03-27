import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Check, X, AlertCircle, Clock, 
    User, Send, MessageSquare, History, CheckCircle2, Layers, Calendar
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toServerUrl } from '../../services/urlConfig';
import { resolvePurchaseRequestModule } from './requestModuleConfig';

const PurchaseRequestDetails = ({ requestId, onBack, onUpdate }) => {
    const { user } = useAuth();
    const location = useLocation();
    const moduleConfig = resolvePurchaseRequestModule(location.pathname);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`${moduleConfig.apiBase}/${requestId}`);
            setRequest(res.data);
        } catch (err) {
            console.error('Error fetching PR details:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [requestId, moduleConfig.apiBase]);

    const handleAction = async (action) => {
        if (!comment.trim() && action === 'comment') {
            alert('Please provide a comment when requesting more information.');
            return;
        }

        setActionLoading(true);
        try {
            const res = await api.post(`${moduleConfig.apiBase}/${requestId}/${action}`, { comment });
            const updatedRequest = res?.data;
            setComment('');

            if (updatedRequest) {
                setRequest(updatedRequest);
            }

            const nextStatus = res?.data?.status;
            if (action === 'approve') {
                const stageLabel = nextStatus === 'PENDING_GM_APPROVAL'
                    ? 'Moved to GM approval.'
                    : nextStatus === 'PENDING_DM_APPROVAL'
                        ? 'Moved to DM approval.'
                        : nextStatus === 'APPROVED'
                            ? 'Request fully approved.'
                            : 'Approval saved.';
                alert(`Approved successfully. ${stageLabel}`);
            } else if (action === 'reject') {
                alert('Request rejected successfully.');
            } else if (action === 'comment') {
                alert('Request More Info sent successfully.');
            }

            if (typeof onUpdate === 'function') {
                await onUpdate();
            }
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
        String(user?.approval_level || '').toUpperCase() ||
        (typeof user?.role === 'string' && ['pm', 'gm', 'dm'].includes(user.role.toLowerCase())
            ? user.role.toUpperCase()
            : 'NONE');

    const canApprove = typeof request.current_user_can_approve === 'boolean'
        ? request.current_user_can_approve
        : (
            (effectiveApprovalLevel === 'PM' && request.status === 'PENDING_PM_APPROVAL') ||
            (effectiveApprovalLevel === 'GM' && request.status === 'PENDING_GM_APPROVAL') ||
            (effectiveApprovalLevel === 'DM' && request.status === 'PENDING_DM_APPROVAL')
        );

    const requiredApprovalLevel =
        request.status === 'PENDING_PM_APPROVAL' ? 'PM' :
        request.status === 'PENDING_GM_APPROVAL' ? 'GM' :
        request.status === 'PENDING_DM_APPROVAL' ? 'DM' :
        null;
    const attachmentUrl = request.attachment?.file_path ? toServerUrl(request.attachment.file_path) : null;

    const normalizeRoleToStage = (roleValue) => {
        const role = String(roleValue || '').trim().toUpperCase();
        if (role === 'PM' || role === 'L1') return 'PM';
        if (role === 'GM' || role === 'L2') return 'GM';
        if (role === 'DM' || role === 'L3') return 'DM';
        return null;
    };

    const rejectLog = Array.isArray(request.logs)
        ? request.logs.find((log) => String(log.action || '').toLowerCase() === 'reject')
        : null;
    const rejectedStage = normalizeRoleToStage(rejectLog?.role);

    const resolveWorkflowStepStatus = (stage) => {
        const isRejected = request.status === 'REJECTED';

        if (isRejected && rejectedStage === stage) {
            return 'failed';
        }

        if (stage === 'PM') {
            if (request.status === 'PENDING_PM_APPROVAL') return 'active';
            if (request.pm_approved_by) return 'completed';
            return 'pending';
        }

        if (stage === 'GM') {
            if (request.status === 'PENDING_GM_APPROVAL') return 'active';
            if (request.gm_approved_by) return 'completed';
            return 'pending';
        }

        if (stage === 'DM') {
            if (request.status === 'PENDING_DM_APPROVAL') return 'active';
            if (request.dm_approved_by) return 'completed';
            return 'pending';
        }

        return 'pending';
    };

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

                    {request.attachment && (
                        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Attached PDF</h3>
                            <p className="text-sm font-semibold text-slate-700 mb-3">
                                {request.attachment.original_name || 'request.pdf'}
                            </p>
                            {attachmentUrl ? (
                                <a
                                    href={attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 text-xs font-black uppercase tracking-wider hover:bg-blue-100 transition-all"
                                >
                                    Open PDF
                                </a>
                            ) : (
                                <p className="text-xs font-semibold text-rose-500">Attachment file URL is unavailable.</p>
                            )}
                        </section>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <InfoItem label="Requested By" value={request.requester?.name} icon={User} />
                        <InfoItem label="Department" value={request.department || 'N/A'} icon={Layers} />
                        <InfoItem label="Section" value={String(request.source_section || moduleConfig.sourceSection || 'N/A').toUpperCase()} icon={Layers} />
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
                                placeholder="Add an optional comment for approve/reject, or required note for Request More Info..."
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
                                <button
                                    onClick={() => handleAction('comment')}
                                    disabled={actionLoading || !comment.trim()}
                                    className="w-full bg-blue-50 text-blue-600 border-2 border-blue-100 font-black py-3 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <MessageSquare size={18} />
                                    <span>Request More Info</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {!canApprove && requiredApprovalLevel && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                            <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Approval Action Locked</p>
                            <p className="text-sm font-semibold text-amber-800">
                                This step requires <span className="font-black">{requiredApprovalLevel}</span> approval.
                            </p>
                            <p className="text-xs font-bold text-amber-700 mt-1">
                                Current account: <span className="font-black">{effectiveApprovalLevel}</span> ({user?.role || 'unknown'})
                            </p>
                        </div>
                    )}

                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Workflow Status</h3>
                        <div className="space-y-6">
                            <WorkflowStep 
                                label="Project Manager" 
                                status={resolveWorkflowStepStatus('PM')}
                                user={request.pmApprover?.name}
                            />
                            <WorkflowStep 
                                label="General Manager" 
                                status={resolveWorkflowStepStatus('GM')}
                                user={request.gmApprover?.name}
                            />
                            <WorkflowStep 
                                label="Director Manager" 
                                status={resolveWorkflowStepStatus('DM')}
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
                {user && status === 'failed' && <p className="text-[10px] font-bold text-rose-400 mt-0.5">Rejected by: {user}</p>}
                {user && status !== 'failed' && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Approved by: {user}</p>}
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
