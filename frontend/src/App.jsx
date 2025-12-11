import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import SignIn from "./pages/SignIn";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/signin" element={<SignIn />} />
      </Routes>
      <footer className="py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Giving Cure
      </footer>
    </div>
  );
}
