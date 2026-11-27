"use client";

import { useState } from "react";
import Alert from "@/components/ui/Alert";
import { STATUS_LABELS, TASK_STATUSES } from "@/lib/constants";
import { toErrorPayload } from "@/lib/http";
import type { TaskFormValues } from "@/store/tasksSlice";
import type { ApiErrorPayload, Task, TaskStatus } from "@/types";

interface TaskFormProps {
  initial?: Task;
  submitLabel: string;
  onSubmit: (values: TaskFormValues) => Promise<unknown>;
  onCancel: () => void;
}

export default function TaskForm({ initial, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "todo");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiErrorPayload | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ title, description, status, dueDate: dueDate || null });
    } catch (err) {
      setError(toErrorPayload(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {error && <Alert>{error.message}</Alert>}

      <div>
        <label htmlFor="task-title" className="label">
          Title
        </label>
        <input
          id="task-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          autoFocus
          required
          disabled={busy}
        />
        {error?.fields?.title && <p className="field-error">{error.fields.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="task-description" className="label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="task-description"
          className="input min-h-24 resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          disabled={busy}
        />
        {error?.fields?.description && <p className="field-error">{error.fields.description[0]}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-status" className="label">
            Status
          </label>
          <select
            id="task-status"
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            disabled={busy}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {error?.fields?.status && <p className="field-error">{error.fields.status[0]}</p>}
        </div>

        <div>
          <label htmlFor="task-due" className="label">
            Due date <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id="task-due"
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={busy}
            />
            {dueDate && (
              <button type="button" className="btn btn-ghost px-2.5" onClick={() => setDueDate("")} disabled={busy}>
                Clear
              </button>
            )}
          </div>
          {error?.fields?.dueDate && <p className="field-error">{error.fields.dueDate[0]}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
