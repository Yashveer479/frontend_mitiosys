import React, { useState, useEffect } from 'react';
import { 
    Plus, List, CheckCircle, Clock, XCircle, AlertCircle, 
    Filter, Search, ArrowRight, MessageSquare, User, Calendar
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import PurchaseRequestForm from './PurchaseRequestForm';
import PurchaseRequestList from './PurchaseRequestList';
import PurchaseRequestDetails from './PurchaseRequestDetails';
import { useAuth } from '../../context/AuthContext';

const PurchaseRequestSystem = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id: routeRequestId } = useParams();
    const [activeTab, setActiveTab] = useState('list');
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        myRequests: 0
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/requests');
            const data = Array.isArray(res.data) ? res.data : [];
            setRequests(data);
            
            // Calculate stats
            const pending = data.filter(r => r.status.startsWith('PENDING')).length;
            const approved = data.filter(r => r.status === 'APPROVED').length;
            const rejected = data.filter(r => r.status === 'REJECTED').length;
            const myRequests = data.filter(r => r.requested_by === user.id).length;
            
            setStats({ pending, approved, rejected, myRequests });
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        if (routeRequestId) {
            setSelectedRequestId(routeRequestId);
            setActiveTab('details');
            return;
        }

        setSelectedRequestId(null);
        setActiveTab((prev) => (prev === 'details' ? 'list' : prev));
    }, [routeRequestId]);

    const handleViewDetails = (id) => {
        setSelectedRequestId(id);
        setActiveTab('details');
        navigate(`/purchase-requests/${id}`);
    };

    const handleBackToList = () => {
        setSelectedRequestId(null);
        setActiveTab('list');
        navigate('/purchase-requests');
        fetchRequests();
    };

    const handleRequestCreated = () => {
        setActiveTab('list');
        fetchRequests();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Purchase Requests</h1>
                    <p className="text-sm text-slate-500 font-medium">Create and manage resource acquisition requests through approval workflows.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setActiveTab('create')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                            activeTab === 'create' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'
                        }`}
                    >
                        <Plus size={18} />
                        <span>New Request</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard 
                    label="Pending Approvals" 
                    value={stats.pending} 
                    icon={Clock} 
                    color="text-amber-500" 
                    bg="bg-amber-50" 
                />
                <StatCard 
                    label="Approved Requests" 
                    value={stats.approved} 
                    icon={CheckCircle} 
                    color="text-emerald-500" 
                    bg="bg-emerald-50" 
                />
                <StatCard 
                    label="Rejected" 
                    value={stats.rejected} 
                    icon={XCircle} 
                    color="text-rose-500" 
                    bg="bg-rose-50" 
                />
                <StatCard 
                    label="My Submissions" 
                    value={stats.myRequests} 
                    icon={User} 
                    color="text-blue-500" 
                    bg="bg-blue-50" 
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-6">
                    <TabButton 
                        active={activeTab === 'list'} 
                        onClick={() => setActiveTab('list')} 
                        label="All Requests" 
                        count={requests.length}
                    />
                    {selectedRequestId && (
                        <TabButton 
                            active={activeTab === 'details'} 
                            onClick={() => setActiveTab('details')} 
                            label="Request Details" 
                        />
                    )}
                </div>

                <div className="p-6">
                    {activeTab === 'list' && (
                        <PurchaseRequestList 
                            requests={requests} 
                            loading={loading} 
                            onViewDetails={handleViewDetails} 
                        />
                    )}
                    {activeTab === 'create' && (
                        <PurchaseRequestForm 
                            onCancel={() => setActiveTab('list')} 
                            onSuccess={handleRequestCreated}
                        />
                    )}
                    {activeTab === 'details' && selectedRequestId && (
                        <PurchaseRequestDetails 
                            requestId={selectedRequestId} 
                            onBack={handleBackToList}
                            onUpdate={fetchRequests}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon size={24} className={color} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="text-xl font-black text-slate-800 leading-none">{value}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
            active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
        }`}
    >
        <span className="flex items-center gap-2">
            {label}
            {count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                    active ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                }`}>
                    {count}
                </span>
            )}
        </span>
        {active && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
        )}
    </button>
);

export default PurchaseRequestSystem;
