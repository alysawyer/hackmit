// src/screens/OnboardingScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../store/settingsStore';
import { CharacterAvatar } from '../components/CharacterAvatar';
import { characterFromPeerIdSync } from '../features/encounters/characterGen';

type OnboardingScreenProps = {
  onComplete: () => void;
};

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setUserName = useSettingsStore((state) => state.setUserName);
  const setHasCompletedOnboarding = useSettingsStore((state) => state.setHasCompletedOnboarding);

  // Generate preview character based on current name input
  const previewCharacter = name.trim() ? characterFromPeerIdSync(name.trim()) : null;

  const handleContinue = () => {
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      Alert.alert('Name Required', 'Please enter a name with at least 2 characters.');
      return;
    }
    
    if (trimmedName.length > 20) {
      Alert.alert('Name Too Long', 'Please enter a name with 20 characters or less.');
      return;
    }

    setIsLoading(true);
    
    // Save user name and mark onboarding as complete
    setUserName(trimmedName);
    setHasCompletedOnboarding(true);
    
    // Small delay for better UX
    setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Fish Friends!</Text>
            <Text style={styles.subtitle}>
              Meet new people nearby and collect unique fish characters
            </Text>
          </View>

          <View style={styles.previewSection}>
            {previewCharacter && (
              <View style={styles.previewContainer}>
                <Text style={styles.previewLabel}>Your Fish Preview:</Text>
                <CharacterAvatar character={previewCharacter} size={120} />
                <Text style={styles.previewName}>{previewCharacter.nickname}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>What's your name?</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              maxLength={20}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              Your fish will be named "{name.trim() || 'Your Name'}" when others meet you!
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!name.trim() || isLoading}
          >
            <Text style={[styles.continueButtonText, !name.trim() && styles.continueButtonTextDisabled]}>
              {isLoading ? 'Getting Ready...' : 'Start Exploring'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  keyboardContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: 40,
    minHeight: 180,
    justifyContent: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
    fontWeight: '600',
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 12,
  },
  inputSection: {
    marginBottom: 40,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 2,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  helperText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  continueButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButtonTextDisabled: {
    color: '#7f8c8d',
  },
});
