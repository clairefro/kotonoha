import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import Room from "./pages/Room";
import Login from "./pages/Login";
import OnboardAdmin from "./pages/OnboardAdmin";
import Profile from "./pages/Profile";
import ItemDetail from "./pages/ItemDetail";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UsersProvider } from "./contexts/UsersContext";
import "./styles.css";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading, checkUsersEmpty } = useAuth();
  const location = useLocation();
  const [usersEmpty, setUsersEmpty] = React.useState<boolean | null>(null);
  const [checkingUsers, setCheckingUsers] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    checkUsersEmpty()
      .then((empty) => {
        if (mounted) setUsersEmpty(empty);
      })
      .finally(() => {
        if (mounted) setCheckingUsers(false);
      });
    return () => {
      mounted = false;
    };
  }, [checkUsersEmpty]);

  if (checkingUsers || loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>Launching...</div>
    );
  }
  if (usersEmpty) {
    return <Navigate to="/onboard-admin" replace />;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/onboard-admin" element={<OnboardAdmin />} />
    <Route path="/" element={<Layout />}>
      <Route
        index
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />
      <Route
        path="profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="room"
        element={
          <RequireAuth>
            <Room />
          </RequireAuth>
        }
      />
      <Route
        path="items/:id"
        element={
          <RequireAuth>
            <ItemDetail />
          </RequireAuth>
        }
      />
    </Route>
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <UsersProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </UsersProvider>
  </AuthProvider>
);

export default App;
