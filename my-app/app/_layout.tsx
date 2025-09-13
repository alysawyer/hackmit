import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Index' }} />
      <Stack.Screen name="chrcreate" options={{ title: 'Character Create' }} />
    </Stack>
  );
}
