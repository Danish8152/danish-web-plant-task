import { NextResponse } from "next/server";
import { parseBody, parseId, textOrNull, withApi, type Ctx } from "@/lib/api";
import { connectDb } from "@/lib/db";
import { findOwnedProject } from "@/lib/queries";
import { toProjectDTO } from "@/lib/serializers";
import { requireSession } from "@/lib/session";
import { projectUpdateSchema } from "@/lib/validation";

type Params = Ctx<{ id: string }>;

export const GET = withApi(async (_req, { params }: Params) => {
  const session = await requireSession();
  const projectId = parseId((await params).id, "Project");
  await connectDb();

  const project = await findOwnedProject(projectId, session.id);
  return NextResponse.json({ project: toProjectDTO(project) });
});

export const PATCH = withApi(async (req, { params }: Params) => {
  const session = await requireSession();
  const projectId = parseId((await params).id, "Project");
  const input = await parseBody(req, projectUpdateSchema);
  await connectDb();

  const project = await findOwnedProject(projectId, session.id);
  if (input.title !== undefined) project.title = input.title;
  if (input.description !== undefined) project.description = textOrNull(input.description);
  await project.save();

  return NextResponse.json({ project: toProjectDTO(project) });
});

export const DELETE = withApi(async (_req, { params }: Params) => {
  const session = await requireSession();
  const projectId = parseId((await params).id, "Project");
  await connectDb();

  const project = await findOwnedProject(projectId, session.id);
  await project.destroy();
  return NextResponse.json({ ok: true });
});
