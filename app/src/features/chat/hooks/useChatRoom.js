import { useState, useCallback, useEffect } from 'react'
import { useBackend } from '../../../component/BareProvider'
import uiEvent, { CONNECTIONS_UI } from '../../../lib/uiEvent'

export function useChatRoom() {
  const backend = useBackend()
  const [roomTopic, setRoomTopic] = useState('')
  const [peersCount, setPeersCount] = useState(0)

  useEffect(() => {
    const peerCountListener = uiEvent.on(CONNECTIONS_UI, (count) => {
      setPeersCount(Number(count) || 0)
    })
    return () => {
      peerCountListener.off()
    }
  }, [])

  const handleTopic = useCallback((topic) => setRoomTopic(topic), [])

  const createRoom = useCallback(() => {
    if (backend) {
      backend.createRoom(handleTopic)
    }
  }, [backend, handleTopic])

  const joinRoom = useCallback(
    (topicInput) => {
      if (backend && topicInput) {
        const topic = topicInput.replace('Topic: ', '')
        handleTopic(topic)
        backend.joinRoom(topic, handleTopic)
      }
    },
    [backend, handleTopic]
  )

  return {
    backend,
    roomTopic,
    peersCount,
    createRoom,
    joinRoom,
  }
}
