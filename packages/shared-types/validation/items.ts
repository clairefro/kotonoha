import { z } from "zod";

// -- HELPERS --
const TagOrAuthorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(["tag", "author"]),
});

const itemTypeEnum = z.enum(["article", "book", "essay", "poem", "other"]);

const sourceUrlSchema = z
  .string()
  .regex(/^https?:\/\/.+\..+/, "Invalid URL")
  .or(z.literal(""))
  .optional()
  .transform((v) => (v === "" ? undefined : v));

// --- SCHEMAS ----

export const CreateItemRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  source_url: sourceUrlSchema,
  item_type: itemTypeEnum.default("article"),
  added_by: z.string().min(1, "added_by is required"),
  tags: z.array(TagOrAuthorSchema).optional(),
  authors: z.array(TagOrAuthorSchema).optional(),
});

export type CreateItemRequest = z.infer<typeof CreateItemRequestSchema>;

// Update item request validation
export const UpdateItemRequestSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  source_url: sourceUrlSchema,
  item_type: itemTypeEnum.optional(),
  tags: z.array(TagOrAuthorSchema).optional(),
  authors: z.array(TagOrAuthorSchema).optional(),
});
export type UpdateItemRequest = z.infer<typeof UpdateItemRequestSchema>;
