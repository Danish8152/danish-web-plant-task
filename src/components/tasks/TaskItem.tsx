"use client";

import { useState } from "react";
import { STATUS_LABELS, TASK_STATUSES } from "@/lib/constants";
import { formatDate, todayISO } from "@/lib/dates";
import { CalendarIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";
import type { Task, TaskStatus } from "@/types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: "border-slate-300 bg-slate-100 text-slate-700",
  "in-progress": "border-amber-300 bg-amber-50 text-amber-800",
  done: "border-emerald-300 bg-emerald-50 text-emerald-800",
};

interface TaskItemProps {
  task: Task;
  onStatusChange: (status: TaskStatus) => Promise<unknown>;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskItem({ task, onStatusChange, onEdit, onDelete }: TaskItemProps) {
  const [updating, setUpdating] = useState(false);
  const done = task.status === "done";
  const overdue = !!task.dueDate && !done && task.dueDate < todayISO();

  async function changeStatus(status: TaskStatus) {
    setUpdating(true);
    try {
      await onStatusChange(status);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <li className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <h3 className={`break-words font-medium ${done ? "text-slate-400 line-through" : ""}`}>{task.title}</h3>
        {task.description && (
          <p className="mt-1 whitespace-pre-line break-words text-sm text-slate-600">{task.description}</p>
        )}
        {task.dueDate && (
          <p className={`mt-2 inline-flex items-center gap-1.5 text-xs ${overdue ? "font-medium text-red-600" : "text-slate-500"}`}>
            <CalendarIcon className="size-3.5" />
            {overdue ? "Overdue · " : "Due "}
            {formatDate(task.dueDate)}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <select
          aria-label={`Status of ${task.title}`}
          value={task.status}
          disabled={updating}
          onChange={(e) => changeStatus(e.target.value as TaskStatus)}
          className={`rounded-full border py-1 pl-3 pr-7 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60 ${STATUS_STYLES[task.status]}`}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="button" className="btn-icon" onClick={onEdit} aria-label={`Edit ${task.title}`}>
          <PencilIcon />
        </button>
        <button type="button" className="btn-icon hover:text-red-600" onClick={onDelete} aria-label={`Delete ${task.title}`}>
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}
