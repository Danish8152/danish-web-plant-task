import { NextResponse } from "next/server";
import { parseBody, parseId, textOrNull, withApi, type Ctx } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { findOwnedProject, findTaskInProject } from "@/lib/queries";
import { toTaskDTO } from "@/lib/serializers";
import { requireSession } from "@/lib/session";
import { taskUpdateSchema } from "@/lib/validation";

type Params = Ctx<{ id: string; taskId: string }>;

async function loadTask({ params }: Params, userId: number) {
  const { id, taskId } = await params;
  const projectId = parseId(id, "Project");
  const parsedTaskId = parseId(taskId, "Task");
  await connectDb();
  await findOwnedProject(projectId, userId);
  return findTaskInProject(parsedTaskId, projectId);
}

export const GET = withApi(async (_req, ctx: Params) => {
  const session = await requireSession();
  const task = await loadTask(ctx, session.id);
  return NextResponse.json({ task: toTaskDTO(task) });
});

export const PATCH = withApi(async (req, ctx: Params) => {
  const session = await requireSession();
  const input = await parseBody(req, taskUpdateSchema);
  const task = await loadTask(ctx, session.id);

  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = textOrNull(input.description);
  if (input.status !== undefined) task.status = input.status;
  if (input.dueDate !== undefined) task.dueDate = input.dueDate;
  await task.save();

  return NextResponse.json({ task: toTaskDTO(task) });
});

export const DELETE = withApi(async (_req, ctx: Params) => {
  const session = await requireSession();
  const task = await loadTask(ctx, session.id);
  await task.destroy();
  return NextResponse.json({ ok: true });
});
