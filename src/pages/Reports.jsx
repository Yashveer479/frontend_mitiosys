import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
    Factory,
    Package,
    TrendingUp,
    AlertTriangle,
    CalendarDays,
    Download,
    RefreshCw,
    Boxes,
    Activity,
    ClipboardList
} from 'lucide-react';

const RANGE_PRESETS = {
    '7d': 7,
    '30d': 30,
    '90d': 90
};

const currency = (value) => `UGX ${Number(value || 0).toLocaleString()}`;
const integer = (value) => Number(value || 0).toLocaleString();

const formatInputDate = (date) => {
    const copy = new Date(date);
    copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
    return copy.toISOString().slice(0, 10);
};

const getPresetRange = (preset) => {
    const days = RANGE_PRESETS[preset] || 30;
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - ((days - 1) * 24 * 60 * 60 * 1000));
    return {
        startDate: formatInputDate(startDate),
        endDate: formatInputDate(endDate)
    };
};

const getMonthRange = (month, year) => {
    const monthIndex = Number.parseInt(month, 10) - 1;
    const resolvedYear = Number.parseInt(year, 10);

    if (Number.isNaN(monthIndex) || Number.isNaN(resolvedYear) || monthIndex < 0 || monthIndex > 11) {
        return null;
    }

    const startDate = new Date(resolvedYear, monthIndex, 1);
    const endDate = new Date(resolvedYear, monthIndex + 1, 0);

    return {
        startDate: formatInputDate(startDate),
        endDate: formatInputDate(endDate)
    };
};

const buildLinePath = (points, width, height) => {
    if (!points.length) {
        return '';
    }

    const maxValue = Math.max(...points.map((point) => point.value), 1);
    return points.map((point, index) => {
        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
        const y = height - ((point.value / maxValue) * (height - 18)) - 9;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
};

const buildAreaPath = (points, width, height) => {
    if (!points.length) {
        return '';
    }

    const linePath = buildLinePath(points, width, height);
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
};

const toneClasses = {
    blue: 'from-blue-500/15 to-blue-100 text-blue-700 bg-blue-50',
    emerald: 'from-emerald-500/15 to-emerald-100 text-emerald-700 bg-emerald-50',
    amber: 'from-amber-500/15 to-amber-100 text-amber-700 bg-amber-50',
    rose: 'from-rose-500/15 to-rose-100 text-rose-700 bg-rose-50'
};

const Reports = () => {
    const location = useLocation();
    const [preset, setPreset] = useState('30d');
    const [dateRange, setDateRange] = useState(() => getPresetRange('30d'));
    const [refreshKey, setRefreshKey] = useState(0);
    const [dashboard, setDashboard] = useState({
        production: null,
        inventory: null,
        sales: null,
        rejections: null
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const isProductionRoute = location.pathname === '/reports/production';

    const productionRouteFilters = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return {
            month: params.get('month') || '',
            year: params.get('year') || '',
            plant: params.get('plant') || ''
        };
    }, [location.search]);

    useEffect(() => {
        if (preset === 'custom') {
            return;
        }

        setDateRange(getPresetRange(preset));
    }, [preset]);

    useEffect(() => {
        if (!isProductionRoute) {
            return;
        }

        const nextRange = getMonthRange(productionRouteFilters.month, productionRouteFilters.year);
        if (!nextRange) {
            return;
        }

        setPreset('custom');
        setDateRange(nextRange);
    }, [isProductionRoute, productionRouteFilters.month, productionRouteFilters.year]);

    useEffect(() => {
        let cancelled = false;

        const fetchReports = async () => {
            if (!dateRange.startDate || !dateRange.endDate) {
                return;
            }

            const params = {
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            };

            if (isProductionRoute && productionRouteFilters.plant) {
                params.plant = productionRouteFilters.plant;
            }

            setError('');
            setRefreshing(!loading);
            setLoading((current) => current || refreshKey === 0);

            try {
                const [productionRes, inventoryRes, salesRes, rejectionRes] = await Promise.all([
                    api.get('/reports/production', { params }),
                    api.get('/reports/inventory', { params }),
                    api.get('/reports/sales', { params }),
                    api.get('/reports/rejections', { params })
                ]);

                if (cancelled) {
                    return;
                }

                setDashboard({
                    production: productionRes.data,
                    inventory: inventoryRes.data,
                    sales: salesRes.data,
                    rejections: rejectionRes.data
                });
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to load reports dashboard', err);
                    setError('Unable to load reports data for the selected period.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        fetchReports();

        return () => {
            cancelled = true;
        };
    }, [dateRange.startDate, dateRange.endDate, isProductionRoute, productionRouteFilters.plant, refreshKey]);

    const productionSeries = dashboard.production?.series || [];
    const inventoryProducts = dashboard.inventory?.byProduct || [];
    const salesSeries = dashboard.sales?.series || [];
    const rejectionStages = dashboard.rejections?.byStage || [];
    const rejectionReasons = dashboard.rejections?.topReasons || [];
    const productionRouteSummary = useMemo(() => {
        if (!isProductionRoute) {
            return null;
        }

        const monthIndex = Number.parseInt(productionRouteFilters.month, 10) - 1;
        const monthLabel = monthIndex >= 0 && monthIndex < 12
            ? new Date(Number.parseInt(productionRouteFilters.year || new Date().getFullYear(), 10), monthIndex, 1).toLocaleString('en-US', { month: 'long' })
            : 'Selected Month';

        return {
            monthLabel,
            yearLabel: productionRouteFilters.year || String(new Date().getFullYear()),
            plantLabel: productionRouteFilters.plant || 'All Plants'
        };
    }, [isProductionRoute, productionRouteFilters.month, productionRouteFilters.plant, productionRouteFilters.year]);

    const overviewCards = useMemo(() => ([
        {
            title: 'Production Output',
            value: integer(dashboard.production?.summary?.totalRawQuantity),
            subtitle: `${integer(dashboard.production?.summary?.totalBatches)} batches recorded`,
            tone: 'blue',
            icon: Factory
        },
        {
            title: 'Inventory Value',
            value: currency(dashboard.inventory?.summary?.totalValue),
            subtitle: `${integer(dashboard.inventory?.summary?.totalUnits)} units on hand`,
            tone: 'emerald',
            icon: Package
        },
        {
            title: 'Sales Revenue',
            value: currency(dashboard.sales?.summary?.totalRevenue),
            subtitle: `${integer(dashboard.sales?.summary?.totalOrders)} sales orders`,
            tone: 'amber',
            icon: TrendingUp
        },
        {
            title: 'Rejected Units',
            value: integer(dashboard.rejections?.summary?.totalRejectedQuantity),
            subtitle: `${integer(dashboard.rejections?.summary?.incidents)} incidents logged`,
            tone: 'rose',
            icon: AlertTriangle
        }
    ]), [dashboard]);

    const handleExport = () => {
        const payload = {
            generatedAt: new Date().toISOString(),
            filters: dateRange,
            ...dashboard
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reports-dashboard-${dateRange.startDate}-to-${dateRange.endDate}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleRefresh = () => {
        setRefreshKey((current) => current + 1);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.08),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] px-6 py-8 pb-16">
            <div className="mx-auto max-w-7xl space-y-8">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200/70 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
                    <div className="relative px-8 py-8 sm:px-10">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_30%)]" />
                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl space-y-3">
                                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-blue-200">
                                    <Activity size={14} />
                                    <span>Reports Dashboard</span>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{isProductionRoute ? 'Detailed production reporting for monthly plant performance.' : 'Advanced operational reporting across production, stock, sales, and quality.'}</h1>
                                    <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-slate-300">
                                        {isProductionRoute
                                            ? 'Review output, active batches, rejection pressure, and recent production activity for the selected plant and reporting month.'
                                            : 'Monitor throughput, stock posture, commercial momentum, and rejection pressure from one live dashboard.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">Coverage Window</p>
                                    <p className="mt-2 text-lg font-black">{dateRange.startDate} to {dateRange.endDate}</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">{isProductionRoute ? 'Plant Filter' : 'Refresh State'}</p>
                                    <p className="mt-2 text-lg font-black">{isProductionRoute ? (productionRouteSummary?.plantLabel || 'All Plants') : (refreshing ? 'Refreshing' : 'Synced')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {isProductionRoute && productionRouteSummary && (
                    <section className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-blue-200 bg-blue-50/80 px-5 py-4 text-sm font-bold text-slate-700 shadow-sm">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">Production Focus</span>
                        <span>{productionRouteSummary.monthLabel} {productionRouteSummary.yearLabel}</span>
                        <span className="text-slate-300">•</span>
                        <span>{productionRouteSummary.plantLabel}</span>
                    </section>
                )}

                <section className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {[
                            { value: '7d', label: '7 Days' },
                            { value: '30d', label: '30 Days' },
                            { value: '90d', label: '90 Days' },
                            { value: 'custom', label: 'Custom' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setPreset(option.value)}
                                className={`rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.24em] transition ${preset === option.value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                            <CalendarDays size={14} />
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(event) => {
                                    setPreset('custom');
                                    setDateRange((current) => ({ ...current, startDate: event.target.value }));
                                }}
                                className="bg-transparent text-slate-700 outline-none"
                            />
                        </label>
                        <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">
                            <CalendarDays size={14} />
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(event) => {
                                    setPreset('custom');
                                    setDateRange((current) => ({ ...current, endDate: event.target.value }));
                                }}
                                className="bg-transparent text-slate-700 outline-none"
                            />
                        </label>
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-white transition hover:bg-blue-700"
                        >
                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.24em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <Download size={14} />
                            Export
                        </button>
                    </div>
                </section>

                {error && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
                        {error}
                    </div>
                )}

                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {overviewCards.map((card) => (
                        <OverviewCard key={card.title} {...card} />
                    ))}
                </section>

                {loading ? (
                    <section className="grid gap-5 lg:grid-cols-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-[360px] animate-pulse rounded-[1.75rem] border border-slate-200 bg-white/80" />
                        ))}
                    </section>
                ) : (
                    <>
                        <section className="grid gap-5 lg:grid-cols-2">
                            <ChartPanel
                                title="Production by Date"
                                subtitle="Raw quantity processed per day"
                                accent="blue"
                                icon={Boxes}
                                footer={`${integer(dashboard.production?.summary?.activeBatches)} active batches in range`}
                            >
                                <VerticalBarChart
                                    data={productionSeries.map((item) => ({
                                        label: item.date.slice(5),
                                        value: item.rawQuantity,
                                        secondary: `${integer(item.batches)} batches`
                                    }))}
                                    valueFormatter={integer}
                                    tone="blue"
                                />
                            </ChartPanel>

                            <ChartPanel
                                title="Inventory Levels"
                                subtitle="Top products by stock on hand"
                                accent="emerald"
                                icon={Package}
                                footer={`${integer(dashboard.inventory?.summary?.lowStockCount)} products below minimum stock`}
                            >
                                <HorizontalBarChart
                                    data={inventoryProducts.map((item) => ({
                                        label: item.product,
                                        value: item.stockLevel,
                                        secondary: `Min ${integer(item.minLevel)}`
                                    }))}
                                    valueFormatter={integer}
                                    tone="emerald"
                                />
                            </ChartPanel>
                        </section>

                        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
                            <ChartPanel
                                title="Sales Trends"
                                subtitle="Revenue movement across the selected period"
                                accent="amber"
                                icon={TrendingUp}
                                footer={`${currency(dashboard.sales?.summary?.averageOrderValue)} average order value`}
                            >
                                <LineChart
                                    data={salesSeries.map((item) => ({
                                        label: item.date.slice(5),
                                        value: item.revenue,
                                        secondary: `${integer(item.orders)} orders`
                                    }))}
                                    valueFormatter={currency}
                                />
                            </ChartPanel>

                            <ChartPanel
                                title="Rejection Analysis"
                                subtitle="Quantity contribution by process stage"
                                accent="rose"
                                icon={AlertTriangle}
                                footer={`${integer(dashboard.rejections?.summary?.batchesAffected)} batches affected`}
                            >
                                <StageBreakdownChart data={rejectionStages} />
                            </ChartPanel>
                        </section>

                        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Quality Drivers</p>
                                        <h2 className="mt-2 text-xl font-black text-slate-900">Top rejection reasons</h2>
                                    </div>
                                    <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                                        <ClipboardList size={18} />
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {rejectionReasons.length > 0 ? rejectionReasons.map((item) => (
                                        <div key={item.reason} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">{item.reason}</p>
                                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{integer(item.incidents)} incidents</p>
                                                </div>
                                                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-rose-700">
                                                    {integer(item.quantity)} units
                                                </span>
                                            </div>
                                        </div>
                                    )) : <EmptyState message="No rejection reasons recorded in the selected range." />}
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">Recent Activity</p>
                                        <h2 className="mt-2 text-xl font-black text-slate-900">Commercial and production highlights</h2>
                                    </div>
                                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-600">
                                        <Activity size={18} />
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    <RecentList
                                        title="Latest Sales"
                                        items={(dashboard.sales?.recentOrders || []).map((item) => ({
                                            primary: item.orderID,
                                            secondary: item.customer,
                                            meta: currency(item.amount),
                                            status: item.status
                                        }))}
                                    />
                                    <RecentList
                                        title="Latest Batches"
                                        items={(dashboard.production?.recent || []).map((item) => ({
                                            primary: item.batchNumber,
                                            secondary: `${integer(item.rawQuantity)} units`,
                                            meta: item.status,
                                            status: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Pending'
                                        }))}
                                    />
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
};

const OverviewCard = ({ title, value, subtitle, icon: Icon, tone }) => (
    <div className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className={`bg-gradient-to-br ${toneClasses[tone]} p-5`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-500">{title}</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-950">{value}</h2>
                </div>
                <div className="rounded-2xl bg-white/75 p-3 shadow-sm">
                    <Icon size={20} />
                </div>
            </div>
            <p className="mt-4 text-sm font-bold text-slate-600">{subtitle}</p>
        </div>
    </div>
);

const ChartPanel = ({ title, subtitle, footer, icon: Icon, accent, children }) => (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-400">{subtitle}</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">{title}</h2>
            </div>
            <div className={`rounded-2xl p-3 ${toneClasses[accent].split(' ').slice(2).join(' ')}`}>
                <Icon size={18} />
            </div>
        </div>
        <div className="mt-6 min-h-[260px]">{children}</div>
        <p className="mt-5 border-t border-slate-100 pt-4 text-sm font-bold text-slate-500">{footer}</p>
    </div>
);

const VerticalBarChart = ({ data, valueFormatter, tone }) => {
    if (!data.length) {
        return <EmptyState message="No production activity found for the selected period." />;
    }

    const maxValue = Math.max(...data.map((item) => item.value), 1);
    const barClass = {
        blue: 'from-blue-700 via-blue-500 to-cyan-400',
        emerald: 'from-emerald-700 via-emerald-500 to-teal-300',
        amber: 'from-amber-700 via-amber-500 to-orange-300',
        rose: 'from-rose-700 via-rose-500 to-pink-300'
    }[tone];

    return (
        <div className="flex h-[260px] items-end gap-3 overflow-x-auto pb-8">
            {data.map((item) => (
                <div key={`${item.label}-${item.value}`} className="group flex min-w-[56px] flex-1 flex-col items-center justify-end">
                    <div className="mb-3 rounded-xl bg-slate-950 px-2 py-1 text-[11px] font-black text-white opacity-0 transition group-hover:opacity-100">
                        {valueFormatter(item.value)}
                    </div>
                    <div className="flex h-[190px] w-full items-end rounded-2xl bg-slate-100 p-1">
                        <div
                            className={`w-full rounded-[1rem] bg-gradient-to-t ${barClass} transition duration-500 group-hover:brightness-110`}
                            style={{ height: `${Math.max((item.value / maxValue) * 100, 8)}%` }}
                        />
                    </div>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-[10px] font-bold text-slate-400">{item.secondary}</p>
                </div>
            ))}
        </div>
    );
};

const HorizontalBarChart = ({ data, valueFormatter, tone }) => {
    if (!data.length) {
        return <EmptyState message="No inventory records available." />;
    }

    const maxValue = Math.max(...data.map((item) => item.value), 1);
    const fillClass = {
        blue: 'from-blue-600 to-cyan-400',
        emerald: 'from-emerald-600 to-teal-400',
        amber: 'from-amber-500 to-orange-400',
        rose: 'from-rose-500 to-pink-400'
    }[tone];

    return (
        <div className="space-y-4">
            {data.map((item) => (
                <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-black text-slate-800">{item.label}</p>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.secondary}</p>
                        </div>
                        <span className="text-sm font-black text-slate-700">{valueFormatter(item.value)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${fillClass}`}
                            style={{ width: `${Math.max((item.value / maxValue) * 100, 6)}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

const LineChart = ({ data, valueFormatter }) => {
    if (!data.length) {
        return <EmptyState message="No sales data found for the selected period." />;
    }

    const width = 620;
    const height = 220;
    const points = data.map((item) => ({ label: item.label, value: Number(item.value || 0), secondary: item.secondary }));
    const path = buildLinePath(points, width, height);
    const areaPath = buildAreaPath(points, width, height);
    const maxValue = Math.max(...points.map((point) => point.value), 1);

    return (
        <div>
            <div className="relative h-[240px] w-full overflow-hidden rounded-[1.5rem] border border-slate-100 bg-[linear-gradient(180deg,rgba(219,234,254,0.45)_0%,rgba(255,255,255,0.9)_100%)] p-4">
                <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
                        </linearGradient>
                    </defs>
                    {[0, 1, 2, 3].map((line) => (
                        <line
                            key={line}
                            x1="0"
                            y1={(height / 4) * line + 10}
                            x2={width}
                            y2={(height / 4) * line + 10}
                            stroke="#e2e8f0"
                            strokeDasharray="4 6"
                        />
                    ))}
                    <path d={areaPath} fill="url(#salesArea)" />
                    <path d={path} fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((point, index) => {
                        const x = points.length === 1 ? width / 2 : (index / (points.length - 1)) * width;
                        const y = height - ((point.value / maxValue) * (height - 18)) - 9;
                        return (
                            <circle key={`${point.label}-${index}`} cx={x} cy={y} r="5" fill="#f59e0b" stroke="#fff" strokeWidth="3" />
                        );
                    })}
                </svg>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                {data.slice(-6).map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-sm font-black text-slate-900">{valueFormatter(item.value)}</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">{item.secondary}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StageBreakdownChart = ({ data }) => {
    if (!data.length) {
        return <EmptyState message="No rejection activity found for the selected period." />;
    }

    const total = data.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 1;
    const palette = ['bg-rose-500', 'bg-orange-400', 'bg-amber-400', 'bg-fuchsia-400', 'bg-slate-400'];

    return (
        <div className="space-y-5">
            <div className="flex h-5 overflow-hidden rounded-full bg-slate-100">
                {data.map((item, index) => (
                    <div
                        key={item.stage}
                        className={palette[index % palette.length]}
                        style={{ width: `${(Number(item.quantity || 0) / total) * 100}%` }}
                    />
                ))}
            </div>
            <div className="space-y-3">
                {data.map((item, index) => (
                    <div key={item.stage} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full ${palette[index % palette.length]}`} />
                                <div>
                                    <p className="text-sm font-black text-slate-800">{item.stage}</p>
                                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{integer(item.incidents)} incidents</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-black text-slate-900">{integer(item.quantity)} units</p>
                                <p className="text-[11px] font-bold text-slate-500">{Math.round((Number(item.quantity || 0) / total) * 100)}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const RecentList = ({ title, items }) => (
    <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50 p-4">
        <h3 className="text-sm font-black text-slate-900">{title}</h3>
        <div className="mt-4 space-y-3">
            {items.length > 0 ? items.map((item, index) => (
                <div key={`${item.primary}-${index}`} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-black text-slate-800">{item.primary}</p>
                            <p className="mt-1 text-xs font-bold text-slate-500">{item.secondary}</p>
                        </div>
                        <span className="text-right text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.meta}</span>
                    </div>
                    <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.status}</p>
                </div>
            )) : <EmptyState message="No recent records available." compact />}
        </div>
    </div>
);

const EmptyState = ({ message, compact = false }) => (
    <div className={`flex h-full items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm font-bold text-slate-400 ${compact ? 'py-8' : 'py-12'}`}>
        {message}
    </div>
);

export default Reports;
