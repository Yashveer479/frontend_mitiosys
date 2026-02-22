import React, { useState, useEffect } from 'react';
import { ExternalLink, Globe, Shield, Terminal, Clock, Zap } from 'lucide-react';
import mitioLogo from '../assets/logo.png';

const Footer = () => {
    const [settings, setSettings] = useState({
        company_name: 'Mitiosys Ltd',
        application_version: '2.4.0 (Build 8921)',
        support_email: 'support@mitiosys.com'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const api = (await import('../services/api')).default;
                const res = await api.get('/settings');
                if (res.data) {
                    setSettings(prev => ({
                        ...prev,
                        company_name: res.data.company_name || prev.company_name,
                        application_version: res.data.application_version ? `ERP v${res.data.application_version}` : prev.application_version,
                        support_email: res.data.support_email || prev.support_email
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch footer settings:', err);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="w-full bg-[#F1F5F9] border-t border-slate-200 py-10 px-12 ml-64 max-w-[calc(100%-16rem)] mt-auto relative overflow-hidden">
            {/* Subtle Top Blue Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

            <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">

                {/* Brand & Tagline Section */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center space-x-3">
                        <img src={mitioLogo} alt="Mitiosys Logo" className="h-7 w-auto object-contain" />
                        <div className="h-6 w-px bg-slate-200"></div>
                        <span className="text-[14px] font-black text-slate-800 tracking-tight uppercase">{settings.company_name}</span>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-[280px] uppercase tracking-[0.15em]">
                        Advancing Industrial Intelligence through Seamless Digital Integration
                    </p>
                    <div className="pt-4 flex items-center space-x-4">
                        <SocialIcon icon={Globe} />
                        <SocialIcon icon={Shield} />
                        <SocialIcon icon={Terminal} />
                    </div>
                </div>

                {/* Operations Center (Clocks) */}
                <div className="lg:col-span-3 space-y-6">
                    <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center space-x-2">
                        <Clock size={12} className="text-blue-600" />
                        <span>Operations Center</span>
                    </h5>
                    <div className="grid grid-cols-1 gap-4">
                        <ClockItem city="KAMPALA" tz="Africa/Kampala" />
                        <ClockItem city="NEW DELHI" tz="Asia/Kolkata" />
                        <ClockItem city="LONDON" tz="Europe/London" />
                    </div>
                </div>

                {/* Navigation Links Grid */}
                <div className="lg:col-span-3 grid grid-cols-2 gap-8">
                    <FooterColumn title="Platform">
                        <FooterLink label="Documentation" />
                        <FooterLink label="System Status" isNew />
                        <FooterLink label="Developer API" />
                    </FooterColumn>
                    <FooterColumn title="Information">
                        <FooterLink label="Privacy Policy" />
                        <FooterLink label="Terms of Service" />
                        <FooterLink label="Security Audit" />
                    </FooterColumn>
                </div>

                {/* Intelligence Bar Section */}
                <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-white/5 space-y-5 shadow-2xl">
                    <h4 className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2 text-center">System Engine</h4>
                    <div className="space-y-4">
                        <StatusIndicator label="API" status="UP" color="bg-emerald-500" />
                        <StatusIndicator label="DB" status="SAFE" color="bg-blue-500" />
                        <StatusIndicator label="CLOUD" status="SYNC" color="bg-indigo-500" />
                    </div>
                </div>
            </div>

            {/* Bottom Minimal Footer Bar */}
            <div className="max-w-[1400px] mx-auto pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">

                {/* Left: Company & Copyright */}
                <div className="flex items-center space-x-4">
                    <span className="text-xs font-bold text-slate-500">
                        &copy; {new Date().getFullYear()} <span className="text-slate-700">{settings.company_name}</span>. All rights reserved.
                    </span>
                </div>

                {/* Center: Version Info */}
                <div className="hidden md:block">
                    <span className="px-2.5 py-1 rounded-md bg-slate-200/50 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        {settings.application_version}
                    </span>
                </div>

                {/* Right: Links */}
                <div className="flex items-center space-x-6">
                    <a href={`mailto:${settings.support_email}`} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center space-x-1">
                        <span>Support Center</span>
                        <ExternalLink size={10} />
                    </a>
                    <a href="#" className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors">
                        Privacy Policy
                    </a>
                </div>

            </div>
        </footer>
    );
};

const ClockItem = ({ city, tz }) => {
    const [time, setTime] = useState('--:--:--');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [tz]);

    return (
        <div className="flex items-center justify-between group">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors uppercase">{city}</span>
            <span className="text-xs font-mono font-black text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-100 shadow-inner group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">{time}</span>
        </div>
    );
};

const FooterColumn = ({ title, children }) => (
    <div className="space-y-4">
        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">{title}</h5>
        <div className="flex flex-col space-y-2.5">
            {children}
        </div>
    </div>
);

const FooterLink = ({ label, isNew }) => (
    <a href="#" className="group flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-all duration-300 tracking-wide">
        <span className="relative overflow-hidden">
            {label}
            <span className="absolute bottom-0 left-0 w-full h-px bg-blue-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        </span>
        {isNew && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded font-black">NEW</span>}
        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
);

const SocialIcon = ({ icon: Icon }) => (
    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-blue-600 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all active:scale-95">
        <Icon size={14} />
    </button>
);

const StatusIndicator = ({ label, status, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-[9px] font-black text-white/40 tracking-widest uppercase">{label}</span>
        <div className="flex items-center space-x-2">
            <span className="text-[9px] font-black text-white">{status}</span>
            <div className={`w-1.5 h-1.5 rounded-full ${color} animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.3)] shadow-${color}`}></div>
        </div>
    </div>
);

export default Footer;
