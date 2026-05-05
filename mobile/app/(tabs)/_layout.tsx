import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import { useState, useEffect } from "react";

export default function TabLayout() {
  // In a real app, you'd check a secure token or a global state here
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // If the user is NOT authenticated, redirect them to the login screen
  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: globalStyles.light.primary, 
        tabBarStyle: { backgroundColor: "#F7E7CE" },
        headerStyle: { backgroundColor: globalStyles.light.primary },
        headerTintColor: "#F7E7CE",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: " ",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: " ",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-add" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
