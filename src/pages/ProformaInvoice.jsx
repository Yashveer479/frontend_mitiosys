import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Download,
    Send,
    FileText,
    Printer,
    MapPin,
    Mail,
    Phone,
    Globe
} from 'lucide-react';
import mitioLogo from '../assets/logo.png'; // Assuming logo exists

const ProformaInvoice = () => {
    const [loading, setLoading] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);

    // Mock Data for Display (Ideally this would come from a selected Sales Order)
    useEffect(() => {
        // Simulate fetching draft data
        setTimeout(() => {
            setInvoiceData({
                invoiceNumber: 'PI-2026-001',
                date: new Date().toISOString().split('T')[0],
                valid until: '2026-03-01',
                customer: {
                    name: 'Global Construction Ltd',
                    address: 'Plot 45, Jinja Road, Kampala, Uganda',
                    email: 'accounts@globalconst.ug',
                    phone: '+256 772 123 456'
                },
                items: [
                    { description: 'MDF Board 18mm - High Density', quantity: 50, unitPrice: 45000, taxRate: 18 },
                    { description: 'Plywood 12mm - Marine Grade', quantity: 100, unitPrice: 32000, taxRate: 18 },
                    { description: 'Wood Glue - Industrial 20L', quantity: 5, unitPrice: 150000, taxRate: 18 }
                ]
            });
        }, 800);
    }, []);

    if (!invoiceData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-slate-600 border-r-2 border-r-transparent"></div>
            </div>
        );
    }

    const calculateSubtotal = () => invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculateTax = () => invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const totalAmount = calculateSubtotal() + calculateTax();

    return (
        <div className="min-h-screen bg-[#F1F5F9] pb-20 pt-10">

            {/* Toolbar */}
            <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between px-4 sm:px-0">
                <div className="flex items-center space-x-2 text-slate-500">
                    <FileText size={18} />
                    <span className="font-bold text-sm">Proforma Invoice Preview</span>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
                        <Printer size={14} />
                        <span>Print</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10">
                        <Download size={14} />
                        <span>Download PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        <Send size={14} />
                        <span>Send to Client</span>
                    </button>
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl shadow-slate-300/50 min-h-[1100px] p-12 sm:p-16 relative">

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                    <div className="w-1/2">
                        {/* Logo Placeholder if image fails */}
                        <div className="flex items-center space-x-3 mb-4">
                            <img src={mitioLogo} alt="Mitiosys Logo" className="h-12 object-contain" onError={(e) => e.target.style.display = 'none'} />
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">MITIOSYS</h1>
                        </div>
                        <div className="text-xs text-slate-500 space-y-1 font-medium">
                            <p className="flex items-center"><MapPin size={12} className="mr-2" /> Industrial Area, Plot 78B, Kampala</p>
                            <p className="flex items-center"><Mail size={12} className="mr-2" /> sales@mitiosys.com</p>
                            <p className="flex items-center"><Phone size={12} className="mr-2" /> +256 414 000 000</p>
                            <p className="flex items-center"><Globe size={12} className="mr-2" /> www.mitiosys.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-black text-slate-200 tracking-widest uppercase mb-2">PROFORMA</h2>
                        <p className="text-sm font-bold text-slate-900">Invoice #: <span className="font-mono text-slate-600">{invoiceData.invoiceNumber}</span></p>
                        <p className="text-sm font-bold text-slate-900">Date: <span className="font-mono text-slate-600">{invoiceData.date}</span></p>
                    </div>
                </div>

                {/* Client Info */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
                        <div className="text-sm text-slate-800 space-y-1">
                            <p className="font-bold text-base">{invoiceData.customer.name}</p>
                            <p>{invoiceData.customer.address}</p>
                            <p>{invoiceData.customer.email}</p>
                            <p>{invoiceData.customer.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Terms</h3>
                        <div className="text-sm text-slate-800 space-y-1">
                            <p><span className="font-bold">Validity:</span> 30 Days</p>
                            <p><span className="font-bold">Currency:</span> UGX</p>
                            <p><span className="font-bold">Payment:</span> Bank Transfer </p>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-100">
                                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/12">#</th>
                                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-5/12">Description</th>
                                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/12 text-right">Qty</th>
                                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/12 text-right">Unit Price</th>
                                <th className="py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest w-2/12 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoiceData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-xs font-bold text-slate-400">{index + 1}</td>
                                    <td className="py-4 text-sm font-bold text-slate-800">{item.description}</td>
                                    <td className="py-4 text-sm font-bold text-slate-600 text-right">{item.quantity}</td>
                                    <td className="py-4 text-sm font-bold text-slate-600 text-right">{item.unitPrice.toLocaleString()}</td>
                                    <td className="py-4 text-sm font-black text-slate-900 text-right">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </div>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-500">Subtotal</span>
                            <span className="font-bold text-slate-800">{calculateSubtotal().toLocaleString()} UGX</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-bold text-slate-500">Tax (VAT 18%)</span>
                            <span className="font-bold text-slate-800">{calculateTax().toLocaleString()} UGX</span>
                        </div>
                        <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-end">
                            <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Total Due</span>
                            <span className="font-black text-2xl text-blue-600">{totalAmount.toLocaleString()} UGX</span>
                        </div>
                    </div>
                </div>

                {/* Terms Footer */}
                <div className="border-t border-slate-100 pt-8 text-xs text-slate-400">
                    <h4 className="font-bold text-slate-600 uppercase mb-2">Terms & Conditions</h4>
                    <p className="mb-1">1. Goods released only upon confirmation of full payment.</p>
                    <p className="mb-1">2. All prices are inclusive of 18% VAT unless stated otherwise.</p>
                    <p>3. Please quote the invoice number when making payments.</p>

                    <div className="mt-8 text-center italic">
                        Thank you for your business!
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProformaInvoice;
