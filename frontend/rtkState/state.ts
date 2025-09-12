import { combineReducers, configureStore, Reducer } from '@reduxjs/toolkit'
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";
import voteSlice from '@/rtkState/slices/vote';
import userSlice from '@/rtkState/slices/user';

const persistConfig = {
  key: "root",
  storage,
  // transforms: [invoiceTransform], //uncomment for invoice transform
};

const rootReducer = combineReducers({
  user: userSlice,
  vote: voteSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer as any as Reducer<ReturnType<typeof rootReducer>>);
const state = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
  // Debugging
  devTools: process.env.NODE_ENV !== 'production',
  // Debugging
})
export type RootState = ReturnType<typeof state.getState>

export default state
export const persistor = persistStore(state);

export type AppDispatch = typeof state.dispatch

// Debugging
export const clearReduxStore = () => {
  persistor.purge();
};
// Debugging