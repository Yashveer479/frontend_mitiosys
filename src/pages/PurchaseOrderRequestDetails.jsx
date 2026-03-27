import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Building2,
    CalendarClock,
    CheckCircle2,
    FileText,
    History,
    Plus,
    User,
    XCircle
} from 'lucide-react';
import api from '../services/api';

const STATUS_STYLES = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200'
};

const approvalLabel = (value) => {
    const key = String(value || '').toUpperCase();
    if (key === 'GM') return 'General Manager';
    if (key === 'FINANCE_MANAGER') return 'Finance Manager';
    if (key === 'COMMERCIAL_MANAGER') return 'Commercial Manager';
    return value || 'N/A';
};

const humanizeAction = (action) => {
    const text = String(action || '').trim().toLowerCase();
    if (text === 'approve' || text === 'approved') return 'Approved';
    if (text === 'reject' || text === 'rejected') return 'Rejected';
    if (text === 'submitted') return 'Submitted';
    return text || 'Action';
};

const isRejectedAction = (action) => {
    const text = String(action || '').trim().toLowerCase();
    return text === 'reject' || text === 'rejected';
};

const isApprovedAction = (action) => {
    const text = String(action || '').trim().toLowerCase();
    return text === 'approve' || text === 'approved';
};

const roleLabel = (role) => {
    const value = String(role || '').trim();
    if (!value) return 'N/A';
    if (value === 'GM') return 'General Manager';
    if (value === 'FINANCE_MANAGER') return 'Finance Manager';
    if (value === 'COMMERCIAL_MANAGER') return 'Commercial Manager';
    if (value.toUpperCase() === 'L1') return 'Level 1';
    if (value.toUpperCase() === 'L2') return 'Level 2';
    if (value.toUpperCase() === 'L3') return 'Level 3';
    return value;
};

const HistoryCard = ({ item }) => {
    const rejected = isRejectedAction(item?.action);
    const approved = isApprovedAction(item?.action);
    const Icon = rejected ? XCircle : CheckCircle2;
    const iconColor = rejected
        ? 'bg-rose-50 text-rose-600 border-rose-200'
        : approved
            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
            : 'bg-slate-50 text-slate-500 border-slate-200';

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center ${iconColor}`}>
                    <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">{humanizeAction(item?.action)}</p>
                        <span className="text-[10px] font-bold text-slate-400">
                            {item?.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'N/A'}
                        </span>
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-1">{item?.approverName || 'N/A'}</p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1">Role: {roleLabel(item?.role)}</p>
                    {item?.comment && (
                        <p className="text-xs font-semibold text-slate-500 mt-2 leading-relaxed">{item.comment}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PurchaseOrderRequestDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/purchase-orders/requests/${id}`);
                setRequest(res.data || null);
            } catch (err) {
                console.error('Failed to load POR details', err);
                setRequest(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    const sourceContext = useMemo(() => {
        if (!request) return null;
        const sourceHistory = Array.isArray(request.source_approval_history)
            ? request.source_approval_history
            : [];

        return {
            title: request.title || 'Purchase Order Request',
            description: request.description || '',
            source_request_module: request.source_request_module || '',
            source_request_id: request.source_request_id || '',
            source_department: request.source_department || '',
            source_section: request.source_section || '',
            source_requester_name: request.source_requester_name || '',
            source_approved_by_name: request.source_approved_by_name || '',
            source_approval_history: JSON.stringify(sourceHistory)
        };
    }, [request]);

    const openNewPoRequest = () => {
        navigate('/inventory/purchase-orders', {
            state: {
                openPoRequestModal: true,
                sourceRequestContext: sourceContext
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent" />
            </div>
        );
    }

    if (!request) {
        return (
            <div className="py-20 text-center">
                <p className="text-rose-500 text-sm font-black">POR details not found.</p>
                <button
                    onClick={() => navigate('/inventory/purchase-orders')}
                    className="mt-5 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider"
                >
                    Back to Purchase Orders
                </button>
            </div>
        );
    }

    const sourceHistory = Array.isArray(request.source_approval_history) ? request.source_approval_history : [];
    const porHistory = Array.isArray(request.por_approval_history) ? request.por_approval_history : [];
    const isRejected = String(request.status || '').toLowerCase() === 'rejected';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <button
                    onClick={() => navigate('/inventory/purchase-orders')}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 text-xs font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={16} />
                    <span>Back to List</span>
                </button>

                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">POR-{String(request.id).padStart(4, '0')}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${STATUS_STYLES[request.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {request.status}
                    </span>
                </div>
            </div>

            {isRejected && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-black text-rose-700 uppercase tracking-wider">Workflow Stopped</p>
                    <p className="text-xs font-semibold text-rose-600 mt-1">This request was rejected, so process is closed at this stage.</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h2 className="text-xl font-black text-slate-900 mb-2">{request.title || 'Purchase Order Request'}</h2>
                        <p className="text-sm font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {request.description || 'No description provided.'}
                        </p>
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <History size={17} className="text-blue-600" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Purchase Request History</h3>
                        </div>
                        {sourceHistory.length === 0 ? (
                            <p className="text-xs font-semibold text-slate-500">No source purchase request history available.</p>
                        ) : (
                            <div className="space-y-3">
                                {sourceHistory.map((item, idx) => (
                                    <HistoryCard key={item.id || `${idx}-${item.action || 'event'}`} item={item} />
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={17} className="text-blue-600" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Purchase Order Request History</h3>
                        </div>
                        {porHistory.length === 0 ? (
                            <p className="text-xs font-semibold text-slate-500">No POR action history available.</p>
                        ) : (
                            <div className="space-y-3">
                                {porHistory.map((item, idx) => (
                                    <HistoryCard key={item.id || `${idx}-${item.action || 'event'}`} item={item} />
                                ))}
                            </div>
                        )}
                    </section>

                </div>

                <div className="space-y-6">
                    <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Approval Summary</h3>
                        <div className="space-y-4">
                            <InfoRow icon={Building2} label="Target Approval Department" value={approvalLabel(request.target_approval_department)} />
                            <InfoRow icon={User} label="Current Approver" value={request.targetApprover?.name || 'N/A'} />
                            <InfoRow icon={CalendarClock} label="Created Date" value={new Date(request.created_at || request.createdAt).toLocaleString('en-IN')} />
                        </div>
                    </section>

                    <section className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Request Source</h3>
                        <div className="space-y-4">
                            <InfoRow icon={User} label="Requested By" value={request.source_requester_name || request.requester?.name || 'N/A'} />
                            <InfoRow icon={Building2} label="Department" value={request.source_department || 'N/A'} />
                            <InfoRow icon={Building2} label="Section" value={request.source_section || request.source_request_module || 'N/A'} />
                            <InfoRow icon={User} label="Approved By" value={request.source_approved_by_name || 'N/A'} />
                        </div>
                    </section>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">Next Action</p>
                        <button
                            type="button"
                            onClick={openNewPoRequest}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all"
                        >
                            <Plus size={14} />
                            <span>New Purchase Order Request</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div>
        <div className="flex items-center gap-1.5 mb-1">
            <Icon size={12} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
        <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
);

export default PurchaseOrderRequestDetails;
