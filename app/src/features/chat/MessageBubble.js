import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatTime } from '../../utils/formatTime'

const StatusIcon = ({ status }) => {
  if (status === 'sending') return <Text style={styles.statusIcon}>&#128339;</Text>
  if (status === 'sent') return <Text style={styles.statusIcon}>&#10003;</Text>
  if (status === 'delivered') return <Text style={styles.statusIcon}>&#10003;&#10003;</Text>
  return null
}

const MessageBubble = ({ message, isFirstInGroup, isLastInGroup }) => {
  const isMine = message.sender === 'me'

  return (
    <View
      style={[
        styles.wrapper,
        isMine ? styles.wrapperRight : styles.wrapperLeft,
        isLastInGroup ? styles.groupEnd : styles.groupMiddle,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubblePeer,
          isMine
            ? (isLastInGroup ? styles.bubbleMineTail : styles.bubbleMineNoTail)
            : (isLastInGroup ? styles.bubblePeerTail : styles.bubblePeerNoTail),
        ]}
      >
        <Text style={isMine ? styles.textMine : styles.textPeer} selectable>
          {message.text}
        </Text>
      </View>
      {isLastInGroup && (
        <View style={[styles.metaRow, isMine && styles.metaRowRight]}>
          <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          {isMine && <StatusIcon status={message.status} />}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    maxWidth: '78%',
  },
  wrapperRight: {
    alignSelf: 'flex-end',
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
  },
  groupEnd: {
    marginBottom: 8,
  },
  groupMiddle: {
    marginBottom: 2,
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleMine: {
    backgroundColor: '#0088cc',
  },
  bubblePeer: {
    backgroundColor: '#2d2d3d',
  },
  bubbleMineTail: {
    borderBottomRightRadius: 4,
  },
  bubbleMineNoTail: {
    borderBottomRightRadius: 4,
  },
  bubblePeerTail: {
    borderBottomLeftRadius: 4,
  },
  bubblePeerNoTail: {
    borderBottomLeftRadius: 4,
  },
  textMine: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 20,
  },
  textPeer: {
    color: '#e0e0e0',
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  metaRowRight: {
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
  statusIcon: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
  },
})

export default React.memo(MessageBubble, (prev, next) => {
  return prev.message.id === next.message.id &&
    prev.message.status === next.message.status &&
    prev.isFirstInGroup === next.isFirstInGroup &&
    prev.isLastInGroup === next.isLastInGroup
})
