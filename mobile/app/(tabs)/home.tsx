import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";

export default function HomeScreen() {
  const [adminName, setAdminName] = useState("");
  const [stats, setStats] = useState({ totalEmployees: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userInfoRaw = await AsyncStorage.getItem("userInfo");
      if (userInfoRaw) {
        const userInfo = JSON.parse(userInfoRaw);
        const firstName = userInfo.fullName
          ? userInfo.fullName.split(" ")[0]
          : "Admin";

        setAdminName(firstName);
      }

      const token = await AsyncStorage.getItem("userToken");
      const url = `${process.env.EXPO_PUBLIC_URL}/hris/api/v1/users/stats`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "client-id": process.env.EXPO_PUBLIC_CLIENT_ID || "",
          "client-secret": process.env.EXPO_PUBLIC_CLIENT_SECRET || "",
        },
      });

      const data = await res.json();

      if (data?.response?.result) {
        setStats(data.response.result);
      } else {
        setStats({ totalEmployees: 0 });
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
      setStats({ totalEmployees: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color={globalStyles.light.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Hi, {adminName}!</Text>

      <View style={styles.dashboardGrid}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Employees</Text>
          <Text style={styles.cardValue}>{stats.totalEmployees}</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <View style={styles.actionButton}>
            <Ionicons
              name="person-add"
              size={24}
              color={globalStyles.light.background}
            />
            <Text style={styles.actionText}>New Hire</Text>
          </View>
          <View style={styles.actionButton}>
            <Ionicons
              name="document-text"
              size={24}
              color={globalStyles.light.background}
            />
            <Text style={styles.actionText}>Reports</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: globalStyles.light.background, // #050505
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 25,
    color: "#FFFFFF",
  },
  dashboardGrid: {
    flexDirection: "row",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#121212", // Slightly lighter black for contrast
    padding: 25,
    borderRadius: 16,
    width: "100%",
    borderLeftWidth: 5,
    borderLeftColor: globalStyles.light.primary, // #FF5C00
  },
  cardTitle: {
    fontSize: 14,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 42,
    fontWeight: "900",
    color: globalStyles.light.primary,
  },
  quickActions: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#FFFFFF",
  },
  actionRow: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flex: 1,
    backgroundColor: globalStyles.light.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    color: globalStyles.light.background,
    fontWeight: "bold",
  },
});
