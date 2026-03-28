import { configureStore } from '@reduxjs/toolkit'
import messagesReducer from './slices/messagesSlice'
import roomsReducer from './slices/roomsSlice'

export const store = configureStore({
  reducer: {
    messages: messagesReducer,
    rooms: roomsReducer,
  },
})
