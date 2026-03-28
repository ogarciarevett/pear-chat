import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { FlashList } from '@shopify/flash-list'

import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { useBackend } from '../../component/BareProvider'
import {
  roomAdded,
  roomUpdated,
  activeRoomSet,
  selectAllRooms,
} from '../../store/slices/roomsSlice'

const truncateTopic = (topic) =>
  `${topic.substring(0, 12)}...${topic.substring(topic.length - 8)}`

const RoomCard = React.memo(({ room, onPress, onCopy }) => (
  <TouchableOpacity style={styles.roomCard} onPress={() => onPress(room)}>
    <View style={styles.roomInfo}>
      <View style={styles.roomNameRow}>
        <Text style={styles.roomName} numberOfLines={1}>
          {room.isOwner ? 'My Room' : 'Joined Room'}
        </Text>
        {room.discovered && (
          <View style={styles.discoveredBadge}>
            <Text style={styles.discoveredText}>P2P</Text>
          </View>
        )}
      </View>
      <Text style={styles.roomTopic} numberOfLines={1}>
        {truncateTopic(room.id)}
      </Text>
    </View>
    <TouchableOpacity
      style={styles.copyButton}
      onPress={() => onCopy(room.id)}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Text style={styles.copyButtonText}>Share</Text>
    </TouchableOpacity>
  </TouchableOpacity>
))

const RoomListScreen = () => {
  const [topicInput, setTopicInput] = useState('')
  const dispatch = useAppDispatch()
  const backend = useBackend()
  const rooms = useAppSelector(selectAllRooms)

  const handleCreateRoom = useCallback(() => {
    if (!backend) return
    backend.createRoom((topic) => {
      if (!topic) return
      dispatch(roomAdded({
        id: topic,
        createdAt: Date.now(),
        lastVisited: Date.now(),
        isOwner: true,
        discovered: false,
      }))
      dispatch(activeRoomSet(topic))
    })
  }, [backend, dispatch])

  const handleJoinInput = useCallback(() => {
    const topic = topicInput.replace('Topic: ', '').trim()
    if (!backend || !topic) return
    backend.joinRoom(topic, (joinedTopic) => {
      dispatch(roomAdded({
        id: joinedTopic,
        createdAt: Date.now(),
        lastVisited: Date.now(),
        isOwner: false,
        discovered: false,
      }))
      dispatch(activeRoomSet(joinedTopic))
    })
    setTopicInput('')
  }, [backend, dispatch, topicInput])

  const handleRoomPress = useCallback((room) => {
    if (!backend) return
    backend.joinRoom(room.id, () => {
      dispatch(roomUpdated({
        id: room.id,
        changes: { lastVisited: Date.now() },
      }))
      dispatch(activeRoomSet(room.id))
    })
  }, [backend, dispatch])

  const handleCopy = useCallback(async (topic) => {
    await Share.share({ message: topic })
  }, [])

  const renderItem = useCallback(({ item }) => (
    <RoomCard room={item} onPress={handleRoomPress} onCopy={handleCopy} />
  ), [handleRoomPress, handleCopy])

  const keyExtractor = useCallback((item) => item.id, [])

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>PearBare Chat</Text>
        <Text style={styles.headerSubtitle}>Peer-to-peer encrypted messaging</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
          <Text style={styles.createButtonText}>+ Create Room</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or join</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.joinGroup}>
          <TextInput
            value={topicInput}
            onChangeText={setTopicInput}
            style={styles.topicInput}
            placeholder="Paste room topic..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.joinButton, !topicInput.trim() && styles.buttonDisabled]}
            onPress={handleJoinInput}
            disabled={!topicInput.trim()}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      {rooms.length > 0 ? (
        <View style={styles.roomList}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <FlashList
            data={rooms}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={72}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No rooms yet</Text>
          <Text style={styles.emptySubtitle}>
            Create a room or join one with a topic.{'\n'}
            Nearby peers' rooms appear automatically.
          </Text>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d1a',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  actions: {
    paddingHorizontal: 24,
    paddingTop: 24,
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
    marginVertical: 16,
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
  roomList: {
    flex: 1,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a2e',
  },
  roomInfo: {
    flex: 1,
    marginRight: 12,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  roomTopic: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 3,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  discoveredBadge: {
    backgroundColor: '#1a3a2a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discoveredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4ade80',
  },
  copyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0088cc',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
})

export default RoomListScreen
