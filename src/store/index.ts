import { configureStore } from "@reduxjs/toolkit";
import authReducer, { initialAuthState } from "./authSlice";
import projectsReducer from "./projectsSlice";
import tasksReducer from "./tasksSlice";
import type { User } from "@/types";

export function makeStore(user: User | null = null) {
  return configureStore({
    reducer: {
      auth: authReducer,
      projects: projectsReducer,
      tasks: tasksReducer,
    },
    preloadedState: { auth: { ...initialAuthState, user } },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
