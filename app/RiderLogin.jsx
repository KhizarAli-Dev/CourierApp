import React, { useState, useEffect } from "react";
import Icon from "@expo/vector-icons/FontAwesome6";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  BackHandler,
  Alert,
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

  // Password Visibility Funtion
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Login Function
  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        process.env.EXPO_PUBLIC_RIDER_LOGIN,
        {
          email,
          password,
        }
      );
      const { token, data } = response?.data;

      if (token && data?._id) {
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
      console.log(error);
      Toast.show({
        type: "error",
        text1: error.response.data.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // App Exit Back Funtion
  const handleBackPress = () => {
    Alert.alert(
      "Exit App",
      "Are you sure you want to exit?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: true }
    );
    return true;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/login.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Courier App</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon
          name="envelope"
          size={20}
          color="#2193b0"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#2193b0" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}
        >
          <Icon
            name={showPassword ? "eye-slash" : "eye"}
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      </View>

      {/* Login Button */}
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
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 20,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  button: {
    backgroundColor: "#2193b0",
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
