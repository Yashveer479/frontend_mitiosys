import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ApprovalEntry = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    useEffect(() => {
        const qs = location.search || '';
        // Always clear session so email links cannot continue under an existing account.
        localStorage.removeItem('token');
        localStorage.removeItem('sessionId');

        const nextPath = `/purchase-requests/${id}?forceLogin=1${qs ? `&${qs.substring(1)}` : ''}`;
        navigate(`/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
    }, [id, location.search, navigate]);

    return <div className="py-20 text-center text-slate-500 font-bold">Redirecting to secure login...</div>;
};

export default ApprovalEntry;
