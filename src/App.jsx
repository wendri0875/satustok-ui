import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import Login from "./pages/Login";
import ProductDashboard from "./pages/ProductDashboard";

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
      </Routes>
    </Router>
  );
}
