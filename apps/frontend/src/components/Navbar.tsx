import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar: React.FC = () => {
  const { user } = useAuth();
  console.log({ user });
  return (
    <nav className="navbar navbar-flex">
      <div>
        <Link to="/">Home</Link>
        {/* Add more nav links here */}
      </div>
      <div className="navbar-user">{user ? user.username : null}</div>
    </nav>
  );
};

export default Navbar;
