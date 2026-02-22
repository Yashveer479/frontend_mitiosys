import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Search, Bell, User, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Header = () => {
    const { user } = useAuth();
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const avatarUrl = user?.avatar ? `${import.meta.env.VITE_SERVER_URL}${user.avatar}` : null;

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
                        <button className="relative p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
                            <Bell size={18} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white ring-2 ring-rose-500/20 group-hover:animate-ping"></span>
                        </button>

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
