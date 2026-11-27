import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "@/components/tasks/ProjectDetail";

export const metadata: Metadata = { title: "Project" };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <ProjectDetail projectId={Number(id)} />;
}
