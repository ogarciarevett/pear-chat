import { Provider } from 'react-redux'
import BareProvider from './src/component/BareProvider'
import ChatScreen from './src/features/chat/ChatScreen'
import { store } from './src/store'
import { rpcHandler } from './src/lib/rpc'

export default function App() {
  return (
    <Provider store={store}>
      <BareProvider rpcHandler={rpcHandler}>
        <ChatScreen />
      </BareProvider>
    </Provider>
  )
}
