import { configureStore } from '@reduxjs/toolkit'
import profileReducer from './slices/profileSlice'
import dockReducer from './slices/dockSlice'
import uiReducer from './slices/uiSlice'
import headerReducer from './slices/headerSlice'

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    dock: dockReducer,
    ui: uiReducer,
    header: headerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
