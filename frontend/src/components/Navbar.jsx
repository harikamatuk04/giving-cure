import { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, signOut, deleteAccount } = useAuth();
  const isAdminOnlyMode = import.meta.env.VITE_AUTH_ADMIN_ONLY === "true";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleSignOut = () => {
    signOut();
    setIsDropdownOpen(false);
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted."
    );
    
    if (confirmed) {
      const result = await deleteAccount();
      if (result.success) {
        setShowDeleteConfirm(false);
        setIsDropdownOpen(false);
      } else {
        alert(`Failed to delete account: ${result.error}`);
      }
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-semibold text-indigo-600">
          Giving Cure
        </Link>
        <div className="flex gap-6 items-center text-gray-700 font-medium">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Home</NavLink>
          {isAuthenticated ? (
            <>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Dashboard</NavLink>
          <NavLink to="/notifications" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Notifications</NavLink>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="text-2xl hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full p-1"
                  aria-label="Profile menu"
                >
                  👤
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                    {!isAdminOnlyMode && (
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Delete Account
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
          <NavLink to="/signin" className={({ isActive }) => isActive ? "text-indigo-600" : ""}>Sign In</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
