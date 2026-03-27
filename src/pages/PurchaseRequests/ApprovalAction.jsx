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
    const openMode = useMemo(() => String(searchParams.get('open') || '').trim().toLowerCase(), [searchParams]);
    const moduleType = useMemo(() => String(searchParams.get('module') || '').trim().toLowerCase(), [searchParams]);
    const isGeneralApproval = moduleType === 'general';
    const isUnifiedApproval = moduleType === 'unified';
    const isProductionPurchaseApproval = moduleType === 'production-pr';
    const isLaminationPurchaseApproval = moduleType === 'lamination-pr';
    const isPoRequestApproval = moduleType === 'po-request';
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
    const [selectedSupplierOptionId, setSelectedSupplierOptionId] = useState('');

    const loadPreview = useCallback(async () => {
        if (!token) {
            setError('Approval token is missing in the link.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const endpointBase = isGeneralApproval
                ? '/general-approvals'
                : isUnifiedApproval
                    ? '/unified-requests'
                    : isProductionPurchaseApproval
                        ? '/production-requests'
                        : isLaminationPurchaseApproval
                            ? '/lamination-requests'
                            : isPoRequestApproval
                                ? '/purchase-orders/requests'
                                : '/requests';
            const response = await axios.get(`${API_BASE_URL}${endpointBase}/public/preview`, {
                params: { token }
            });
            setPreview(response.data);
            setError('');
        } catch (err) {
            setError(err?.response?.data?.msg || 'This approval link is invalid or expired.');
        } finally {
            setLoading(false);
        }
    }, [token, isGeneralApproval, isUnifiedApproval, isProductionPurchaseApproval, isLaminationPurchaseApproval, isPoRequestApproval]);

    const submitAction = useCallback(async (action, { force = false } = {}) => {
        if (!token) return;

        if (!force && !preview?.canAct) {
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

        if (isPoRequestApproval && action === 'approve') {
            const hasSuppliers = Array.isArray(preview?.request?.supplierOptions) && preview.request.supplierOptions.length > 0;
            if (hasSuppliers && !String(selectedSupplierOptionId || '').trim()) {
                setError('Please select one supplier quotation before approval.');
                return;
            }
        }

        try {
            setSubmitting(true);
            setError('');
            setSuccess('');

            const endpointBase = isGeneralApproval
                ? '/general-approvals'
                : isUnifiedApproval
                    ? '/unified-requests'
                    : isProductionPurchaseApproval
                        ? '/production-requests'
                        : isLaminationPurchaseApproval
                            ? '/lamination-requests'
                            : isPoRequestApproval
                                ? '/purchase-orders/requests'
                                : '/requests';
            const response = await axios.post(`${API_BASE_URL}${endpointBase}/public/act`, {
                token,
                action,
                comment: comment.trim() || null,
                supplierOptionId: isPoRequestApproval ? (selectedSupplierOptionId || null) : null
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
    }, [comment, token, isGeneralApproval, isUnifiedApproval, isProductionPurchaseApproval, isLaminationPurchaseApproval, isPoRequestApproval, preview, selectedSupplierOptionId]);

    const attachmentUrl = token && !isPoRequestApproval
        ? `${API_BASE_URL}${isGeneralApproval
            ? '/general-approvals'
            : isUnifiedApproval
                ? '/unified-requests'
                : isProductionPurchaseApproval
                    ? '/production-requests'
                    : isLaminationPurchaseApproval
                        ? '/lamination-requests'
                        : '/requests'}/public/attachment?token=${encodeURIComponent(token)}&forwarded=1`
        : null;

    useEffect(() => {
        if (actionFromUrl === 'approve' && token && !isPoRequestApproval) {
            const endpointBase = isGeneralApproval
                ? '/general-approvals'
                : isUnifiedApproval
                    ? '/unified-requests'
                    : isProductionPurchaseApproval
                        ? '/production-requests'
                        : isLaminationPurchaseApproval
                            ? '/lamination-requests'
                            : isPoRequestApproval
                                ? '/purchase-orders/requests'
                                : '/requests';
            const quickActionValue = isUnifiedApproval ? 'APPROVED' : 'approve';
            const quickActionUrl = `${API_BASE_URL}${endpointBase}/public/quick-action?token=${encodeURIComponent(token)}&action=${quickActionValue}`;
            window.location.replace(quickActionUrl);
            return;
        }

        if ((openMode === 'pdf' || openMode === 'file') && attachmentUrl) {
            window.location.replace(attachmentUrl);
            return;
        }

        loadPreview();
    }, [actionFromUrl, token, isGeneralApproval, isUnifiedApproval, isProductionPurchaseApproval, isLaminationPurchaseApproval, isPoRequestApproval, openMode, attachmentUrl, loadPreview]);

    useEffect(() => {
        if (!preview || !actionFromUrl || autoActionDone) {
            return;
        }

        // Only approve is auto-executed from an email quick-action link.
        if (actionFromUrl !== 'approve') {
            return;
        }

        if (isPoRequestApproval) {
            return;
        }

        setAutoActionDone(true);
        submitAction(actionFromUrl, { force: true });
    }, [actionFromUrl, autoActionDone, preview, submitAction, isPoRequestApproval]);

    if (loading) {
        return <div className="min-h-screen grid place-items-center text-slate-600 font-semibold">Loading approval request...</div>;
    }

    const request = preview?.request;
    const canAct = Boolean(preview?.canAct);
    const approvalLevel = String(preview?.approvalLevel || '').toUpperCase();
    const expectedStatus = prettyStatus(preview?.expectedStatus);
    const currentStatus = prettyStatus(preview?.currentStatus || request?.status);
    const isRejectFlow = actionFromUrl === 'reject';

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                    <h1 className="text-2xl font-bold text-slate-800">{isGeneralApproval ? 'General Approval' : isUnifiedApproval ? 'Unified Request Approval' : isPoRequestApproval ? 'Purchase Order Request Approval' : 'Purchase Request Approval'}</h1>
                    <p className="text-sm text-slate-600 mt-1">Secure mail-link workflow. No login is required for this action.</p>
                </div>

                <div className="p-6 space-y-4">
                    {error && <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3">{error}</div>}
                    {success && <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-3">{success}</div>}

                    {request && (
                        <>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-slate-700">Request ID:</span> {isGeneralApproval ? `GA-${request.id}` : isUnifiedApproval ? `REQ-${request.id}` : `PR-${request.id}`}</div>
                                <div><span className="font-semibold text-slate-700">Status:</span> {prettyStatus(request.status)}</div>
                                <div><span className="font-semibold text-slate-700">Title:</span> {request.title}</div>
                                {!isGeneralApproval && !isUnifiedApproval && !isPoRequestApproval && <div><span className="font-semibold text-slate-700">Type:</span> {request.request_type}</div>}
                                {!isGeneralApproval && !isUnifiedApproval && !isPoRequestApproval && <div><span className="font-semibold text-slate-700">Quantity:</span> {request.quantity}</div>}
                                {!isGeneralApproval && !isUnifiedApproval && !isPoRequestApproval && <div><span className="font-semibold text-slate-700">Priority:</span> {request.priority || 'Medium'}</div>}
                                {isUnifiedApproval && <div><span className="font-semibold text-slate-700">Type:</span> {request.type}</div>}
                                {isUnifiedApproval && <div><span className="font-semibold text-slate-700">Amount:</span> {Number(request.invoice_amount).toLocaleString()}</div>}
                                {isGeneralApproval && <div><span className="font-semibold text-slate-700">Flow:</span> {request.first_level} {'->'} {request.second_level} {'->'} {request.third_level}</div>}
                                {isPoRequestApproval && <div><span className="font-semibold text-slate-700">Department Route:</span> {request.target_approval_department}</div>}
                                {isPoRequestApproval && <div><span className="font-semibold text-slate-700">Description:</span> {request.description || 'N/A'}</div>}
                            </div>

                            {isPoRequestApproval && actionFromUrl === 'approve' && Array.isArray(request.supplierOptions) && request.supplierOptions.length > 0 && (
                                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Select Supplier Quotation (tick one checkbox)</p>
                                    <div className="space-y-2">
                                        {request.supplierOptions.map((row) => (
                                            <label key={row.id} className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="po_supplier_option"
                                                    value={row.id}
                                                    checked={String(selectedSupplierOptionId) === String(row.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedSupplierOptionId(e.target.value);
                                                        } else {
                                                            setSelectedSupplierOptionId('');
                                                        }
                                                    }}
                                                    className="mt-1"
                                                />
                                                <span className="text-sm text-slate-700">
                                                    <span className="font-semibold">{row.supplierName || 'Supplier'}</span>
                                                    {row.notes && <span className="block text-xs text-slate-500 mt-1">Notes: {row.notes}</span>}
                                                    {row.quotePdfUrl && (
                                                        <a
                                                            href={row.quotePdfUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block text-xs text-blue-700 underline mt-1"
                                                        >
                                                            {row.quotePdfName || 'Open quotation PDF'}
                                                        </a>
                                                    )}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {request.attachment && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Attachment: <span className="font-bold">{request.attachment.original_name || 'request-file'}</span>
                                    </p>
                                    <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-2 text-sm font-semibold text-blue-700 hover:text-blue-800 underline"
                                    >
                                        Open file
                                    </a>
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
