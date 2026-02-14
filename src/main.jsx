//\src\main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthProvider";

import Login from "./pages/Login";
import ProductDashboard from "./pages/ProductDashboard";
import DashboardLayout from "./layouts/DashboardLayout";
import ComingSoon from "./pages/ComingSoon";
import StoreList from "./pages/StoreList";
import HostAssistant from "./pages/HostAssistant";
import LiveProducts from "./pages/LiveProducts";
import StockHistory from "./pages/StockHistory";

import { HostAssistantProvider } from "./context/HostAssistantContext";

import "./index.css";

function PrivateRoute({ children }) {
    const { user } = useAuth();
    if (user === undefined) return null; // tunggu context siap
    return user ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HostAssistantProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/master-product"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ProductDashboard />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/mapping-produk"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Mapping Produk (Master ↔ Client SKU)" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/store-list"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <StoreList />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/host-assistant"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <HostAssistant />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/live-products"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <LiveProducts />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/add-store"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Hubungkan Toko Baru" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/store-master"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Tentukan Master Toko" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
         
          <Route
            path="/sync-stock"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Sinkronisasi Stok Manual" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/stock-history"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <StockHistory />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/status-update"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Status Update (log sukses/gagal)" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/all-orders"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Semua Order" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/order-sync"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Order Status Sync" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/user-management"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="User Management" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/api-integration"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="API Keys & Integrasi" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <DashboardLayout>
                  <ComingSoon title="Notifikasi (WA/Email kalau stok error)" />
                </DashboardLayout>
              </PrivateRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Navigate to="/master-product" />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
        </HostAssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
