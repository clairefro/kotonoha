import { z } from "zod";

// Login request validation
export const LoginRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(2, "Password must be at least 2 characters"),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Create user request validation (can be same as login for now)
export const CreateUserRequestSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(2, "Password must be at least 2 characters"),
});
export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
