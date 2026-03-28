import React, { useState, useCallback } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'

const MessageInput = ({ onSend }) => {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }, [text, onSend])

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Message"
        placeholderTextColor="#666"
        value={text}
        onChangeText={setText}
        multiline
        maxLength={2000}
      />
      {text.trim().length > 0 && (
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <MaterialIcons name="arrow-upward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#0d0d1a',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2a2a3a',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0088cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default React.memo(MessageInput)
