import { z } from "zod";
import { TASK_SORT_FIELDS, TASK_STATUSES } from "@/lib/constants";

const email = z
  .string("Email is required")
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(255));

export const signupSchema = z.object({
  name: z.string("Name is required").trim().min(1, "Name is required").max(100, "Name is too long"),
  email,
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
});

export const loginSchema = z.object({
  email,
  password: z.string("Password is required").min(1, "Password is required"),
});

// no .default() in these - the update schemas are the same ones with .partial()
export const projectCreateSchema = z.object({
  title: z.string("Title is required").trim().min(1, "Title is required").max(150, "Title is too long"),
  description: z.string().trim().max(2000, "Description is too long").nullish(),
});
export const projectUpdateSchema = projectCreateSchema.partial();

export const taskCreateSchema = z.object({
  title: z.string("Title is required").trim().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().trim().max(5000, "Description is too long").nullish(),
  status: z.enum(TASK_STATUSES, "Invalid status").optional(),
  dueDate: z.iso.date("Due date must be a valid date (YYYY-MM-DD)").nullish(),
});
export const taskUpdateSchema = taskCreateSchema.partial();

export const taskQuerySchema = z.object({
  status: z.enum([...TASK_STATUSES, "all"], "Invalid status filter").optional(),
  sortBy: z.enum(TASK_SORT_FIELDS, "Invalid sort field").optional(),
  order: z.enum(["asc", "desc"], "Invalid sort order").optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
