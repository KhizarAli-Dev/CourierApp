import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "@/utils/axiosInstance";
import Icon from "react-native-vector-icons/Ionicons";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import Entypo from "@expo/vector-icons/Entypo";
import { Link, useRouter } from "expo-router";
import io from "socket.io-client"; // Ensure you import socket.io-client

function WelcomeCard({ searchTerm, setSearchTerm }) {
  const [rider, setRider] = useState(null);
  const [id, setId] = useState(null);
  const [orders, setOrders] = useState([]);
  const router = useRouter();
  const [riderBalance, setRiderBalance] = useState(0);

  // Socket Work
  useEffect(() => {
    const initializeSocket = async () => {
      const id = await AsyncStorage.getItem("id");
      const socket = io(process.env.EXPO_PUBLIC_URL, {
        query: { riderId: id },
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.emit("joinRoom", id);

      // Listen for the 'orderUpdated' event
      socket.on("orderUpdated", (data) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      });

      socket.on("newOrder", (newOrder) => {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      });

      // Listen for rider balance updates
      socket.on("riderBalanceUpdated", (data) => {
        if (data.riderId === id) {
          setRiderBalance(data.remaining_balance);
        }
      });

      // Listen for addtoprocess Status Update
      socket.on("ordersStatusChanged", (data) => {
        setOrders((prevOrders) => {
          const updatedOrdersMap = new Map(
            [...prevOrders, ...data.orders].map((order) => [order._id, order])
          );
          return Array.from(updatedOrdersMap.values());
        });
      });

      // Listen for the 'orderDeleted' event from the server
      socket.on("orderDeleted", (data) => {
        console.log("Order deleted:", data);
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== data.orderId)
        );
      });

      return () => {
        socket.off("connect");
        socket.off("orderUpdated");
        socket.off("newOrder");
        socket.off("riderBalanceUpdated");
        socket.off("ordersStatusChanged");
        socket.off("orderDeleted");
        socket.disconnect();
      };
    };

    initializeSocket();
  }, []);

  // Get Id From storage
  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem("id");
      setId(storedId);
    };
    fetchId();
  }, []);

  // get riders Details on header
  useEffect(() => {
    if (id) {
      getRiderDetails();
    }
  }, [id]);

  // get riders detail api function
  const getRiderDetails = async () => {
    try {
      const RIDER_DETAILS = `${process.env.EXPO_PUBLIC_PROFILE_URL}${id}`;
      const response = await axiosInstance.get(RIDER_DETAILS);
      setRider(response?.data?.data);
      setRiderBalance(response?.data?.data.remaining_balance);
    } catch (error) {
      console.log("Error in fetching Rider Details", error);
    }
  };

  // reload Details
  const reloadDetails = () => {
    getRiderDetails();
    getRidersOrder();
  };

  useEffect(() => {
    const fetchId = async () => {
      const id = await AsyncStorage.getItem("id");
      if (id) {
        getRidersOrder();
      }
    };
    fetchId();
  }, []);

  // Riders Specific Orders Function
  const getRidersOrder = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_RIDER_SPECIFIC}`
      );
      const allOrders = response?.data?.data || [];
      setOrders(allOrders);
    } catch (error) {
      console.log("Error in Fetching Orders", error);
    }
  };

  const pendingNavigate = () => {
    router.push("/Pending");
  };

  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={["#0F2027", "#203A43", "#2C5364"]}
        style={styles.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {/* Search Bar */}
        <View>
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
          Welcome, {rider ? rider.name : "Rider"}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Child1 */}
          <View style={styles.balanceWrapper}>
            <Text style={styles.balanceLabel}>Your Balance</Text>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.balanceAmount}>{`Rs. ${riderBalance}`}</Text>
              <TouchableOpacity onPress={reloadDetails}>
                <Text>
                  <EvilIcons name="refresh" size={27} color={"white"} />
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Child2 */}
          <View style={styles.counterContainer}>
            <View style={styles.counterBox}>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomColor: "white",
                  borderBottomWidth: 2,
                }}
              >
                <Entypo name="circular-graph" size={15} color={"white"} />
                <TouchableOpacity onPress={pendingNavigate}>
                  <Link style={styles.statusTitle} href="/Pending">
                    Pending
                  </Link>
                </TouchableOpacity>
              </View>
              <Text style={styles.counterText}>
                {orders.filter((order) => order.status === "pending").length}
              </Text>
            </View>

            <View style={styles.counterBox}>
              <View
                style={{
                  flexDirection: "row",
                  borderBottomColor: "white",
                  borderBottomWidth: 2,
                }}
              >
                <Feather name="trending-up" size={15} color={"white"} />
                <Text style={styles.statusTitle}>InProcess</Text>
              </View>
              <Text style={styles.counterText}>
                {orders.filter((order) => order.status === "inprocess").length}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
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
    height: 280,
    justifyContent: "center",
    paddingBottom: 80,
  },
  searchBar: {
    backgroundColor: "transparent",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: "white",
    marginTop: 50,
    height: 40,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "left",
  },
  balanceWrapper: {},
  balanceLabel: {
    fontSize: 17,
    color: "white",
    marginBottom: 8,
    textAlign: "left",
    marginTop: 12,
  },

  balanceAmount: {
    fontSize: 15,
    color: "white",
    fontWeight: "600",
  },
  searchIcon: {
    position: "absolute",
    top: 60,
    right: 8,
  },
  counterContainer: {
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",

    padding: 8,
  },
  counterBox: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: 80,
  },
  counterText: {
    textAlign: "center",
    color: "white",
    marginTop: 4,
  },
  orderStatusHeading: {
    color: "white",
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  statusTitle: {
    color: "white",
    marginLeft: 6,
    marginBottom: 5,
  },
});
