import React, { useState } from "react";
import Icon from '@expo/vector-icons/FontAwesome6'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/axiosInstance";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";

export default function RiderLogin() {
  const route = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(process.env.EXPO_PUBLIC_RIDER_LOGIN, {
        email,
        password,
      });
      const { token, data } = response?.data;

      if (token && data?._id) {
        // Store token and id in AsyncStorage
        await AsyncStorage.setItem("token", token);
        await AsyncStorage.setItem("id", data._id);

        Toast.show({
          type: "success",
          text1: "Login Success",
          position: "top",
          visibilityTime: 2000,
        });

        setTimeout(() => {
          route.push("Profile");
        }, 2000);
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response?.data?.message,
        });
      }
    } catch (error) {
      console.log(error)
      Toast.show({
        type: "error",
        text1: error.response.data.message,
        // text2: error.response.data.message
        
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container]}>
      <Image
        source={require("../assets/images/login.png")} 
        style={styles.logo}
      />
      <Text style={styles.title}>Courier App</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}
        >
          <Text style={styles.toggleText}>{showPassword ? <Icon name="eye-slash" size={16} color={"black"}/> : <Icon name="eye" size={16} color={"black"}/>}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    // backgroundColor: "amber",
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 80,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 15,
  },
  toggleText: {
    fontSize: 14,
    color: "#007AFF",
  },
  button: {
    backgroundColor: "#6a0dad",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: "#a0a0a0",
  },
});
