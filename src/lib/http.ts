import type { ApiErrorPayload } from "@/types";

export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public fields?: Record<string, string[]>,
  ) {
    super(message);
  }

  toPayload(): ApiErrorPayload {
    return { message: this.message, status: this.status, fields: this.fields };
  }
}

export function toErrorPayload(err: unknown): ApiErrorPayload {
  if (err instanceof HttpError) return err.toPayload();
  if (typeof err === "object" && err !== null && typeof (err as { message?: unknown }).message === "string") {
    const { message, fields, status } = err as ApiErrorPayload;
    return { message, fields, status };
  }
  return { message: "Something went wrong" };
}

interface HttpOptions extends Omit<RequestInit, "body"> {
  json?: unknown;
}

export async function http<T>(url: string, { json, headers, ...init }: HttpOptions = {}): Promise<T> {
  const h = new Headers(headers);
  let body: string | undefined;
  if (json !== undefined) {
    h.set("Content-Type", "application/json");
    body = JSON.stringify(json);
  }

  let res: Response;
  try {
    res = await fetch(url, { ...init, headers: h, body, credentials: "same-origin" });
  } catch {
    throw new HttpError("Network error - check your connection and try again.");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined" && !url.startsWith("/api/auth/")) {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
    throw new HttpError(data?.error ?? `Request failed (${res.status})`, res.status, data?.fields);
  }
  return data as T;
}
