import React from 'react';
import { ExternalLink } from 'lucide-react';

const FooterNavigation = ({ title, links, navigate }) => (
    <div className="space-y-4">
        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h5>
        <div className="flex flex-col space-y-2.5">
            {links.map((link) => (
                <button
                    key={link.label}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="group flex items-center space-x-1.5 text-left text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-all duration-300 tracking-wide"
                >
                    <span className="relative overflow-hidden">
                        {link.label}
                        <span className="absolute bottom-0 left-0 h-px w-full -translate-x-full bg-blue-600 transition-transform duration-300 group-hover:translate-x-0"></span>
                    </span>
                    {link.isNew && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-black">NEW</span>}
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
        </div>
    </div>
);

export default FooterNavigation;