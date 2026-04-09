import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import SignIn from "./pages/SignIn";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signin"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignIn />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AppRoutes />
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Giving Cure
      </footer>
    </div>
  );
}
