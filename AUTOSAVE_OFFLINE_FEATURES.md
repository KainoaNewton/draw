# Autosave and Offline Features

This document describes the comprehensive autosave and offline functionality implemented in the Draw application.

## Features Overview

### 🔄 Comprehensive Autosave
- **Drawing Elements**: Automatically saves every 3 seconds while drawing
- **Page Names**: Debounced autosave (400ms) when editing page titles
- **Folder Names**: Instant autosave when renaming folders
- **Local Storage**: All changes are immediately saved to browser local storage
- **Supabase Sync**: Changes are synced to Supabase when online

### 🌐 Offline Support
- **Offline Detection**: Automatically detects when the user goes offline
- **Local Persistence**: All changes continue to work offline using local storage
- **Pending Changes Queue**: Failed or offline changes are queued for later sync
- **Automatic Sync**: When back online, all pending changes are automatically synced
- **Conflict Resolution**: Uses timestamps to resolve conflicts between local and remote data

### 📱 User Experience
- **Sync Status Indicator**: Shows online/offline status and sync progress
- **Pending Changes Counter**: Displays number of changes waiting to sync
- **No Data Loss**: Changes are never lost, even when offline
- **Seamless Experience**: App works identically whether online or offline

## Technical Implementation

### Core Components

#### 1. Network Status Detection (`useNetworkStatus`)
- Monitors browser online/offline events
- Periodic connectivity checks via health endpoint
- Tracks transition states (just came online, was offline)

#### 2. Offline Storage (`offlineStore`)
- Zustand store with persistence
- Queues pending changes when offline or sync fails
- Tracks sync status and timestamps
- Prevents duplicate pending changes

#### 3. Local Data Stores
- **`drawDataStore`**: Persists drawing elements and page names
- **`folderDataStore`**: Persists folder names and metadata
- Both use Zustand with persistence middleware

#### 4. Sync Service (`syncService`)
- Handles syncing pending changes to Supabase
- Processes changes in chronological order
- Handles different change types (page updates, folder renames, etc.)
- Provides error handling and retry logic

#### 5. Offline Sync Hook (`useOfflineSync`)
- Combines network status with sync functionality
- Triggers sync when coming back online
- Provides periodic sync checks
- Exposes sync status to components

### Data Flow

```
User Action → Local Storage (Immediate) → Online Check
                                       ↓
                              Online: Sync to Supabase
                                       ↓
                              Offline: Add to Pending Queue
                                       ↓
                              Back Online: Auto-sync Pending
```

### Change Types Supported

1. **Page Updates** (`page_update`)
   - Drawing elements changes
   - Page name changes
   - Automatic deduplication by page ID

2. **Folder Renames** (`folder_rename`)
   - Folder name changes
   - Automatic deduplication by folder ID

3. **Page Creation** (`page_create`)
   - New page creation when offline
   - Synced when back online

4. **Folder Creation** (`folder_create`)
   - New folder creation when offline
   - Synced when back online

## User Interface Changes

### Removed Features
- ❌ **Refresh Button**: No longer needed due to comprehensive autosave
- ❌ **Manual Save**: All saving is now automatic

### Added Features
- ✅ **Sync Status Indicator**: Shows online/offline status in page header
- ✅ **Pending Changes Badge**: Shows count of changes waiting to sync
- ✅ **Automatic Sync Notifications**: Toast messages for sync status

### Status Indicators

#### Online Status
- 🟢 **Online**: Green wifi icon with "Online" text
- 🟠 **Offline**: Orange wifi-off icon with "Offline" text and pending count
- 🔄 **Syncing**: Spinning icon with "Syncing" text

## Configuration

### Autosave Intervals
- **Drawing Elements**: 3 seconds
- **Page Names**: 400ms debounce
- **Folder Names**: Immediate
- **Periodic Sync**: 5 minutes (when online with pending changes)

### Storage Keys
- `draw-data-store`: Drawing elements and page names
- `folder-data-store`: Folder names and metadata
- `offline-store`: Pending changes queue and sync status

## Error Handling

### Network Failures
- Failed requests are automatically queued for retry
- User is notified of offline status
- No data loss occurs

### Sync Conflicts
- Timestamps are used to determine data precedence
- Local changes take priority during active editing
- Remote changes are applied when loading fresh data

### Invalid Data
- Invalid pending changes are removed to prevent infinite retries
- Error logging helps with debugging
- Graceful degradation ensures app continues working

## Benefits

1. **No Data Loss**: Changes are never lost, even with network issues
2. **Better UX**: No need to manually save or refresh
3. **Offline Capability**: Full functionality when offline
4. **Automatic Recovery**: Seamless sync when back online
5. **Performance**: Local-first approach for instant responsiveness
6. **Reliability**: Multiple layers of data persistence

## Future Enhancements

- Real-time collaboration support
- Conflict resolution UI for manual resolution
- Selective sync options
- Data compression for large drawings
- Background sync service worker
