import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    FileText,
    Download,
    Calendar,
    Filter,
    ChevronDown,
    Search,
    TrendingUp,
    Users,
    Package,
    ArrowUpRight,
    Loader2
} from 'lucide-react';

const Reports = () => {
    const [reportType, setReportType] = useState('sales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/reports/${reportType}`, {
                params: { startDate, endDate }
            });
            setData(res.data);
        } catch (err) {
            console.error("Failed to fetch report", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const handleExport = () => {
        if (data.length === 0) return;

        // Simple CSV Export
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter data based on search
    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">System Reports</h1>
                        <nav className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Intelligence</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-blue-600">Dynamic Queries</span>
                        </nav>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="appearance-none bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide py-3 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
                            >
                                <option value="sales">Sales Report</option>
                                <option value="inventory">Inventory Report</option>
                                <option value="customers">Customer Report</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>

                        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:outline-none p-2"
                            />
                            <span className="text-slate-300 mx-1">-</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-slate-600 focus:outline-none p-2"
                            />
                        </div>

                        <button
                            onClick={fetchReport}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                        >
                            Run Query
                        </button>

                        <button
                            onClick={handleExport}
                            disabled={data.length === 0}
                            className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/20 disabled:opacity-50"
                        >
                            <Download size={14} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                {reportType === 'sales' && <TrendingUp size={18} className="text-blue-500" />}
                                {reportType === 'inventory' && <Package size={18} className="text-emerald-500" />}
                                {reportType === 'customers' && <Users size={18} className="text-indigo-500" />}
                            </div>
                            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                                {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Data ({filteredData.length} records)
                            </h2>
                        </div>

                        <div className="relative w-full md:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Executing Database Query...</span>
                            </div>
                        ) : data.length > 0 ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        {Object.keys(data[0]).map(header => (
                                            <th key={header} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                {header.replace(/([A-Z])/g, ' $1').trim()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredData.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                            {Object.values(row).map((val, i) => (
                                                <td key={i} className="px-6 py-4 text-xs font-bold text-slate-600">
                                                    {typeof val === 'number' ?
                                                        (val > 1000 ? val.toLocaleString() : val) :
                                                        String(val)
                                                    }
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-bold">No data found for the selected criteria.</p>
                                <button onClick={fetchReport} className="mt-4 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">
                                    Try Refreshing
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Summary Info (Visual Aggregation) */}
                {data.length > 0 && !loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Records</p>
                                <h3 className="text-2xl font-black text-slate-900">{data.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <FileText size={20} />
                            </div>
                        </div>
                        {reportType === 'sales' && (
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cumulative Value</p>
                                    <h3 className="text-2xl font-black text-slate-900">
                                        UGX {data.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0).toLocaleString()}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                    <TrendingUp size={20} />
                                </div>
                            </div>
                        )}
                        <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-slate-500">Last Updated</p>
                                <h3 className="text-lg font-bold">{new Date().toLocaleTimeString()}</h3>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                <Calendar size={18} />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Reports;
