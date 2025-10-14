import { authSlice } from "@/lib/features/auth/authSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { learnApi } from "@/lib/features/learn/learnApi";
import { vocabApi } from "@/lib/features/vocab/vocabApi";

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(learnApi.middleware, vocabApi.middleware),
  });
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  [learnApi.reducerPath]: learnApi.reducer,
  [vocabApi.reducerPath]: vocabApi.reducer,
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
