import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { formatDateSeparator } from '../../utils/formatTime'

const DateSeparator = ({ timestamp }) => {
  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.text}>{formatDateSeparator(timestamp)}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  text: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
})

export default React.memo(DateSeparator)
