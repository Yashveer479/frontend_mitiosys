import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, ArrowRightLeft, Warehouse, Shield, Settings as SettingsIcon, ClipboardCheck, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const role = user?.role || 'viewer';

    const allNavItems = [
        { name: 'Dashboard',           path: '/',                       icon: LayoutDashboard, roles: null },
        { name: 'Production',          path: '/production/raw-entry',   icon: Layers, roles: ['admin','production'] },
        { name: 'Thickness Processing',path: '/production/thickness',   icon: Layers, roles: ['admin','production'] },
        { name: 'Sanding Processing',  path: '/production/sanding',     icon: Layers, roles: ['admin','production'] },
        { name: 'Grading',             path: '/production/grading',     icon: Layers, roles: ['admin','production'] },
        { name: 'Production Transfer', path: '/warehouse/transfer',     icon: Layers, roles: ['admin','warehouse'] },
        { name: 'Send to Lamination',  path: '/warehouse/lamination',   icon: Layers, roles: ['admin','warehouse'] },
        { name: 'Lamination Dept',     path: '/lamination/process',     icon: Layers, roles: ['admin','lamination'] },
        { name: 'Warehouse Inventory', path: '/warehouse/inventory',    icon: Layers, roles: ['admin','warehouse','viewer'] },
        { name: 'Products',            path: '/products',               icon: Package, roles: null },
        { name: 'Inventory',           path: '/inventory',              icon: Package, roles: null },
        { name: 'Stock Audit',         path: '/inventory/audit',        icon: ClipboardCheck, roles: ['admin'] },
        { name: 'Settings',            path: '/settings',               icon: SettingsIcon, roles: ['admin'] },
        { name: 'Logistics STO',       path: '/logistics',              icon: ArrowRightLeft, roles: null },
        { name: 'Warehouses',          path: '/warehouses',             icon: Warehouse, roles: ['admin','warehouse'] },
        { name: 'Sales & Orders',      path: '/orders',                 icon: ShoppingCart, roles: null },
        { name: 'Dispatch',            path: '/dispatch',               icon: ArrowRightLeft, roles: null },
        { name: 'Customers',           path: '/customers',              icon: Users, roles: null },
        { name: 'Analytics',           path: '/analytics',              icon: BarChart3, roles: ['admin','viewer'] },
        { name: 'Reports',             path: '/reports',                icon: BarChart3, roles: ['admin','viewer'] },
        { name: 'Users',               path: '/users',                  icon: Shield, roles: ['admin'] },
        { name: 'System Engine',       path: '/admin/system-engine',   icon: Shield, roles: ['admin'] },
        { name: 'Security Audit',      path: '/admin/security-audit',  icon: Shield, roles: ['admin'] },
        { name: 'Developer API',       path: '/admin/developer-api',   icon: Shield, roles: ['admin'] },
    ];

    const navItems = allNavItems.filter(item => !item.roles || item.roles.includes(role));
    const laminationItemNames = ['Lamination Dept', 'Warehouse Inventory'];
    const laminationNavItems = navItems.filter(item => laminationItemNames.includes(item.name));
    const primaryNavItems = navItems.filter(item => !laminationItemNames.includes(item.name));

    const renderNavItem = (item) => (
        <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
            }
        >
            <item.icon size={18} />
            <span className="text-sm font-medium">{item.name}</span>
        </NavLink>
    );

    // Group items by section
    const productionItemNames = ['Production', 'Thickness Processing', 'Sanding Processing', 'Grading', 'Production Transfer', 'Send to Lamination'];
    const productionNavItems = navItems.filter(item => productionItemNames.includes(item.name));
    const otherNavItems = navItems.filter(item => !productionItemNames.includes(item.name) && !laminationItemNames.includes(item.name));

    return (
        <div className="fixed left-0 top-0 h-screen w-64 bg-secondary text-white flex flex-col shadow-xl z-30 overflow-hidden">
            {/* Brand Area */}
            <div className="h-20 flex items-center px-6 border-b border-white/5">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Package className="text-white" size={20} />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Enterprise ERP</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-6 overflow-y-auto">
                <div className="space-y-1">
                    {navItems.filter(item => item.name === 'Dashboard').map(renderNavItem)}
                </div>

                {/* Production Section */}
                {productionNavItems.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/10">
                        <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Production
                        </p>
                        <div className="space-y-1">
                            {productionNavItems.map(renderNavItem)}
                        </div>
                    </div>
                )}

                {/* Lamination Section - Right below Production */}
                {laminationNavItems.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/10">
                        <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Lamination
                        </p>
                        <div className="space-y-1">
                            {laminationNavItems.map(renderNavItem)}
                        </div>
                    </div>
                )}

                {/* Other Sections */}
                {otherNavItems.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-white/10">
                        <div className="space-y-1">
                            {otherNavItems.map(renderNavItem)}
                        </div>
                    </div>
                )}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5 bg-mitio-navy-dark/20 space-y-2">
                <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-slate-500 hover:bg-mitio-red/10 hover:text-mitio-red transition-all font-bold text-[10px] uppercase tracking-widest group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
