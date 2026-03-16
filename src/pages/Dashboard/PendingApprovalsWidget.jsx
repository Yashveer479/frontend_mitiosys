import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ClipboardList } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const PendingApprovalsWidget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingCount = async () => {
            const isApprover = user?.role === 'admin' || (user?.approval_level && user?.approval_level !== 'NONE');
            if (!isApprover) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/requests');
                const data = Array.isArray(res.data) ? res.data : [];
                
                let count = 0;
                if (user.approval_level === 'PM') {
                    count = data.filter(r => r.status === 'PENDING_PM_APPROVAL').length;
                } else if (user.approval_level === 'GM') {
                    count = data.filter(r => r.status === 'PENDING_GM_APPROVAL').length;
                } else if (user.approval_level === 'DM') {
                    count = data.filter(r => r.status === 'PENDING_DM_APPROVAL').length;
                } else if (user.role === 'admin') {
                    count = data.filter(r => r.status.startsWith('PENDING')).length;
                }
                
                setPendingCount(count);
            } catch (err) {
                console.error('Error fetching pending PR count:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingCount();
    }, [user]);

    const isApprover = user?.role === 'admin' || (user?.approval_level && user?.approval_level !== 'NONE');
    if (loading) return null;
    if (!isApprover) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-sm">
                    <Clock size={24} />
                </div>
                {pendingCount > 0 && (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Action Required
                    </span>
                )}
            </div>
            
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Approval Queue</h3>
            <p className="text-2xl font-black text-slate-800 mb-6">
                {pendingCount} <span className="text-sm text-slate-400 font-bold ml-1">Pending Requests</span>
            </p>
            
            <button
                onClick={() => navigate('/purchase-requests')}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-blue-600 group-hover:border-blue-600 transition-all"
            >
                <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-slate-400 group-hover:text-blue-100 transition-colors" />
                    <span className="text-xs font-black text-slate-600 group-hover:text-white uppercase tracking-widest transition-colors">Open Dashboard</span>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>
        </div>
    );
};

export default PendingApprovalsWidget;
