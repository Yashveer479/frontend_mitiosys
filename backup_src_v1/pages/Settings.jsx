import React, { useState } from 'react';
import {
    Building2,
    Landmark,
    Warehouse,
    Bell,
    ShieldCheck,
    Save,
    CheckCircle,
    Mail,
    Globe,
    Phone,
    MapPin
} from 'lucide-react';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('company');
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    // Mock State for Forms
    const [company, setCompany] = useState({
        name: 'Mitiosys Ltd',
        email: 'info@mitiosys.com',
        phone: '+256 700 000 000',
        address: 'Plot 78B, Industrial Area, Kampala',
        website: 'www.mitiosys.com',
        registrationNumber: '800200100'
    });

    const [tax, setTax] = useState({
        tin: '1000223344',
        vrn: '4000556677',
        vatRate: 18,
        currency: 'UGX',
        fiscalYearStart: 'January'
    });

    const [warehouse, setWarehouse] = useState({
        defaultLocation: 'Main Warehouse (Kampala)',
        lowStockThreshold: 100,
        enableAutoReorder: true
    });

    const [security, setSecurity] = useState({
        passwordExpiry: 90,
        sessionTimeout: 30,
        requireTwoFactor: false
    });

    const handleSave = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API save
        setTimeout(() => {
            setLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1500);
    };

    const tabs = [
        { id: 'company', label: 'Company Profile', icon: Building2 },
        { id: 'tax', label: 'Tax & Fiscal', icon: Landmark },
        { id: 'warehouse', label: 'Warehouse Rules', icon: Warehouse },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security Policy', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">System Configuration</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Admin</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Settings</span>
                        </nav>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex items-center space-x-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70`}
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-r-transparent"></div>
                        ) : saved ? (
                            <>
                                <CheckCircle size={16} className="text-emerald-400" />
                                <span>Changes Saved</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Vertical Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-4 rounded-xl transition-all duration-200 group text-left ${activeTab === tab.id
                                        ? 'bg-white text-blue-600 shadow-md ring-1 ring-blue-50'
                                        : 'text-slate-500 hover:bg-white hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                <span className="text-xs font-bold uppercase tracking-wide">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {/* Company Profile Tab */}
                        {activeTab === 'company' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-fade-in-up">
                                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center">
                                    <Building2 className="mr-3 text-slate-400" size={20} />
                                    Company Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Company Name</label>
                                        <input
                                            type="text"
                                            value={company.name}
                                            onChange={(e) => setCompany({ ...company, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Registration Number</label>
                                        <input
                                            type="text"
                                            value={company.registrationNumber}
                                            onChange={(e) => setCompany({ ...company, registrationNumber: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Physical Address</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={company.address}
                                                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={company.email}
                                                onChange={(e) => setCompany({ ...company, email: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone Contact</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={company.phone}
                                                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Website Domain</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={company.website}
                                                onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tax Tab */}
                        {activeTab === 'tax' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-fade-in-up">
                                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center">
                                    <Landmark className="mr-3 text-slate-400" size={20} />
                                    Tax & Fiscal Configuration
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">TIN (Tax ID Number)</label>
                                        <input
                                            type="text"
                                            value={tax.tin}
                                            onChange={(e) => setTax({ ...tax, tin: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">VRN (VAT Reg Number)</label>
                                        <input
                                            type="text"
                                            value={tax.vrn}
                                            onChange={(e) => setTax({ ...tax, vrn: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all font-mono"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Standard VAT Rate (%)</label>
                                        <input
                                            type="number"
                                            value={tax.vatRate}
                                            onChange={(e) => setTax({ ...tax, vatRate: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Base Currency</label>
                                        <select
                                            value={tax.currency}
                                            onChange={(e) => setTax({ ...tax, currency: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        >
                                            <option>UGX</option>
                                            <option>USD</option>
                                            <option>KES</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-fade-in-up">
                                <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center">
                                    <ShieldCheck className="mr-3 text-slate-400" size={20} />
                                    Security Policies
                                </h2>
                                <div className="space-y-6 max-w-lg">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Enforce 2-Factor Auth</h3>
                                            <p className="text-xs text-slate-500">Require OTP for all admin logins</p>
                                        </div>
                                        <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input
                                                type="checkbox"
                                                checked={security.requireTwoFactor}
                                                onChange={() => setSecurity({ ...security, requireTwoFactor: !security.requireTwoFactor })}
                                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-blue-600 transition-all duration-200"
                                                style={{ right: security.requireTwoFactor ? '0' : 'auto', left: security.requireTwoFactor ? 'auto' : '0' }}
                                            />
                                            <label className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ${security.requireTwoFactor ? 'bg-blue-600' : 'bg-slate-300'}`}></label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Password Expiry (Days)</label>
                                        <input
                                            type="number"
                                            value={security.passwordExpiry}
                                            onChange={(e) => setSecurity({ ...security, passwordExpiry: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Session Timeout (Minutes)</label>
                                        <input
                                            type="number"
                                            value={security.sessionTimeout}
                                            onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Placeholders for other tabs */}
                        {['warehouse', 'notifications'].includes(activeTab) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 animate-fade-in-up flex flex-col items-center justify-center min-h-[400px]">
                                <div className="p-4 bg-slate-50 rounded-full mb-4">
                                    <activeTab.icon size={32} className="text-slate-400" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-2">Configuration Module</h3>
                                <p className="text-sm text-slate-500 text-center max-w-xs">Values in this section are currently managed by the global environment configuration.</p>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;
