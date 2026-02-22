import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Warehouses from './pages/Warehouses';
import Logistics from './pages/Logistics';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
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
                                                <Route path="/inventory" element={<Inventory />} />
                                                <Route path="/orders" element={<Orders />} />
                                                <Route path="/customers" element={<Customers />} />
                                                <Route path="/warehouses" element={<Warehouses />} />
                                                <Route path="/logistics" element={<Logistics />} />
                                                <Route path="/users" element={<UserManagement />} />
                                                <Route path="/settings" element={<Settings />} />
                                                <Route path="/profile" element={<Profile />} />
                                                <Route path="/change-password" element={<ChangePassword />} />
                                            </Routes>
                                        </div>
                                    </main>
                                    <Footer />
                                </div>
                            }
                        />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
