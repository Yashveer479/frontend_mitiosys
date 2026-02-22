import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, User, AlertCircle, RefreshCw } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';
import mitioLogo from '../assets/logo.png';

const OTP_COOLDOWN = 60; // seconds

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otpMode, setOtpMode] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [cooldown, setCooldown] = useState(0); // seconds left before resend allowed
    const { login, register, requestOtp, verifyOtp } = useAuth();
    const navigate = useNavigate();
    const otpInputRef = useRef(null);
    const cooldownRef = useRef(null);

    // Start / manage resend cooldown timer
    const startCooldown = () => {
        setCooldown(OTP_COOLDOWN);
        clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => clearInterval(cooldownRef.current), []);

    // Auto-focus OTP input when it appears
    useEffect(() => {
        if (otpSent && otpInputRef.current) {
            otpInputRef.current.focus();
        }
    }, [otpSent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            if (isSignUp) {
                await register(name, email, password);
                navigate('/');
            } else if (otpMode) {
                if (otpSent) {
                    await verifyOtp(email, otpCode);
                    navigate('/');
                } else {
                    await requestOtp(email);
                    setOtpSent(true);
                    startCooldown();
                    setIsLoading(false);
                }
            } else {
                const res = await login(email, password);
                if (res.mfaRequired) {
                    setOtpMode(true);
                    setOtpSent(true);
                    startCooldown();
                    setIsLoading(false);
                    return;
                }
                navigate('/');
            }
        } catch (err) {
            const msg = err.response?.data?.msg || 'Access Denied: Invalid Credentials';
            setErrorMsg(msg);
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setErrorMsg('');
        setOtpCode('');
        try {
            await requestOtp(email);
            startCooldown();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Failed to resend OTP');
        }
    };

    const switchMode = () => {
        setOtpMode(!otpMode);
        setOtpSent(false);
        setOtpCode('');
        setErrorMsg('');
        setCooldown(0);
        clearInterval(cooldownRef.current);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 font-sans antialiased text-slate-900 bg-slate-950 overflow-hidden">
            {/* Direct Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
                style={{ backgroundImage: `url(${loginBg})` }}
            ></div>

            {/* Dark Tech Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-blue-900/20"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand Identity */}
                <div className="text-center mb-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 inline-block shadow-2xl transform hover:scale-105 transition-transform duration-500">
                        <img src={mitioLogo} alt="Mitiosys Logo" className="h-12 w-auto object-contain" />
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-10 border border-slate-200/50">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                            Digital Core Portal
                        </h1>
                        <p className="text-slate-500 text-xs mt-1.5 font-medium uppercase tracking-[0.2em]">Mitiosys Enterprise Integration</p>
                    </div>

                    {/* Inline Error Banner */}
                    {errorMsg && (
                        <div className="mb-5 flex items-start space-x-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="admin@enterprise-erp.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={otpSent}
                                    />
                                </div>
                            </div>

                            {otpMode ? (
                                otpSent && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Enter 6-Digit OTP</label>
                                            <div className="relative">
                                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    ref={otpInputRef}
                                                    type="text"
                                                    required
                                                    maxLength={6}
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    placeholder="000000"
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                                    value={otpCode}
                                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <p className="text-[10px] font-bold text-blue-600">Check your email for the verification code.</p>
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={cooldown > 0}
                                                className="flex items-center space-x-1 text-[10px] font-black text-slate-400 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <RefreshCw size={10} className={cooldown > 0 ? 'animate-spin' : ''} />
                                                <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between ml-1">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required={!otpMode}
                                            placeholder="••••••••"
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-between pt-1">
                                <button
                                    type="button"
                                    onClick={switchMode}
                                    className="text-xs font-bold text-[#2563EB] hover:underline"
                                >
                                    {otpMode ? 'Use Password Login' : 'Login with Email OTP'}
                                </button>
                                {!otpMode && (
                                    <Link to="/forgot-password" className="text-xs font-bold text-slate-400 hover:text-slate-600">Forgot password?</Link>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>
                                        {isSignUp ? 'Create Account' :
                                            otpMode ? (otpSent ? 'Verify OTP' : 'Request OTP') :
                                                'Secure Login'}
                                    </span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-xs font-bold text-slate-500 hover:text-[#2563EB] transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Contact System Admin"}
                        </button>
                    </div>
                </div>

                {/* Trust Footer */}
                <div className="mt-8 flex items-center justify-center space-x-4 opacity-100">
                    <div className="flex items-center space-x-1.5 text-blue-100/60 text-[10px] font-bold uppercase tracking-widest">
                        <Lock size={12} />
                        <span>AES-256 Encrypted</span>
                    </div>
                    <div className="w-1 h-1 bg-blue-100/20 rounded-full"></div>
                    <div className="flex items-center space-x-1.5 text-blue-100/60 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck size={12} />
                        <span>Protected by Firewall</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
