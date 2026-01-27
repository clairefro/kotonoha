import { apiFetch } from "../api";
import type { Item, ItemId } from "../../../../../packages/shared-types";

export const items = {
  async list(): Promise<Item[]> {
    return apiFetch("/api/items");
  },
  // Note: get() is left as-is unless backend is updated to return raw Item
  async create(item: Omit<Item, "id" | "created_at">): Promise<Item> {
    return apiFetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  },
  async update(
    id: ItemId,
    updates: Partial<Omit<Item, "id" | "created_at" | "added_by">>,
  ): Promise<Item> {
    return apiFetch(`/api/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  },
  async delete(id: ItemId): Promise<void> {
    await apiFetch(`/api/items/${id}`, { method: "DELETE" });
  },
};
