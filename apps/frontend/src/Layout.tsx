import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => (
  <div>
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

export default Layout;
