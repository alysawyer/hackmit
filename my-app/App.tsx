// App.tsx

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { useSettingsStore } from './src/store/settingsStore';
import { encounterService } from './src/features/encounters/encounterService';

export default function App() {
  const hasCompletedOnboarding = useSettingsStore((state) => state.hasCompletedOnboarding);
  const [showOnboarding, setShowOnboarding] = useState(!hasCompletedOnboarding);

  useEffect(() => {
    // Initialize encounter service when app starts
    encounterService.initialize();

    return () => {
      // Cleanup when app closes
      encounterService.stop();
    };
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding) {
    return (
      <>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}
