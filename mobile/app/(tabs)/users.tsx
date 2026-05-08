import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  id: number;
  uuid: string;
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
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isMoreLoading, setIsMoreLoading] = useState(false);

  const fetchUsers = async (query = "", pageNum = 1) => {
    if (pageNum === 1) setLoading(true);
    else setIsMoreLoading(true);

    if (users.length === 0) setLoading(true);

    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const roleEmployee = "employee";
      const urlApi = `${process.env.EXPO_PUBLIC_URL}/hris/api/v1/users/?search=${query}&role=${roleEmployee}&page=${pageNum}&limit=10`;

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
      const total = json.response?.result?.meta?.totalItems;

      if (userData && Array.isArray(userData)) {
        setUsers((prev) => {
          if (pageNum === 1) return userData;

          // Double-check for duplicates before adding to state
          const newItems = userData.filter(
            (newItem) => !prev.some((oldItem) => oldItem.uuid === newItem.uuid),
          );

          return [...prev, ...newItems];
        });
        setTotalCount(total || 0);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setIsMoreLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1); // Reset page state
      fetchUsers(search, 1); // Fetch first page
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      // This runs when the screen is focused
      setPage(1);
      fetchUsers(search, 1);

      return () => {
        // This runs when the user LEAVES the screen
        setSearch(""); // Clear the text input
        setUsers([]); // Optional: Clear the list so it doesn't "flicker" next time
      };
    }, []),
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        router.push({
          pathname: "/user/[uuid]",
          params: { uuid: item.uuid },
        })
      } // Route to dynamic page
      activeOpacity={0.7}
    >
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
        <Ionicons name="chevron-forward" size={20} color="#444" />
      </View>
    </TouchableOpacity>
  );

  // 4. Added Footer Component for "Load More"
  const renderFooter = () => {
    // Only show button if there are more items to load
    if (users.length >= totalCount && totalCount > 0) {
      return <View style={{ height: 120 }} />;
    }
    return (
      <View style={styles.footerContainer}>
        {isMoreLoading ? (
          <ActivityIndicator color={globalStyles.light.primary} />
        ) : (
          <TouchableOpacity
            style={styles.loadMoreBtn}
            onPress={() => {
              const nextPage = page + 1; // This will now correctly be 2
              setPage(nextPage);
              fetchUsers(search, nextPage);
            }}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={globalStyles.light.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

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

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          Showing <Text style={styles.countHighlight}>{users.length}</Text> out
          of <Text style={styles.countHighlight}>{totalCount}</Text> employees
        </Text>
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
          keyExtractor={(item) => item.uuid}
          renderItem={renderUserItem}
          contentContainerStyle={styles.list}
          ListFooterComponent={renderFooter}
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
    backgroundColor: globalStyles.light.background,
  },
  searchHeader: {
    padding: 15,
    backgroundColor: globalStyles.light.background,
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
    color: "#FFFFFF",
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
    fontSize: 18,
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
    color: "#FFFFFF",
  },
  userEmail: {
    color: "#AAAAAA",
    fontSize: 13,
    marginTop: 2,
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
    color: "#666",
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: globalStyles.light.background,
  },
  counterText: {
    color: "#888",
    fontSize: 13,
    fontWeight: "500",
  },
  countHighlight: {
    color: globalStyles.light.primary,
    fontWeight: "bold",
  },
  list: {
    padding: 15,
    paddingBottom: 20, // Reduced as footer handles the bottom space
  },
  footerContainer: {
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 100, // Important: Ensures button clears your floating tabs
  },
  loadMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  loadMoreText: {
    color: globalStyles.light.primary,
    fontWeight: "bold",
    marginRight: 8,
  },
});
