import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../../services/urlConfig';

const ApprovalEntry = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [error, setError] = useState('');

    useEffect(() => {
        const exchangeLegacyLink = async () => {
            const params = new URLSearchParams(location.search || '');
            const approverEmail = String(params.get('approverEmail') || '').trim();
            const action = String(params.get('action') || '').trim().toLowerCase();

            if (!id || !approverEmail) {
                setError('Invalid approval link. Missing approver details.');
                return;
            }

            try {
                const response = await axios.get(`${API_BASE_URL}/requests/public/legacy-token`, {
                    params: {
                        requestId: id,
                        approverEmail
                    }
                });

                const token = response?.data?.token;
                if (!token) {
                    setError('Unable to generate approval token for this link.');
                    return;
                }

                const actionQuery = ['approve', 'reject'].includes(action) ? `&action=${action}` : '';
                navigate(`/approval-action?token=${encodeURIComponent(token)}${actionQuery}`, { replace: true });
            } catch (err) {
                setError(err?.response?.data?.msg || 'This approval link is invalid or expired.');
            }
        };

        exchangeLegacyLink();
    }, [id, location.search, navigate]);

    return (
        <div className="py-20 text-center">
            {!error && <div className="text-slate-500 font-bold">Preparing secure approval action...</div>}
            {error && <div className="text-rose-600 font-bold">{error}</div>}
        </div>
    );
};

export default ApprovalEntry;
