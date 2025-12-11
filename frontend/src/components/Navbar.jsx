import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-indigo-600">
          Giving Cure
        </Link>
        <div className="flex gap-6 text-gray-700 font-medium">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Home</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Dashboard</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Notifications</NavLink>
          <NavLink to="/signin" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Sign In</NavLink>
        </div>
      </div>
    </nav>
  );
}
