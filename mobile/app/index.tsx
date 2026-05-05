import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { globalStyles } from "../styles/global";
import { useRouter } from "expo-router"; // Import the router
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const router = useRouter(); // Initialize router
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const url = process.env.EXPO_PUBLIC_URL;
      const response = await fetch(`${url}/hris/api/v1/users/signIn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Extract the token from your specific backend response structure
        const token = data.response?.data?.token;

        if (token) {
          // 2. Persist the token to storage
          await AsyncStorage.setItem("userToken", token);

          // Optional: Store user info if you want to show "Welcome, Ash Gre" on the Home screen
          const userJson = JSON.stringify(data.response.data.user);
          await AsyncStorage.setItem("userInfo", userJson);
        }

        // 3. Navigate to the tabs folder
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Could not connect to the HRIS server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>HRIS-Drizzle-Expo</Text>
        <Text style={styles.subtitle}>Management Portal</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading} // Disable during loading
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            editable={!loading} // Disable during loading
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {isPasswordVisible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#F7E7CE" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: globalStyles.light.background,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: globalStyles.light.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: globalStyles.light.primary,
    textAlign: "center",
    marginBottom: 40,
    opacity: 0.7,
  },
  input: {
    backgroundColor: "#000000",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#222222",
    color: "#ffffff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000000",
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#222222",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    color: "#ffffff",
    fontSize: 16,
  },
  toggleButton: {
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  toggleText: {
    color: globalStyles.light.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  button: {
    backgroundColor: globalStyles.light.primary,
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#F7E7CE",
    fontWeight: "bold",
    fontSize: 16,
  },
});
