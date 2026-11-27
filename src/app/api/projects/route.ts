import { NextResponse } from "next/server";
import { parseBody, textOrNull, withApi } from "@/lib/api";
import { connectDb, Project } from "@/lib/db";
import { PROJECT_COUNT_ATTRS } from "@/lib/queries";
import { toProjectDTO } from "@/lib/serializers";
import { requireSession } from "@/lib/session";
import { projectCreateSchema } from "@/lib/validation";

export const GET = withApi(async () => {
  const session = await requireSession();
  await connectDb();

  const projects = await Project.findAll({
    where: { userId: session.id },
    attributes: { include: PROJECT_COUNT_ATTRS },
    order: [
      ["createdAt", "DESC"],
      ["id", "DESC"],
    ],
  });
  return NextResponse.json({ projects: projects.map(toProjectDTO) });
});

export const POST = withApi(async (req) => {
  const session = await requireSession();
  const input = await parseBody(req, projectCreateSchema);
  await connectDb();

  const project = await Project.create({
    userId: session.id,
    title: input.title,
    description: textOrNull(input.description),
  });
  return NextResponse.json({ project: toProjectDTO(project) }, { status: 201 });
});
