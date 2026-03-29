# PearBareChat
Interoperatable peer-to-peer Chat sample across desktop (Windows, Mac, Linux), terminal, and mobile (Android &amp; iOS)
  <img width="1060" height="979" alt="Screenshot 2026-03-28 at 18 24 31" src="https://github.com/user-attachments/assets/9a3b03dd-95e0-499c-80d9-fa19d236ccc6" />
  
 ## Implemented Enhancements
                                                                                                      
  1. Redux State Management
  - Replaced local useState message handling with Redux Toolkit using createEntityAdapter for         
  normalized, sorted storage                                                                          
  - Added messagesSlice with entity adapter actions (messageAdded, messageUpdated, messagesCleared)
  - Added roomsSlice managing room list and active room navigation state                              
  - Built selectGroupedMessages — a memoized selector that groups consecutive messages by same sender 
  within 60-second windows (drives the bubble grouping UI)                                            
  - Typed hooks (useAppDispatch, useAppSelector) for consistent store access                          
                                                                                                      
  2. FlashList Virtualized Rendering                                                                  
  - Replaced FlatList with @shopify/flash-list for efficient rendering at scale
  - Tuned estimatedItemSize and drawDistance for chat scroll performance                              
  - Heterogeneous list (messages + date separators) via a buildFlatList flattener
  - React.memo with custom comparators on MessageBubble to prevent unnecessary re-renders             
                                                                                                      
  3. Keet.io-Inspired Dark UI                                                                         
  - Dark theme (#0d0d1a background, #0088cc accent) modeled after keet.io                             
  - Message bubble grouping with tail indicators on the last message per group                        
  - Timestamps and delivery status icons (sending/sent/delivered) shown only at group boundaries      
  - Date separator pills between different days                                                       
  - Conditional send button (appears only when input has content)                                     
                                                                                                      
  4. Room List with P2P Discovery (bonus feature)                                                     
  - Added a room management screen to solve the topic-sharing UX problem                              
  - Users can create, join, and revisit rooms from a central list                                     
  - Share button on each room card and in the chat header (native share sheet)                        
  - P2P lobby discovery — all peers auto-join a deterministic Hyperswarm lobby topic. When a room is  
  created, its topic is broadcast to all connected peers. Discovered rooms appear with a "P2P" badge —
   no manual copy-paste needed                                                                        
  - Back button to return to the room list from any chat                                              
                                                                                                      
  5. Dependency Alignment                                   
  - Upgraded to Expo 55 canary, React Native 0.83.4, and React 19.2.0                                 
  - Resolved iOS build failure caused by ExpoReactNativeFactory.swift API mismatch with RN 0.84       
  (bundleConfiguration parameter missing)                                                             
                                                                                                      
  Bugs Found & Fixed                                        
                                                                                                      
  - TinyEmitter listener leak — uiEvent.on() returns this, not a subscription. The original cleanup   
  (listener.off()) was a no-op. Every component mount added a new listener that was never removed,    
  causing messages to duplicate N times after N room visits. Fixed by storing callback references and 
  calling uiEvent.off(eventName, handler)                   
  - Duplicate swarm connections — Re-entering a room called swarm.join() again, creating additional
  connections to the same peer. Fixed with a joinedTopics Set that prevents redundant joins           
  - Peer count stuck at 0 — swarm.on('update') fired before the ChatScreen mounted. Added
  updatePeersCount() calls in the CREATE_ROOM and JOIN_ROOM RPC handlers so the count is sent         
  immediately on join                                       
  - DHT update spam — swarm.on('update') fires for every DHT activity, not just connection changes,   
  flooding the RPC channel. Fixed by tracking lastPeersCount and only sending when the count changes  
  - Message deduplication — Added unique IDs to the message payload (createMessage) and a
  seenMessageIds Set in the worklet to drop duplicates arriving via multiple swarm connections (lobby 
  + room)                                                                 
                                                                                                      
  ## Setup                                                                                               
                                                                                                      
  cd app                                                    
  npm install
  npm run ios

