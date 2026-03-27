import React, { useEffect, useState } from 'react';
import { ArrowLeft, Check, X, History, Layers, Calendar, User, Package } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toServerUrl } from '../../services/urlConfig';
import { resolvePurchaseRequestModule } from './requestModuleConfig';

const APPROVAL_LABELS = {
    GM: 'General Manager',
    FINANCE_CONTROL: 'Finance Manager',
    FINANCE_MANAGER: 'Finance Manager',
    COMMERCIAL_MANAGER: 'Commercial Manager'
};

const PurchaseRequestDetails = ({ requestId, onBack }) => {
    const location = useLocation();
    const moduleConfig = resolvePurchaseRequestModule(location.pathname);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="py-20 text-center text-slate-400 font-bold">Loading...</div>;
    if (!request) return <div className="py-20 text-center text-rose-500 font-bold">Request not found.</div>;

    const attachmentUrl = request.attachment?.file_path ? toServerUrl(request.attachment.file_path) : null;
    const approvalDepartmentLabel = APPROVAL_LABELS[String(request.approval_department || '').toUpperCase()] || (request.approval_department || 'N/A');

    return (
        <div className="animate-in slide-in-from-right-4 duration-300">
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
                            {request.description || 'No description provided.'}
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Requested Items</h3>
                        </div>
                        {!Array.isArray(request.items) || request.items.length === 0 ? (
                            <p className="text-sm text-slate-500 font-semibold">No item lines were added.</p>
                        ) : (
                            <div className="space-y-3">
                                {request.items.map((item) => (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 border border-slate-100 rounded-xl p-3 bg-slate-50">
                                        <div className="md:col-span-9 text-sm font-bold text-slate-800">{item.item_name}</div>
                                        <div className="md:col-span-3 text-sm font-semibold text-slate-600">Qty: {item.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {request.attachment && (
                        <section className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-3">Attached PDF</h3>
                            <p className="text-sm font-semibold text-slate-700 mb-3">{request.attachment.original_name || 'request.pdf'}</p>
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
                                                    {log.action === 'approve' ? 'Approved' : 'Rejected'} by {log.approver?.name || 'N/A'}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400">{new Date(log.created_at || log.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Role: {String(log.role || '').toUpperCase()}</p>
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

                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Approval Summary</h3>
                        <div className="space-y-4">
                            <InfoItem label="Selected Approval Department" value={approvalDepartmentLabel} icon={User} />
                            <InfoItem label="Current Status" value={statusLabel(request.status)} icon={Package} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200">
                        <div className="grid grid-cols-1 gap-4">
                            <InfoItem label="Requested By" value={request.requester?.name || 'N/A'} icon={User} />
                            <InfoItem label="Department" value={request.department || 'N/A'} icon={Layers} />
                            <InfoItem label="Section" value={String(request.source_section || moduleConfig.sourceSection || 'N/A').toUpperCase()} icon={Layers} />
                            <InfoItem label="Created Date" value={new Date(request.createdAt || request.created_at).toLocaleString()} icon={Calendar} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const statusLabel = (status) => {
    if (status === 'PENDING_PM_APPROVAL') return 'Pending Approval';
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    return String(status || 'Unknown');
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
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${config[priority] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
            {priority}
        </span>
    );
};

const StatusBadge = ({ status }) => {
    const configs = {
        PENDING_PM_APPROVAL: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-600' },
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
