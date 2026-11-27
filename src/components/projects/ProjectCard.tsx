import Link from "next/link";
import { formatTimestamp } from "@/lib/dates";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const { taskCount, doneCount } = project;
  const percent = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <li className="card flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/projects/${project.id}`}
          className="min-w-0 text-base font-semibold leading-snug hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <span className="line-clamp-2 break-words">{project.title}</span>
        </Link>
        <div className="-mr-1.5 -mt-1 flex shrink-0">
          <button type="button" className="btn-icon" onClick={onEdit} aria-label={`Edit ${project.title}`}>
            <PencilIcon />
          </button>
          <button type="button" className="btn-icon hover:text-red-600" onClick={onDelete} aria-label={`Delete ${project.title}`}>
            <TrashIcon />
          </button>
        </div>
      </div>

      <p className="mt-2 line-clamp-3 min-h-[3.75rem] flex-1 whitespace-pre-line break-words text-sm text-slate-600">
        {project.description || <span className="text-slate-400">No description</span>}
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex justify-between text-xs text-slate-500">
          <span>
            {taskCount === 0 ? "No tasks yet" : `${doneCount} of ${taskCount} task${taskCount === 1 ? "" : "s"} done`}
          </span>
          {taskCount > 0 && <span>{percent}%</span>}
        </div>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Completed tasks"
        >
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-3 text-xs text-slate-400">Created {formatTimestamp(project.createdAt)}</p>
      </div>
    </li>
  );
}
