import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, toErrorPayload } from "@/lib/http";
import type { ApiErrorPayload, Project } from "@/types";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";
type ThunkConfig = { rejectValue: ApiErrorPayload };

export interface ProjectFormValues {
  title: string;
  description: string;
}

interface ProjectsState {
  items: Project[];
  listStatus: LoadStatus;
  listError: string | null;
  current: Project | null;
  currentStatus: LoadStatus;
  currentError: ApiErrorPayload | null;
}

const initialState: ProjectsState = {
  items: [],
  listStatus: "idle",
  listError: null,
  current: null,
  currentStatus: "idle",
  currentError: null,
};

export const fetchProjects = createAsyncThunk<Project[], void, ThunkConfig>(
  "projects/fetchAll",
  async (_arg, { rejectWithValue }) => {
    try {
      return (await http<{ projects: Project[] }>("/api/projects")).projects;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const fetchProject = createAsyncThunk<Project, number, ThunkConfig>(
  "projects/fetchOne",
  async (id, { rejectWithValue }) => {
    try {
      return (await http<{ project: Project }>(`/api/projects/${id}`)).project;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const createProject = createAsyncThunk<Project, ProjectFormValues, ThunkConfig>(
  "projects/create",
  async (values, { rejectWithValue }) => {
    try {
      return (await http<{ project: Project }>("/api/projects", { method: "POST", json: values })).project;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const updateProject = createAsyncThunk<
  Project,
  { id: number; changes: Partial<ProjectFormValues> },
  ThunkConfig
>("projects/update", async ({ id, changes }, { rejectWithValue }) => {
  try {
    return (await http<{ project: Project }>(`/api/projects/${id}`, { method: "PATCH", json: changes })).project;
  } catch (err) {
    return rejectWithValue(toErrorPayload(err));
  }
});

export const deleteProject = createAsyncThunk<number, number, ThunkConfig>(
  "projects/delete",
  async (id, { rejectWithValue }) => {
    try {
      await http(`/api/projects/${id}`, { method: "DELETE" });
      return id;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject(state) {
      state.current = null;
      state.currentStatus = "idle";
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload?.message ?? "Could not load projects";
      })
      .addCase(fetchProject.pending, (state) => {
        state.currentStatus = "loading";
        state.currentError = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.current = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.current = null;
        state.currentError = action.payload ?? { message: "Could not load project" };
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const i = state.items.findIndex((p) => p.id === action.payload.id);
        if (i !== -1) state.items[i] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.current?.id === action.payload) state.current = null;
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;
