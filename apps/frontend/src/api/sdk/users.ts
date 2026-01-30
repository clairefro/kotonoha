import { apiFetch } from "../api";
import {
  UserLoginCredentials,
  UserPublic,
} from "../../../../../packages/shared-types";

export const users = {
  async list(): Promise<UserPublic[]> {
    return apiFetch("/api/users");
  },
  async get(id: string): Promise<UserPublic> {
    return apiFetch(`/api/users/${id}`);
  },
  async create({
    username,
    password,
  }: UserLoginCredentials): Promise<UserPublic> {
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
