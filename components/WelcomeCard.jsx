import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/utils/axiosInstance";
import Icon from "react-native-vector-icons/Ionicons";
import EvilIcons from "@expo/vector-icons/EvilIcons";

function WelcomeCard({ searchTerm, setSearchTerm }) {
  const [rider, setRider] = useState(null);
  const [id, setId] = useState(null);

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

 

  const reloadDetails = () => {
    getRiderDetails();
  };

  return (
    <>
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={["#0F2027", "#203A43", "#2C5364"]}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Search Bar */}
          <View style={{}}>
            <TextInput
              style={styles.searchBar}
              placeholder="Search..."
              placeholderTextColor="#ccc"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <Icon
              name="search-outline"
              color={"white"}
              size={20}
              style={styles.searchIcon}
            />
          </View>

          <Text style={styles.greetingText}>
            Welcome {rider ? rider.name : "Rider"}
          </Text>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <View style={styles.balanceWrapper}>
            <View>
              <Text style={styles.balanceAmount}>
                {`Rs. ${rider?.remaining_balance}`}
              </Text>
              
            </View>
            <View>
              <TouchableOpacity onPress={reloadDetails}>
                <Text><EvilIcons name="refresh" size={30} color={"white"}/></Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

export default WelcomeCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    margin: 0,
    padding: 0,
    justifyContent: "flex-start",
    alignItems: "stretch",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
    elevation: 20,
  },
  gradientCard: {
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    height: 250,
    justifyContent: "center",
  },
  searchBar: {
    height: 40,
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "white",
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "left",
  },
  balanceLabel: {
    fontSize: 18,
    color: "white",
    marginBottom: 8,
    textAlign: "left",
  },
  balanceWrapper: {
    flexDirection: "row",
    alignItems: "left",
    justifyContent: "flex-start",
    // gap: 10,
  },
  balanceAmount: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  searchIcon: {
    position: "absolute",
    top: 9,
    right: 8,
  },
});
