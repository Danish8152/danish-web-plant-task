import "server-only";
import { literal, type ProjectionAlias } from "sequelize";
import { ApiError } from "@/lib/api";
import { Project, Task } from "@/lib/db";

export const PROJECT_COUNT_ATTRS: ProjectionAlias[] = [
  [literal("(SELECT COUNT(*) FROM tasks WHERE tasks.projectId = Project.id)"), "taskCount"],
  [
    literal("(SELECT COUNT(*) FROM tasks WHERE tasks.projectId = Project.id AND tasks.status = 'done')"),
    "doneCount",
  ],
];

export async function findOwnedProject(projectId: number, userId: number) {
  const project = await Project.findOne({
    where: { id: projectId, userId },
    attributes: { include: PROJECT_COUNT_ATTRS },
  });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

export async function findTaskInProject(taskId: number, projectId: number) {
  const task = await Task.findOne({ where: { id: taskId, projectId } });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}
