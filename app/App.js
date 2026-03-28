import { useEffect } from 'react'
import { Provider } from 'react-redux'
import BareProvider from './src/component/BareProvider'
import RoomListScreen from './src/features/rooms/RoomListScreen'
import ChatScreen from './src/features/chat/ChatScreen'
import { store } from './src/store'
import { useAppDispatch, useAppSelector } from './src/store/hooks'
import { rpcHandler } from './src/lib/rpc'
import uiEvent, { ROOM_DISCOVERED_UI } from './src/lib/uiEvent'
import { roomAdded, selectActiveRoomId } from './src/store/slices/roomsSlice'

function RoomDiscoveryListener() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const listener = uiEvent.on(ROOM_DISCOVERED_UI, ({ topic }) => {
      dispatch(roomAdded({
        id: topic,
        createdAt: Date.now(),
        lastVisited: Date.now(),
        isOwner: false,
        discovered: true,
      }))
    })
    return () => listener.off()
  }, [dispatch])

  return null
}

function AppNavigator() {
  const activeRoomId = useAppSelector(selectActiveRoomId)
  return activeRoomId ? <ChatScreen /> : <RoomListScreen />
}

export default function App() {
  return (
    <Provider store={store}>
      <BareProvider rpcHandler={rpcHandler}>
        <RoomDiscoveryListener />
        <AppNavigator />
      </BareProvider>
    </Provider>
  )
}
