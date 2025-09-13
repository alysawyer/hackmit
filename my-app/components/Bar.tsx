import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './Button';

type BarProps = {
  numberOfButtons: number;
  buttonLabels?: string[];
  initialFocused?: number; 
  onButtonPress?: (index: number) => void;
}

export default function Bar({ numberOfButtons, buttonLabels, initialFocused = 0, onButtonPress }: BarProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(initialFocused);

  const handleButtonPress = (index: number) => {
    setFocusedIndex(index); // Set this button as focused
    onButtonPress?.(index); // Call external callback if provided
  };

  const renderButtons = () => {
    const buttons = [];
    
    for (let i = 0; i < numberOfButtons; i++) {
      const label = buttonLabels?.[i] || `Button ${i + 1}`;
      
      buttons.push(
        <Button
          key={i}
          label={label}
          isFocused={focusedIndex === i} // Pass focus state
          onPress={() => handleButtonPress(i)}
        />
      );
    }
    
    return buttons;
  };

  return (
    <View style={styles.barContainer}>
      {renderButtons()}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});