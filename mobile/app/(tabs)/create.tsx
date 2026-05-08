import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { globalStyles } from "../../styles/global";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Added for password toggle

export default function CreateUserScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "employee",
    sss: "",
    philhealth: "",
    pagibig: "",
    tin: "",
    hmo: "",
  });

  const handleCancel = () => {
    setForm({
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      role: "employee",
      sss: "",
      philhealth: "",
      pagibig: "",
      tin: "",
      hmo: "",
    });

    router.back();
  };

  const handleCreate = async () => {
    if (!form.fullName || !form.email || !form.password || !form.phoneNumber) {
      Alert.alert(
        "Required Fields",
        "Name, Email, Phone, and Password are required.",
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const url = `${process.env.EXPO_PUBLIC_URL}/hris/api/v1/users`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "client-id": process.env.EXPO_PUBLIC_CLIENT_ID || "",
          "client-secret": process.env.EXPO_PUBLIC_CLIENT_SECRET || "",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.status === 200 || res.status === 201) {
        setForm({
          fullName: "",
          email: "",
          phoneNumber: "",
          password: "",
          role: "employee",
          sss: "",
          philhealth: "",
          pagibig: "",
          tin: "",
          hmo: "",
        });

        Alert.alert("Success", "Employee profile created.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        Alert.alert("Error", data.message || "Registration failed.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>Account Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor="#666"
          value={form.fullName}
          onChangeText={(val) => setForm({ ...form, fullName: val })}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          placeholderTextColor="#666"
          keyboardType="phone-pad"
          value={form.phoneNumber}
          onChangeText={(val) => setForm({ ...form, phoneNumber: val })}
        />

        <TextInput
          style={styles.input}
          placeholder="Email Address *"
          placeholderTextColor="#666"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(val) => setForm({ ...form, email: val })}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Set Password *"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={form.password}
            onChangeText={(val) => setForm({ ...form, password: val })}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>System Role</Text>
        <View style={styles.roleRow}>
          {["employee", "admin"].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
              onPress={() => setForm({ ...form, role: r })}
            >
              <Text
                style={[
                  styles.roleBtnText,
                  form.role === r && styles.roleBtnTextActive,
                ]}
              >
                {r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Government ID's</Text>
        <View style={styles.grid}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="SSS"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.sss}
            onChangeText={(val) => setForm({ ...form, sss: val })}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="PhilHealth"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.philhealth}
            onChangeText={(val) => setForm({ ...form, philhealth: val })}
          />
        </View>

        <View style={styles.grid}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Pag-IBIG"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.pagibig}
            onChangeText={(val) => setForm({ ...form, pagibig: val })}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="TIN"
            placeholderTextColor="#666"
            keyboardType="numeric"
            value={form.tin}
            onChangeText={(val) => setForm({ ...form, tin: val })}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="HMO Information"
          placeholderTextColor="#666"
          value={form.hmo}
          onChangeText={(val) => setForm({ ...form, hmo: val })}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleCreate}>
          <Text style={styles.submitBtnText}>Create Employee</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: globalStyles.light.background },
  scrollContent: { padding: 20 },
  sectionHeader: {
    color: globalStyles.light.primary,
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 25,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  label: { color: "#FFF", marginBottom: 10, fontSize: 13, fontWeight: "600" },
  input: {
    backgroundColor: "#121212",
    color: "#FFF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 15,
  },
  eyeIcon: { paddingHorizontal: 15 },
  grid: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  roleRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  roleBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  roleBtnActive: {
    backgroundColor: globalStyles.light.primary,
    borderColor: globalStyles.light.primary,
  },
  roleBtnText: { color: "#666", fontWeight: "bold", fontSize: 12 },
  roleBtnTextActive: { color: globalStyles.light.background },
  submitBtn: {
    backgroundColor: globalStyles.light.primary,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  submitBtnText: {
    color: globalStyles.light.background,
    fontWeight: "900",
    fontSize: 16,
    textTransform: "uppercase",
  },
  cancelButton: {
    alignItems: "center",
    marginTop: -5,
  },
  cancelText: {
    color: "#888",
    fontSize: 14,
  },
});
