import type { TaskStatus } from "@/lib/constants";

export type { TaskStatus };

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Project {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  doneCount: number;
}

export interface Task {
  id: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorPayload {
  message: string;
  fields?: Record<string, string[]>;
  status?: number;
}
