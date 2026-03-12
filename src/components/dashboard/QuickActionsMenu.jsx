import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

const QuickActionsMenu = ({ actions, navigate }) => {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleActionClick = (path) => {
        navigate(path);
        setOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
                <Sparkles size={14} />
                <span>Quick Actions</span>
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-14 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/30">
                    <div className="px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Workflow Shortcuts</p>
                    </div>
                    <div className="space-y-1">
                        {actions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <button
                                    key={action.label}
                                    type="button"
                                    onClick={() => handleActionClick(action.path)}
                                    className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-slate-50"
                                >
                                    <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                                        <Icon size={14} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800">{action.label}</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{action.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActionsMenu;