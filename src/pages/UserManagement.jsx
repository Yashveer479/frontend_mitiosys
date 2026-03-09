import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    MoreVertical,
    Shield,
    Unlock,
    Lock,
    CheckCircle,
    XCircle,
    Search,
    RefreshCw,
    KeyRound,
    History,
    AlertCircle
} from 'lucide-react';
import api from '../services/api';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [view, setView] = useState('users'); // 'users' or 'logs'
    const [filter, setFilter] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'staff',
        password: ''
    });

    const [resetData, setResetData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (view === 'logs') fetchLogs();
    }, [view]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/users/logs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };



    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.toLowerCase())
    );

    const handleAddUser = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            await api.post('/users', formData);
            fetchUsers();
            setShowAddModal(false);
            setFormData({ name: '', email: '', role: 'staff', password: '' });
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to create user");
        } finally {
            setActionLoading(false);
        }
    };

    const toggleStatus = async (id) => {
        try {
            await api.put(`/users/${id}/status`);
            fetchUsers();
            if (view === 'logs') fetchLogs();
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to toggle status");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (resetData.newPassword !== resetData.confirmPassword) {
            return alert("Passwords do not match");
        }
        setActionLoading(true);
        try {
            await api.post(`/users/${selectedUser.id}/reset-password`, {
                newPassword: resetData.newPassword
            });
            setShowResetModal(false);
            setResetData({ newPassword: '', confirmPassword: '' });
            alert("Password reset successful");
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to reset password");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">User Management</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Admin</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Access Control</span>
                        </nav>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <UserPlus size={16} />
                        <span>Add New User</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[600px] flex flex-col">

                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setView('users')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                User Directory
                            </button>
                            <button
                                onClick={() => setView('logs')}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${view === 'logs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Security Logs
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${view}...`}
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="flex-1 overflow-x-auto">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                                <RefreshCw className="animate-spin mb-2" size={32} />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading data...</span>
                            </div>
                        ) : view === 'users' ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">ID</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Login</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6 text-xs font-bold text-slate-300">#{user.id}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    <Shield size={12} className="mr-1" />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => toggleStatus(user.id)}
                                                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all ${user.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {user.isActive ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="py-4 px-6 text-xs font-bold text-slate-500">
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowResetModal(true);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Reset Password"
                                                    >
                                                        <KeyRound size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                                        <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-6 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-xs font-black text-slate-900">
                                                {log.User?.name || 'System'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-slate-600">
                                                {log.details}
                                                <div className="text-[10px] text-slate-400 mt-0.5">IP: {log.ipAddress}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-black text-slate-900">Add New User</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g. Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    placeholder="e.g. jane@mdferp.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Login Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                    placeholder="Set temporary password"
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="manager">Manager</option>
                                        <option value="admin">Administrator</option>
                                        <option value="logistics">Logistics</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-wide transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-70 flex items-center"
                                >
                                    {actionLoading && <RefreshCw size={14} className="animate-spin mr-2" />}
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Reset Password</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase">User: {selectedUser?.name}</p>
                            </div>
                            <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={resetData.newPassword}
                                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Enter new password"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={resetData.confirmPassword}
                                    onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowResetModal(false)}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 uppercase tracking-wide transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="px-6 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-95 disabled:opacity-70 flex items-center"
                                >
                                    {actionLoading && <RefreshCw size={14} className="animate-spin mr-2" />}
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default UserManagement;
