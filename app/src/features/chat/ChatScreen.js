import React, { useState, useCallback, useRef } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FlashList } from '@shopify/flash-list'

import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import DateSeparator from './DateSeparator'
import { useMessages } from './hooks/useMessages'
import { useChatRoom } from './hooks/useChatRoom'
import { isSameDay } from '../../utils/formatTime'

const ChatHeader = React.memo(({ topic, peersCount }) => (
  <View style={styles.header}>
    <View style={styles.headerInfo}>
      <Text style={styles.headerTitle} numberOfLines={1}>Chat Room</Text>
      <Text style={styles.headerSubtitle}>
        {peersCount} peer{peersCount !== 1 ? 's' : ''} connected
      </Text>
    </View>
  </View>
))

const LobbyScreen = React.memo(({ onCreateRoom, onJoinRoom }) => {
  const [topicInput, setTopicInput] = useState('')

  return (
    <View style={styles.lobbyContainer}>
      <View style={styles.lobbyContent}>
        <Text style={styles.lobbyTitle}>PearBare Chat</Text>
        <Text style={styles.lobbySubtitle}>Peer-to-peer encrypted messaging</Text>

        <TouchableOpacity style={styles.createButton} onPress={onCreateRoom}>
          <Text style={styles.createButtonText}>Create Room</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.joinGroup}>
          <TextInput
            value={topicInput}
            onChangeText={setTopicInput}
            style={styles.topicInput}
            placeholder="Enter room topic..."
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={[styles.joinButton, !topicInput.trim() && styles.buttonDisabled]}
            onPress={() => topicInput.trim() && onJoinRoom(topicInput.trim())}
            disabled={!topicInput.trim()}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

function buildFlatList(groupedMessages) {
  const items = []
  let lastDate = null

  for (const group of groupedMessages) {
    for (let i = 0; i < group.messages.length; i++) {
      const msg = group.messages[i]

      if (!lastDate || !isSameDay(lastDate, msg.timestamp)) {
        items.push({ type: 'date', id: `date-${msg.timestamp}`, timestamp: msg.timestamp })
        lastDate = msg.timestamp
      }

      items.push({
        type: 'message',
        id: msg.id,
        message: msg,
        isFirstInGroup: i === 0,
        isLastInGroup: i === group.messages.length - 1,
      })
    }
  }

  return items
}

const ChatScreen = () => {
  const { backend, roomTopic, peersCount, createRoom, joinRoom } = useChatRoom()
  const { groupedMessages, sendMessage } = useMessages()
  const listRef = useRef(null)

  const flatItems = React.useMemo(() => buildFlatList(groupedMessages), [groupedMessages])

  const handleSend = useCallback(
    (text) => sendMessage(text, backend),
    [sendMessage, backend]
  )

  const renderItem = useCallback(({ item }) => {
    if (item.type === 'date') {
      return <DateSeparator timestamp={item.timestamp} />
    }
    return (
      <MessageBubble
        message={item.message}
        isFirstInGroup={item.isFirstInGroup}
        isLastInGroup={item.isLastInGroup}
      />
    )
  }, [])

  const keyExtractor = useCallback((item) => item.id, [])

  const handleContentSizeChange = useCallback(() => {
    if (listRef.current && flatItems.length > 0) {
      listRef.current.scrollToEnd({ animated: true })
    }
  }, [flatItems.length])

  if (!roomTopic) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <LobbyScreen onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ChatHeader topic={roomTopic} peersCount={peersCount} />
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={styles.listContainer}>
          <FlashList
            ref={listRef}
            data={flatItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={80}
            drawDistance={300}
            onContentSizeChange={handleContentSizeChange}
            contentContainerStyle={styles.listContent}
          />
        </View>
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  chatArea: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a3a',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  lobbyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  lobbyContent: {
    alignItems: 'center',
  },
  lobbyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  lobbySubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 40,
  },
  createButton: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#0088cc',
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#2a2a3a',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 12,
    fontSize: 13,
  },
  joinGroup: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  topicInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#2a2a3a',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#e0e0e0',
    backgroundColor: '#1a1a2e',
    fontSize: 14,
  },
  joinButton: {
    paddingHorizontal: 20,
    height: 48,
    backgroundColor: '#0088cc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
})

export default ChatScreen
