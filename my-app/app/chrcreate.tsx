import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Character Creation screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2f42ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#90bbc8ff',
  },
});
