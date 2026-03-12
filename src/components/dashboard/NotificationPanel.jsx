import React from 'react';
import { Bell } from 'lucide-react';
import IntelligenceAlertItem from './IntelligenceAlertItem';

const NotificationPanel = ({ alerts }) => (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center space-x-2">
                <Bell size={16} className="text-blue-600" />
                <span>Intelligence</span>
            </h3>
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        </div>
        <div className="divide-y divide-slate-50">
            {alerts.map((alert) => (
                <IntelligenceAlertItem
                    key={alert.msg}
                    type={alert.type}
                    msg={alert.msg}
                    time={alert.time}
                    isAlert={alert.isAlert}
                    onClick={alert.onClick}
                />
            ))}
        </div>
    </div>
);

export default NotificationPanel;