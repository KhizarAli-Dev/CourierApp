import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axiosInstance from "../../utils/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import Modal from 'react-native-modal'

export default function Profile() {
  const route = useRouter();
  const [rider, setRider] = useState(null);
  const [id, setId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Get Rider Id
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

  // Rider Details Funtion
  const getRiderDetails = async () => {
    try {
      const RIDER_DETAILS = `${process.env.EXPO_PUBLIC_PROFILE_URL}${id}`;
      const response = await axiosInstance.get(RIDER_DETAILS);
      setRider(response?.data?.data);
    } catch (error) {
      console.log("Error in fetching Rider Details", error);
    }
  };

  // Logout Funtion
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("id");
      route.push("RiderLogin"); // Navigate back to login screen after logout
    } catch (error) {
      console.log("Error in logout", error);
    }
  };

  // Swipe Refresh Funtion
  const onRefresh = () => {
    getRiderDetails();
  };

  // Toggle modal visibility
  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
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
              <LinearGradient
                colors={["#16222A", "#3A6073"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.profileGradient}
              >
                <View style={styles.profileHeader}>
                  {rider?.image?.url && (
                    <TouchableOpacity onPress={openModal}>
                      <Image
                        source={{ uri: rider.image.url }}
                        style={styles.profileImage}
                      />
                    </TouchableOpacity>
                  )}
                  <Text style={styles.name}>{rider.name}</Text>
                </View>
              </LinearGradient>

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
            <View>
              <ActivityIndicator size="large" color="2193b0" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for Enlarged Profile Image */}
      <Modal
        isVisible={modalVisible}
        animationIn={"zoomIn"}
        animationOut={"zoomOut"}
        animationOutTiming={500}
        animationInTiming={500}
        onBackdropPress={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
           {/* Check if image exists before rendering */}
           {rider?.image?.url && (
              <TouchableOpacity onPress={closeModal}>
                <Image
                  source={{ uri: rider.image.url }}
                  style={styles.enlargedImage}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 16,
    padding: 20,
  },
  profileGradient: {
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
  },
  infoContainer: {
    flex: 1,
    marginTop: 8,
    paddingHorizontal: 10,
    
  },
  card: {
    borderRadius: 15,
    padding: 18,
    marginVertical: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    alignItems: "center",
    justifyContent: "center",
    
  },
  enlargedImage: {
    width: 300,
    height: 300,
    borderRadius: 20,
  },
});
