import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut,
    ArrowRightLeft, Warehouse, Shield, Settings as SettingsIcon,
    ClipboardCheck, Layers, Truck, ShoppingBag, ChevronDown,
    Factory, Box, History, SlidersHorizontal, FileText,
    Truck as TruckIcon, ClipboardList, ReceiptText, Boxes,
    FlaskConical, Gauge, Zap, CalendarDays
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const groups = [
    {
        id: 'dashboard',
        single: true,
        items: [{ name: 'Dashboard', path: '/', icon: LayoutDashboard }]
    },
    {
        id: 'production',
        label: 'Production',
        icon: Factory,
        color: 'text-violet-400',
        paths: ['/production', '/warehouse/transfer', '/warehouse/lamination', '/lamination', '/warehouse/inventory'],
        items: [
            { name: 'Planning', path: '/production/planning', icon: CalendarDays },
            { name: 'Raw Entry', path: '/production/raw-entry', icon: Boxes },
            { name: 'Thickness Processing', path: '/production/thickness', icon: Gauge },
            { name: 'Sanding Processing', path: '/production/sanding', icon: Zap },
            { name: 'Grading', path: '/production/grading', icon: FlaskConical },
            { name: 'Production Transfer', path: '/warehouse/transfer', icon: ArrowRightLeft },
            { name: 'Send to Lamination', path: '/warehouse/lamination', icon: Layers },
            { name: 'Lamination Dept', path: '/lamination/process', icon: Layers },
            { name: 'Warehouse Inventory', path: '/warehouse/inventory', icon: Warehouse },
        ]
    },
    {
        id: 'inventory',
        label: 'Inventory',
        icon: Box,
        color: 'text-blue-400',
        paths: ['/inventory', '/products'],
        items: [
            { name: 'Products', path: '/products', icon: Package },
            { name: 'Inventory', path: '/inventory', icon: Box },
            { name: 'Stock Audit', path: '/inventory/audit', icon: ClipboardCheck },
            { name: 'Stock Adjustment', path: '/inventory/adjustment', icon: SlidersHorizontal },
            { name: 'Inventory History', path: '/inventory/history', icon: History },
        ]
    },
    {
        id: 'procurement',
        label: 'Procurement',
        icon: ShoppingBag,
        color: 'text-amber-400',
        paths: ['/purchase-requests', '/general-approvals', '/inventory/suppliers', '/inventory/purchase-orders', '/inventory/goods-receipt', '/admin/approval-matrix'],
        items: [
            { name: 'Purchase Requests', path: '/purchase-requests', icon: ClipboardList },
            { name: 'General Approval', path: '/general-approvals', icon: ClipboardCheck },
            { name: 'Suppliers', path: '/inventory/suppliers', icon: Truck },
            { name: 'Purchase Orders', path: '/inventory/purchase-orders', icon: ReceiptText },
            { name: 'Goods Receipt', path: '/inventory/goods-receipt', icon: ClipboardList },
            { name: 'Approval Matrix', path: '/admin/approval-matrix', icon: ClipboardCheck },
        ]
    },
    {
        id: 'sales',
        label: 'Sales',
        icon: ShoppingCart,
        color: 'text-emerald-400',
        paths: ['/orders', '/customers', '/dispatch'],
        items: [
            { name: 'Sales & Orders', path: '/orders', icon: ShoppingCart },
            { name: 'Customers', path: '/customers', icon: Users },
            { name: 'Dispatch', path: '/dispatch', icon: TruckIcon },
        ]
    },
    {
        id: 'logistics',
        label: 'Logistics',
        icon: ArrowRightLeft,
        color: 'text-cyan-400',
        paths: ['/logistics', '/warehouses'],
        items: [
            { name: 'Logistics STO', path: '/logistics', icon: ArrowRightLeft },
            { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
        ]
    },
    {
        id: 'reports',
        label: 'Reports & Analytics',
        icon: BarChart3,
        color: 'text-pink-400',
        paths: ['/analytics', '/reports'],
        items: [
            { name: 'Analytics', path: '/analytics', icon: BarChart3 },
            { name: 'Reports', path: '/reports', icon: FileText },
        ]
    },
    {
        id: 'admin',
        label: 'Administration',
        icon: Shield,
        color: 'text-slate-400',
        paths: ['/users', '/settings', '/admin/approvers'],
        items: [
            { name: 'Users', path: '/users', icon: Shield },
            { name: 'Settings', path: '/settings', icon: SettingsIcon },
            { name: 'Approvers', path: '/admin/approvers', icon: Shield },
        ]
    },
];

const Sidebar = () => {
    const { logout } = useAuth();
    const location = useLocation();

    const isGroupActive = (group) =>
        group.paths?.some(p => location.pathname === p || location.pathname.startsWith(p + '/')) ||
        group.items?.some(item => location.pathname === item.path);

    const [openGroups, setOpenGroups] = useState(() => {
        const initial = {};
        groups.forEach(g => { initial[g.id] = !g.single && isGroupActive(g); });
        return initial;
    });

    const toggle = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-secondary text-white flex flex-col shadow-xl z-30 overflow-hidden">
            {/* Brand */}
            <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                        <Package className="text-white" size={18} />
                    </div>
                    <div>
                        <div className="font-black text-sm tracking-tight text-white leading-none">Enterprise ERP</div>
                        <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">MitiO Systems</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10">
                {groups.map((group) => {
                    if (group.single) {
                        const item = group.items[0];
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150 mx-1 mb-1 ${
                                        isActive
                                            ? 'bg-primary text-white shadow-md shadow-primary/30'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`
                                }
                            >
                                <item.icon size={17} />
                                <span className="text-sm font-semibold">{item.name}</span>
                            </NavLink>
                        );
                    }

                    const active = isGroupActive(group);
                    const open = openGroups[group.id];

                    return (
                        <div key={group.id} className="mx-1">
                            {/* Group header */}
                            <button
                                onClick={() => toggle(group.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                                    active
                                        ? 'bg-white/8 text-white'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <group.icon size={17} className={active ? group.color : 'text-slate-500 group-hover:text-slate-300'} />
                                    <span className="text-sm font-semibold">{group.label}</span>
                                    {active && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                    )}
                                </div>
                                <ChevronDown
                                    size={14}
                                    className={`text-slate-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Group children */}
                            {open && (
                                <div className="mt-0.5 ml-3 pl-3 border-l border-white/8 space-y-0.5 pb-1">
                                    {group.items.map(item => (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-150 ${
                                                    isActive
                                                        ? 'bg-primary text-white shadow-md shadow-primary/25'
                                                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
                                                }`
                                            }
                                        >
                                            <item.icon size={15} className="shrink-0" />
                                            <span className="text-xs font-medium leading-tight">{item.name}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="shrink-0 px-3 py-3 border-t border-white/5">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
