"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Alert from "@/components/ui/Alert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import { ArrowLeftIcon, CheckCircleIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import ProjectForm from "@/components/projects/ProjectForm";
import { toErrorPayload } from "@/lib/http";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCurrentProject, deleteProject, fetchProject, updateProject } from "@/store/projectsSlice";
import { createTask, deleteTask, fetchTasks, resetTasks, setFilters, updateTask } from "@/store/tasksSlice";
import type { Task, TaskStatus } from "@/types";
import TaskFilters from "./TaskFilters";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";

export default function ProjectDetail({ projectId }: { projectId: number }) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { current, currentStatus, currentError } = useAppSelector((s) => s.projects);
  const { items: tasks, status: tasksStatus, error: tasksError, filters } = useAppSelector((s) => s.tasks);
  const project = current?.id === projectId ? current : null;

  const [taskDialog, setTaskDialog] = useState<Task | "new" | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchProject(projectId));
    return () => {
      dispatch(clearCurrentProject());
      dispatch(resetTasks());
    };
  }, [dispatch, projectId]);

  useEffect(() => {
    dispatch(fetchTasks({ projectId, filters }));
  }, [dispatch, projectId, filters]);

  if (currentStatus === "failed") {
    const notFound = currentError?.status === 404;
    return (
      <div className="card px-6 py-16 text-center">
        <h1 className="text-lg font-semibold">{notFound ? "Project not found" : "Couldn't load this project"}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {notFound ? "It may have been deleted, or it isn't yours." : currentError?.message}
        </p>
        <Link href="/projects" className="btn btn-primary mt-5">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) return <Spinner label="Loading project…" />;

  const firstTasksLoad = tasks.length === 0 && (tasksStatus === "idle" || tasksStatus === "loading");
  const filtered = filters.status !== "all";

  async function changeStatus(task: Task, status: TaskStatus) {
    setActionError(null);
    try {
      await dispatch(updateTask({ projectId, taskId: task.id, changes: { status } })).unwrap();
    } catch (err) {
      setActionError(toErrorPayload(err).message);
    }
  }

  return (
    <div>
      <Link href="/projects" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeftIcon />
        All projects
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight">{project.title}</h1>
          {project.description && (
            <p className="mt-1 max-w-2xl whitespace-pre-line break-words text-sm text-slate-600">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={() => setEditingProject(true)}>
            <PencilIcon />
            Edit
          </button>
          <button type="button" className="btn btn-secondary hover:text-red-600" onClick={() => setDeletingProject(true)}>
            <TrashIcon />
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <button type="button" className="btn btn-primary" onClick={() => setTaskDialog("new")}>
          <PlusIcon />
          Add task
        </button>
      </div>

      <TaskFilters filters={filters} onChange={(changes) => dispatch(setFilters(changes))} />

      <div className="mt-4 space-y-4">
        {actionError && <Alert onDismiss={() => setActionError(null)}>{actionError}</Alert>}
        {tasksStatus === "failed" && (
          <Alert>
            {tasksError}{" "}
            <button
              type="button"
              className="font-medium underline"
              onClick={() => dispatch(fetchTasks({ projectId, filters }))}
            >
              Try again
            </button>
          </Alert>
        )}

        {firstTasksLoad ? (
          <Spinner label="Loading tasks…" />
        ) : tasks.length === 0 && tasksStatus === "succeeded" ? (
          <div className="card flex flex-col items-center px-6 py-14 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <CheckCircleIcon className="size-6" />
            </div>
            <h3 className="font-semibold">{filtered ? "No tasks with this status" : "No tasks yet"}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {filtered ? "Try a different filter, or add a new task." : "Add your first task to get started."}
            </p>
            <div className="mt-5 flex gap-2">
              {filtered && (
                <button type="button" className="btn btn-secondary" onClick={() => dispatch(setFilters({ status: "all" }))}>
                  Show all tasks
                </button>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setTaskDialog("new")}>
                <PlusIcon />
                Add task
              </button>
            </div>
          </div>
        ) : (
          <ul className={`space-y-3 transition-opacity ${tasksStatus === "loading" ? "opacity-60" : ""}`}>
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onStatusChange={(status) => changeStatus(task, status)}
                onEdit={() => setTaskDialog(task)}
                onDelete={() => setDeletingTask(task)}
              />
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={taskDialog !== null}
        title={taskDialog === "new" ? "Add task" : "Edit task"}
        onClose={() => setTaskDialog(null)}
      >
        <TaskForm
          initial={taskDialog && taskDialog !== "new" ? taskDialog : undefined}
          submitLabel={taskDialog === "new" ? "Add task" : "Save changes"}
          onCancel={() => setTaskDialog(null)}
          onSubmit={async (values) => {
            if (taskDialog === "new") {
              await dispatch(createTask({ projectId, values })).unwrap();
            } else if (taskDialog) {
              await dispatch(updateTask({ projectId, taskId: taskDialog.id, changes: values })).unwrap();
            }
            setTaskDialog(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deletingTask !== null}
        title="Delete task?"
        message={
          <>
            <strong className="text-slate-900">{deletingTask?.title}</strong> will be permanently deleted.
          </>
        }
        onCancel={() => setDeletingTask(null)}
        onConfirm={async () => {
          if (!deletingTask) return;
          await dispatch(deleteTask({ projectId, taskId: deletingTask.id })).unwrap();
          setDeletingTask(null);
        }}
      />

      <Modal open={editingProject} title="Edit project" onClose={() => setEditingProject(false)}>
        <ProjectForm
          initial={project}
          submitLabel="Save changes"
          onCancel={() => setEditingProject(false)}
          onSubmit={async (values) => {
            await dispatch(updateProject({ id: project.id, changes: values })).unwrap();
            setEditingProject(false);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deletingProject}
        title="Delete project?"
        message={
          <>
            <strong className="text-slate-900">{project.title}</strong> and all of its tasks will be permanently
            deleted. This can&apos;t be undone.
          </>
        }
        onCancel={() => setDeletingProject(false)}
        onConfirm={async () => {
          await dispatch(deleteProject(project.id)).unwrap();
          router.replace("/projects");
        }}
      />
    </div>
  );
}
