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

import ErrorBoundary from './components/ErrorBoundary';
import RoleGuard from './components/RoleGuard';

function App() {
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
                                                    <Route path="/inventory/low-stock" element={<Inventory />} />
                                                    <Route path="/orders" element={<Orders />} />
                                                    <Route path="/sales/orders" element={<Orders />} />
                                                    <Route path="/sales/pending" element={<Orders />} />
                                                    <Route path="/orders/new" element={<SalesOrder />} />
                                                    <Route path="/customers" element={<Customers />} />
                                                    <Route path="/warehouses" element={<Warehouses />} />
                                                    <Route path="/logistics" element={<Logistics />} />
                                                    <Route path="/inventory/audit" element={<StockAudit />} />
                                                    <Route path="/dispatch" element={<Dispatch />} />
                                                    <Route path="/analytics" element={<Analytics />} />
                                                    <Route path="/reports" element={<RoleGuard roles={['admin', 'manager']}><Reports /></RoleGuard>} />
                                                    <Route path="/users" element={<RoleGuard roles={['admin']}><UserManagement /></RoleGuard>} />
                                                    <Route path="/settings" element={<RoleGuard roles={['admin']}><Settings /></RoleGuard>} />
                                                    <Route path="/profile" element={<Profile />} />
                                                    <Route path="/change-password" element={<ChangePassword />} />
                                                    <Route path="/change-email" element={<ChangeEmail />} />
                                    <Route path="/production/raw-entry" element={<ProductionRawEntry />} />
                                    <Route path="/production/planning" element={<ProductionPlanning />} />
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
