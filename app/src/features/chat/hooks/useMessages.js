import { useEffect, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import {
  messageAdded,
  messageUpdated,
  messagesCleared,
  selectAllMessages,
  selectGroupedMessages,
} from '../../../store/slices/messagesSlice'
import uiEvent, { RECEIVE_MESSAGE_UI } from '../../../lib/uiEvent'

let messageCounter = 0
function generateId() {
  return `${Date.now()}-${++messageCounter}`
}

export function useMessages() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector(selectAllMessages)
  const groupedMessages = useAppSelector(selectGroupedMessages)

  useEffect(() => {
    const handler = ({ memberId, message }) => {
      dispatch(
        messageAdded({
          id: generateId(),
          text: message?.message || '',
          sender: 'peer',
          timestamp: message?.timestamp ? new Date(message.timestamp).getTime() : Date.now(),
          status: 'delivered',
          memberId,
        })
      )
    }

    uiEvent.on(RECEIVE_MESSAGE_UI, handler)
    return () => uiEvent.off(RECEIVE_MESSAGE_UI, handler)
  }, [dispatch])

  const sendMessage = useCallback(
    (text, backend) => {
      if (!text.trim() || !backend) return

      const id = generateId()
      dispatch(
        messageAdded({
          id,
          text: text.trim(),
          sender: 'me',
          timestamp: Date.now(),
          status: 'sending',
        })
      )

      backend.sendMessage(text, () => {
        dispatch(
          messageUpdated({
            id,
            changes: { status: 'sent' },
          })
        )
      })
    },
    [dispatch]
  )

  const clearMessages = useCallback(() => {
    dispatch(messagesCleared())
  }, [dispatch])

  return { messages, groupedMessages, sendMessage, clearMessages }
}
