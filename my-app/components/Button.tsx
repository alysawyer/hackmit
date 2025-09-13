import { StyleSheet, View, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  isFocused?: boolean; // Add focus state prop
}

export default function Button({ label, onPress, isFocused }: Props) {
  return (
    <View style={styles.buttonContainer}>
      <Pressable 
        style={[
          styles.button, 
          isFocused && styles.focusedButton // Apply focused style conditionally
        ]} 
        onPress={onPress}
      >
        <Text style={[
          styles.buttonLabel,
          isFocused && styles.focusedButtonLabel // Apply focused text style
        ]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#e0e0e0', // Default background
  },
  buttonLabel: {
    fontSize: 16,
    color: '#000', // Default text color
  },
  focusedButton: {
    backgroundColor: '#007AFF', // Focused background color
  },
  focusedButtonLabel: {
    color: '#fff', // Focused text color
  },
});