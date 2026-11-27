import "server-only";
import type { Project, Task, User } from "@/lib/db/models";
import type { Project as ProjectDTO, Task as TaskDTO, User as UserDTO } from "@/types";

export function toUserDTO(user: User): UserDTO {
  return { id: user.id, name: user.name, email: user.email };
}

export function toProjectDTO(project: Project): ProjectDTO {
  const row = project.get({ plain: true }) as { taskCount?: number | string; doneCount?: number | string };
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCount: Number(row.taskCount ?? 0),
    doneCount: Number(row.doneCount ?? 0),
  };
}

export function toTaskDTO(task: Task): TaskDTO {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: task.dueDate,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
