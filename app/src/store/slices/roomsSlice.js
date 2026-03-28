import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'

const roomsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.lastVisited - a.lastVisited,
})

const roomsSlice = createSlice({
  name: 'rooms',
  initialState: {
    ...roomsAdapter.getInitialState(),
    activeRoomId: null,
  },
  reducers: {
    roomAdded: roomsAdapter.upsertOne,
    roomRemoved: roomsAdapter.removeOne,
    roomUpdated: roomsAdapter.updateOne,
    activeRoomSet: (state, action) => {
      state.activeRoomId = action.payload
    },
    activeRoomCleared: (state) => {
      state.activeRoomId = null
    },
  },
})

export const {
  roomAdded,
  roomRemoved,
  roomUpdated,
  activeRoomSet,
  activeRoomCleared,
} = roomsSlice.actions

const roomsSelectors = roomsAdapter.getSelectors((state) => state.rooms)

export const selectAllRooms = roomsSelectors.selectAll
export const selectRoomById = roomsSelectors.selectById
export const selectActiveRoomId = (state) => state.rooms.activeRoomId
export const selectActiveRoom = (state) => {
  const id = state.rooms.activeRoomId
  return id ? state.rooms.entities[id] : null
}

export default roomsSlice.reducer
