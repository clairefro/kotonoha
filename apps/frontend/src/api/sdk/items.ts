import { apiFetch } from "../api";
import type { Item, ItemId, TagOrAuthor, ItemWithMeta } from "shared-types";

export const items = {
  async list(): Promise<ItemWithMeta[]> {
    return apiFetch("/api/items");
  },
  async get(id: ItemId): Promise<ItemWithMeta> {
    return apiFetch(`/api/items/${id}`);
  },
  async create(
    item: Omit<ItemWithMeta, "id" | "created_at">,
  ): Promise<ItemWithMeta> {
    return apiFetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
  },
  async update(
    id: ItemId,
    updates: Partial<Omit<ItemWithMeta, "id" | "created_at" | "added_by">>,
  ): Promise<ItemWithMeta> {
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
