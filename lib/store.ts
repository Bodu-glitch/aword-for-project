import { authSlice } from "@/lib/features/auth/authSlice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { learnApi } from "@/lib/features/learn/learnApi";
import { vocabApi } from "@/lib/features/vocab/vocabApi";
import { searchSlice } from "@/lib/features/search/searchSlice";
import { profileApi } from "@/lib/features/profile/profileApi";
import { leaderboardApi } from "@/lib/features/leaderboard/leaderboardApi";
import { adminApi } from "@/lib/features/admin/adminApi";

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        learnApi.middleware,
        vocabApi.middleware,
        profileApi.middleware,
        leaderboardApi.middleware,
        adminApi.middleware,
      ),
  });
};

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  search: searchSlice.reducer,
  [learnApi.reducerPath]: learnApi.reducer,
  [vocabApi.reducerPath]: vocabApi.reducer,
  [profileApi.reducerPath]: profileApi.reducer,
  [leaderboardApi.reducerPath]: leaderboardApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
});

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
