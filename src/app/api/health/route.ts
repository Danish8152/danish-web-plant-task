import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";

export async function GET() {
  try {
    const sequelize = await connectDb();
    await sequelize.authenticate();
    return NextResponse.json({ ok: true, database: "connected" });
  } catch (err) {
    console.error("[health] database check failed:", err);
    return NextResponse.json({ ok: false, database: "unreachable" }, { status: 503 });
  }
}
