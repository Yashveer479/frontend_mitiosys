import React, { useState, useEffect } from 'react';
import {
    Mail,
    ShieldCheck,
    Check,
    X,
    Eye,
    EyeOff,
    Lock,
    ArrowLeft,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ChangeEmail = () => {
    const navigate = useNavigate();
    const { user, requestEmailChange, verifyEmailChange } = useAuth();
    const [step, setStep] = useState(1); // 1: Request, 2: Verify
    const [formData, setFormData] = useState({
        currentPassword: '',
        newEmail: '',
        otpCode: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestEmailChange(formData.currentPassword, formData.newEmail);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to request email change');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await verifyEmailChange(formData.newEmail, formData.otpCode);
            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
            <div className="w-full max-w-md">

                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-wide mb-6 group transition-colors"
                >
                    <ArrowLeft size={14} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </button>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

                    {/* Header */}
                    <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-indigo-600">
                            <Mail size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900">Email Address Update</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Two-step secure verification</p>
                    </div>

                    {success ? (
                        <div className="p-12 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 mb-2">Email Updated!</h2>
                            <p className="text-sm text-slate-500 font-medium">Your primary email has been changed to <span className="font-bold text-slate-800">{formData.newEmail}</span>.</p>
                            <p className="text-[10px] text-slate-400 mt-4 font-bold uppercase tracking-widest">Redirecting to profile...</p>
                        </div>
                    ) : (
                        <div className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-600 animate-in fade-in slide-in-from-top-1">
                                    <X size={18} className="shrink-0 mt-0.5" />
                                    <p className="text-xs font-bold">{error}</p>
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleRequest} className="space-y-5">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Current Email</p>
                                            <p className="text-sm font-black text-slate-900">{user.email}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">New Email Address</label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    required
                                                    name="newEmail"
                                                    value={formData.newEmail}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                                    placeholder="new-email@enterprise-erp.com"
                                                />
                                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">Confirm Identity (Password)</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    name="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={handleChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-300"
                                                    placeholder="••••••••"
                                                />
                                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>Send Verification Code</span>}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerify} className="space-y-5">
                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-6">
                                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Check your new inbox</p>
                                        <p className="text-xs font-medium text-blue-700">A verification code was sent to <span className="font-bold">{formData.newEmail}</span></p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide ml-1">Enter 6-Digit Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                name="otpCode"
                                                value={formData.otpCode}
                                                onChange={handleChange}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:border-indigo-500 transition-all text-center"
                                                placeholder="000000"
                                            />
                                            <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {loading ? <RefreshCw size={16} className="animate-spin" /> : <span>Verify & Update Email</span>}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
                                    >
                                        Edit Email Address
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-center mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-50">
                    Industrial OS Secure Protocol v4.2
                </p>
            </div>
        </div>
    );
};

export default ChangeEmail;
