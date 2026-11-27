"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { FolderIcon, PlusIcon } from "@/components/ui/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProject, deleteProject, fetchProjects, updateProject } from "@/store/projectsSlice";
import type { Project } from "@/types";
import ProjectCard from "./ProjectCard";
import ProjectForm from "./ProjectForm";

export default function ProjectsView() {
  const dispatch = useAppDispatch();
  const { items, listStatus, listError } = useAppSelector((s) => s.projects);

  const [editing, setEditing] = useState<Project | "new" | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const firstLoad = items.length === 0 && (listStatus === "idle" || listStatus === "loading");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500">Everything you&apos;re working on, in one place.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
          <PlusIcon />
          New project
        </button>
      </div>

      {listStatus === "failed" && (
        <div className="mb-4">
          <Alert>
            {listError}{" "}
            <button type="button" className="font-medium underline" onClick={() => dispatch(fetchProjects())}>
              Try again
            </button>
          </Alert>
        </div>
      )}

      {firstLoad ? (
        <Spinner label="Loading projects…" />
      ) : items.length === 0 && listStatus === "succeeded" ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <FolderIcon className="size-6" />
          </div>
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Create your first project, then break it down into tasks.
          </p>
          <button type="button" className="btn btn-primary mt-5" onClick={() => setEditing("new")}>
            <PlusIcon />
            Create a project
          </button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => setEditing(project)}
              onDelete={() => setDeleting(project)}
            />
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        title={editing === "new" ? "New project" : "Edit project"}
        onClose={() => setEditing(null)}
      >
        <ProjectForm
          initial={editing && editing !== "new" ? editing : undefined}
          submitLabel={editing === "new" ? "Create project" : "Save changes"}
          onCancel={() => setEditing(null)}
          onSubmit={async (values) => {
            if (editing === "new") await dispatch(createProject(values)).unwrap();
            else if (editing) await dispatch(updateProject({ id: editing.id, changes: values })).unwrap();
            setEditing(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete project?"
        message={
          <>
            <strong className="text-slate-900">{deleting?.title}</strong> and all of its tasks will be permanently
            deleted. This can&apos;t be undone.
          </>
        }
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await dispatch(deleteProject(deleting.id)).unwrap();
          setDeleting(null);
        }}
      />
    </div>
  );
}
