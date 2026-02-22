import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, ArrowRightLeft, Warehouse, Shield, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Inventory', path: '/inventory', icon: Package },
        { name: 'Logistics STO', path: '/logistics', icon: ArrowRightLeft },
        { name: 'Warehouses', path: '/warehouses', icon: Warehouse },
        { name: 'Sales & Orders', path: '/orders', icon: ShoppingCart },
        { name: 'Customers', path: '/customers', icon: Users },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Users', path: '/users', icon: Shield },
    ];

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

            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
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
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5 bg-mitio-navy-dark/20 space-y-2">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 text-[10px] font-bold uppercase tracking-widest ${isActive
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-slate-500 hover:bg-white/5 hover:text-white'
                        }`
                    }
                >
                    <SettingsIcon size={16} />
                    <span>Settings</span>
                </NavLink>
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
