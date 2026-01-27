import { z } from "zod";

export const UserCreateRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(2, "Password must be at least 2 characters"),
});

export type UserCreateRequest = z.infer<typeof UserCreateRequestSchema>;
