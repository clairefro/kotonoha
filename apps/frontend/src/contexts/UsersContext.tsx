import React, { createContext, useContext, useState, useEffect } from "react";
import { sdk } from "../api/sdk";
import { User } from "shared-types";

interface UsersContextType {
  users: User[];
  getUserById: (id: string) => User | undefined;
  getOrFetchUserById: (id: string) => Promise<User | undefined>;
  refreshUsers: () => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = async () => {
    const all = await sdk.users.list();
    setUsers(all);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const getUserById = (id: string) => users.find((u) => u.id === id);

  // Fetch user by id if not in cache, and update cache if found
  const getOrFetchUserById = async (id: string): Promise<User | undefined> => {
    let user = getUserById(id);
    if (user) return user;
    try {
      user = await sdk.users.get(id);
      if (user) {
        setUsers((prev) =>
          prev.some((u) => u.id === user!.id) ? prev : [...prev, user!],
        );
        return user;
      }
    } catch {
      // If not found, add a placeholder user
      const unknownUser: User = {
        id: id as User["id"],
        username: "Unknown",
        is_admin: false,
      };
      setUsers((prev) =>
        prev.some((u) => u.id === id) ? prev : [...prev, unknownUser],
      );
      return unknownUser;
    }
    return undefined;
  };

  return (
    <UsersContext.Provider
      value={{ users, getUserById, getOrFetchUserById, refreshUsers }}
    >
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within a UsersProvider");
  return ctx;
};
