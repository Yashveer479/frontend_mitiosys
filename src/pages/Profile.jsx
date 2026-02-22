import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    User,
    Mail,
    Shield,
    KeyRound,
    Activity,
    Camera,
    Save,
    CheckCircle,
    LogOut,
    RefreshCw,
    Monitor,
    Smartphone,
    Globe,
    Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const { user, logout, updateUser, toggle2FA } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    });
    const fileInputRef = useRef(null);
    const [activity, setActivity] = useState([]);
    const [activityLoading, setActivityLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(true);
    const currentSessionId = localStorage.getItem('sessionId');
    const [notifPrefs, setNotifPrefs] = useState(null);
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    const fetchActivity = useCallback(async () => {
        try {
            const res = await api.get('/users/activity');
            setActivity(res.data);
        } catch (err) {
            console.error('Failed to load activity', err);
        } finally {
            setActivityLoading(false);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await api.get('/users/sessions');
            setSessions(res.data);
        } catch (err) {
            console.error('Failed to load sessions', err);
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    const revokeSession = async (sessionId) => {
        try {
            await api.delete(`/users/sessions/${sessionId}`);
            setSessions(prev => prev.filter(s => s.sessionId !== sessionId));
        } catch (err) {
            alert('Failed to revoke session');
        }
    };

    const revokeAllOthers = async () => {
        try {
            await api.delete('/users/sessions');
            setSessions(prev => prev.filter(s => s.sessionId === currentSessionId));
        } catch (err) {
            alert('Failed to revoke other sessions');
        }
    };

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get('/users/notifications');
            setNotifPrefs(res.data);
        } catch (err) {
            console.error('Failed to load notification prefs', err);
        }
    }, []);

    const handleNotifToggle = async (key) => {
        const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
        setNotifPrefs(updated);
        setNotifSaving(true);
        try {
            await api.put('/users/notifications', updated);
            setNotifSaved(true);
            setTimeout(() => setNotifSaved(false), 2000);
        } catch (err) {
            console.error('Failed to update notification prefs', err);
            setNotifPrefs(notifPrefs); // revert
        } finally {
            setNotifSaving(false);
        }
    };

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name || '', email: user.email || '' });
            fetchActivity();
            fetchSessions();
            fetchNotifications();
        }
    }, [user, fetchActivity, fetchSessions, fetchNotifications]);


    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/users/profile', formData);
            updateUser(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Update profile error:', err);
            alert(err.response?.data?.msg || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Frontend Validation
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload a JPEG, PNG or WebP image.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large. Max size is 2MB.');
            return;
        }

        const uploadData = new FormData();
        uploadData.append('avatar', file);

        setLoading(true);
        try {
            const res = await api.post('/users/avatar', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser({ avatar: res.data.avatar });
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert(err.response?.data?.msg || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return (
        <div className="h-full flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
        </div>
    );

    const avatarUrl = user.avatar ? `${import.meta.env.VITE_SERVER_URL}${user.avatar}` : null;

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
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
                    </div>

                    <div className="px-8 pb-8">
                        {/* Avatar & Main Info */}
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-lg">
                                    <div
                                        onClick={handleAvatarClick}
                                        className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden relative cursor-pointer group"
                                    >
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={40} />
                                        )}
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
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
                                    <span className="text-xs text-slate-500 font-medium lowercase">
                                        Join Date: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Jan 2026'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Display Name</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                            value={formData.email}
                                            disabled={true}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed opacity-70"
                                        />
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <button
                                            type="button"
                                            onClick={() => navigate('/change-email')}
                                            className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-wider"
                                        >
                                            Change Email
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password & 2FA Change Info */}
                            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 space-y-4">
                                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center">
                                    <KeyRound size={16} className="mr-2 text-blue-600" />
                                    Security Settings
                                </h3>

                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password Management</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Always keep your password updated.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/change-password')}
                                        className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm flex items-center space-x-2"
                                    >
                                        <Shield size={12} className="text-blue-500" />
                                        <span>Change Password</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-slate-400 mt-1">Require an email OTP whenever you log in.</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.twoFactorEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                                            {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setLoading(true);
                                                try {
                                                    await toggle2FA();
                                                } catch (err) {
                                                    alert('Failed to toggle 2FA');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        >
                                            <span
                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${user.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
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
                                        <RefreshCw size={16} className="animate-spin" />
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

                {/* Account Status */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center">
                        <Shield size={16} className="mr-2 text-indigo-500" />
                        Account Status
                    </h3>

                    {/* Key Dates */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Member Since</p>
                            <p className="text-xs font-black text-slate-800">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {user.createdAt ? `${Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days ago` : ''}
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Password Change</p>
                            <p className="text-xs font-black text-slate-800">
                                {user.lastPasswordChange ? new Date(user.lastPasswordChange).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Never changed'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                                {user.lastPasswordChange ? `${Math.floor((Date.now() - new Date(user.lastPasswordChange)) / (1000 * 60 * 60 * 24))} days ago` : 'Using initial password'}
                            </p>
                        </div>
                    </div>

                    {/* Security Indicators */}
                    <div className="space-y-2">
                        {(() => {
                            const passwordAgeDays = user.lastPasswordChange
                                ? Math.floor((Date.now() - new Date(user.lastPasswordChange)) / (1000 * 60 * 60 * 24))
                                : null;
                            const passwordHealthy = passwordAgeDays !== null && passwordAgeDays < 90;

                            const indicators = [
                                {
                                    label: 'Two-Factor Authentication',
                                    value: user.twoFactorEnabled ? 'Enabled' : 'Disabled',
                                    ok: user.twoFactorEnabled,
                                    warn: !user.twoFactorEnabled,
                                    hint: user.twoFactorEnabled ? 'Your account has an extra layer of protection.' : 'Enable 2FA in Security Settings for stronger protection.'
                                },
                                {
                                    label: 'Password Freshness',
                                    value: passwordAgeDays === null ? 'Never changed' : passwordAgeDays < 90 ? 'Up to date' : `${passwordAgeDays} days old`,
                                    ok: passwordHealthy,
                                    warn: !passwordHealthy,
                                    hint: passwordHealthy ? 'Password was changed recently.' : 'Consider updating your password — it\'s over 90 days old.'
                                },
                                {
                                    label: 'Account Status',
                                    value: user.isActive ? 'Active' : 'Inactive',
                                    ok: user.isActive,
                                    warn: !user.isActive,
                                    hint: user.isActive ? 'Your account is in good standing.' : 'Account is currently inactive.'
                                },
                                {
                                    label: 'Last Login',
                                    value: user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown',
                                    ok: !!user.lastLogin,
                                    warn: false,
                                    hint: 'Most recent successful authentication.'
                                },
                            ];

                            return indicators.map(({ label, value, ok, warn, hint }) => (
                                <div key={label} className="flex items-start justify-between py-2.5 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-xs font-black text-slate-700">{label}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>
                                    </div>
                                    <span className={`ml-4 shrink-0 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider ${ok ? 'text-emerald-600 bg-emerald-50' : warn ? 'text-amber-600 bg-amber-50' : 'text-slate-500 bg-slate-100'
                                        }`}>
                                        {value}
                                    </span>
                                </div>
                            ));
                        })()}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-900 flex items-center">
                            <Activity size={16} className="mr-2 text-indigo-500" />
                            Recent Account Activity
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 10 Events</span>
                    </div>

                    {activityLoading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw size={20} className="animate-spin text-slate-300" />
                        </div>
                    ) : activity.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold text-center py-8">No activity recorded yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {activity.map((log) => {
                                const ua = log.userAgent || '';
                                const isMobile = /mobile|android|iphone/i.test(ua);
                                const browser = ua.match(/(chrome|firefox|safari|edge|opera)/i)?.[1] || 'Browser';
                                const DeviceIcon = isMobile ? Smartphone : Monitor;

                                const actionColors = {
                                    LOGIN_OTP: 'text-emerald-500 bg-emerald-50',
                                    LOGIN_PASSWORD: 'text-emerald-500 bg-emerald-50',
                                    OTP_FAILURE: 'text-rose-500 bg-rose-50',
                                    PASSWORD_CHANGE: 'text-amber-500 bg-amber-50',
                                    EMAIL_CHANGE_COMPLETED: 'text-blue-500 bg-blue-50',
                                    '2FA_ENABLED': 'text-indigo-500 bg-indigo-50',
                                    '2FA_DISABLED': 'text-slate-500 bg-slate-100',
                                    PROFILE_UPDATE: 'text-slate-500 bg-slate-100',
                                    AVATAR_UPDATE: 'text-slate-500 bg-slate-100',
                                };
                                const colorClass = actionColors[log.action] || 'text-slate-500 bg-slate-100';

                                return (
                                    <div key={log.id} className="flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-start space-x-3">
                                            <span className={`mt-0.5 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider shrink-0 ${colorClass}`}>
                                                {log.action.replace(/_/g, ' ')}
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-slate-700 leading-tight">{log.details || '—'}</p>
                                                <div className="flex items-center space-x-3 mt-1">
                                                    {log.ipAddress && (
                                                        <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                                                            <Globe size={10} />
                                                            <span>{log.ipAddress}</span>
                                                        </span>
                                                    )}
                                                    {log.userAgent && (
                                                        <span className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                                                            <DeviceIcon size={10} />
                                                            <span className="capitalize">{browser}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-4 shrink-0">
                                            {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Active Sessions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-900 flex items-center">
                            <Monitor size={16} className="mr-2 text-indigo-500" />
                            Active Sessions
                        </h3>
                        {sessions.filter(s => s.sessionId !== currentSessionId).length > 0 && (
                            <button
                                onClick={revokeAllOthers}
                                className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest border border-rose-200 hover:border-rose-400 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                Logout All Other Devices
                            </button>
                        )}
                    </div>

                    {sessionsLoading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw size={20} className="animate-spin text-slate-300" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold text-center py-8">No active sessions.</p>
                    ) : (
                        <div className="space-y-2">
                            {sessions.map((session) => {
                                const ua = session.userAgent || '';
                                const isMobile = /mobile|android|iphone/i.test(ua);
                                const browser = ua.match(/(chrome|firefox|safari|edge|opera)/i)?.[1] || 'Browser';
                                const DeviceIcon = isMobile ? Smartphone : Monitor;
                                const isCurrent = session.sessionId === currentSessionId;

                                return (
                                    <div key={session.sessionId} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${isCurrent ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                                <DeviceIcon size={14} className={isCurrent ? 'text-indigo-600' : 'text-slate-500'} />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <p className="text-xs font-black text-slate-800 capitalize">{browser}</p>
                                                    {isCurrent && (
                                                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">Current</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-3 mt-0.5">
                                                    {session.ipAddress && (
                                                        <span className="flex items-center space-x-1 text-[10px] text-slate-400">
                                                            <Globe size={9} />
                                                            <span>{session.ipAddress}</span>
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400">
                                                        Last seen {new Date(session.lastSeenAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {!isCurrent && (
                                            <button
                                                onClick={() => revokeSession(session.sessionId)}
                                                className="text-[10px] font-black text-rose-500 hover:text-rose-700 uppercase tracking-widest ml-4 shrink-0 hover:underline"
                                            >
                                                Revoke
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* Notification Preferences */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black text-slate-900 flex items-center">
                            <Bell size={16} className="mr-2 text-indigo-500" />
                            Email Notification Preferences
                        </h3>
                        {notifSaved && (
                            <span className="text-[10px] font-black text-emerald-500 flex items-center space-x-1">
                                <CheckCircle size={12} />
                                <span>Saved</span>
                            </span>
                        )}
                    </div>

                    {!notifPrefs ? (
                        <div className="flex justify-center py-6">
                            <RefreshCw size={20} className="animate-spin text-slate-300" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {[
                                { key: 'notifyOrderUpdates', label: 'Order Updates', desc: 'New orders, status changes, approvals' },
                                { key: 'notifyStockAlerts', label: 'Stock Alerts', desc: 'Low stock warnings and inventory changes' },
                                { key: 'notifyDispatchEvents', label: 'Dispatch Events', desc: 'Shipment dispatched, delivered, delayed' },
                                { key: 'notifySecurityAlerts', label: 'Security Alerts', desc: 'New logins, 2FA changes, password resets' },
                                { key: 'notifySystemReports', label: 'System Reports', desc: 'Weekly summaries and performance reports' },
                            ].map(({ key, label, desc }) => (
                                <div key={key} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                                    <div>
                                        <p className="text-xs font-black text-slate-700">{label}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={notifSaving}
                                        onClick={() => handleNotifToggle(key)}
                                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none shrink-0 ml-4 disabled:opacity-60 ${notifPrefs[key] ? 'bg-indigo-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${notifPrefs[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Profile;
