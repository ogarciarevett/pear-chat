import { createSlice, createEntityAdapter, createSelector } from '@reduxjs/toolkit'

const messagesAdapter = createEntityAdapter({
  sortComparer: (a, b) => a.timestamp - b.timestamp,
})

const messagesSlice = createSlice({
  name: 'messages',
  initialState: messagesAdapter.getInitialState(),
  reducers: {
    messageAdded: messagesAdapter.addOne,
    messageUpdated: messagesAdapter.updateOne,
    messagesCleared: messagesAdapter.removeAll,
  },
})

export const { messageAdded, messageUpdated, messagesCleared } = messagesSlice.actions

const messagesSelectors = messagesAdapter.getSelectors((state) => state.messages)

export const selectAllMessages = messagesSelectors.selectAll
export const selectMessageById = messagesSelectors.selectById
export const selectTotalMessages = messagesSelectors.selectTotal

export const selectGroupedMessages = createSelector(
  [selectAllMessages],
  (messages) => {
    if (messages.length === 0) return []

    const grouped = []
    let currentGroup = null

    for (const msg of messages) {
      const isNewGroup =
        !currentGroup ||
        currentGroup.sender !== msg.sender ||
        msg.timestamp - currentGroup.lastTimestamp > 60000

      if (isNewGroup) {
        currentGroup = {
          sender: msg.sender,
          lastTimestamp: msg.timestamp,
          messages: [msg],
        }
        grouped.push(currentGroup)
      } else {
        currentGroup.messages.push(msg)
        currentGroup.lastTimestamp = msg.timestamp
      }
    }

    return grouped
  }
)

export default messagesSlice.reducer
