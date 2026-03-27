import React, { useState } from 'react';
import { Send, X, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { resolvePurchaseRequestModule } from './requestModuleConfig';

const APPROVAL_DEPARTMENT_OPTIONS = [
    { value: 'GM', label: 'General Manager' },
    { value: 'FINANCE_CONTROL', label: 'Finance Control Department' },
    { value: 'COMMERCIAL_MANAGER', label: 'Commercial Manager' }
];

const createEmptyItem = () => ({
    item_name: '',
    quantity: 1,
    unit: '',
    notes: ''
});

const PurchaseRequestForm = ({ onCancel, onSuccess }) => {
    const location = useLocation();
    const moduleConfig = resolvePurchaseRequestModule(location.pathname);
    const [formData, setFormData] = useState({
        title: '',
        request_type: 'Raw Material',
        description: '',
        quantity: 1,
        priority: 'Medium',
        department: moduleConfig.defaultDepartment,
        approval_department: 'GM'
    });
    const [items, setItems] = useState([createEmptyItem()]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [attachment, setAttachment] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setItems((prev) => prev.map((item, idx) => (
            idx === index ? { ...item, [field]: value } : item
        )));
    };

    const addItem = () => setItems((prev) => [...prev, createEmptyItem()]);

    const removeItem = (index) => {
        setItems((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, idx) => idx !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (attachment && attachment.type !== 'application/pdf') {
            setLoading(false);
            setError('Only PDF files are allowed.');
            return;
        }

        if (attachment && attachment.size > 10 * 1024 * 1024) {
            setLoading(false);
            setError('PDF file is too large. Maximum size is 10MB.');
            return;
        }

        const cleanedItems = items
            .map((item) => ({
                item_name: String(item.item_name || '').trim(),
                quantity: Math.max(1, parseInt(item.quantity, 10) || 1),
                unit: String(item.unit || '').trim(),
                notes: String(item.notes || '').trim()
            }))
            .filter((item) => item.item_name);

        if (cleanedItems.length === 0) {
            setLoading(false);
            setError('Please add at least one valid item.');
            return;
        }

        try {
            const payload = new FormData();
            payload.append('title', formData.title);
            payload.append('request_type', formData.request_type);
            payload.append('description', formData.description);
            payload.append('quantity', String(formData.quantity));
            payload.append('priority', formData.priority);
            payload.append('department', formData.department || moduleConfig.defaultDepartment);
            payload.append('approval_department', formData.approval_department);
            payload.append('source_section', moduleConfig.sourceSection);
            payload.append('items', JSON.stringify(cleanedItems));

            if (attachment) {
                payload.append('attachment', attachment);
            }

            await api.post(`${moduleConfig.apiBase}/create`, payload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-4">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Create New Request</h2>
                <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="font-semibold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Request Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Board Consumables for Week 2"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Request Type</label>
                            <select
                                name="request_type"
                                value={formData.request_type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            >
                                <option value="Machinery">Machinery</option>
                                <option value="Worker">Worker</option>
                                <option value="Raw Material">Raw Material</option>
                                <option value="Equipment">Equipment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</label>
                            <input
                                type="text"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Approval Department</label>
                            <select
                                name="approval_department"
                                value={formData.approval_department}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            >
                                {APPROVAL_DEPARTMENT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Items</h3>
                            <button type="button" onClick={addItem} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all">
                                <Plus size={14} />
                                Add Item
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center bg-white border border-slate-200 rounded-xl p-3">
                                    <input
                                        type="text"
                                        value={item.item_name}
                                        onChange={(e) => handleItemChange(idx, 'item_name', e.target.value)}
                                        placeholder="Item name"
                                        className="md:col-span-5 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                        placeholder="Qty"
                                        className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                                    />
                                    <input
                                        type="text"
                                        value={item.unit}
                                        onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                        placeholder="Unit"
                                        className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                                    />
                                    <input
                                        type="text"
                                        value={item.notes}
                                        onChange={(e) => handleItemChange(idx, 'notes', e.target.value)}
                                        placeholder="Notes"
                                        className="md:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeItem(idx)}
                                        className="md:col-span-1 p-2 rounded-lg text-rose-500 hover:bg-rose-50"
                                        title="Remove item"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Justification</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Detailed explanation of why this resource is needed..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all resize-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">PDF Attachment (optional)</label>
                        <input
                            type="file"
                            accept="application/pdf,.pdf"
                            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-black file:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                        />
                        <p className="mt-2 text-xs text-slate-500 font-semibold">
                            Upload one PDF document (max 10MB). It will be visible to the selected approval department.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Submitting...' : (
                            <>
                                <Send size={18} />
                                <span>Submit Request</span>
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseRequestForm;
