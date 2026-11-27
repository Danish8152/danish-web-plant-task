import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { ConnectionError, UniqueConstraintError } from "sequelize";
import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export type Ctx<P extends Record<string, string>> = { params: Promise<P> };

function errorResponse(status: number, message: string, fields?: Record<string, string[]>) {
  return NextResponse.json({ error: message, ...(fields ? { fields } : {}) }, { status });
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) return errorResponse(err.status, err.message, err.fields);

  if (err instanceof z.ZodError) {
    const fields = z.flattenError(err).fieldErrors as Record<string, string[]>;
    return errorResponse(422, err.issues[0]?.message ?? "Validation failed", fields);
  }

  if (err instanceof UniqueConstraintError) {
    return errorResponse(409, "That value is already in use");
  }

  if (err instanceof ConnectionError) {
    console.error("[api] database connection error:", err.message);
    return errorResponse(503, "Cannot reach the database. Please try again shortly.");
  }

  console.error("[api] unexpected error:", err);
  return errorResponse(500, "Something went wrong on our side");
}

export function withApi<A extends unknown[]>(handler: (req: NextRequest, ...args: A) => Promise<Response>) {
  return async (req: NextRequest, ...args: A): Promise<Response> => {
    try {
      return await handler(req, ...args);
    } catch (err) {
      return handleError(err);
    }
  };
}

export async function parseBody<S extends z.ZodType>(req: NextRequest, schema: S): Promise<z.output<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON");
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw result.error;
  return result.data;
}

export function parseId(value: string, label: string): number {
  const id = Number(value);
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(id) || id < 1) {
    throw new ApiError(404, `${label} not found`);
  }
  return id;
}

export function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
