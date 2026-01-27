import { Link } from "react-router-dom";

const Navbar: React.FC = () => (
  <nav className="navbar">
    <Link to="/">Home</Link>
    {/* Add more nav links here */}
  </nav>
);

export default Navbar;
