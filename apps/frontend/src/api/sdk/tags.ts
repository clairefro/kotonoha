// SDK for fetching tags from the backend
import { apiFetch } from "../api";
import type { TagOrAuthor } from "shared-types";

export const tags = {
  async list(): Promise<TagOrAuthor[]> {
    return apiFetch("/api/tags");
  },
  async get(id: string): Promise<TagOrAuthor> {
    return apiFetch(`/api/tags/${id}`);
  },
};
