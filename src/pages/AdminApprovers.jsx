import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const resolveRoleBasis = (user) => {
    const level = String(user?.approval_level || '').toUpperCase();
    if (level === 'PM' || level === 'L1') return 'Level 1 - Procurement Manager';
    if (level === 'DM' || level === 'L2') return 'Level 2 - Department Manager';
    if (level === 'L3') return 'Level 3 - Finance Manager';
    if (level === 'L4') return 'Level 4 - Director';
    if (level === 'L5') return 'Level 5 - CEO';
    if (level === 'GM') return 'General Manager (No Level)';

    const role = String(user?.role || '').toLowerCase();
    if (!role) return 'Not Defined';

    return role.charAt(0).toUpperCase() + role.slice(1);
};

const AdminApprovers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Failed to load users for approver assignment:', err);
            alert(err?.response?.data?.msg || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleApprover = async (user) => {
        try {
            await api.post('/admin/assign-approver', {
                user_id: user.id,
                is_approver: !Boolean(user.is_approver)
            });
            await fetchUsers();
        } catch (err) {
            console.error('Failed to assign approver:', err);
            alert(err?.response?.data?.msg || 'Failed to update approver mapping');
        }
    };

    const filteredUsers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return users;

        return users.filter((user) =>
            String(user.name || '').toLowerCase().includes(keyword) ||
            String(user.email || '').toLowerCase().includes(keyword)
        );
    }, [users, search]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Approver Assignment</h1>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Admin control for dynamic approver mapping</p>
                    </div>
                    <button
                        onClick={fetchUsers}
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email"
                            className="w-full md:w-96 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="h-52 flex items-center justify-center text-slate-500 text-sm font-semibold">Loading users...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                                        <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Email</th>
                                        <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role Basis</th>
                                        <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Approver</th>
                                        <th className="py-3 px-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/60">
                                            <td className="py-3 px-5 text-sm font-semibold text-slate-900">{user.name || 'Unknown User'}</td>
                                            <td className="py-3 px-5 text-sm text-slate-600">{user.email || '-'}</td>
                                            <td className="py-3 px-5 text-sm text-slate-700">{resolveRoleBasis(user)}</td>
                                            <td className="py-3 px-5">
                                                {user.is_approver ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wide">
                                                        <ShieldCheck size={12} />
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wide">No</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-5 text-right">
                                                <button
                                                    onClick={() => toggleApprover(user)}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-colors ${
                                                        user.is_approver
                                                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                                >
                                                    {user.is_approver ? 'Remove Approver' : 'Make Approver'}
                                                </button>
                                            </td>
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

export default AdminApprovers;
