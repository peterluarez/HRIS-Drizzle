import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        setIsAuthenticated(!!token);
      } catch (e) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);
 
  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: globalStyles.light.background,
        }}
      >
        <ActivityIndicator size="large" color={globalStyles.light.primary} />
      </View>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: globalStyles.light.primary,
        tabBarInactiveTintColor: "#555555",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
        },
        headerStyle: {
          backgroundColor: globalStyles.light.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: globalStyles.light.primary,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Employees",
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      /> 
      <Tabs.Screen
        name="create"
        options={{
          title: "Add Employee",
          href: null,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
