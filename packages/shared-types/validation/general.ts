import { z } from "zod";

export const IdParamSchema = z.object({
  id: z.string().min(1, "Missing or invalid id parameter"),
});
