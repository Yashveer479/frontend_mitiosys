import React, { useState } from 'react';
import {
    User,
    Mail,
    Shield,
    KeyRound,
    History,
    Camera,
    Save,
    CheckCircle,
    LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);

    // Mock User Data
    const [user, setUser] = useState({
        name: 'Admin User',
        email: 'admin@mitiosys.com',
        role: 'Administrator',
        joined: 'Jan 2026'
    });

    // Mock Activity Log
    const activities = [
        { id: 1, action: 'Updated System Settings', date: 'Just now', icon: Shield },
        { id: 2, action: 'Created New User "John Doe"', date: '2 hours ago', icon: User },
        { id: 3, action: 'Exported Monthly Sales Report', date: 'Yesterday', icon: History },
        { id: 4, action: 'Logged in from New Device', date: '3 days ago', icon: KeyRound },
    ];

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
            <div className="max-w-2xl mx-auto space-y-8">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">My Profile</h1>
                    <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Account</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-blue-600">Overview</span>
                    </nav>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 relative">
                    {/* Cover / Background Pattern */}
                    <div className="h-32 bg-slate-900 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Main Info */}
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                    <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative">
                                        <User size={40} />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                            </div>
                            <div className="mb-2">
                                <button
                                    onClick={logout}
                                    className="flex items-center space-x-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-colors text-xs font-bold uppercase tracking-wide"
                                >
                                    <LogOut size={14} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>

                        {/* Details Form */}
                        <form onSubmit={handleSave} className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide">
                                        {user.role}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">Member since {user.joined}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Display Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={user.name}
                                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={user.email}
                                            readOnly
                                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed focus:outline-none"
                                        />
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Password Change Accordion (Visual) */}
                            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50">
                                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center">
                                    <KeyRound size={16} className="mr-2 text-blue-600" />
                                    Security Settings
                                </h3>
                                <div className="space-y-4">
                                    <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide hover:underline text-left">
                                        Change Password
                                    </button>
                                    <div className="hidden">
                                        {/* Hidden inputs for expansion later */}
                                        <input type="password" placeholder="Current Password" />
                                        <input type="password" placeholder="New Password" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex items-center space-x-2 bg-slate-900 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70`}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                                    ) : saved ? (
                                        <>
                                            <CheckCircle size={16} className="text-emerald-400" />
                                            <span>Updated</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            <span>Save Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>

                {/* Activity History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center">
                        <History size={16} className="mr-2 text-slate-400" />
                        Recent Activity
                    </h3>
                    <div className="space-y-6 relative pl-2">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>

                        {activities.map((item, index) => (
                            <div key={index} className="flex items-start relative z-10">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-4 text-slate-400 shadow-sm">
                                    <item.icon size={14} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">{item.action}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
