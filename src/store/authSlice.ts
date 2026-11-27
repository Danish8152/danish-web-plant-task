import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { http, toErrorPayload } from "@/lib/http";
import type { LoginInput, SignupInput } from "@/lib/validation";
import type { ApiErrorPayload, User } from "@/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading";
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
}

export const initialAuthState: AuthState = { user: null, status: "idle", error: null, fieldErrors: null };

type ThunkConfig = { rejectValue: ApiErrorPayload };

export const login = createAsyncThunk<User, LoginInput, ThunkConfig>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const { user } = await http<{ user: User }>("/api/auth/login", { method: "POST", json: credentials });
      return user;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const signup = createAsyncThunk<User, SignupInput, ThunkConfig>(
  "auth/signup",
  async (input, { rejectWithValue }) => {
    try {
      const { user } = await http<{ user: User }>("/api/auth/signup", { method: "POST", json: input });
      return user;
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

export const logout = createAsyncThunk<void, void, ThunkConfig>(
  "auth/logout",
  async (_arg, { rejectWithValue }) => {
    try {
      await http("/api/auth/logout", { method: "POST" });
    } catch (err) {
      return rejectWithValue(toErrorPayload(err));
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers: (builder) => {
    for (const thunk of [login, signup]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = "loading";
          state.error = null;
          state.fieldErrors = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.status = "idle";
          state.user = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = "idle";
          state.error = action.payload?.message ?? action.error.message ?? "Something went wrong";
          state.fieldErrors = action.payload?.fields ?? null;
        });
    }
    builder
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "idle";
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload?.message ?? "Could not log out";
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
