import React, { useState, useEffect } from 'react';
import {
    KeyRound,
    ShieldCheck,
    Check,
    X,
    Eye,
    EyeOff,
    Lock,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [validations, setValidations] = useState({
        length: false,
        number: false,
        symbol: false,
        match: false
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const { newPassword, confirmPassword } = formData;
        setValidations({
            length: newPassword.length >= 8,
            number: /\d/.test(newPassword),
            symbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
            complexity: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
            match: newPassword && newPassword === confirmPassword
        });
    }, [formData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const isFormValid = Object.values(validations).every(Boolean) && formData.currentPassword.length > 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        try {
            const api = (await import('../services/api')).default;
            await api.put('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            setLoading(false);
            setSuccess(true);
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (err) {
            setLoading(false);
            alert(err.response?.data?.msg || 'Failed to update password');
        }
    };

    const toggleShow = (field) => {
        setShowPassword({ ...showPassword, [field]: !showPassword[field] });
    };

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
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-blue-600">
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-xl font-black text-slate-900">Secure Password Update</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">Protect your account</p>
                    </div>

                    {success ? (
                        <div className="p-12 text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                <Check size={32} strokeWidth={3} />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 mb-2">Password Updated!</h2>
                            <p className="text-sm text-slate-500 font-medium">Your account is now secure with your new credentials.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-8 space-y-5">

                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.current ? "text" : "password"}
                                        name="currentPassword"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                    />
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('current')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.new ? "text" : "password"}
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-300 ${Object.values(validations).every(Boolean) ? 'border-emerald-200 focus:border-emerald-500' : 'border-slate-200 focus:border-blue-500'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('new')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Validation Indicators */}
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <ValidationItem valid={validations.length} label="8+ Characters" />
                                    <ValidationItem valid={validations.number} label="Number (0-9)" />
                                    <ValidationItem valid={validations.symbol} label="Symbol (!@#)" />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-3 text-sm font-bold text-slate-900 focus:outline-none transition-all placeholder:text-slate-300 ${validations.match && formData.confirmPassword ? 'border-emerald-200 focus:border-emerald-500' : 'border-slate-200 focus:border-blue-500'
                                            }`}
                                        placeholder="••••••••"
                                    />
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    {validations.match && formData.confirmPassword && (
                                        <div className="absolute right-10 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <Check size={16} />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => toggleShow('confirm')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {!validations.match && formData.confirmPassword && (
                                    <p className="text-[10px] font-bold text-rose-500 flex items-center">
                                        <X size={10} className="mr-1" /> Passwords do not match
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={!isFormValid || loading}
                                className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

const ValidationItem = ({ valid, label }) => (
    <div className={`flex items-center space-x-1.5 text-[10px] font-bold transition-colors ${valid ? 'text-emerald-500' : 'text-slate-400'}`}>
        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${valid ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-slate-300'}`}>
            {valid && <Check size={8} strokeWidth={4} />}
        </div>
        <span>{label}</span>
    </div>
);

export default ChangePassword;
