import React, { useState } from 'react';
import { Send, X, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const PurchaseRequestForm = ({ onCancel, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        request_type: 'Raw Material',
        description: '',
        quantity: 1,
        priority: 'Medium',
        department: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/requests/create', formData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4">
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
                            placeholder="e.g., 500 Sheets of MDF 18mm"
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                placeholder="e.g., Production"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 transition-all"
                            />
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
