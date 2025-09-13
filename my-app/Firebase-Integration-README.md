# Firebase Realtime Proximity Integration

This guide covers the Firebase realtime proximity system integration for your React Native/Expo app. The system maintains your existing mock/test harness while adding real location-based encounter detection using Firebase Realtime Database.

## 🚀 Quick Setup

### 1. Install Dependencies

The required dependencies have already been added to `package.json`. Run:

```bash
cd my-app
npm install
```

**Dependencies added:**
- `expo-location` (~18.0.5) - Foreground location services
- `firebase` (^11.1.0) - Firebase SDK
- `haversine-distance` (^1.2.1) - Distance calculations
- `zod` (^3.24.1) - Schema validation

### 2. Firebase Project Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Realtime Database** (not Firestore)
4. Enable **Authentication** with Anonymous provider

#### Get Configuration
1. In Project Settings → General → Your apps
2. Add a web app or use existing config
3. Copy the `firebaseConfig` object

#### Configure Environment Variables
Create or update `app.config.js` in your project root:

```javascript
export default {
  expo: {
    // ... existing config
    extra: {
      // Firebase configuration
      EXPO_PUBLIC_FB_API_KEY: "your-api-key",
      EXPO_PUBLIC_FB_AUTH_DOMAIN: "your-project.firebaseapp.com",
      EXPO_PUBLIC_FB_DATABASE_URL: "https://your-project-default-rtdb.firebaseio.com/",
      EXPO_PUBLIC_FB_PROJECT_ID: "your-project-id",
      EXPO_PUBLIC_FB_STORAGE_BUCKET: "your-project.appspot.com",
      EXPO_PUBLIC_FB_MSG_SENDER_ID: "123456789",
      EXPO_PUBLIC_FB_APP_ID: "1:123456789:web:abcdef123456"
    }
  }
};
```

**Alternative:** For hackathon/testing, you can inline config in `src/services/firebase.ts` (not recommended for production).

#### Set Database Rules
In Firebase Console → Realtime Database → Rules:

**Development Rules (permissive):**
```json
{
  "rules": {
    "locations": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Production Rules (auth-scoped):**
```json
{
  "rules": {
    "locations": {
      "$uid": {
        ".read": true,
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

### 3. Location Permissions

The app will request location permissions automatically. For iOS, you may need to add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "This app uses location to find nearby users.",
          "locationAlwaysPermission": "This app uses location to find nearby users.",
          "locationWhenInUsePermission": "This app uses location to find nearby users."
        }
      ]
    ]
  }
}
```

## 🎯 How It Works

### Architecture Overview

The system uses a **3-mode architecture**:

1. **Mock Mode** (`'mock'`): Original behavior with simulated encounters
2. **EventBus Mode** (`'eventbus'`): Only listens for manual events via DeviceEventEmitter
3. **Firebase Mode** (`'firebase'`): Full realtime proximity detection using Firebase

### Components

```
┌─────────────────────────┐
│   EncounterService      │  ← Main service (unchanged interface)
│   - Toast handling      │
│   - Mode management     │
└─────────────────────────┘
           │
┌─────────────────────────┐
│   EncounterRuntime      │  ← New: Mode switching & orchestration
│   - Mock/EventBus/FB    │
│   - Location watching   │
└─────────────────────────┘
           │
┌─────────────────────────┐  ┌─────────────────────────┐
│  EventBusEncounterAdapter│  │  LocationPublisher       │
│  - DeviceEventEmitter   │  │  - Firebase RTDB writes  │
│  - Schema validation    │  │  - 3s location updates   │
└─────────────────────────┘  └─────────────────────────┘
           │                            │
┌─────────────────────────────────────────────────────────┐
│              FirebaseProximityEngine                    │
│  - Listens to locations/ in RTDB                       │
│  - Calculates haversine distance                       │
│  - Emits EncounterEvents via DeviceEventEmitter        │
│  - 20m proximity threshold, 60s cooldown               │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Location Publishing**: Your location → Firebase `/locations/{userId}`
2. **Proximity Detection**: Engine watches all locations, calculates distances
3. **Event Emission**: When peer within 20m → `DeviceEventEmitter.emit('EncounterEvent')`
4. **Event Processing**: EventBus → CollectionStore → UI (existing logic)

## 🎮 Usage & Testing

### Running the App

```bash
expo start
```

Choose your platform (iOS/Android/Web) and the app will load with Firebase mode enabled by default.

### Mode Switching

The app supports three encounter modes that can be switched in your Settings/Debug screen:

```typescript
import { useSettingsStore } from '../store/settingsStore';

// In your component
const { encounterMode, setEncounterMode } = useSettingsStore();

// Switch modes
setEncounterMode('firebase'); // Real proximity
setEncounterMode('mock');     // Simulated encounters
setEncounterMode('eventbus'); // Manual events only
```

### Manual Testing

**Simulate Encounters (works in any mode):**
```typescript
import { encounterService } from '../features/encounters/encounterService';

// Trigger a test encounter
encounterService.simulateEncounter('test-peer-123');
```

**Check Runtime Status:**
```typescript
const status = encounterService.getRuntimeStatus();
console.log('Runtime status:', status);
// Output: { mode: 'firebase', userId: 'xyz', busRunning: true, publisherRunning: true, engineRunning: true }
```

## 🧪 Testing Scenarios

### Single Device Testing

1. **Start the app** in Firebase mode
2. **Check Firebase Console** → Realtime Database → `locations/`
3. You should see your `userId` with `lat`, `lng`, `updatedAt`
4. **Manually add a fake peer**:
   ```json
   {
     "locations": {
       "your-user-id": { "lat": 37.7749, "lng": -122.4194, "updatedAt": 1640000000000 },
       "fake-peer-123": { "lat": 37.7750, "lng": -122.4195, "updatedAt": 1640000000000 }
     }
   }
   ```
5. **Expected**: Toast notification + character appears in collection

### Two Device Testing

1. **Install Expo Go** on two devices
2. **Same build** on both devices
3. **Walk devices close together** (< 20m)
4. **Expected**: Both devices get encounter notifications

### Testing Matrix

| Scenario | Mock Mode | EventBus Mode | Firebase Mode |
|----------|-----------|---------------|---------------|
| Auto encounters | ✅ (every 10-20s) | ❌ | ✅ (proximity-based) |
| Manual simulation | ✅ | ✅ | ✅ |
| Location tracking | ❌ | ❌ | ✅ |
| Real proximity | ❌ | ❌ | ✅ |
| Cooldown behavior | ✅ | ✅ | ✅ |

## 🐛 Debugging

### Location Issues

**No location updates in Firebase:**
```bash
# Check permissions
expo install expo-location
# In device settings, ensure location permission is granted

# Check console logs
console.log('Location publisher running:', encounterService.getRuntimeStatus().publisherRunning);
```

**Location permission denied:**
- iOS: Settings → Privacy → Location Services → Your App → "While Using App"  
- Android: Settings → Apps → Your App → Permissions → Location → Allow

### Firebase Connection Issues

**Firebase config errors:**
```bash
# Check environment variables are loaded
console.log('Firebase config:', {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  databaseURL: process.env.EXPO_PUBLIC_FB_DATABASE_URL
});
```

**Database rules errors:**
- Check Firebase Console → Realtime Database → Rules
- Ensure rules allow read/write for your use case
- Check browser network tab for 401/403 errors

**Anonymous auth issues:**
```typescript
import { ensureAnonAuth } from '../services/firebase';

// Test auth manually
ensureAnonAuth().then(uid => console.log('User ID:', uid));
```

### Proximity Detection Issues

**No encounters despite close proximity:**
```bash
# Check if both users appear in Firebase locations
# Firebase Console → Realtime Database → locations/

# Verify distance calculation
import haversine from 'haversine-distance';
const distance = haversine(
  { lat: 37.7749, lon: -122.4194 },
  { lat: 37.7750, lon: -122.4195 }
);
console.log('Distance:', distance, 'meters'); // Should be < 20 for encounter
```

**Cooldown preventing encounters:**
- Default: 60-second cooldown per peer
- Check `FirebaseProximityEngine.ENTER_COOLDOWN_MS`
- Store also applies its own cooldown logic

**Stale location data:**
- Engine ignores locations older than 30 seconds
- Check `FirebaseProximityEngine.MAX_AGE_MS`
- Ensure location updates are recent in Firebase

### Console Debug Commands

```javascript
// Runtime status
encounterService.getRuntimeStatus()

// Force encounter
encounterService.simulateEncounter()

// Check store state
useCollectionStore.getState().all()

// Firebase locations (in browser console)
firebase.database().ref('locations').once('value').then(snap => console.log(snap.val()))
```

## ⚙️ Configuration

### Proximity Settings

Edit `src/services/proximity/FirebaseProximityEngine.ts`:

```typescript
// Proximity threshold (meters)
private readonly PROXIMITY_THRESHOLD_METERS = 20;

// Cooldown between encounters with same peer (ms) 
private readonly ENTER_COOLDOWN_MS = 60_000;

// Ignore stale peer locations (ms)
private readonly MAX_AGE_MS = 30_000;
```

### Location Publishing

Edit `src/services/location/LocationPublisher.ts`:

```typescript
// Location update frequency
timeInterval: 3000,       // 3 seconds
distanceInterval: 5,      // 5 meters

// Location accuracy
accuracy: Location.Accuracy.Balanced
```

### Performance Considerations

**Battery Usage:**
- Uses `Location.Accuracy.Balanced` for reasonable battery life
- Updates every 3 seconds or 5 meters of movement
- Consider longer intervals for production (5-10 seconds)

**Firebase Usage:**
- Each location update = 1 write operation
- Each proximity check = reads all locations
- ~20-100 operations per minute per user
- Firebase free tier: 100k operations/day

**Network Usage:**
- Location payload: ~100 bytes per update
- Proximity data: varies by user density
- Total: ~1-5 KB per minute per user

## 🏗️ Production Checklist

- [ ] Set Firebase database rules to auth-scoped
- [ ] Configure proper environment variables (not inline config)
- [ ] Test location permissions on both platforms
- [ ] Verify Firebase quotas for expected user count
- [ ] Consider background location for production app (requires custom dev client)
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Test with simulated poor network conditions
- [ ] Add privacy policy for location data

## 🔄 Migration Notes

**From existing mock setup:**
- Existing encounter logic unchanged
- Same toast system and collection store
- Same cooldown behavior
- Settings store has legacy compatibility (`isDebugMode` still works)

**EventBus pattern preserved:**
- All encounter events still go through `DeviceEventEmitter`
- Manual simulation still works: `encounterService.simulateEncounter()`
- Existing debugging tools unchanged

## 📝 Next Steps

**Immediate:**
1. Set up Firebase project and get config
2. Update environment variables  
3. Test single device with manual peer injection
4. Test two devices in close proximity

**Future Enhancements:**
- Background location (requires custom dev client)
- Bluetooth fallback for more accuracy
- User profile exchange during encounters
- Push notifications for encounters when app backgrounded
- Supabase alternative with PostGIS queries

## 🆘 Support

**Common Issues:**
1. **"Location permission denied"** → Check device settings
2. **"Firebase permission denied"** → Check database rules
3. **"No encounters detected"** → Check both devices appear in Firebase locations
4. **"Environment variables undefined"** → Check app.config.js setup

**Debug First Steps:**
1. Check `encounterService.getRuntimeStatus()`
2. Verify Firebase Console shows your location
3. Test manual simulation: `encounterService.simulateEncounter()`
4. Check React Native logs for errors

For more detailed debugging, check the Firebase Console → Realtime Database to see live location data and verify the proximity engine is working correctly.
