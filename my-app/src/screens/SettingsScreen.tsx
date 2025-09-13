// src/screens/SettingsScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { useCollectionStore } from '../store/collectionStore';
import { encounterService } from '../features/encounters/encounterService';
import { EncounterModeSelector } from '../components/EncounterModeSelector';

export const SettingsScreen: React.FC = () => {
  const {
    isDebugMode,
    isAdapterRunning,
    setDebugMode,
    toggleDebugMode,
  } = useSettingsStore();
  const { reset: resetCollection } = useCollectionStore();

  const handleToggleDebugMode = async (enabled: boolean) => {
    setDebugMode(enabled);
    // Restart service with new adapter
    if (isAdapterRunning) {
      await encounterService.restart();
    }
  };

  const handleStartStop = async () => {
    if (isAdapterRunning) {
      await encounterService.stop();
    } else {
      await encounterService.start();
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all your collected characters and encounter history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetCollection();
            Alert.alert('Success', 'All data has been reset.');
          },
        },
      ]
    );
  };

  const handleTestEventBus = () => {
    // Example of triggering EventBus event for testing
    const { DeviceEventEmitter } = require('react-native');
    DeviceEventEmitter.emit('EncounterEvent', {
      type: 'ENTER',
      peerId: 'test-eventbus-peer',
      occurredAt: Date.now(),
      distanceMeters: 5,
    });
    Alert.alert('Test Event Sent', 'Sent EncounterEvent via DeviceEventEmitter');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure your encounter experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adapter Control</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Service Status</Text>
              <Text style={styles.settingDescription}>
                {isAdapterRunning ? 'Scanning for encounters' : 'Service stopped'}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isAdapterRunning ? styles.stopButton : styles.startButton,
              ]}
              onPress={handleStartStop}
            >
              <Text
                style={[
                  styles.actionButtonText,
                  isAdapterRunning ? styles.stopButtonText : styles.startButtonText,
                ]}
              >
                {isAdapterRunning ? 'Stop' : 'Start'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Firebase Proximity Mode Selector */}
        <EncounterModeSelector />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legacy Debug Options</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Debug Mode (Legacy)</Text>
              <Text style={styles.settingDescription}>
                Use mock adapter with simulated encounters (same as Mock mode above)
              </Text>
            </View>
            <Switch
              value={isDebugMode}
              onValueChange={handleToggleDebugMode}
              trackColor={{ false: '#e0e0e0', true: '#4CAF50' }}
              thumbColor={isDebugMode ? '#ffffff' : '#ffffff'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Test EventBus</Text>
              <Text style={styles.settingDescription}>
                Send test event via DeviceEventEmitter
              </Text>
            </View>
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestEventBus}
            >
              <Text style={styles.testButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleResetData}>
            <Text style={styles.dangerButtonText}>Reset All Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions Note</Text>
          <Text style={styles.permissionNote}>
            📍 The real proximity layer will require Location permissions for GPS-based detection.
            {'\n\n'}
            📶 Bluetooth permissions may be needed for BLE-based proximity detection.
            {'\n\n'}
            🔄 Background app refresh permission for background scanning (not implemented in this MVP).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Proximity Encounter App MVP{'\n'}
            Built with React Native & Expo{'\n'}
            Uses Zustand for state management{'\n'}
            Fish characters generated deterministically
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  startButtonText: {
    color: 'white',
  },
  stopButtonText: {
    color: 'white',
  },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionNote: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
