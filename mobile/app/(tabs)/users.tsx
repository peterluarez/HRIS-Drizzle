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
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: string;
  status: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  sss: string | null;
}

export default function UserListScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (query = "") => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const roleEmployee = "employee";
      const urlApi = `${process.env.EXPO_PUBLIC_URL}/hris/api/v1/users/?search=${query}&role=${roleEmployee}`;

      const res = await fetch(urlApi, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "client-id": process.env.EXPO_PUBLIC_CLIENT_ID || "",
          "client-secret": process.env.EXPO_PUBLIC_CLIENT_SECRET || "",
        },
      });

      if (res.status === 401) {
        await AsyncStorage.removeItem("userToken");
        router.replace("/");
        return;
      }

      const json = await res.json();
      const userData = json.response?.result?.data;

      if (userData && Array.isArray(userData)) {
        setUsers(userData);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(search);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.fullName ? item.fullName.charAt(0).toUpperCase() : "U"}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>

        <View style={[
          styles.statusBadge,
          { borderColor: item.status === "active" ? "#4CAF50" : "#F44336" }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === "active" ? "#4CAF50" : "#F44336" }
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            style={styles.input}
            placeholder="Search employees..."
            placeholderTextColor="#666"
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
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No employees found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: globalStyles.light.background 
  },
  searchHeader: { 
    padding: 15, 
    backgroundColor: globalStyles.light.background 
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 45,
    borderWidth: 1,
    borderColor: "#333",
  },
  input: { 
    flex: 1, 
    marginLeft: 10, 
    color: "#FFFFFF" 
  },
  list: { 
    padding: 15 
  },
  userCard: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#121212",
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: globalStyles.light.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { 
    color: "#000", 
    fontWeight: "bold", 
    fontSize: 18 
  },
  cardContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flex: 1,
  },
  userName: { 
    fontWeight: "bold", 
    fontSize: 16, 
    color: "#FFFFFF" 
  },
  userEmail: { 
    color: "#AAAAAA", 
    fontSize: 13, 
    marginTop: 2 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  empty: { 
    textAlign: "center", 
    marginTop: 40, 
    color: "#666" 
  },
});