import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Truck,
    Printer,
    Download,
    CheckCircle,
    MapPin,
    Calendar,
    Package,
    FileText
} from 'lucide-react';
import mitioLogo from '../assets/logo.png';

const DeliveryNote = () => {
    const [deliveryData, setDeliveryData] = useState(null);
    const [released, setReleased] = useState(false);

    useEffect(() => {
        // Simulate fetching delivery data
        setTimeout(() => {
            setDeliveryData({
                dispatchNumber: 'DN-2026-8842',
                dispatchDate: new Date().toISOString().split('T')[0],
                orderReference: 'ORD-2026-5591',
                vehicleReg: 'UUB 452K',
                driverName: 'Michael K.',
                customer: {
                    name: 'Kampala Builders & Contractors',
                    address: 'Plot 12, Industrial Area, Kampala',
                    contact: 'Site Manager: +256 700 000 000'
                },
                items: [
                    { description: 'MDF Board 18mm - High Density (Batch A22)', ordered: 200, shipped: 200 },
                    { description: 'Plywood 12mm - Marine Grade', ordered: 150, shipped: 150 },
                    { description: 'Wood Glue - Industrial 20L', ordered: 5, shipped: 5 }
                ]
            });
        }, 800);
    }, []);

    const handleRelease = () => {
        setReleased(true);
        // Logic to update inventory would go here
        setTimeout(() => setReleased(false), 3000);
    };

    if (!deliveryData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#F1F5F9]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-slate-600 border-r-2 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F1F5F9] pb-20 pt-10">

            {/* Toolbar */}
            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between px-4 sm:px-0">
                <div className="flex items-center space-x-2 text-slate-500">
                    <Truck size={18} />
                    <span className="font-bold text-sm">Dispatch Advice # {deliveryData.dispatchNumber}</span>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-sm">
                        <Printer size={14} />
                        <span>Print</span>
                    </button>
                    {released ? (
                        <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide shadow-lg flex items-center animate-fade-in">
                            <CheckCircle size={14} className="mr-2" />
                            Goods Released
                        </div>
                    ) : (
                        <button
                            onClick={handleRelease}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
                        >
                            <Package size={14} />
                            <span>Release Goods</span>
                        </button>
                    )}
                </div>
            </div>

            {/* A4 Document Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl shadow-slate-300/50 min-h-[297mm] p-12 sm:p-16 relative flex flex-col justify-between">

                <div>
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                        <div className="w-1/2">
                            <div className="flex items-center space-x-3 mb-4">
                                <img src={mitioLogo} alt="Mitiosys Logo" className="h-12 object-contain" onError={(e) => e.target.style.display = 'none'} />
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">MITIOSYS</h1>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Logistics Division</p>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-600 space-y-1 font-medium">
                                <p>Industrial Area, Plot 78B, Kampala, Uganda</p>
                                <p>logistics@mitiosys.com</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black text-slate-900 tracking-wide uppercase mb-1">DELIVERY NOTE</h2>
                            <p className="text-xs font-bold text-slate-500 mb-4">Proof of Delivery</p>
                            <div className="text-right space-y-1">
                                <p className="text-sm font-bold text-slate-900">Dispatch #: <span className="font-mono text-slate-600">{deliveryData.dispatchNumber}</span></p>
                                <p className="text-sm font-bold text-slate-900">Date: <span className="font-mono text-slate-600">{deliveryData.dispatchDate}</span></p>
                                <p className="text-sm font-bold text-slate-900">Order Ref: <span className="font-mono text-slate-600">{deliveryData.orderReference}</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Logistics Info */}
                    <div className="grid grid-cols-2 gap-8 mb-10">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-24">Deliver To</h3>
                            <div className="text-sm text-slate-800 space-y-1">
                                <p className="font-black text-lg">{deliveryData.customer.name}</p>
                                <p className="text-slate-600">{deliveryData.customer.address}</p>
                                <p className="text-slate-600 font-medium">{deliveryData.customer.contact}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-24">Transport</h3>
                            <div className="text-sm text-slate-800 space-y-1">
                                <p className="flex justify-between"><span className="text-slate-500 font-bold">Vehicle Reg:</span> <span className="font-mono font-bold">{deliveryData.vehicleReg}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500 font-bold">Driver:</span> <span className="font-mono font-bold">{deliveryData.driverName}</span></p>
                                <p className="flex justify-between"><span className="text-slate-500 font-bold">Carrier:</span> <span className="font-mono font-bold">Mitiosys Logistics</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full text-left mb-10">
                        <thead>
                            <tr className="bg-slate-900 text-white">
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest w-12 text-center">#</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest">Description</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-center w-32">Ordered</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-center w-32 bg-slate-800">Shipped</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {deliveryData.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 px-4 text-xs font-bold text-slate-400 text-center">{index + 1}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-slate-800">{item.description}</td>
                                    <td className="py-4 px-4 text-sm font-bold text-slate-400 text-center">{item.ordered}</td>
                                    <td className="py-4 px-4 text-sm font-black text-slate-900 text-center bg-slate-50">{item.shipped}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mb-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-xs text-yellow-800 font-medium flex items-start">
                        <CheckCircle size={14} className="mr-2 mt-0.5 text-yellow-600" />
                        <p>Please inspect goods immediately upon delivery. Any discrepancies or damage must be noted on this document before signing.</p>
                    </div>
                </div>

                {/* Signature Section */}
                <div className="border-t-2 border-slate-900 pt-8 mt-auto">
                    <div className="grid grid-cols-2 gap-16">
                        <div>
                            <h4 className="font-bold text-slate-800 uppercase text-xs mb-8">Dispatched By (Mitiosys)</h4>
                            <div className="border-b border-slate-300 mb-2"></div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                                <span>Name & Signature</span>
                                <span>Date</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 uppercase text-xs mb-8">Received By (Customer)</h4>
                            <div className="border-b border-slate-300 mb-2"></div>
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                                <span>Name & Signature / Stamp</span>
                                <span>Date</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DeliveryNote;
