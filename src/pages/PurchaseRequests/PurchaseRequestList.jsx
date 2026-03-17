import React from 'react';
import { 
    Clock, CheckCircle, XCircle, Info, ChevronRight, 
    AlertCircle, Layers, User, Calendar, Trash2
} from 'lucide-react';

const PurchaseRequestList = ({ requests, loading, onViewDetails, onDeleteRequest, canDeleteRequest }) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-sm">Loading requests...</p>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <AlertCircle size={48} className="mb-4 text-slate-200" />
                <p className="font-black text-lg uppercase tracking-tight text-slate-400">No requests found</p>
                <p className="text-sm font-medium mt-1">Start by creating your first purchase request.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-slate-100 text-left bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title & Type</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requester</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="font-mono text-xs font-bold text-slate-500 text-blue-600">#PR-{request.id}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{request.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{request.request_type} • Qty: {request.quantity}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User size={12} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700 leading-tight">{request.requester?.name}</p>
                                        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">{request.department || 'N/A'}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <PriorityBadge priority={request.priority} />
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={request.status} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Calendar size={12} />
                                    <span className="text-[11px] font-bold">{new Date(request.createdAt || request.created_at).toLocaleDateString()}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    {canDeleteRequest?.(request) && (
                                        <button
                                            onClick={() => onDeleteRequest?.(request)}
                                            className="p-2 bg-rose-50 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-all"
                                            title="Delete Request"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onViewDetails(request.id)}
                                        className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        title="View Details"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

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
        PENDING_PM_APPROVAL: { label: 'Pending PM', color: 'bg-amber-100 text-amber-600', icon: Clock },
        PENDING_GM_APPROVAL: { label: 'Pending GM', color: 'bg-blue-100 text-blue-600', icon: Clock },
        PENDING_DM_APPROVAL: { label: 'Pending DM', color: 'bg-indigo-100 text-indigo-600', icon: Clock },
        APPROVED: { label: 'Approved', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle },
        REJECTED: { label: 'Rejected', color: 'bg-rose-100 text-rose-600', icon: XCircle }
    };
    const config = configs[status] || { label: status, color: 'bg-slate-100 text-slate-600', icon: Info };
    const Icon = config.icon;
    return (
        <span className={`flex items-center gap-1.5 w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${config.color}`}>
            <Icon size={10} strokeWidth={3} />
            {config.label}
        </span>
    );
};

export default PurchaseRequestList;
