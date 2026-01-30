import { sdk } from "../api/sdk";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UserPublic } from "../../../../packages/shared-types";

interface AuthContextType {
  user: UserPublic | null;
  loading: boolean;
  login: (user: UserPublic) => void;
  logout: () => void;
  checkUsersEmpty: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (user: UserPublic) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkUsersEmpty: sdk.users.isEmpty,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
