import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CornerDownLeft, File, Package, ShoppingCart, Users, Settings, BarChart2 } from 'lucide-react';

const allCommands = [
    { name: 'Dashboard', path: '/dashboard', icon: <BarChart2 size={16} /> },
    { name: 'Products', path: '/products', icon: <Package size={16} /> },
    { name: 'Inventory', path: '/inventory', icon: <File size={16} /> },
    { name: 'Sales Orders', path: '/sales/orders', icon: <ShoppingCart size={16} /> },
    { name: 'Customers', path: '/sales/customers', icon: <Users size={16} /> },
    { name: 'Purchase Requests', path: '/purchase-requests', icon: <File size={16} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={16} /> },
];

const CommandPalette = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredCommands = searchTerm
        ? allCommands.filter(cmd => cmd.name.toLowerCase().includes(searchTerm.toLowerCase()))
        : allCommands;

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[activeIndex]) {
                handleSelect(filteredCommands[activeIndex].path);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (path) => {
        navigate(path);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for commands or pages..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-12 pr-4 py-4 bg-transparent border-b border-slate-100 text-sm font-medium placeholder:text-slate-400 focus:outline-none"
                    />
                </div>
                <div className="p-2 max-h-96 overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                        <ul>
                            {filteredCommands.map((cmd, index) => (
                                <li key={cmd.path}>
                                    <button
                                        onClick={() => handleSelect(cmd.path)}
                                        onMouseMove={() => setActiveIndex(index)}
                                        className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-lg text-sm font-semibold ${
                                            index === activeIndex ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {cmd.icon}
                                            <span>{cmd.name}</span>
                                        </div>
                                        {index === activeIndex && <CornerDownLeft size={14} />}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-sm text-slate-500">
                            <p>No commands found for "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
