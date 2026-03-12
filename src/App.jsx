import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import SalesOrder from './pages/SalesOrder';
import Customers from './pages/Customers';
import Warehouses from './pages/Warehouses';
import Logistics from './pages/Logistics';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import ChangeEmail from './pages/ChangeEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Dispatch from './pages/Dispatch';
import StockAudit from './pages/StockAudit';
import ProductionRawEntry from './pages/ProductionRawEntry';
import ThicknessProcessing from './pages/ThicknessProcessing';
import SandingProcessing from './pages/SandingProcessing';
import Grading from './pages/Grading';
import ProductionTransfer from './pages/ProductionTransfer';
import SendToLamination from './pages/SendToLamination';
import LaminationDepartment from './pages/LaminationDepartment';
import WarehouseInventory from './pages/WarehouseInventory';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import GoodsReceipt from './pages/GoodsReceipt';
import InventoryHistory from './pages/InventoryHistory';
import StockAdjustment from './pages/StockAdjustment';
import ProductionPlanning from './pages/ProductionPlanning';
import StaticPortalPage from './pages/StaticPortalPage';

import ErrorBoundary from './components/ErrorBoundary';
import RoleGuard from './components/RoleGuard';

function App() {
    const systemPortal = (
        <StaticPortalPage
            eyebrow="System Oversight"
            title="Platform Status Console"
            description="Executive visibility for synchronization, service health, and platform resilience across ERP control surfaces."
            primaryAction={{ label: 'Open Analytics', path: '/analytics' }}
            secondaryAction={{ label: 'Review Reports', path: '/reports' }}
            sections={[
                { kicker: 'Services', title: 'Core Engine Health', body: 'Review the live service heartbeat, integration checkpoints, and operational anomalies in one place.', path: '/analytics' },
                { kicker: 'Security', title: 'Synchronization Audit', body: 'Inspect terminal sync events, access posture, and recent orchestration changes.', path: '/security-audit' },
                { kicker: 'Recovery', title: 'Operational Escalation', body: 'Jump to reporting workflows to validate production, sales, and inventory impact.', path: '/reports' }
            ]}
        />
    );

    return (
        <BrowserRouter>
            <AuthProvider>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route element={<PrivateRoute />}>
                            <Route
                                path="*"
                                element={
                                    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 flex flex-col">
                                        <Sidebar />
                                        <Header />
                                        <main className="flex-1 pl-64 pt-20">
                                            <div className="p-8 max-w-7xl mx-auto">
                                                <Routes>
                                                    <Route path="/" element={<Dashboard />} />
                                                    <Route path="/products" element={<Products />} />
                                                    <Route path="/inventory" element={<Inventory />} />
                                                    <Route path="/inventory/restock" element={<Inventory />} />
                                                    <Route path="/inventory/add-stock" element={<Inventory />} />
                                                    <Route path="/inventory/low-stock" element={<Inventory />} />
                                                    <Route path="/orders" element={<Orders />} />
                                                    <Route path="/sales/orders" element={<Orders />} />
                                                    <Route path="/sales/pending" element={<Orders />} />
                                                    <Route path="/sales/create-order" element={<SalesOrder />} />
                                                    <Route path="/orders/new" element={<SalesOrder />} />
                                                    <Route path="/customers" element={<Customers />} />
                                                    <Route path="/warehouses" element={<Warehouses />} />
                                                    <Route path="/warehouse/locations" element={<Warehouses />} />
                                                    <Route path="/logistics" element={<Logistics />} />
                                                    <Route path="/inventory/audit" element={<StockAudit />} />
                                                    <Route path="/dispatch" element={<Dispatch />} />
                                                    <Route path="/analytics" element={<Analytics />} />
                                                    <Route path="/reports" element={<RoleGuard roles={['admin', 'manager']}><Reports /></RoleGuard>} />
                                                    <Route path="/reports/production" element={<RoleGuard roles={['admin', 'manager']}><Reports /></RoleGuard>} />
                                                    <Route path="/system/status" element={systemPortal} />
                                                    <Route path="/system-status" element={systemPortal} />
                                                    <Route
                                                        path="/docs"
                                                        element={
                                                            <StaticPortalPage
                                                                eyebrow="Knowledge Base"
                                                                title="ERP Documentation"
                                                                description="Technical and operational documentation for executive workflows, process controls, and system administration."
                                                                primaryAction={{ label: 'Open Analytics', path: '/analytics' }}
                                                                secondaryAction={{ label: 'Production Reports', path: '/reports/production' }}
                                                                sections={[
                                                                    { kicker: 'Operations', title: 'Executive Playbooks', body: 'Cross-functional SOP guidance for inventory, production, and order orchestration.', path: '/analytics' },
                                                                    { kicker: 'Modules', title: 'Workflow References', body: 'Navigate directly into the operational modules documented for warehouse, sales, and production teams.', path: '/inventory' },
                                                                    { kicker: 'Support', title: 'Implementation Notes', body: 'Reference deployment practices, environment setup, and escalation channels.', path: '/developer-api' }
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                    <Route
                                                        path="/developer-api"
                                                        element={
                                                            <StaticPortalPage
                                                                eyebrow="Integration Layer"
                                                                title="Developer API"
                                                                description="Reference surface for ERP integrations, event streams, and backend automation pathways."
                                                                primaryAction={{ label: 'Open System Status', path: '/system-status' }}
                                                                secondaryAction={{ label: 'View Reports', path: '/reports' }}
                                                                sections={[
                                                                    { kicker: 'Endpoints', title: 'Service Surface', body: 'Audit available integration points and align reporting, inventory, and production consumers.', path: '/system/status' },
                                                                    { kicker: 'Automation', title: 'Operational Hooks', body: 'Coordinate API-backed workflows with the live ERP command center.', path: '/analytics' },
                                                                    { kicker: 'Telemetry', title: 'Report Feeds', body: 'Inspect analytics endpoints used by executive dashboards and manufacturing reports.', path: '/reports/production' }
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                    <Route
                                                        path="/privacy-policy"
                                                        element={
                                                            <StaticPortalPage
                                                                eyebrow="Governance"
                                                                title="Privacy Policy"
                                                                description="Privacy and handling posture for customer, operational, and supplier data within the ERP platform."
                                                                primaryAction={{ label: 'Security Audit', path: '/security-audit' }}
                                                                secondaryAction={{ label: 'Terms of Service', path: '/terms' }}
                                                                sections={[
                                                                    { kicker: 'Data', title: 'Operational Data Handling', body: 'Review the controls applied to order, inventory, user, and production records.' },
                                                                    { kicker: 'Access', title: 'Access Governance', body: 'Understand how role-based workflows constrain operational visibility.' },
                                                                    { kicker: 'Controls', title: 'Security Review', body: 'Open the security audit workspace for active control monitoring.', path: '/security-audit' }
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                    <Route
                                                        path="/terms"
                                                        element={
                                                            <StaticPortalPage
                                                                eyebrow="Governance"
                                                                title="Terms of Service"
                                                                description="Service terms governing the use of Mitiosys ERP modules, integrations, and reporting workflows."
                                                                primaryAction={{ label: 'Open Privacy Policy', path: '/privacy-policy' }}
                                                                secondaryAction={{ label: 'Developer API', path: '/developer-api' }}
                                                                sections={[
                                                                    { kicker: 'Usage', title: 'Module Access Terms', body: 'Review usage boundaries for production, warehouse, sales, and reporting capabilities.' },
                                                                    { kicker: 'Operations', title: 'Service Commitments', body: 'Understand support posture, uptime expectations, and reporting continuity.' },
                                                                    { kicker: 'Security', title: 'Audit Alignment', body: 'Open current security controls and audit visibility.', path: '/security-audit' }
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                    <Route
                                                        path="/security-audit"
                                                        element={
                                                            <StaticPortalPage
                                                                eyebrow="Risk Control"
                                                                title="Security Audit"
                                                                description="Centralized view of security posture, operational trust indicators, and platform safeguards for executive review."
                                                                primaryAction={{ label: 'Open System Status', path: '/system-status' }}
                                                                secondaryAction={{ label: 'View Analytics', path: '/analytics' }}
                                                                sections={[
                                                                    { kicker: 'Integrity', title: 'Control Surface', body: 'Track synchronization integrity, service continuity, and operational anomalies.', path: '/system/status' },
                                                                    { kicker: 'Identity', title: 'Access Signals', body: 'Review user workflows and policy posture for protected ERP modules.', path: '/users' },
                                                                    { kicker: 'Response', title: 'Executive Monitoring', body: 'Jump into the analytics dashboard to correlate alerts with live operations.', path: '/analytics' }
                                                                ]}
                                                            />
                                                        }
                                                    />
                                                    <Route path="/users" element={<RoleGuard roles={['admin']}><UserManagement /></RoleGuard>} />
                                                    <Route path="/settings" element={<RoleGuard roles={['admin']}><Settings /></RoleGuard>} />
                                                    <Route path="/profile" element={<Profile />} />
                                                    <Route path="/change-password" element={<ChangePassword />} />
                                                    <Route path="/change-email" element={<ChangeEmail />} />
                                    <Route path="/production/raw-entry" element={<ProductionRawEntry />} />
                                    <Route path="/production/create-batch" element={<ProductionPlanning />} />
                                    <Route path="/production/planning" element={<ProductionPlanning />} />
                                                    <Route path="/production/history" element={<ProductionPlanning />} />
                                    <Route path="/production/thickness" element={<ThicknessProcessing />} />
                                    <Route path="/production/sanding" element={<SandingProcessing />} />
                                    <Route path="/production/grading" element={<Grading />} />
                                    <Route path="/warehouse/transfer" element={<ProductionTransfer />} />
                                    <Route path="/warehouse/lamination" element={<SendToLamination />} />
                                    <Route path="/lamination/process" element={<LaminationDepartment />} />
                                    <Route path="/warehouse/inventory" element={<WarehouseInventory />} />
                                    <Route path="/inventory/suppliers" element={<Suppliers />} />
                                    <Route path="/inventory/purchase-orders" element={<PurchaseOrders />} />
                                    <Route path="/inventory/goods-receipt" element={<GoodsReceipt />} />
                                    <Route path="/inventory/history" element={<InventoryHistory />} />
                                    <Route path="/inventory/adjustment" element={<StockAdjustment />} />
                                                </Routes>
                                            </div>
                                        </main>
                                        <Footer />
                                    </div>
                                }
                            />
                        </Route>
                    </Routes>
                </ErrorBoundary>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
