export const TASK_STATUSES = ["todo", "in-progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  "in-progress": "In progress",
  done: "Done",
};

export const TASK_SORT_FIELDS = ["createdAt", "dueDate", "status"] as const;
export type TaskSortField = (typeof TASK_SORT_FIELDS)[number];

export const SORT_LABELS: Record<TaskSortField, string> = {
  createdAt: "Date created",
  dueDate: "Due date",
  status: "Status",
};

export type SortOrder = "asc" | "desc";
