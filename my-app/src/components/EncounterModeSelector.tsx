// src/components/EncounterModeSelector.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { EncounterMode } from '../features/encounters/bootstrap';
import { encounterService } from '../features/encounters/encounterService';

const modeLabels: Record<EncounterMode, string> = {
  mock: 'Mock (Simulated)',
  eventbus: 'EventBus Only', 
  firebase: 'Firebase (Realtime)',
};

const modeDescriptions: Record<EncounterMode, string> = {
  mock: 'Auto-generates encounters every 10-20 seconds for testing',
  eventbus: 'Only responds to manual encounter simulations',
  firebase: 'Real-time proximity detection using location services',
};

export function EncounterModeSelector() {
  const { encounterMode, setEncounterMode, isAdapterRunning, userId } = useSettingsStore();

  const handleModeChange = async (newMode: EncounterMode) => {
    if (newMode === encounterMode) return;
    
    try {
      // Stop current service
      await encounterService.stop();
      
      // Update mode
      setEncounterMode(newMode);
      
      // Restart with new mode
      await encounterService.restart();
    } catch (error) {
      console.error('Failed to switch encounter mode:', error);
    }
  };

  const runtime = encounterService.getRuntimeStatus();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encounter Mode</Text>
      
      {/* Mode buttons */}
      <View style={styles.modeGrid}>
        {(Object.keys(modeLabels) as EncounterMode[]).map((mode) => (
          <Pressable
            key={mode}
            style={[
              styles.modeButton,
              encounterMode === mode && styles.activeModeButton,
            ]}
            onPress={() => handleModeChange(mode)}
          >
            <Text style={[
              styles.modeButtonText,
              encounterMode === mode && styles.activeModeButtonText,
            ]}>
              {modeLabels[mode]}
            </Text>
            <Text style={[
              styles.modeDescription,
              encounterMode === mode && styles.activeModeDescription,
            ]}>
              {modeDescriptions[mode]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Status info */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Status</Text>
        <Text style={styles.statusText}>Mode: {encounterMode}</Text>
        <Text style={styles.statusText}>Running: {isAdapterRunning ? '✅' : '❌'}</Text>
        {userId && <Text style={styles.statusText}>User ID: {userId.slice(0, 8)}...</Text>}
        
        {runtime && (
          <View style={styles.runtimeStatus}>
            <Text style={styles.statusText}>Bus: {runtime.busRunning ? '✅' : '❌'}</Text>
            {runtime.mode === 'firebase' && (
              <>
                <Text style={styles.statusText}>Publisher: {runtime.publisherRunning ? '✅' : '❌'}</Text>
                <Text style={styles.statusText}>Engine: {runtime.engineRunning ? '✅' : '❌'}</Text>
              </>
            )}
          </View>
        )}
      </View>

      {/* Test button */}
      <View style={styles.testContainer}>
        <Text style={styles.testTitle}>Manual Testing</Text>
        <Pressable
          style={styles.testButton}
          onPress={() => encounterService.simulateEncounter()}
        >
          <Text style={styles.testButtonText}>Simulate Encounter</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modeGrid: {
    gap: 12,
    marginBottom: 20,
  },
  modeButton: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activeModeButton: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activeModeButtonText: {
    color: '#007AFF',
  },
  modeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  activeModeDescription: {
    color: '#0066CC',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  runtimeStatus: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  testContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
