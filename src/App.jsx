import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import ProductDashboard from "./pages/ProductDashboard";
import StoreList from "./pages/StoreList"; // 👉 import StoreList

export default function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={user ? <ProductDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/store-list"
          element={user ? <StoreList /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

