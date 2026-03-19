import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Search, Bell, User, ArrowUpRight, ArrowDownRight, Package, Factory, ShoppingCart, CheckCheck, X, ClipboardList } from 'lucide-react';
import { toServerUrl } from '../services/urlConfig';
import api from '../services/api';
import CommandPalette from './CommandPalette';

const NOTIFICATION_ICONS = {
    LOW_STOCK: { icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    PRODUCTION_COMPLETE: { icon: Factory, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    ORDER_CREATED: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    ORDER_DISPATCHED: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    PURCHASE_REQUEST: { icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
};

const FALLBACK_NOTIFICATIONS = [
    {
        id: 'fallback-low-stock',
        type: 'LOW_STOCK',
        title: 'Low stock alert',
        message: 'Raw material inventory dropped below minimum threshold.',
        created_at: new Date().toISOString(),
        is_read: false,
    },
    {
        id: 'fallback-order-dispatched',
        type: 'ORDER_DISPATCHED',
        title: 'Order dispatched',
        message: 'A customer order left the warehouse and moved to delivery.',
        created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        is_read: false,
    },
    {
        id: 'fallback-production-complete',
        type: 'PRODUCTION_COMPLETE',
        title: 'Production completed',
        message: 'A production run was completed and recorded successfully.',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_read: true,
    },
];

const resolveNotificationPath = (notification) => {
    const title = String(notification.title || '').toLowerCase();
    const message = String(notification.message || '').toLowerCase();

    if (notification.type === 'LOW_STOCK' || title.includes('low stock') || message.includes('low stock')) {
        return '/inventory/low-stock';
    }

    if (
        notification.type === 'PRODUCTION_COMPLETE' ||
        title.includes('production completed') ||
        title.includes('production plan completed') ||
        message.includes('production')
    ) {
        return '/production/history';
    }

    if (
        notification.type === 'ORDER_CREATED' ||
        notification.type === 'ORDER_DISPATCHED' ||
        title.includes('order dispatched') ||
        title.includes('order') ||
        message.includes('order')
    ) {
        return '/sales/orders';
    }

    if (
        notification.type === 'PURCHASE_REQUEST' ||
        title.includes('purchase request') ||
        message.includes('purchase request')
    ) {
        return `/purchase-requests`;
    }

    return '/';
};

const Header = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = React.useState([]);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [bellOpen, setBellOpen] = React.useState(false);
    const bellRef = React.useRef(null);
    const [isCommandPaletteOpen, setCommandPaletteOpen] = React.useState(false);

    const fetchNotifications = React.useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            const data = Array.isArray(res.data) ? res.data : [];
            setNotifications(data);
            setUnreadCount(data.filter(notification => !notification.is_read).length);
        } catch (_) {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);

    React.useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setBellOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setCommandPaletteOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const recentNotifications = React.useMemo(() => {
        const source = notifications.length > 0 ? notifications : FALLBACK_NOTIFICATIONS;
        return source.slice(0, 5);
    }, [notifications]);

    const handleMarkRead = async (id) => {
        if (String(id).startsWith('fallback-')) {
            return;
        }

        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(notification => (
                notification.id === id ? { ...notification, is_read: true } : notification
            )));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (_) {
            // Keep UI responsive if the backend call fails.
        }
    };

    const handleMarkAllRead = async () => {
        if (notifications.length === 0) {
            return;
        }

        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
            setUnreadCount(0);
        } catch (_) {
            // Keep UI responsive if the backend call fails.
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            await handleMarkRead(notification.id);
        }

        setBellOpen(false);
        navigate(resolveNotificationPath(notification));
    };

    const avatarUrl = toServerUrl(user?.avatar);

    return (
        <>
            <header className="fixed top-0 left-64 right-0 z-40 flex flex-col shadow-sm">
                <div className="h-7 bg-slate-900 flex items-center overflow-hidden px-8 space-x-8 border-b border-white/5">
                    <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Market Feed</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
                        <TickerItem label="MDF 18mm" value="UGX 159,375" change="+1.2%" isUp />
                        <TickerItem label="Timber (Oak)" value="UGX 3,150,000/m3" change="-0.5%" />
                        <TickerItem label="Fuel (Diesel)" value="UGX 4,650/L" change="+0.8%" isUp />
                        <TickerItem label="USD/UGX" value="3,750" change="-2.1%" />
                        <TickerItem label="EUR/UGX" value="4,080" change="+0.4%" isUp />
                        <TickerItem label="Steel Sheet" value="UGX 4,200,000/t" change="+1.5%" isUp />
                    </div>
                </div>

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
                                placeholder="Search Command... (Ctrl+K)"
                                onFocus={() => setCommandPaletteOpen(true)}
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
                            <div className="relative" ref={bellRef}>
                                <button
                                    type="button"
                                    onClick={() => setBellOpen(prev => !prev)}
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
                                                    type="button"
                                                    onClick={handleMarkAllRead}
                                                    className="flex items-center space-x-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    <CheckCheck size={12} />
                                                    <span>Mark all read</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="max-h-80 overflow-y-auto">
                                            {recentNotifications.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                                                    <Bell size={28} />
                                                    <p className="text-xs font-semibold mt-2">No notifications yet</p>
                                                </div>
                                            ) : (
                                                recentNotifications.map(notification => {
                                                    const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.ORDER_CREATED;
                                                    const Icon = config.icon;
                                                    const timestamp = new Date(notification.created_at);
                                                    const timeLabel = timestamp.toLocaleDateString() === new Date().toLocaleDateString()
                                                        ? timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });

                                                    return (
                                                        <div
                                                            key={notification.id}
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            onKeyDown={(event) => {
                                                                if (event.key === 'Enter' || event.key === ' ') {
                                                                    event.preventDefault();
                                                                    handleNotificationClick(notification);
                                                                }
                                                            }}
                                                            className={`flex items-start space-x-3 px-4 py-3 border-b border-slate-50 transition-colors text-left cursor-pointer hover:bg-slate-50 focus:outline-none focus:bg-slate-50 ${
                                                                notification.is_read ? 'opacity-70' : 'bg-blue-50/30'
                                                            }`}
                                                        >
                                                            <div className={`w-8 h-8 rounded-lg ${config.bg} ${config.border} border flex items-center justify-center shrink-0 mt-0.5`}>
                                                                <Icon size={14} className={config.color} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-bold text-slate-800 leading-tight truncate">{notification.title}</p>
                                                                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">{notification.message}</p>
                                                                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{timeLabel}</p>
                                                            </div>
                                                            {!notification.is_read && !String(notification.id).startsWith('fallback-') && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        handleMarkRead(notification.id);
                                                                    }}
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

                                        {recentNotifications.length > 0 && (
                                            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                                    Showing latest {recentNotifications.length} notifications
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
        </>
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
