import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/auth/me');
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        localStorage.setItem('token', res.data.token);
        setUser({ token: res.data.token });
        return res.data;
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            if (res.data.sessionId) localStorage.setItem('sessionId', res.data.sessionId);
            const userRes = await api.get('/auth/me');
            setUser(userRes.data);
        }
        return res.data;
    };

    const requestOtp = async (email) => {
        return await api.post('/auth/request-otp', { email });
    };

    const verifyOtp = async (email, otpCode) => {
        const res = await api.post('/auth/verify-otp', { email, otpCode });
        localStorage.setItem('token', res.data.token);
        if (res.data.sessionId) localStorage.setItem('sessionId', res.data.sessionId);
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (_) { /* best effort */ }
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');
        setUser(null);
    };

    const requestEmailChange = async (currentPassword, newEmail) => {
        return await api.post('/auth/request-email-change', { currentPassword, newEmail });
    };

    const verifyEmailChange = async (newEmail, otpCode) => {
        const res = await api.post('/auth/verify-email-change', { newEmail, otpCode });
        setUser(prev => ({ ...prev, email: res.data.email }));
        return res.data;
    };

    const toggle2FA = async () => {
        const res = await api.put('/auth/2fa');
        setUser(prev => ({ ...prev, twoFactorEnabled: res.data.twoFactorEnabled }));
        return res.data;
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, requestOtp, verifyOtp, updateUser, requestEmailChange, verifyEmailChange, toggle2FA }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
