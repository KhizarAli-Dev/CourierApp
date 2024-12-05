import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axiosInstance from "../../utils/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function Profile() {
  const route = useRouter();
  const [rider, setRider] = useState(null);
  const [id, setId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);



  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem("id");
      setId(storedId);
    };
    fetchId();
  }, []);

  useEffect(() => {
    if (id) {
      getRiderDetails();
    }
  }, [id]);

  const getRiderDetails = async () => {
    try {
      const RIDER_DETAILS = `${process.env.EXPO_PUBLIC_PROFILE_URL}${id}`;
      const response = await axiosInstance.get(RIDER_DETAILS);
      setRider(response?.data?.data);
    } catch (error) {
      console.log("Error in fetching Rider Details", error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("id");
      route.push("RiderLogin"); // Navigate back to login screen after logout
    } catch (error) {
      console.log("Error in logout", error);
    }
  };

  const onRefresh = () => {
    getRiderDetails();
  };

  return (
    <>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          {rider ? (
            <>
              <View style={styles.profileHeader}>
                <Image
                  source={{ uri: rider.image.url }}
                  style={styles.profileImage}
                />
                <Text style={styles.name}>{rider.name}</Text>
              </View>

              <View style={styles.infoContainer}>
                {/* Account Info Section */}
                <LinearGradient
                  colors={["#0F2027", "#2C5364"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.card}
                >
                  <View>
                    <Text style={styles.cardTitle}>Account Info</Text>
                    <View style={styles.cardContent}>
                      <Text style={styles.infoText}>
                        <Text style={styles.label}>Role: </Text>
                        {rider.role === 1 ? "Admin" : "Rider"}
                      </Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.label}>Balance: </Text>
                        {rider.remaining_balance}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Contact Details Section */}
                <LinearGradient
                  colors={["#0F2027", "#2C5364"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.card}
                >
                  <View>
                    <Text style={styles.cardTitle}>Contact Details</Text>
                    <View style={styles.cardContent}>
                      <Text style={styles.infoText}>
                        <Text style={styles.label}>Email: </Text>
                        {rider.email}
                      </Text>
                      <Text style={styles.infoText}>
                        <Text style={styles.label}>Location: </Text>
                        {rider.location}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>

                {/* Logout Button */}
                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={handleLogout}
                >
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text style={styles.loadingText}>Loading...</Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 20,
    // marginTop: 35,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: "#023e8a",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#023e8a",
  },
  infoContainer: {
    flex: 1,
    marginTop: 12,
  },
  card: {
    // backgroundColor: "#023e8a",
    borderRadius: 15,
    padding: 18,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  cardContent: {
    paddingLeft: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.3)",
    paddingTop: 10,
    marginTop: 10,
  },
  infoText: {
    fontSize: 17,
    color: "#e0e0e0",
    marginBottom: 6,
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
  },
  loadingText: {
    fontSize: 18,
    color: "#7d3c98",
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: "#6f0000",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
