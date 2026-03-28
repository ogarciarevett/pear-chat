import React, { useCallback, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Share,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FlashList } from '@shopify/flash-list'

import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import DateSeparator from './DateSeparator'
import { useMessages } from './hooks/useMessages'
import { useChatRoom } from './hooks/useChatRoom'
import { isSameDay } from '../../utils/formatTime'

const ChatHeader = React.memo(({ topic, peersCount, onBack, onShare }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} style={styles.backButton}>
      <Text style={styles.backButtonText}>&#8249;</Text>
    </TouchableOpacity>
    <View style={styles.headerInfo}>
      <Text style={styles.headerTitle} numberOfLines={1}>Chat Room</Text>
      <Text style={styles.headerSubtitle}>
        {peersCount} peer{peersCount !== 1 ? 's' : ''} connected
      </Text>
    </View>
    <TouchableOpacity onPress={() => onShare(topic)} style={styles.shareButton}>
      <Text style={styles.shareButtonText}>Share</Text>
    </TouchableOpacity>
  </View>
))

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
  const { backend, roomTopic, peersCount, leaveRoom } = useChatRoom()
  const { groupedMessages, sendMessage } = useMessages()
  const listRef = useRef(null)

  const flatItems = React.useMemo(() => buildFlatList(groupedMessages), [groupedMessages])

  const handleSend = useCallback(
    (text) => sendMessage(text, backend),
    [sendMessage, backend]
  )

  const handleShare = useCallback(async (topic) => {
    await Share.share({ message: topic })
  }, [])

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
    listRef.current?.scrollToEnd({ animated: true })
  }, [flatItems.length])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ChatHeader
        topic={roomTopic}
        peersCount={peersCount}
        onBack={leaveRoom}
        onShare={handleShare}
      />
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: '#0d0d1a',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2a2a3a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#0088cc',
    fontWeight: '300',
  },
  headerInfo: {
    flex: 1,
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
  shareButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0088cc',
  },
})

export default ChatScreen
