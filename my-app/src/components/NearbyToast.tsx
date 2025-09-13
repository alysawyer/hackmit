// src/components/NearbyToast.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Character } from '../features/encounters/characterGen';
import { CharacterAvatar } from './CharacterAvatar';
import { ToastData, encounterService } from '../features/encounters/encounterService';

const TOAST_DURATION = 3000; // 3 seconds
const ANIMATION_DURATION = 300;

type NearbyToastProps = {
  onDismiss?: () => void;
};

export const NearbyToast: React.FC<NearbyToastProps> = ({ onDismiss }) => {
  const navigation = useNavigation<any>();
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register toast handler
    encounterService.setToastHandler((toast) => {
      if (!isVisible) {
        showToast(toast);
      }
    });

    // Check for queued toasts on mount
    const nextToast = encounterService.getNextToast();
    if (nextToast) {
      showToast(nextToast);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [isVisible]);

  const showToast = (toast: ToastData) => {
    setCurrentToast(toast);
    setIsVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    dismissTimer.current = setTimeout(() => {
      hideToast();
    }, TOAST_DURATION);
  };

  const hideToast = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setCurrentToast(null);
      
      // Check for next toast in queue
      const nextToast = encounterService.getNextToast();
      if (nextToast) {
        setTimeout(() => showToast(nextToast), 100);
      }
      
      if (onDismiss) {
        onDismiss();
      }
    });
  };

  const handlePress = () => {
    if (currentToast) {
      // Navigate to peer detail
      navigation.navigate('PeerDetail', { peerId: currentToast.peerId });
      hideToast();
    }
  };

  if (!isVisible || !currentToast) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toast}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <CharacterAvatar character={currentToast.character} size={50} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>New Encounter!</Text>
          <Text style={styles.subtitle}>
            {currentToast.character.nickname || currentToast.peerId}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  toast: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
