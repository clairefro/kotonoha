import { apiFetch } from "../api";
import { SessionUser } from "shared-types";

export const auth = {
  async login(username: string, password: string): Promise<SessionUser> {
    return apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  },
  async session(): Promise<SessionUser | null> {
    return apiFetch("/api/auth/session");
  },
  async logout(): Promise<void> {
    await apiFetch("/api/auth/logout", { method: "POST" });
  },
};
