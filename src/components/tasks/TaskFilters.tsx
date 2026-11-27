"use client";

import {
  SORT_LABELS,
  STATUS_LABELS,
  TASK_SORT_FIELDS,
  TASK_STATUSES,
  type SortOrder,
  type TaskSortField,
} from "@/lib/constants";
import { ArrowUpDownIcon } from "@/components/ui/icons";
import type { TaskFilters as Filters } from "@/store/tasksSlice";

const ORDER_LABELS: Record<TaskSortField, Record<SortOrder, string>> = {
  createdAt: { desc: "Newest first", asc: "Oldest first" },
  dueDate: { asc: "Soonest first", desc: "Latest first" },
  status: { asc: "To do → Done", desc: "Done → To do" },
};

const DEFAULT_ORDER: Record<TaskSortField, SortOrder> = { createdAt: "desc", dueDate: "asc", status: "asc" };

interface TaskFiltersProps {
  filters: Filters;
  onChange: (changes: Partial<Filters>) => void;
}

export default function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  const statusOptions = [{ value: "all", label: "All" }, ...TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))] as const;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label="Filter by status" className="inline-flex rounded-lg bg-slate-200/60 p-1">
        {statusOptions.map((opt) => {
          const active = filters.status === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ status: opt.value })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="task-sort" className="text-sm text-slate-500">
          Sort by
        </label>
        <select
          id="task-sort"
          className="input w-auto py-1.5"
          value={filters.sortBy}
          onChange={(e) => {
            const sortBy = e.target.value as TaskSortField;
            onChange({ sortBy, order: DEFAULT_ORDER[sortBy] });
          }}
        >
          {TASK_SORT_FIELDS.map((f) => (
            <option key={f} value={f}>
              {SORT_LABELS[f]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-secondary py-1.5"
          onClick={() => onChange({ order: filters.order === "asc" ? "desc" : "asc" })}
          title="Reverse the sort order"
        >
          <ArrowUpDownIcon />
          {ORDER_LABELS[filters.sortBy][filters.order]}
        </button>
      </div>
    </div>
  );
}
