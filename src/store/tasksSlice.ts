import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SortOrder, TaskSortField } from "@/lib/constants";
import { http, toErrorPayload } from "@/lib/http";
import type { ApiErrorPayload, Task, TaskStatus } from "@/types";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
type ThunkConfig = { rejectValue: ApiErrorPayload };

export interface TaskFilters {
  status: TaskStatus | "all";
  sortBy: TaskSortField;
  order: SortOrder;
}

export interface TaskFormValues {
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
}

export interface TasksState {
  items: Task[];
  status: LoadStatus;
  error: string | null;
  filters: TaskFilters;
  latestRequestId: string | null;
}

const initialState: TasksState = {
  items: [],
  status: "idle",
  error: null,
  filters: { status: "all", sortBy: "createdAt", order: "desc" },
  latestRequestId: null,
};

export const fetchTasks = createAsyncThunk<Task[], { projectId: number; filters: TaskFilters }, ThunkConfig>(
  "tasks/fetch",
  async ({ projectId, filters }, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams({ status: filters.status, sortBy: filters.sortBy, order: filters.order });
      return (await http<{ tasks: Task[] }>(`/api/projects/${projectId}/tasks?${qs}`)).tasks;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

const currentFilters = (getState: () => unknown) => (getState() as { tasks: TasksState }).tasks.filters;

export const createTask = createAsyncThunk<Task, { projectId: number; values: TaskFormValues }, ThunkConfig>(
  "tasks/create",
  async ({ projectId, values }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { task } = await http<{ task: Task }>(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        json: values,
      });
      dispatch(fetchTasks({ projectId, filters: currentFilters(getState) }));
      return task;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const updateTask = createAsyncThunk<
  Task,
  { projectId: number; taskId: number; changes: Partial<TaskFormValues> },
  ThunkConfig
>("tasks/update", async ({ projectId, taskId, changes }, { rejectWithValue, dispatch, getState }) => {
  try {
    const { task } = await http<{ task: Task }>(`/api/projects/${projectId}/tasks/${taskId}`, {
      method: "PATCH",
      json: changes,
    });
    dispatch(fetchTasks({ projectId, filters: currentFilters(getState) }));
    return task;
  } catch (err) {
    return rejectWithValue(toErrorPayload(err));
  }
});

export const deleteTask = createAsyncThunk<number, { projectId: number; taskId: number }, ThunkConfig>(
  "tasks/delete",
  async ({ projectId, taskId }, { rejectWithValue, dispatch, getState }) => {
    try {
      await http(`/api/projects/${projectId}/tasks/${taskId}`, { method: "DELETE" });
      dispatch(fetchTasks({ projectId, filters: currentFilters(getState) }));
      return taskId;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<TaskFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetTasks() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state, action) => {
        state.status = "loading";
        state.error = null;
        state.latestRequestId = action.meta.requestId;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        if (state.latestRequestId !== action.meta.requestId) return;
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        if (state.latestRequestId !== action.meta.requestId) return;
        state.status = "failed";
        state.error = action.payload?.message ?? "Could not load tasks";
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const i = state.items.findIndex((t) => t.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setFilters, resetTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
