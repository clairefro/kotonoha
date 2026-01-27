import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    logout();
  };

  return (
    <nav className="navbar navbar-flex">
      <div>
        <Link to="/">Home</Link>
        <Link to="/room" style={{ marginLeft: 16 }}>
          Room
        </Link>
        {user && (
          <Link to="/profile" style={{ marginLeft: 16 }}>
            Profile
          </Link>
        )}
        {/* Add more nav links here */}
      </div>
      <div className="navbar-user">
        {user ? (
          <>
            {user.username}
            <button onClick={handleLogout} style={{ marginLeft: 12 }}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
