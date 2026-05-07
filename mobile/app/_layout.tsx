import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // This hides the header (and the "index" text) for EVERY screen in this stack
        headerShown: false, 
      }}
    >
      {/* You can also be specific about the index screen here */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}