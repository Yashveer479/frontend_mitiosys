import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Search, Bell, User, ArrowUpRight, ArrowDownRight, Package, Factory, ShoppingCart, CheckCheck, X } from 'lucide-react';
import { toServerUrl } from '../services/urlConfig';
import api from '../services/api';

const NOTIFICATION_ICONS = {
    LOW_STOCK: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    PRODUCTION_COMPLETE: { icon: Factory, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ORDER_CREATED: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
};

const Header = () => {
    const { user } = useAuth();
    const [time, setTime] = React.useState(new Date());
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [bellOpen, setBellOpen] = React.useState(false);
    const bellRef = React.useRef(null);

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchNotifications = React.useCallback(async () => {
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.is_read).length);
        } catch (_) {
            // silently fail — don't block UI
        }
    }, []);

    // Fetch on mount + poll every 30 s
    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e) => {
            if (bellRef.current && !bellRef.current.contains(e.target)) {
                setBellOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (_) {}
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (_) {}
    };

    const avatarUrl = toServerUrl(user?.avatar);

    return (
        <header className="fixed top-0 left-64 right-0 z-40 flex flex-col shadow-sm">
            {/* Industrial Market Ticker */}
            <div className="h-7 bg-slate-900 flex items-center overflow-hidden px-8 space-x-8 border-b border-white/5">
                <div className="flex items-center space-x-2 shrink-0">
                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Market Feed</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
                    <TickerItem label="MDF 18mm" value="$42.50" change="+1.2%" isUp />
                    <TickerItem label="Timber (Oak)" value="$840/m3" change="-0.5%" />
                    <TickerItem label="Fuel (Diesel)" value="$1.24/L" change="+0.8%" isUp />
                    <TickerItem label="USD/UGX" value="3,750" change="-2.1%" />
                    <TickerItem label="EUR/UGX" value="4,080" change="+0.4%" isUp />
                    <TickerItem label="Steel Sheet" value="$1,120/t" change="+1.5%" isUp />
                </div>
            </div>

            {/* Sub-Header / Main Actions */}
            <div className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8">
                <div className="flex items-center space-x-6 flex-1">
                    <div className="flex items-center space-x-3 pr-6 border-r border-slate-100">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Zap size={16} fill="white" />
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter leading-none">Mitiosys</p>
                            <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-none mt-1">Digital Core</p>
                        </div>
                    </div>

                    <div className="relative w-full max-w-sm group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search Command..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="hidden xl:flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Global Hub</p>
                            <p className="text-xs font-bold text-slate-800 leading-none">EAST-AFRICA-01</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Notification Bell */}
                        <div className="relative" ref={bellRef}>
                            <button
                                onClick={() => setBellOpen(o => !o)}
                                className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group"
                                aria-label="Notifications"
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border border-white leading-none">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {bellOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center space-x-2">
                                            <Bell size={14} className="text-blue-600" />
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={handleMarkAllRead}
                                                className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <CheckCheck size={12} />
                                                <span>Mark all read</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Notification list */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                                                <Bell size={28} />
                                                <p className="text-xs font-semibold mt-2">No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(n => {
                                                const config = NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.ORDER_CREATED;
                                                const Icon = config.icon;
                                                const ts = new Date(n.created_at);
                                                const timeStr = ts.toLocaleDateString() === new Date().toLocaleDateString()
                                                    ? ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ts.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                                return (
                                                    <div
                                                        key={n.id}
                                                        className={`flex items-start space-x-3 px-4 py-3 border-b border-slate-50 transition-colors ${
                                                            n.is_read ? 'opacity-60' : 'bg-blue-50/30'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                                                            <Icon size={14} className={config.color} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 leading-tight truncate">{n.title}</p>
                                                            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{timeStr}</p>
                                                        </div>
                                                        {!n.is_read && (
                                                            <button
                                                                onClick={() => handleMarkRead(n.id)}
                                                                className="shrink-0 p-1 rounded-lg hover:bg-slate-100 text-slate-300 hover:text-blue-500 transition-colors"
                                                                title="Mark as read"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {notifications.length > 0 && (
                                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                Showing latest {notifications.length} notifications
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button onClick={() => window.location.href = '/profile'} className="flex items-center space-x-3 pl-4 border-l border-slate-100 cursor-pointer group text-left">
                            <div className="hidden sm:block">
                                <p className="text-sm font-black text-slate-800 leading-none mb-1 group-hover:text-blue-600 transition-colors">
                                    {user?.name || 'Loading...'}
                                </p>
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">
                                    {user?.role || 'Guest'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm overflow-hidden relative">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
            ` }} />
        </header>
    );
};

const TickerItem = ({ label, value, change, isUp }) => (
    <div className="flex items-center space-x-2 text-[10px] font-bold">
        <span className="text-slate-500 uppercase tracking-tighter">{label}</span>
        <span className="text-white">{value}</span>
        <div className={`flex items-center ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            <span>{change}</span>
        </div>
    </div>
);

export default Header;
