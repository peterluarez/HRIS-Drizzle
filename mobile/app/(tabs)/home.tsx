import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import { useRouter } from "expo-router"; // Import the router
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string; // Your JSON shows UUID strings
  status: string;
  fullName: string; // Must be camelCase to match JSON
  email: string;
  phoneNumber: string;
  role: string;
  sss: string | null;
}

export default function UserListScreen() {
  const router = useRouter(); // Initialize router
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Unified Fetch Function
  // It uses your exact URL structure. If search is empty, the API handles the defaults.
  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("No token found, redirecting to login...");
        return;
      }

      const baseUrl = process.env.EXPO_PUBLIC_URL;
      const apiPath = "/hris/api/v1/users";
      const urlApi = `${baseUrl}${apiPath}/?search=${query}`;
      const clientId = process.env.EXPO_PUBLIC_CLIENT_ID;
      const clientSecret = process.env.EXPO_PUBLIC_CLIENT_SECRET;
      const res = await fetch(urlApi, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Add this once you store your token
          "client-id": clientId || "",
          "client-secret": clientSecret || "",
        },
      });

      if (res.status === 401) {
        console.log("Token expired or invalid. Logging out...");
        await AsyncStorage.removeItem("userToken"); // Clear the bad token
        router.replace("/"); // Redirect to login (ensure 'router' is imported from 'expo-router')
        return; // Stop the rest of the function
      }

      const json = await res.json();
      const userData = json.response?.result?.data;

      if (userData && Array.isArray(userData)) {
        setUsers(userData);
      } else {
        console.log("Check Headers:", { clientId, clientSecret });
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Load & Search Trigger
  useEffect(() => {
    // If search is empty, it fetches the default user list immediately
    if (search.length === 0) {
      fetchUsers("");
    } else {
      // Debounce search to save server resources
      const delayDebounceFn = setTimeout(() => {
        fetchUsers(search);
      }, 400);
      return () => clearTimeout(delayDebounceFn);
    }
  });
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      {/* 1. Avatar Section */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
        </Text>
      </View>

      {/* 2. Content Section - Now a Row to separate Info and Badge */}
      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor: item.status === "active" ? "#E8F5E9" : "#FFEBEE",
            },
          ]}
        >
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Search by name or email..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {loading && users.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={globalStyles.light.primary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No users found in the HRIS.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userCard: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center", // Keeps avatar and content vertically centered
  },
  cardContent: {
    flex: 1, // Takes up all remaining width after the avatar
    flexDirection: "row", // Places userInfo and roleBadge side-by-side
    justifyContent: "space-between", // Pushes badge to the right
    alignItems: "center", // Vertically aligns text and badge
  },
  userInfo: {
    flex: 1, // Ensures text doesn't overflow the badge
    marginRight: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    // Remove marginTop since it's now centered on the right
  },
  roleText: {
    fontSize: 10,
    fontWeight: "bold",
    color: globalStyles.light.primary, //
    textTransform: "uppercase",
  },
  container: { flex: 1, backgroundColor: "#fff" },
  searchHeader: { marginTop: 50, padding: 20 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ebebeb",
    paddingHorizontal: 10,
    borderRadius: 8,
    height: 40,
  },
  input: { flex: 1, marginLeft: 10 },
  list: { padding: 15 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F7E7CE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { color: globalStyles.light.primary, fontWeight: "bold" },
  userName: { fontWeight: "600", fontSize: 16 },
  userEmail: { color: "#666", fontSize: 14 },
  empty: { textAlign: "center", marginTop: 20, color: "#999" },
});
