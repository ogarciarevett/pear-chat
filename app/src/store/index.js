import { configureStore } from '@reduxjs/toolkit'
import messagesReducer from './slices/messagesSlice'

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
  },
})
