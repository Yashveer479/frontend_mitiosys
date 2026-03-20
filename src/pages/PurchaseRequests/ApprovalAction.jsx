import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../../services/urlConfig';

const actionLabel = {
    approve: 'Approve',
    reject: 'Reject'
};

const prettyStatus = (value) => String(value || '').replaceAll('_', ' ').trim();

const ApprovalAction = () => {
    const [searchParams] = useSearchParams();
    const token = useMemo(() => String(searchParams.get('token') || '').trim(), [searchParams]);
    const view = useMemo(() => String(searchParams.get('view') || '').trim().toLowerCase(), [searchParams]);
    const actionFromUrl = useMemo(() => {
        const value = String(searchParams.get('action') || '').trim().toLowerCase();
        return ['approve', 'reject'].includes(value) ? value : '';
    }, [searchParams]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [autoActionDone, setAutoActionDone] = useState(false);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [preview, setPreview] = useState(null);

    const loadPreview = useCallback(async () => {
        if (!token) {
            setError('Approval token is missing in the link.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/requests/public/preview`, {
                params: { token }
            });
            setPreview(response.data);
            setError('');
        } catch (err) {
            setError(err?.response?.data?.msg || 'This approval link is invalid or expired.');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const submitAction = useCallback(async (action) => {
        if (!token) return;

        if (!preview?.canAct) {
            const level = String(preview?.approvalLevel || '').toUpperCase();
            const expected = prettyStatus(preview?.expectedStatus);
            const current = prettyStatus(preview?.currentStatus || preview?.request?.status);
            setError(`This link cannot act now. It was issued for ${level || 'an approver'} at ${expected || 'a previous'} stage, but the request is at ${current || 'another'} stage.`);
            return;
        }

        if (action === 'reject' && !comment.trim()) {
            setError('Rejection reason is required. Please add a comment before rejecting.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            const response = await axios.post(`${API_BASE_URL}/requests/public/act`, {
                token,
                action,
                comment: comment.trim() || null
            });

            setPreview((prev) => ({
                ...prev,
                request: response.data.request,
                canAct: false,
                currentStatus: response.data.request?.status
            }));
            setSuccess(response.data?.msg || `Request ${action}d successfully`);
        } catch (err) {
            setError(err?.response?.data?.msg || 'Unable to process the action.');
        } finally {
            setSubmitting(false);
        }
    }, [comment, token]);

    useEffect(() => {
        loadPreview();
    }, [loadPreview]);

    useEffect(() => {
        if (!preview || !actionFromUrl || autoActionDone || !preview.canAct) {
            return;
        }

        // Only approve is auto-executed from an email quick-action link.
        if (actionFromUrl !== 'approve') {
            return;
        }

        setAutoActionDone(true);
        submitAction(actionFromUrl);
    }, [actionFromUrl, autoActionDone, preview, submitAction]);

    if (loading) {
        return <div className="min-h-screen grid place-items-center text-slate-600 font-semibold">Loading approval request...</div>;
    }

    const request = preview?.request;
    const canAct = Boolean(preview?.canAct);
    const approvalLevel = String(preview?.approvalLevel || '').toUpperCase();
    const expectedStatus = prettyStatus(preview?.expectedStatus);
    const currentStatus = prettyStatus(preview?.currentStatus || request?.status);
    const attachmentUrl = token ? `${API_BASE_URL}/requests/public/attachment?token=${encodeURIComponent(token)}` : null;
    const isRejectFlow = actionFromUrl === 'reject';
    const showAttachmentPreview = Boolean(attachmentUrl && request?.attachment && (view === 'attachment' || isRejectFlow || !actionFromUrl));

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h1 className="text-2xl font-bold text-slate-800">Purchase Request Approval</h1>
                    <p className="text-sm text-slate-600 mt-1">Secure mail-link workflow. No login is required for this action.</p>
                </div>

                <div className="p-6 space-y-4">
                    {error && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3">{error}</div>}
                    {success && <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-3">{success}</div>}

                    {request && (
                        <>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-slate-700">Request ID:</span> PR-{request.id}</div>
                                <div><span className="font-semibold text-slate-700">Status:</span> {prettyStatus(request.status)}</div>
                                <div><span className="font-semibold text-slate-700">Title:</span> {request.title}</div>
                                <div><span className="font-semibold text-slate-700">Type:</span> {request.request_type}</div>
                                <div><span className="font-semibold text-slate-700">Quantity:</span> {request.quantity}</div>
                                <div><span className="font-semibold text-slate-700">Priority:</span> {request.priority || 'Medium'}</div>
                            </div>

                            {request.attachment && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Attached PDF: <span className="font-bold">{request.attachment.original_name || 'request.pdf'}</span>
                                    </p>
                                    <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800 underline"
                                    >
                                        Open PDF document
                                    </a>
                                    {showAttachmentPreview && (
                                        <div className="mt-3 rounded-lg border border-slate-200 overflow-hidden bg-white">
                                            <iframe
                                                title="Purchase request attachment preview"
                                                src={attachmentUrl}
                                                className="w-full h-[70vh]"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    {isRejectFlow ? 'Rejection reason (required)' : 'Comment (optional)'}
                                </label>
                                <textarea
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={submitting}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    placeholder={isRejectFlow ? 'Add a clear reason for rejection' : 'Add a note for audit trail'}
                                />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {!isRejectFlow && (
                                    <button
                                        type="button"
                                        onClick={() => submitAction('approve')}
                                        disabled={submitting}
                                        className={`px-4 py-2 rounded-lg font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 ${!canAct ? 'opacity-60' : ''}`}
                                    >
                                        {submitting && actionFromUrl === 'approve' ? 'Processing...' : actionLabel.approve}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => submitAction('reject')}
                                    disabled={submitting}
                                    className={`px-4 py-2 rounded-lg font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 ${!canAct ? 'opacity-60' : ''}`}
                                >
                                    {submitting && actionFromUrl === 'reject' ? 'Processing...' : actionLabel.reject}
                                </button>
                            </div>

                            {!canAct && (
                                <div className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                    <p className="font-semibold text-slate-700 mb-1">This link cannot be used now.</p>
                                    <p>
                                        This token was generated for {approvalLevel || 'an approver'} at {expectedStatus || 'a previous'} stage,
                                        but the request is currently at {currentStatus || 'another'} stage.
                                    </p>
                                    <p className="mt-1">Use the latest email sent to the current approver (PM {'->'} GM {'->'} DM).</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalAction;
