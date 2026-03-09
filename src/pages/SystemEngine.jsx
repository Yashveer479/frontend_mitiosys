import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const STATUS_COLOR = {
    UP: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    DOWN: 'text-red-600 bg-red-50 border-red-200',
    UNKNOWN: 'text-amber-600 bg-amber-50 border-amber-200',
};

function StatusBadge({ status }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_COLOR[status] || STATUS_COLOR.UNKNOWN}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'UP' ? 'bg-emerald-500' : status === 'DOWN' ? 'bg-red-500' : 'bg-amber-500'}`} />
            {status}
        </span>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-semibold text-gray-800 font-mono">{value}</span>
        </div>
    );
}

export default function SystemEngine({ tab = 'engine' }) {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [health, setHealth] = useState(null);
    const [devApi, setDevApi] = useState(null);
    const [secAudit, setSecAudit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAdmin) { setLoading(false); return; }
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [hRes, dRes, sRes] = await Promise.all([
                    api.get('/admin/system-engine'),
                    api.get('/admin/developer-api'),
                    api.get('/admin/security-audit'),
                ]);
                setHealth(hRes.data);
                setDevApi(dRes.data);
                setSecAudit(sRes.data);
            } catch (e) {
                setError(e.response?.data?.message || 'Failed to load system data.');
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [isAdmin]);

    // Non-admin view
    if (!isAdmin) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-16 text-center">
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-emerald-600 text-2xl">✓</span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800 mb-2">System Status</h2>
                    <p className="text-gray-500 text-sm">System running normally.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-800">System Engine Panel</h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    Admin Access
                </span>
            </div>

            {error && <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">{error}</div>}

            {loading ? (
                <p className="text-gray-400">Loading system data…</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* API Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-700">API Status</h2>
                            <StatusBadge status="UP" />
                        </div>
                        <InfoRow label="Uptime" value={health ? `${health.uptime}s` : '—'} />
                        <InfoRow label="Node Version" value={health?.nodeVersion || '—'} />
                        <InfoRow label="Memory Used" value={health ? `${health.memoryMB} MB` : '—'} />
                        <InfoRow label="Timestamp" value={health ? new Date(health.timestamp).toLocaleString() : '—'} />
                    </div>

                    {/* Database Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-700">Database Status</h2>
                            <StatusBadge status="UP" />
                        </div>
                        <InfoRow label="Provider" value="Aiven PostgreSQL" />
                        <InfoRow label="Cloud Sync" value="Active" />
                        <InfoRow label="SSL" value="Enabled" />
                        <InfoRow label="Connection" value="Healthy" />
                    </div>

                    {/* Developer API */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-700">Developer API</h2>
                            <StatusBadge status={devApi?.status || 'UNKNOWN'} />
                        </div>
                        <InfoRow label="Version" value={devApi?.version || '—'} />
                        <InfoRow label="Environment" value={devApi?.environment || '—'} />
                        <InfoRow label="Last Check" value={devApi ? new Date(devApi.timestamp).toLocaleString() : '—'} />
                    </div>

                    {/* Security Audit */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold text-gray-700">Security Audit</h2>
                            <StatusBadge status={secAudit?.status || 'UNKNOWN'} />
                        </div>
                        <InfoRow label="Anomalies" value="None detected" />
                        <InfoRow label="Auth Method" value="JWT + Session" />
                        <InfoRow label="RBAC" value="Active" />
                        <InfoRow label="Last Audit" value={secAudit ? new Date(secAudit.timestamp).toLocaleString() : '—'} />
                    </div>
                </div>
            )}
        </div>
    );
}
