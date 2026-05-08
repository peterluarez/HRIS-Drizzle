import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { globalStyles } from "../../styles/global";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserDetailScreen() {
  const { uuid } = useLocalSearchParams(); // Gets the UUID from the URL
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (uuid) fetchUserDetails();
  }, [uuid]);

  const fetchUserDetails = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken"); 
      const url = `${process.env.EXPO_PUBLIC_URL}/hris/api/v1/users/${uuid}`;
      console.log(url);
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "client-id": process.env.EXPO_PUBLIC_CLIENT_ID || "",
          "client-secret": process.env.EXPO_PUBLIC_CLIENT_SECRET || "",
        },
      });

      const json = await res.json();
      if (json.response?.success) {
        setUser(json.response.result);
      }
    } catch (error) {
      console.error("Fetch Details Error:", error);
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
    <ScrollView style={styles.container}
    contentContainerStyle={{
        paddingBottom: 90,
        
      }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {user?.fullName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userNameLarge}>{user?.fullName}</Text>
        <View style={[styles.statusBadge, { borderColor: user?.status === 'active' ? '#4CAF50' : '#F44336' }]}>
           <Text style={[styles.statusText, { color: user?.status === 'active' ? '#4CAF50' : '#F44336' }]}>{user?.status}</Text>
        </View>
      </View>

      <View style={styles.infoBox}>
        <InfoRow icon="mail-outline" label="Email" value={user?.email} />
        <InfoRow icon="call-outline" label="Phone" value={user?.phoneNumber} />
        <InfoRow icon="briefcase-outline" label="Role" value={user?.role} />
        <InfoRow icon="finger-print-outline" label="UUID" value={user?.uuid} />
      </View>

      <Text style={styles.sectionLabel}>Government ID's</Text>
      <View style={styles.infoBox}>
        <InfoRow icon="card-outline" label="SSS" value={user?.sss || "---"} />
        <InfoRow icon="medical-outline" label="PhilHealth" value={user?.philhealth || "---"} />
        <InfoRow icon="home-outline" label="Pag-IBIG" value={user?.pagibig || "---"} />
        <InfoRow icon="document-outline" label="TIN" value={user?.tin || "---"} />
        <InfoRow icon="card" label="HMO" value={user?.hmo || "---"} />
      </View>
    </ScrollView>
  );
}

// Helper component for clean rows
function InfoRow({ icon, label, value }: any) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={globalStyles.light.primary} />
      <View style={styles.infoTextContainer}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: globalStyles.light.background },
  // header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 20, 
    paddingTop: 55, // Adjust for Status Bar height
    paddingBottom: 15,
    backgroundColor: globalStyles.light.background, // Match background
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A", // Subtle line to separate from content
    zIndex: 10, // Ensures it stays on top
  },
  headerTitle: { color: globalStyles.light.primary, fontSize: 18, fontWeight: "bold" },
  backBtn: { padding: 8, backgroundColor: "#1A1A1A", borderRadius: 10 },
  profileSection: { alignItems: "center", marginVertical: 30 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: globalStyles.light.primary, justifyContent: "center", alignItems: "center" },
  avatarTextLarge: { fontSize: 40, fontWeight: "bold", color: "#000" },
  userNameLarge: { color: "#FFF", fontSize: 24, fontWeight: "bold", marginTop: 15 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 10 },
  statusText: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  sectionLabel: { color: "#666", marginLeft: 25, marginBottom: 10, marginTop: 20, fontWeight: "bold", textTransform: "uppercase", fontSize: 12 },
  infoBox: { backgroundColor: "#121212", marginHorizontal: 20, borderRadius: 20, padding: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 15 },
  infoTextContainer: { marginLeft: 15 },
  infoLabel: { color: "#666", fontSize: 12 },
  infoValue: { color: "#FFF", fontSize: 15, fontWeight: "500", marginTop: 2 },
});