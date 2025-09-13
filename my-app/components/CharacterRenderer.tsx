import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

type CharacterRendererProps = {
  selectedColor: string;
  bodySource: any;
  faceSource: any;
  size?: number;
};

const CharacterRenderer: React.FC<CharacterRendererProps> = ({
  selectedColor,
  bodySource,
  faceSource,
  size = 200
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background color layer */}
      <View 
        style={[
          styles.colorBackground, 
          { backgroundColor: selectedColor }
        ]} 
      />
      
      {/* Body sprite - will show black lines, white becomes transparent */}
      <Image 
        source={bodySource}
        style={styles.sprite}
        resizeMode="contain"
      />
      
      {/* Face sprite layered on top */}
      <Image 
        source={faceSource}
        style={styles.sprite}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  shadowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  withShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  colorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sprite: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
});

export default CharacterRenderer;