import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Download,
    Printer,
    Start, // Using generic icon if Badge/Award not available or just simple layout
    Landmark, // For Bank
    FileText,
    MapPin,
    Mail,
    Phone,
    Globe
} from 'lucide-react';
import mitioLogo from '../assets/logo.png';

const TaxInvoice = () => {
    const [invoiceData, setInvoiceData] = useState(null);

    useEffect(() => {
        // Simulate fetching draft/final tax invoice data
        setTimeout(() => {
            setInvoiceData({
                invoiceNumber: 'INV-2026-8842',
                date: new Date().toISOString().split('T')[0],
                tin: '1000283495', // Company TIN
                vrn: '4839201', // VAT Reg Number
                customer: {
                    name: 'Kampala Builders & Contractors',
                    tin: '1005529932',
                    address: 'Plot 12, Industrial Area, Kampala',
                    email: 'procurement@kbc.co.ug'
                },
                items: [
                    { description: 'MDF Board 18mm - High Density (Batch A22)', quantity: 200, unitPrice: 45000, taxRate: 18 },
                    { description: 'Plywood 12mm - Marine Grade', quantity: 150, unitPrice: 32000, taxRate: 18 },
                    { description: 'Transport & Logistics', quantity: 1, unitPrice: 250000, taxRate: 18 }
                ],
                bankDetails: {
                    bankName: 'Stanbic Bank Uganda',
                    accountName: 'Mitiosys Services Pvt Ltd',
                    accountNumber: '9030005821193',
                    branch: 'Corporate Branch'
                }
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
            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between px-4 sm:px-0">
                <div className="flex items-center space-x-2 text-slate-500">
                    <FileText size={18} />
                    <span className="font-bold text-sm">Tax Invoice # {invoiceData.invoiceNumber}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
                        <Printer size={14} />
                        <span>Print</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
                        <Download size={14} />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl shadow-slate-300/50 min-h-[297mm] p-12 sm:p-16 relative flex flex-col justify-between">

                {/* Top Section */}
                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                        <div className="w-2/3">
                            <div className="flex items-center space-x-3 mb-4">
                                <img src={mitioLogo} alt="Mitiosys Logo" className="h-12 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">MITIOSYS</h1>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Manufacturing & Distribution</p>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-600 space-y-1 font-medium grid grid-cols-2 gap-x-8">
                                <p><span className="font-bold text-slate-800">TIN:</span> {invoiceData.tin}</p>
                                <p><span className="font-bold text-slate-800">VRN:</span> {invoiceData.vrn}</p>
                                <p className="col-span-2 mt-1"><MapPin size={10} className="inline mr-1" /> Industrial Area, Plot 78B, Kampala, Uganda</p>
                                <p><Phone size={10} className="inline mr-1" /> +256 414 000 000</p>
                                <p><Mail size={10} className="inline mr-1" /> accounts@mitiosys.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black text-slate-900 tracking-wide uppercase mb-1">TAX INVOICE</h2>
                            <p className="text-xs font-bold text-slate-500 mb-4">Original Copy</p>
                            <div className="text-right space-y-1">
                                <p className="text-sm font-bold text-slate-900">Inv #: <span className="font-mono text-slate-600">{invoiceData.invoiceNumber}</span></p>
                                <p className="text-sm font-bold text-slate-900">Date: <span className="font-mono text-slate-600">{invoiceData.date}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-10 bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-20">Bill To</h3>
                        <div className="text-sm text-slate-800 space-y-1">
                            <p className="font-black text-lg">{invoiceData.customer.name}</p>
                            <p className="text-slate-600">{invoiceData.customer.address}</p>
                            <p className="text-slate-600">TIN: <span className="font-mono font-bold text-slate-800">{invoiceData.customer.tin}</span></p>
                        </div>
                    </div>

                    {/* Table */}
                    <table className="w-full text-left mb-10">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest w-12 text-center">#</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Description</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-right w-24">Qty</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-right w-32">Unit Price</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoiceData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 px-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{item.description}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-slate-600 text-right">{item.quantity}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-slate-600 text-right">{item.unitPrice.toLocaleString()}</td>
                                    <td className="py-4 px-4 text-sm font-black text-slate-900 text-right">{(item.quantity * item.unitPrice).toLocaleString()}</td>
                                </div>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-12">
                        <div className="w-5/12 space-y-4">
                            <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-500">Subtotal</span>
                                <span className="font-bold text-slate-800">{calculateSubtotal().toLocaleString()} UGX</span>
                            </div>
                            <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-500">Tax (VAT 18%)</span>
                                <span className="font-bold text-slate-800">{calculateTax().toLocaleString()} UGX</span>
                            </div>
                            <div className="flex justify-between items-end pt-2">
                                <span className="font-black text-slate-900 uppercase text-sm tracking-widest">Total Payable</span>
                                <span className="font-black text-2xl text-slate-900 border-b-4 border-blue-600 pb-1">{totalAmount.toLocaleString()} <span className="text-sm text-slate-400 font-medium">UGX</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div>
                    <div className="grid grid-cols-2 gap-12 border-t-2 border-slate-900 pt-8">
                        <div>
                            <h4 className="flex items-center font-bold text-slate-800 uppercase text-xs mb-3">
                                <Landmark size={14} className="mr-2 text-blue-600" />
                                Bank Details
                            </h4>
                            <div className="text-xs text-slate-600 space-y-1.5 font-medium bg-slate-50 p-4 rounded-lg">
                                <p><span className="text-slate-400 uppercase text-[10px] font-bold w-20 inline-block">Bank:</span> {invoiceData.bankDetails.bankName}</p>
                                <p><span className="text-slate-400 uppercase text-[10px] font-bold w-20 inline-block">Account:</span> {invoiceData.bankDetails.accountNumber}</p>
                                <p><span className="text-slate-400 uppercase text-[10px] font-bold w-20 inline-block">Name:</span> {invoiceData.bankDetails.accountName}</p>
                                <p><span className="text-slate-400 uppercase text-[10px] font-bold w-20 inline-block">Branch:</span> {invoiceData.bankDetails.branch}</p>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-end">
                            <div className="mb-8">
                                <span className="font-bold text-slate-900 uppercase text-xs">Authorized Signature</span>
                                <div className="h-16 border-b border-slate-300 w-48 ml-auto mb-2"></div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">Mitiosys Services Pvt Ltd</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center border-t border-slate-100 pt-4">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            This is a computer-generated document. No signature required usually, but provided for formality.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TaxInvoice;
