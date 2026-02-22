import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import loginBg from '../assets/login-bg.jpg';
import mitioLogo from '../assets/logo.png';

const Login = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isSignUp) {
                await register(name, email, password);
            } else {
                await login(email, password);
            }
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.msg || 'Access Denied: Invalid Credentials');
            setIsLoading(false);
        }
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
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
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
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            {!isSignUp && (
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-blue-500/20 cursor-pointer" />
                                    <span className="text-xs font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                                </label>
                            )}
                            {!isSignUp && (
                                <a href="#" className="text-xs font-bold text-[#2563EB] hover:underline">Forgot password?</a>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 mt-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Secure Login'}</span>
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
