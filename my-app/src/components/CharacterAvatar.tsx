// src/components/CharacterAvatar.tsx

import React from 'react';
import { View, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Character } from '../features/encounters/characterGen';

type CharacterAvatarProps = {
  character: Character;
  size?: number;
  style?: ViewStyle;
  showColorOverlay?: boolean;
};

// Map variant index to fish asset
const fishAssets = [
  require('../../assets/fish/fish_0.png'),
  require('../../assets/fish/fish_1.png'),
  require('../../assets/fish/fish_2.png'),
  require('../../assets/fish/fish_3.png'),
  require('../../assets/fish/fish_4.png'),
  require('../../assets/fish/fish_5.png'),
  require('../../assets/fish/fish_6.png'),
  require('../../assets/fish/fish_7.png'),
];

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 80,
  style,
  showColorOverlay = true,
}) => {
  const fishSource = fishAssets[character.variantIndex] || fishAssets[0];
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={fishSource}
        style={[
          styles.image,
          { width: size, height: size },
          showColorOverlay && { tintColor: character.colorHex }
        ] as ImageStyle}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    position: 'absolute',
  },
});
