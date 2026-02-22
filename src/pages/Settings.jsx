import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Save,
    Building2,
    MapPin,
    Percent,
    Warehouse as WarehouseIcon,
    RefreshCw,
    Globe,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import api from '../services/api';

const Settings = () => {
    const [settings, setSettings] = useState({
        company_name: '',
        address: '',
        tax_rate: 18.0,
        default_warehouse: '',
        currency: 'UGX',
        application_version: '2.4.0',
        support_email: ''
    });
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
        fetchWarehouses();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (err) {
            console.error('Error fetching settings:', err);
            setMessage({ type: 'error', text: 'Failed to load settings' });
        } finally {
            setLoading(false);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouses');
            setWarehouses(res.data);
        } catch (err) {
            console.error('Error fetching warehouses:', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/settings', settings);
            setMessage({ type: 'success', text: 'Settings updated successfully' });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (err) {
            console.error('Error saving settings:', err);
            setMessage({ type: 'error', text: err.response?.data?.msg || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 underline decoration-blue-500/30 decoration-4 underline-offset-8">System Configuration</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                            <span>Admin</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600 font-black">Global Preferences</span>
                        </nav>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-xs font-black uppercase tracking-wider">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Company Identity Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Building2 size={20} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Company Identity</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        value={settings.company_name}
                                        onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                        placeholder="MDF Management System"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Currency Code</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="text"
                                        value={settings.currency}
                                        onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none"
                                        placeholder="UGX"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Application Version</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                        <span className="text-xs font-bold">v</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={settings.application_version}
                                        onChange={(e) => setSettings({ ...settings, application_version: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none"
                                        placeholder="1.0.0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">@</div>
                                    <input
                                        type="email"
                                        value={settings.support_email}
                                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none"
                                        placeholder="support@company.com"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
                                    <textarea
                                        rows="3"
                                        value={settings.address}
                                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none resize-none"
                                        placeholder="Kampala Industrial Area, Plot 45..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Defaults Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center space-x-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                <SettingsIcon size={20} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Operational Defaults</h2>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Tax Rate (%)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={settings.tax_rate}
                                        onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Entry Warehouse</label>
                                <div className="relative">
                                    <WarehouseIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    <select
                                        value={settings.default_warehouse}
                                        onChange={(e) => setSettings({ ...settings, default_warehouse: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all outline-none appearance-none"
                                    >
                                        <option value="">Select Primary Warehouse</option>
                                        {warehouses.map(w => (
                                            <option key={w.id} value={w.id}>{w.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-3 bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            {saving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            <span>Commit Changes</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
