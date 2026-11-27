import { NextResponse } from "next/server";
import { literal, type Order, type WhereOptions } from "sequelize";
import { parseBody, parseId, textOrNull, withApi, type Ctx } from "@/lib/api";
import { connectDb, Task } from "@/lib/db";
import { findOwnedProject } from "@/lib/queries";
import { toTaskDTO } from "@/lib/serializers";
import { requireSession } from "@/lib/session";
import { taskCreateSchema, taskQuerySchema } from "@/lib/validation";

type Params = Ctx<{ id: string }>;

const NO_DUE_DATE_LAST = literal("`Task`.`dueDate` IS NULL");

export const GET = withApi(async (req, { params }: Params) => {
  const session = await requireSession();
  const projectId = parseId((await params).id, "Project");
  const query = taskQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
  await connectDb();

  await findOwnedProject(projectId, session.id);

  const where: WhereOptions = { projectId };
  if (query.status && query.status !== "all") where.status = query.status;

  const sortBy = query.sortBy ?? "createdAt";
  const dir = (query.order ?? (sortBy === "createdAt" ? "desc" : "asc")).toUpperCase();

  let order: Order;
  if (sortBy === "dueDate") {
    order = [[NO_DUE_DATE_LAST, "ASC"], ["dueDate", dir], ["id", "ASC"]];
  } else if (sortBy === "status") {
    order = [["status", dir], [NO_DUE_DATE_LAST, "ASC"], ["dueDate", "ASC"], ["id", "ASC"]];
  } else {
    order = [["createdAt", dir], ["id", dir]];
  }

  const tasks = await Task.findAll({ where, order });
  return NextResponse.json({ tasks: tasks.map(toTaskDTO) });
});

export const POST = withApi(async (req, { params }: Params) => {
  const session = await requireSession();
  const projectId = parseId((await params).id, "Project");
  const input = await parseBody(req, taskCreateSchema);
  await connectDb();

  await findOwnedProject(projectId, session.id);

  const task = await Task.create({
    projectId,
    title: input.title,
    description: textOrNull(input.description),
    status: input.status ?? "todo",
    dueDate: input.dueDate ?? null,
  });
  return NextResponse.json({ task: toTaskDTO(task) }, { status: 201 });
});
