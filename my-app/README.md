# Proximity Encounter App MVP

A React Native + Expo app that creates cute fish characters when users encounter each other nearby. Features StreetPass-style proximity detection with persistent character collection.

## Features

- 🐟 **Deterministic Fish Characters**: Each peer ID generates unique fish with colors and variants
- 📡 **Dual Proximity Modes**: Mock adapter (debug) + EventBus adapter (production)
- 🏪 **Persistent Collection**: Save encountered characters with Zustand + AsyncStorage
- 🎯 **Smart Toast System**: Animated encounter notifications with queue management
- ⏱️ **60-second Cooldown**: Prevents spam encounters from same peer
- 📱 **Native Navigation**: Tab navigation with character detail screens

## Architecture

### File Structure

```
/src
  /adapters
    EncounterAdapter.ts          # Abstract interface
    MockEncounterAdapter.ts      # Debug implementation with simulated encounters
    EventBusEncounterAdapter.ts  # Production implementation via DeviceEventEmitter
  /components
    NearbyToast.tsx              # Animated encounter notifications
    CharacterAvatar.tsx          # Fish character display component
  /features
    /encounters
      encounterService.ts        # Central service managing adapters and toasts
      characterGen.ts            # Deterministic character generation using expo-crypto
  /screens
    HomeScreen.tsx               # Recent encounters + debug controls
    CollectionScreen.tsx         # Grid of all collected characters
    PeerDetailScreen.tsx         # Individual character details
    SettingsScreen.tsx           # Debug mode, adapter controls, data reset
  /store
    collectionStore.ts           # Zustand store for character collection
    settingsStore.ts             # Zustand store for app settings
  /navigation
    RootNavigator.tsx            # React Navigation setup
  /utils
    colors.ts                    # Color utilities and palettes
    time.ts                      # Time formatting helpers
/assets/fish/
  fish_0.png through fish_7.png # Fish character assets
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

**Core Dependencies Added:**
- `@react-navigation/native` + `@react-navigation/native-stack` + `@react-navigation/bottom-tabs`
- `@react-native-async-storage/async-storage` 
- `zustand` (state management)
- `expo-crypto` (deterministic character generation)

### 2. Run the App

```bash
# Start Expo development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web
```

## Usage

### Debug Mode (Default)

1. **Launch app** - Debug mode is enabled by default in development
2. **Tap "Simulate Encounter"** on Home screen to trigger mock encounters
3. **View toast notification** showing new character
4. **Check Collection tab** to see saved characters
5. **Tap any character** for detailed view

### Production EventBus Mode

1. **Go to Settings tab**
2. **Turn off "Debug Mode"** 
3. **Trigger EventBus event** via one of these methods:

#### Method 1: React Native Debugger Console
```javascript
import { DeviceEventEmitter } from 'react-native';
DeviceEventEmitter.emit('EncounterEvent', { 
  type: 'ENTER', 
  peerId: 'peer-ny-42', 
  occurredAt: Date.now(), 
  distanceMeters: 8 
});
```

#### Method 2: Settings Screen Test Button
- Use the **"Test EventBus"** button in Settings to send a test event

#### Method 3: Integration with Real Proximity Layer
Your teammate can emit events from their proximity detection module:
```javascript
// In their BLE/GPS proximity module
import { DeviceEventEmitter } from 'react-native';

// When peer detected
DeviceEventEmitter.emit('EncounterEvent', {
  type: 'ENTER',           // 'ENTER' | 'DWELL' | 'EXIT' 
  peerId: detectedPeerId,  // Unique identifier
  occurredAt: Date.now(),  // Timestamp
  distanceMeters: 12       // Optional distance
});
```

## Character Generation

Each `peerId` deterministically generates:
- **Species**: fish (MVP only supports fish)
- **Variant Index**: 0-7 (selects from fish_0.png to fish_7.png)
- **Color Hex**: Derived from SHA-256 hash 
- **Nickname**: Combination like "Swift Fin" or "Gentle Wave"

### Example Character Output:
```typescript
{
  id: "peer-ny-42",
  seed: "a8b2c3d4...",
  species: "fish", 
  variantIndex: 3,
  colorHex: "#4ECDC4",
  nickname: "Curious Reef"
}
```

## Encounter Flow

1. **Proximity Detection** → `EncounterEvent` emitted
2. **encounterService** → Processes event, applies 60s cooldown
3. **Character Generation** → Creates character from peerId  
4. **Store Update** → Saves to collection with persistence
5. **Toast Display** → Shows animated notification (max 1 visible, queue up to 3)
6. **Navigation** → Tap toast to view character details

## Testing Scenarios

### Test 1: Basic Encounter
1. Start app
2. Press "Simulate Encounter" 
3. **Expected**: Toast appears with random fish, character added to collection

### Test 2: Cooldown Behavior  
1. Simulate encounter with same peer
2. Quickly simulate again (within 60s)
3. **Expected**: Second encounter ignored, no duplicate toast

### Test 3: EventBus Integration
1. Switch to production mode in Settings
2. Execute EventBus command from console
3. **Expected**: Same behavior as mock encounters

### Test 4: Persistence
1. Add several characters
2. Force-quit app and reopen  
3. **Expected**: All characters still in collection

### Test 5: Navigation Flow
1. Simulate encounter
2. Tap toast notification
3. **Expected**: Navigate to character detail screen

## Fish Assets

The app includes 8 placeholder fish assets (`fish_0.png` through `fish_7.png`) generated as colorful SVG fish shapes. Each variant has a unique color:

- fish_0.png: Red (#FF6B6B)
- fish_1.png: Teal (#4ECDC4) 
- fish_2.png: Blue (#45B7D1)
- fish_3.png: Green (#96CEB4)
- fish_4.png: Yellow (#FECA57)
- fish_5.png: Pink (#FF9FF3)
- fish_6.png: Light Blue (#54A0FF)
- fish_7.png: Purple (#5F27CD)

*Note: Character colors are dynamically generated from peerId hash and tinted over the base fish asset.*

## State Management

### Collection Store (Zustand + AsyncStorage)
- **Entries**: Map of peerId → CollectionEntry
- **Recent Encounters**: Last 5 encounters for Home screen
- **Cooldown Tracking**: Prevents duplicate encounters within 60s
- **Persistence**: Auto-saves to AsyncStorage

### Settings Store
- **Debug Mode**: Toggle between Mock/EventBus adapters
- **Adapter Status**: Track if service is running
- **Persistence**: Settings survive app restarts

## Permissions Note

🚨 **This MVP runs in foreground only**. The real proximity layer will require:

- **Location Permissions**: For GPS-based proximity detection
- **Bluetooth Permissions**: For BLE-based proximity detection  
- **Background App Refresh**: For background scanning (future enhancement)

## Troubleshooting

### "No characters appear"
- Check if adapter is running (Settings → Service Status)
- Verify Debug Mode is enabled for testing
- Look for console errors in Metro/Expo logs

### "Toast doesn't show"  
- Check if multiple toasts are queued (max 3)
- Verify encounter passed 60-second cooldown
- Check `encounterService.toastHandler` is set

### "Navigation error"
- Ensure all navigation dependencies are installed
- Check React Navigation is properly initialized

### "Character images not loading"
- Verify fish assets exist in `/assets/fish/`
- Check file paths in `CharacterAvatar.tsx`
- Ensure require() statements match exact filenames

## Next Steps for Production

1. **Real Proximity Integration**: Replace mock adapter with teammate's BLE/GPS module
2. **Background Processing**: Add background encounter detection
3. **User Authentication**: Add user accounts and server sync
4. **Enhanced Character System**: More species, customization, evolution
5. **Social Features**: Trading, battles, friend systems
6. **AR Integration**: Overlay characters in camera view

---

**Built with**: React Native 0.81, Expo 54, TypeScript, Zustand, React Navigation 7

**MVP Scope**: Local-only, foreground operation, single device testing via simulation