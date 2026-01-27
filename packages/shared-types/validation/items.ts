import { z } from "zod";

export const CreateItemRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source_url: z
    .string()
    .regex(/^https?:\/\/.+\..+/, "Invalid URL")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  item_type: z
    .enum(["article", "book", "essay", "poem", "other"])
    .default("article"),
  added_by: z.string().min(1, "added_by is required"),
});

export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;

// Update item request validation
export const UpdateItemRequestSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  source_url: z
    .string()
    .regex(/^https?:\/\/.+\..+/, "Invalid URL")
    .or(z.literal(""))
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  item_type: z.enum(["article", "book", "essay", "poem", "other"]).optional(),
});
export type UpdateItemRequest = z.infer<typeof UpdateItemRequestSchema>;
