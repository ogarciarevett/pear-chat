import { useState, useCallback, useEffect } from 'react'
import { useBackend } from '../../../component/BareProvider'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { selectActiveRoomId, activeRoomCleared } from '../../../store/slices/roomsSlice'
import { messagesCleared } from '../../../store/slices/messagesSlice'
import uiEvent, { CONNECTIONS_UI } from '../../../lib/uiEvent'

export function useChatRoom() {
  const backend = useBackend()
  const dispatch = useAppDispatch()
  const roomTopic = useAppSelector(selectActiveRoomId)
  const [peersCount, setPeersCount] = useState(0)

  useEffect(() => {
    const handler = (count) => setPeersCount(Number(count) || 0)
    uiEvent.on(CONNECTIONS_UI, handler)
    return () => uiEvent.off(CONNECTIONS_UI, handler)
  }, [])

  const leaveRoom = useCallback(() => {
    dispatch(messagesCleared())
    dispatch(activeRoomCleared())
  }, [dispatch])

  return {
    backend,
    roomTopic,
    peersCount,
    leaveRoom,
  }
}
