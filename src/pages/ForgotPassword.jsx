import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft, Eye, EyeOff, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import loginBg from '../assets/login-bg.jpg';
import mitioLogo from '../assets/logo.png';

const OTP_COOLDOWN = 60;

const STEPS = { EMAIL: 'email', OTP: 'otp', PASSWORD: 'password', DONE: 'done' };

const ForgotPassword = () => {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);
    const otpRef = useRef(null);
    const navigate = useNavigate();

    const startCooldown = () => {
        setCooldown(OTP_COOLDOWN);
        clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => clearInterval(cooldownRef.current), []);
    useEffect(() => { if (step === STEPS.OTP && otpRef.current) otpRef.current.focus(); }, [step]);

    // Step 1: Send OTP
    const handleRequestReset = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(STEPS.OTP);
            startCooldown();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            // Pre-validate OTP by attempting reset with a placeholder (we'll do it in one flow at step 3)
            // Store OTP and advance to step 3
            setStep(STEPS.PASSWORD);
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Invalid code.');
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (newPassword !== confirmPassword) {
            setErrorMsg('Passwords do not match.');
            return;
        }
        setIsLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otpCode, newPassword });
            setStep(STEPS.DONE);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Reset failed.';
            const code = err.response?.data?.code;
            setErrorMsg(msg);
            // If OTP was invalid/expired/locked, send back to OTP step
            if (code === 'EXPIRED' || code === 'LOCKED') {
                setOtpCode('');
                setStep(STEPS.OTP);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setErrorMsg('');
        setOtpCode('');
        try {
            await api.post('/auth/forgot-password', { email });
            startCooldown();
        } catch (err) {
            setErrorMsg(err.response?.data?.msg || 'Failed to resend code.');
        }
    };

    const stepTitles = {
        [STEPS.EMAIL]: { title: 'Reset Password', sub: 'Enter your registered email address' },
        [STEPS.OTP]: { title: 'Enter Reset Code', sub: `A 6-digit code was sent to ${email}` },
        [STEPS.PASSWORD]: { title: 'Set New Password', sub: 'Choose a strong new password' },
        [STEPS.DONE]: { title: 'Password Reset!', sub: 'You can now log in with your new password' },
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-6 font-sans antialiased text-slate-900 bg-slate-950 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40" style={{ backgroundImage: `url(${loginBg})` }} />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/80 to-blue-900/20" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 inline-block shadow-2xl">
                        <img src={mitioLogo} alt="Mitiosys Logo" className="h-12 w-auto object-contain" />
                    </div>
                </div>

                <div className="bg-white rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 md:p-10 border border-slate-200/50">
                    {/* Step Progress */}
                    {step !== STEPS.DONE && (
                        <div className="flex items-center justify-center mb-6 space-x-1.5">
                            {[STEPS.EMAIL, STEPS.OTP, STEPS.PASSWORD].map((s, i) => (
                                <React.Fragment key={s}>
                                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'bg-blue-600 w-6' :
                                            [STEPS.OTP, STEPS.PASSWORD].indexOf(step) > i ? 'bg-emerald-500' : 'bg-slate-200'
                                        }`} />
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{stepTitles[step].title}</h1>
                        <p className="text-slate-500 text-xs mt-1.5 font-medium">{stepTitles[step].sub}</p>
                    </div>

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="mb-5 flex items-start space-x-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-xs font-bold">
                            <AlertCircle size={15} className="shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* ── Step 1: Email ── */}
                    {step === STEPS.EMAIL && (
                        <form onSubmit={handleRequestReset} className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="email" required autoFocus
                                        placeholder="admin@enterprise-erp.com"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading}
                                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Send Reset Code</span><ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: OTP ── */}
                    {step === STEPS.OTP && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5">
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">6-Digit Reset Code</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            ref={otpRef}
                                            type="text" required maxLength={6} inputMode="numeric" autoComplete="one-time-code"
                                            placeholder="000000"
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                            value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[10px] font-bold text-blue-600">Check your email for the code.</p>
                                    <button type="button" onClick={handleResend} disabled={cooldown > 0}
                                        className="flex items-center space-x-1 text-[10px] font-black text-slate-400 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors">
                                        <RefreshCw size={10} className={cooldown > 0 ? 'animate-spin' : ''} />
                                        <span>{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}</span>
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading || otpCode.length !== 6}
                                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Continue</span><ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    {/* ── Step 3: New Password ── */}
                    {step === STEPS.PASSWORD && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'} required autoFocus minLength={8}
                                            placeholder="Min 8 characters"
                                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] transition-all"
                                            value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'} required
                                            placeholder="Repeat password"
                                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${confirmPassword && confirmPassword !== newPassword ? 'border-rose-300 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20 focus:border-[#2563EB]'
                                                }`}
                                            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <button type="submit" disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2">
                                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Reset Password</span><ArrowRight size={18} /></>}
                            </button>
                        </form>
                    )}

                    {/* ── Step 4: Done ── */}
                    {step === STEPS.DONE && (
                        <div className="text-center space-y-5">
                            <div className="flex justify-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 size={32} className="text-emerald-500" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">Your password has been reset successfully. All existing sessions have been signed out.</p>
                            <button onClick={() => navigate('/login')}
                                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2">
                                <span>Back to Login</span><ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {step !== STEPS.DONE && (
                        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                            <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-[#2563EB] transition-colors">
                                <ArrowLeft size={14} />
                                <span>Back to Login</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
