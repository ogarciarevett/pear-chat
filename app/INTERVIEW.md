## Mobile Development Project challenge

### Overview

This challenge evaluates your practical mobile development skills through enhancing a peer-to-peer chat application. You'll have **up to 4 hours** to implement specific improvements while maintaining the existing functionality.

### Project structure

- `/app` - Mobile chat App (your primary focus)
- `/terminal` - Command-line chat App (for testing)

Key Feature: The application uses direct peer-to-peer communication without requiring a central server.

### Demo

Watch the current implementation: https://youtube.com/shorts/E0G-WBHTltU

### Project Tasks

The zip contain a working sample, your mission is to improve the existing mobile chat App (in the `app/` directory) by implementing the following enhancements:

- Refactor the message handling logic using Redux store
- Implement efficient list scrolling to handle thousands of messages
- Improve message display formatting to match modern messaging apps (reference design: https://keet.io/)
- Enhance overall project readability, user experience and performance

### Setup Instructions

1. Initial Setup

Extract the project archive

```sh
cd app
npm install
```

2. Run the App

Use npm

```
npm run ios
```

Use xcode

- navigate to the `ios/` directory (auto gen by the `npm run ios` command)
- open the `.xcworkspace` file
- Build and run the project

3. Testing with Multiple Instances

You need at least one of these combinations:

- 2 mobile app instances
- 1 mobile app + 1 terminal client

4. Terminal Client Setup (Optional)

Visit `terminal/README.md` to run terminal chat room.
Copy the topic hash from the console that running react native.

```sh
> npm install -g pear
> pear run --dev . [topic hash]
[info] Joined chat room...
```

### Development Tips

#### Debugging

- iOS, Run `npm start` and then run the project with xcode to view logs.
- Android, use `npm run barelog` for logcat monitoring.

#### Important Notes

- Focus on improving the chat interface and message handling
- Core functionality in `app/worklet` or `app/src/lib/rpc` could remain unchanged

#### Submission Guidelines

- Make your improvements within the 4-hour timeframe
- Commit all changes to local git repository
- Create a zip archive of your work
- Send the archive to the recruiter

### Evaluation Criteria

- Code quality and organization
- Implementation of required features
- Performance optimizations
- UI/UX improvements
- Time management

---

### Implemented Enhancements

#### 1. Redux State Management

Refactored message handling from local state to **Redux Toolkit** with `createEntityAdapter` for normalized, sorted message storage.

- `messagesSlice` — entity adapter with `messageAdded`, `messageUpdated`, `messagesCleared` actions
- `roomsSlice` — entity adapter managing room list and active room navigation
- `selectGroupedMessages` — memoized selector that groups consecutive messages by sender within 60-second windows (used for bubble grouping like Keet.io)
- Typed hooks (`useAppDispatch`, `useAppSelector`) for consistent store access

#### 2. FlashList Virtualized Rendering

Replaced FlatList with **@shopify/flash-list** for efficient rendering of large message lists.

- `estimatedItemSize` and `drawDistance` tuned for chat scroll performance
- Heterogeneous list items (messages + date separators) via `buildFlatList` flattener
- `React.memo` with custom comparators on `MessageBubble` to prevent unnecessary re-renders

#### 3. Keet.io-Inspired Dark UI

Polished chat interface modeled after [keet.io](https://keet.io):

- Dark theme (`#0d0d1a` background) with blue accent (`#0088cc`) for sent messages
- Message bubble grouping with tail indicators on last message in group
- Timestamps and delivery status icons (sending/sent/delivered) shown only on group boundaries
- Date separator pills between different days
- Conditional send button that appears only when input has content

#### 4. Room List with P2P Discovery

Added a **room list screen** to solve the topic-sharing UX problem:

- Create, join, and revisit rooms from a central list
- **Share button** on each room card and in the chat header (native share sheet for topic)
- **P2P lobby discovery** — all peers auto-join a deterministic lobby topic (`crypto.data('pearbarchat-lobby-v1')`). When a room is created, its topic is broadcast to all lobby peers. Discovered rooms appear automatically with a "P2P" badge.
- Message deduplication in the worklet via unique message IDs and a `seenMessageIds` Set, preventing duplicates when peers share multiple swarm connections (lobby + room)

#### 5. Dependency Alignment

Updated to Expo 55 canary with React Native 0.83.4 and React 19.2.0 to resolve iOS build compatibility issues (`ExpoReactNativeFactory.swift` API mismatch with RN 0.84).

### File Structure (New/Modified)

```
app/
├── App.js                              # Navigation + P2P room discovery listener
├── src/
│   ├── store/
│   │   ├── index.js                    # Added rooms reducer
│   │   └── slices/
│   │       ├── messagesSlice.js        # Entity adapter, grouped selector
│   │       └── roomsSlice.js           # Room list + active room state
│   ├── features/
│   │   ├── rooms/
│   │   │   └── RoomListScreen.js       # Room list UI
│   │   └── chat/
│   │       ├── ChatScreen.js           # Chat UI with back/share header
│   │       ├── MessageBubble.js        # Grouped bubbles with status
│   │       ├── MessageInput.js         # Conditional send button
│   │       ├── DateSeparator.js        # Date pills
│   │       └── hooks/
│   │           ├── useChatRoom.js      # Room state from Redux
│   │           └── useMessages.js      # Message dispatch + P2P listener
│   ├── lib/
│   │   ├── rpc.js                      # Added room discovery RPC handler
│   │   └── uiEvent.js                  # Added ROOM_DISCOVERED_UI event
│   └── utils/
│       └── formatTime.js              # Time/date formatting
└── worklet/
    ├── api.mjs                         # Added API_ROOM_DISCOVERED + message IDs
    └── app.mjs                         # Lobby join, room broadcast, dedup
```
