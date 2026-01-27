import { apiFetch } from "../api";
import { User } from "../../../../../packages/shared-types";

export const users = {
  async list(): Promise<User[]> {
    return apiFetch("/api/users");
  },
  async get(id: string): Promise<User> {
    return apiFetch(`/api/users/${id}`);
  },
  async create(username: string, password: string): Promise<User> {
    return apiFetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },
  async isEmpty(): Promise<boolean> {
    const data = await apiFetch("/api/users/empty");
    return !!data.empty;
  },
};
