import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX } from 'lucide-react';

/**
 * RoleGuard — wraps a page and only renders it if the current user
 * has one of the allowed roles. Otherwise renders a clean 403 page.
 *
 * Usage:
 *   <RoleGuard roles={['admin']}>
 *     <UserManagement />
 *   </RoleGuard>
 *
 *   <RoleGuard roles={['admin', 'manager']}>
 *     <Reports />
 *   </RoleGuard>
 */
const RoleGuard = ({ roles = [], children, redirect = false }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    const hasRole = roles.length === 0 || roles.includes(user.role);

    if (!hasRole) {
        if (redirect) return <Navigate to="/" replace />;
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-8">
                <div className="mb-6 w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
                    <ShieldX size={28} className="text-rose-500" />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-2">Access Restricted</h2>
                <p className="text-sm text-slate-500 max-w-sm">
                    You don't have permission to view this page.
                    Contact your system administrator if you believe this is an error.
                </p>
                <div className="mt-8 flex flex-col items-center space-y-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-[#2563EB] text-white rounded-lg font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                    >
                        Go Back
                    </button>
                    <div className="px-3 py-1.5 bg-slate-100 rounded-lg">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            Required: {roles.join(' or ')} · Your role: {user.role}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleGuard;
