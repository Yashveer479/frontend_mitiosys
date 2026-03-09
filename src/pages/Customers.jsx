import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    Filter,
    Download,
    Mail,
    Phone,
    MapPin,
    Hash,
    ChevronDown,
    Circle,
    X,
    Save,
    AlertCircle,
    Globe
} from 'lucide-react';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null); // null = add mode, object = edit mode
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        country: 'Uganda',
        tin: '',
        vrn: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = 'Company Name is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
        if (formData.taxId && formData.taxId.length < 5) errors.taxId = 'Tax ID must be at least 5 characters';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setCurrentCustomer(customer);
            setFormData({
                name: customer.name || '',
                contact: customer.contact || '',
                email: customer.email || '',
                phone: customer.phone || '',
                address: customer.address || '',
                taxId: customer.taxId || '',
                country: customer.country || 'Uganda',
                tin: customer.tin || '',
                vrn: customer.vrn || ''
            });
        } else {
            setCurrentCustomer(null);
            setFormData({
                name: '',
                contact: '',
                email: '',
                phone: '',
                address: '',
                taxId: '',
                country: 'Uganda',
                tin: '',
                vrn: ''
            });
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCustomer(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        try {
            if (currentCustomer) {
                // Edit
                await api.put(`/customers/${currentCustomer.id}`, formData);
            } else {
                // Add
                await api.post('/customers', formData);
            }
            await fetchCustomers();
            handleCloseModal();
        } catch (err) {
            console.error("Failed to save customer", err);
            alert("Failed to save customer. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                await api.delete(`/customers/${id}`);
                setCustomers(customers.filter(c => c.id !== id));
            } catch (err) {
                console.error("Failed to delete customer", err);
                alert("Failed to delete customer.");
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600 border-r-2 border-r-transparent"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-12">
            <div className="max-w-[1600px] mx-auto px-8 py-10 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Customer Relations</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>CRM</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Enterprise Registry</span>
                        </nav>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                        <button
                            onClick={() => handleOpenModal()}
                            className="flex items-center space-x-2 bg-blue-600 px-6 py-2.5 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Plus size={16} strokeWidth={3} />
                            <span>Add Customer</span>
                        </button>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Locate customer by name, contact person, or email..."
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                        <button className="flex items-center space-x-2 px-4 py-3 border border-slate-100 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all">
                            <Filter size={14} />
                            <span>Filters</span>
                            <ChevronDown size={14} />
                        </button>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Profile</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Intelligence</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Address</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Identity</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Lifecycle</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredCustomers.map((c) => (
                                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100 group-hover:scale-110 transition-transform">
                                                    {(c.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-none mb-1.5">{c.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.contact || 'No Contact'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                    <Mail size={12} className="text-slate-300" />
                                                    <span>{c.email || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-600">
                                                    <Phone size={12} className="text-slate-300" />
                                                    <span>{c.phone || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={12} className="text-slate-300 mt-0.5 shrink-0" />
                                                <div className="text-[11px] font-bold text-slate-600 max-w-[200px] leading-tight flex flex-col">
                                                    <span>{c.address || 'No Address Provided'}</span>
                                                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{c.country}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col space-y-1">
                                                {c.taxId && (
                                                    <div className="inline-flex items-center space-x-2 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 w-fit">
                                                        <Hash size={10} className="text-slate-300" />
                                                        <span className="text-[10px] font-mono font-black text-slate-700 uppercase tracking-tighter">{c.taxId}</span>
                                                    </div>
                                                )}
                                                {c.tin && (
                                                    <span className="text-[9px] text-slate-400 font-mono pl-1">TIN: {c.tin}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-emerald-50 text-emerald-600 border-emerald-100">
                                                <Circle size={4} className="mr-1.5 fill-current" />
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(c)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-95"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCustomers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 italic tracking-tight">No Customers Located</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Adjust your refinement parameters</p>
                        </div>
                    )}
                </div>

                {/* Add/Edit Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                                    {currentCustomer ? 'Update Customer Profile' : 'Onboard New Customer'}
                                </h3>
                                <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Name */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Company / Customer Name <span className="text-rose-500">*</span></label>
                                        <input
                                            type="text"
                                            className={`w-full bg-slate-50 border ${formErrors.name ? 'border-rose-300 ring-4 ring-rose-500/10' : 'border-slate-200'} rounded-xl px-4 py-3 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all`}
                                            placeholder="e.g. Acme Construction Ltd"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                        {formErrors.name && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.name}</p>}
                                    </div>

                                    {/* Primary Contact */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Primary Contact Person</label>
                                        <div className="relative">
                                            <Users size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder="e.g. John Doe"
                                                value={formData.contact}
                                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
                                        <div className="relative">
                                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                className={`w-full bg-slate-50 border ${formErrors.email ? 'border-rose-300' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all`}
                                                placeholder="contact@company.com"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.email && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.email}</p>}
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</label>
                                        <div className="relative">
                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                                placeholder="+256 700 000000"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Country */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Country</label>
                                        <div className="relative">
                                            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <select
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-8 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 appearance-none transition-all"
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                            >
                                                <option value="Uganda">Uganda</option>
                                                <option value="Kenya">Kenya</option>
                                                <option value="Tanzania">Tanzania</option>
                                                <option value="Rwanda">Rwanda</option>
                                                <option value="South Sudan">South Sudan</option>
                                                <option value="DR Congo">DR Congo</option>
                                            </select>
                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Physical Address</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition-all"
                                            placeholder="Plot 78, Industrial Area, Kampala"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>

                                    {/* Tax ID */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Tax ID / TIN</label>
                                        <div className="relative">
                                            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                className={`w-full bg-slate-50 border ${formErrors.taxId ? 'border-rose-300' : 'border-slate-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-mono font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all uppercase`}
                                                placeholder="TAX-12345"
                                                value={formData.taxId}
                                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                            />
                                        </div>
                                        {formErrors.taxId && <p className="text-[10px] text-rose-500 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> {formErrors.taxId}</p>}
                                    </div>

                                    {/* VRN */}
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">VAT Reg Number (VRN)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-700 focus:outline-none focus:border-blue-500 transition-all uppercase"
                                            placeholder="VRN-0000"
                                            value={formData.vrn}
                                            onChange={(e) => setFormData({ ...formData, vrn: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center space-x-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 bg-slate-100 text-slate-700 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {saving ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>{currentCustomer ? 'Update Profile' : 'Save Customer'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Customers;
