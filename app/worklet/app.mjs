/* global Bare, BareKit */
import Hyperswarm from 'hyperswarm'   // Module for P2P networking and connecting peers
import b4a from 'b4a'                 // Module for buffer-to-string and vice-versa conversions
import crypto from 'hypercore-crypto' // Cryptographic functions for generating the key in app
import RPC from 'bare-rpc'

import {
  API_PING,
  API_REVERSE,
  API_CREATE_ROOM,
  API_JOIN_ROOM,
  API_SEND_MESSAGE,
  API_RECEIVE_MESSAGE,
  API_UPDATE_CONNECTIONS,
  API_ROOM_DISCOVERED,
  createMessage,
} from './api'

const swarm = new Hyperswarm()

const version = '0.1.0'
console.log('bare version', version)

// Deterministic lobby topic for P2P room discovery
const LOBBY_TOPIC = crypto.data(b4a.from('pearbarchat-lobby-v1'))

const getMemberId = (peer) => {
  return peer
    ? b4a.toString(peer.remotePublicKey, 'hex')?.substring(0, 6)
    : 'invalid'
}

// Track joined topics to prevent duplicate swarm joins
const joinedTopics = new Set()

const joinSwarm = async (topicBuffer) => {
  const topicHex = b4a.toString(topicBuffer, 'hex')
  if (joinedTopics.has(topicHex)) return true
  const discovery = swarm.join(topicBuffer, { client: true, server: true })
  await discovery.flushed()
  joinedTopics.add(topicHex)
  return true
}

const createRoom = async () => {
  const topicBuffer = crypto.randomBytes(32)
  const done = await joinSwarm(topicBuffer)
  const topic = done ? b4a.toString(topicBuffer, 'hex') : ''
  return { done, topic }
}

const joinRoom = async (topicStr) => {
  try {
    const topicBuffer = b4a.from(topicStr, 'hex')
    const done = await joinSwarm(topicBuffer)
    return { done, topic: topicStr }
  } catch (error) {
    return { done: false, topic: 'err' }
  }
}

function sendMessage (message) {
  // Send the message to all peers (that you are connected to)
  const peers = [...swarm.connections]
  const event = createMessage(message, true)
  for (const peer of peers) peer.write(JSON.stringify(event))
}

Bare
  .on('suspend', () => console.log('suspended'))
  .on('resume', () => console.log('resumed'))
  .on('exit', () => console.log('exited'))

const getTranslation = (text) => text?.split('').reverse().join('')

const rpc = new RPC(BareKit.IPC, async (req) => {
  const text = req.data.toString()
  console.warn('BareKit command:', req.command)
  switch(req.command) {
    case API_REVERSE:
      const result = getTranslation(text)
      req.reply(result)
      break
    case API_CREATE_ROOM:
      const { done, topic } = await createRoom()
      if (done) broadcastRoomAnnouncement(topic)
      updatePeersCount(swarm.connections.size)
      req.reply(JSON.stringify({done, topic}))
      break
    case API_JOIN_ROOM:
      const { done: joined, topic: joinTopic } = await joinRoom(text)
      updatePeersCount(swarm.connections.size)
      req.reply(JSON.stringify({done: joined, topic: joinTopic}))
      break
    case API_SEND_MESSAGE:
      sendMessage(text)
      req.reply(text)
      break
    case API_PING:
    default:
      console.log('Hello Bare')
      req.reply('Pong from Bare')
  }
})

const receivedMessage = (memberId, event) => {
  const req = rpc.request(API_RECEIVE_MESSAGE)
  console.log(`got message from ${memberId}: ${event} \n`)
  req.send(JSON.stringify({ memberId, event: b4a.toString(event, 'utf8') }))
}

const updatePeersCount = (count) => {
  const req = rpc.request(API_UPDATE_CONNECTIONS)
  req.send(String(count))
}

// Dedup messages arriving via multiple swarm connections (lobby + room)
const seenMessageIds = new Set()

const broadcastRoomAnnouncement = (topic) => {
  const announcement = JSON.stringify({ type: 'room_announced', topic })
  for (const peer of swarm.connections) peer.write(announcement)
}

const forwardRoomDiscovery = (topic) => {
  const req = rpc.request(API_ROOM_DISCOVERED)
  req.send(topic)
}

// Join lobby on startup for P2P room discovery
joinSwarm(LOBBY_TOPIC).then(() => console.log('[lobby] joined discovery network'))

// When there's a new connection, listen for new messages, and emit them to the UI
swarm.on('connection', (peer) => {
  const memberId = getMemberId(peer)
  console.log(`[info] New peer joined, ${memberId}`)

  peer.on('data', event => {
    const str = b4a.toString(event, 'utf8')
    try {
      const parsed = JSON.parse(str)
      if (parsed.type === 'room_announced') {
        forwardRoomDiscovery(parsed.topic)
        return
      }
      if (parsed.id && seenMessageIds.has(parsed.id)) return
      if (parsed.id) seenMessageIds.add(parsed.id)
    } catch {}
    receivedMessage(memberId, event)
  })
  peer.on('error', e => console.error(`Connection error: ${e}`))
})

// When there's updates to the swarm, update the peers count (only on change)
let lastPeersCount = 0
swarm.on('update', () => {
  const count = swarm.connections.size
  if (count === lastPeersCount) return
  lastPeersCount = count
  console.log(`[info] Number of connections is now ${count}`)
  updatePeersCount(count)
})
