"use client";

import { useState } from "react";
import Alert from "@/components/ui/Alert";
import { toErrorPayload } from "@/lib/http";
import type { ProjectFormValues } from "@/store/projectsSlice";
import type { ApiErrorPayload, Project } from "@/types";

interface ProjectFormProps {
  initial?: Project;
  submitLabel: string;
  onSubmit: (values: ProjectFormValues) => Promise<unknown>;
  onCancel: () => void;
}

export default function ProjectForm({ initial, submitLabel, onSubmit, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiErrorPayload | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit({ title, description });
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
        <label htmlFor="project-title" className="label">
          Title
        </label>
        <input
          id="project-title"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          autoFocus
          required
          disabled={busy}
        />
        {error?.fields?.title && <p className="field-error">{error.fields.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="project-description" className="label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="project-description"
          className="input min-h-24 resize-y"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          disabled={busy}
        />
        {error?.fields?.description && <p className="field-error">{error.fields.description[0]}</p>}
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
