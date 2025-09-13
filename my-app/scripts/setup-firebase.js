#!/usr/bin/env node

/**
 * Firebase Setup Helper Script
 * 
 * This script helps validate your Firebase configuration and provides
 * setup instructions for the proximity detection system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase Proximity Setup Helper\n');

// Check if Firebase config is set up
const configPath = path.join(__dirname, '..', 'app.config.js');
let hasValidConfig = false;

try {
  const config = require(configPath);
  const fbConfig = config.default?.expo?.extra;
  
  if (fbConfig && !fbConfig.EXPO_PUBLIC_FB_API_KEY?.includes('YOUR_FIREBASE')) {
    console.log('✅ Firebase configuration found in app.config.js');
    hasValidConfig = true;
  } else {
    console.log('❌ Firebase configuration not set in app.config.js');
  }
} catch (error) {
  console.log('❌ Could not read app.config.js');
}

// Check for .env file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
} else {
  console.log('ℹ️  .env.local file not found (optional)');
}

console.log('\n📋 Setup Checklist:');
console.log('');

if (!hasValidConfig) {
  console.log('🔧 REQUIRED: Update Firebase config in app.config.js');
  console.log('   1. Go to Firebase Console → Your Project → Project Settings');
  console.log('   2. Scroll to "Your apps" section');
  console.log('   3. Copy the firebaseConfig values');
  console.log('   4. Replace the placeholder values in app.config.js\n');
}

console.log('🔥 Firebase Project Setup:');
console.log('   1. Create/use Firebase project at https://console.firebase.google.com');
console.log('   2. Enable Realtime Database');
console.log('   3. Enable Authentication → Anonymous provider');
console.log('   4. Set database rules (see firebase-database-rules.json)');
console.log('');

console.log('📱 Test the integration:');
console.log('   1. npm install');
console.log('   2. expo start');
console.log('   3. Open Settings → Encounter Mode → Switch to Firebase');
console.log('   4. Check Firebase Console to see your location appear');
console.log('   5. Add fake peer location or test with second device');
console.log('');

console.log('🐛 Debug commands:');
console.log('   - Check status: encounterService.getRuntimeStatus()');
console.log('   - Test manual encounter: encounterService.simulateEncounter()');
console.log('   - View Firebase locations: Firebase Console → Realtime Database');

if (hasValidConfig) {
  console.log('\n🎉 Configuration looks good! Run "npm install" and "expo start" to test.');
} else {
  console.log('\n⚠️  Please complete Firebase configuration before testing.');
}
