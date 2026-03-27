import React, { useState, useEffect, useMemo } from 'react';
import { 
    Plus, List, CheckCircle, Clock, XCircle, AlertCircle, 
    Filter, Search, ArrowRight, MessageSquare, User, Calendar
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../services/api';
import PurchaseRequestForm from './PurchaseRequestForm';
import PurchaseRequestList from './PurchaseRequestList';
import PurchaseRequestDetails from './PurchaseRequestDetails';
import { useAuth } from '../../context/AuthContext';
import { resolvePurchaseRequestModule } from './requestModuleConfig';

const PurchaseRequestSystem = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const query = new URLSearchParams(location.search);
    const forceLogin = query.get('forceLogin') === '1';
    const approverEmail = String(query.get('approverEmail') || '').trim().toLowerCase();
    const moduleConfig = useMemo(() => resolvePurchaseRequestModule(location.pathname), [location.pathname]);
    const purchaseRequestBasePath = useMemo(() => {
        if (location.pathname.startsWith('/production/purchase-requests')) return '/production/purchase-requests';
        if (location.pathname.startsWith('/lamination/purchase-requests')) return '/lamination/purchase-requests';
        return '/purchase-requests';
    }, [location.pathname]);

    const toRequestPath = (suffix = '') => `${purchaseRequestBasePath}${suffix}`;

    useEffect(() => {
        const enforceApproverLogin = async () => {
            if (!forceLogin) return;
            if (authLoading) return;

            const currentEmail = String(user?.email || '').trim().toLowerCase();
            const mustLogin = !currentEmail;
            const emailMismatch = approverEmail && currentEmail !== approverEmail;

            if (mustLogin || emailMismatch) {
                try {
                    await logout();
                } catch (_) {
                    // best effort logout
                }

                localStorage.removeItem('token');
                localStorage.removeItem('sessionId');
                const next = encodeURIComponent(`${location.pathname}${location.search}`);
                navigate(`/login?next=${next}`, { replace: true });
            }
        };

        enforceApproverLogin();
    }, [forceLogin, approverEmail, user?.email, authLoading, logout, location.pathname, location.search, navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get(moduleConfig.apiBase);
            const data = Array.isArray(res.data) ? res.data : [];
            setRequests(data);

            const pending = data.filter(r => r.status.startsWith('PENDING')).length;
            const approved = data.filter(r => r.status === 'APPROVED').length;
            const rejected = data.filter(r => r.status === 'REJECTED').length;
            const myRequests = data.filter(r => r.requested_by === user?.id).length;

            setStats({ pending, approved, rejected, myRequests });
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSingleRequest = async (id) => {
        try {
            const res = await api.get(`${moduleConfig.apiBase}/${id}`);
            // Manually add or update the request in the main list
            setRequests(prev => {
                const existing = prev.find(r => r.id === res.data.id);
                if (existing) {
                    return prev.map(r => r.id === res.data.id ? res.data : r);
                }
                return [...prev, res.data];
            });
        } catch (error) {
            console.error(`Failed to fetch single request ${id}`, error);
            // If the request is not found, maybe navigate back or show a specific message
            if (error.response && error.response.status === 404) {
                navigate(toRequestPath(''));
            }
        }
    };

    useEffect(() => {
        // Fetch all requests initially
        fetchRequests();
    }, [moduleConfig.apiBase]);

    useEffect(() => {
        if (routeRequestId) {
            if (routeRequestId === 'new') {
                setSelectedRequestId(null);
                setActiveTab('create');
                return;
            }

            // When navigating directly to a request URL, ensure that request's data is loaded.
            const requestDataExists = requests.some(r => r.id.toString() === routeRequestId);
            
            // Set the view to details
            setSelectedRequestId(routeRequestId);
            setActiveTab('details');

            // If the request data isn't already in our list, fetch it specifically.
            if (!requestDataExists) {
                fetchSingleRequest(routeRequestId);
            }
        } else {
            // If there's no ID in the route, go back to the list view.
            setSelectedRequestId(null);
            setActiveTab((prev) => (prev === 'details' ? 'list' : prev));
        }
    }, [routeRequestId, requests]); // Add `requests` as a dependency

    const handleViewDetails = (id) => {
        navigate(toRequestPath(`/${id}`));
    };

    const handleBackToList = () => {
        navigate(toRequestPath(''));
        setFilter('all');
    };

    const handleRequestUpdated = () => {
        return fetchRequests();
    };

    const handleRequestCreated = () => {
        fetchRequests();
        navigate(toRequestPath(''));
    };

    const canDeleteRequest = (request) => {
        if (!user || !request) return false;
        const isAdmin = String(user.role || '').toLowerCase() === 'admin';
        const isRequester = Number(request.requested_by) === Number(user.id);
        return isAdmin || isRequester;
    };

    const handleDeleteRequest = async (request) => {
        if (!request?.id) return;
        const confirmed = window.confirm(`Delete Request #PR-${request.id}? This will permanently remove it from backend and database.`);
        if (!confirmed) return;

        try {
            await api.delete(`${moduleConfig.apiBase}/${request.id}`);
            if (selectedRequestId && Number(selectedRequestId) === Number(request.id)) {
                navigate(toRequestPath(''));
            }
            await fetchRequests();
            window.alert(`Request #PR-${request.id} deleted successfully.`);
        } catch (err) {
            const status = err?.response?.status;
            const backendMsg = err?.response?.data?.msg || err?.message;
            window.alert(`Failed to delete request${status ? ` (HTTP ${status})` : ''}${backendMsg ? `: ${backendMsg}` : ''}`);
        }
    };

    const filteredRequests = useMemo(() => {
        let filtered = requests;

        if (filter !== 'all') {
            if (filter === 'pending') {
                filtered = requests.filter(r => r.status.startsWith('PENDING'));
            } else if (filter === 'approved') {
                filtered = requests.filter(r => r.status === 'APPROVED');
            } else if (filter === 'rejected') {
                filtered = requests.filter(r => r.status === 'REJECTED');
            } else if (filter === 'my-submissions') {
                filtered = requests.filter(r => r.requested_by === user?.id);
            }
        }

        if (searchTerm) {
            const lowercasedSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.id.toString().includes(lowercasedSearchTerm) ||
                (r.title && r.title.toLowerCase().includes(lowercasedSearchTerm)) ||
                (r.description && r.description.toLowerCase().includes(lowercasedSearchTerm)) ||
                (r.requester && r.requester.name.toLowerCase().includes(lowercasedSearchTerm))
            );
        }

        return filtered;
    }, [requests, filter, searchTerm, user?.id]);

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
                        onClick={() => navigate(toRequestPath('/new'))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700`}
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
                    onClick={() => setFilter('pending')}
                />
                <StatCard 
                    label="Approved Requests" 
                    value={stats.approved} 
                    icon={CheckCircle} 
                    color="text-emerald-500" 
                    bg="bg-emerald-50"
                    onClick={() => setFilter('approved')}
                />
                <StatCard 
                    label="Rejected" 
                    value={stats.rejected} 
                    icon={XCircle} 
                    color="text-rose-500" 
                    bg="bg-rose-50"
                    onClick={() => setFilter('rejected')}
                />
                <StatCard 
                    label="My Submissions" 
                    value={stats.myRequests} 
                    icon={User} 
                    color="text-blue-500" 
                    bg="bg-blue-50"
                    onClick={() => setFilter('my-submissions')}
                />
            </div>

            {/* Filter and Search Section */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by ID, item, or requester..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button 
                        onClick={() => { setFilter('all'); setSearchTerm(''); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all bg-slate-100 text-slate-600 hover:bg-slate-200"
                    >
                        <Filter size={16} />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                {/* Tabs */}
                <div className="flex items-center border-b border-slate-100 bg-slate-50/50 px-6">
                    <TabButton 
                        active={!routeRequestId} 
                        onClick={handleBackToList} 
                        label="All Requests" 
                        count={filteredRequests.length}
                    />
                    {routeRequestId && routeRequestId !== 'new' && (
                        <TabButton 
                            active={true}
                            onClick={() => {}} 
                            label="Request Details" 
                        />
                    )}
                     {routeRequestId === 'new' && (
                        <TabButton 
                            active={true}
                            onClick={() => {}} 
                            label="Create New Request" 
                        />
                    )}
                </div>

                <div className="p-6">
                    {!routeRequestId ? (
                        <PurchaseRequestList 
                            requests={filteredRequests} 
                            loading={loading} 
                            onViewDetails={handleViewDetails}
                            onDeleteRequest={handleDeleteRequest}
                            canDeleteRequest={canDeleteRequest}
                        />
                    ) : routeRequestId === 'new' ? (
                        <PurchaseRequestForm 
                            onCancel={handleBackToList} 
                            onSuccess={handleRequestCreated}
                        />
                    ) : (
                        <PurchaseRequestDetails 
                            requestId={routeRequestId} 
                            onBack={handleBackToList}
                            onUpdate={handleRequestUpdated}
                            key={routeRequestId}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, bg, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:border-blue-500 hover:shadow-md cursor-pointer"
    >
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
