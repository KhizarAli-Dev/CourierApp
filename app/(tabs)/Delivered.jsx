import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import axiosInstance from "../../utils/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";

function Delivered() {
  const navigation = useNavigation();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchId = async () => {
      const id = await AsyncStorage.getItem("id");
      if (id) {
        getRidersOrder();
      }
    };
    fetchId();
  }, []);

  const getRidersOrder = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get(
        process.env.EXPO_PUBLIC_RIDER_SPECIFIC
      );
      const filteredOrders =
        response?.data?.data?.filter(
          (order) => order.status === "delivered" || order.status === "complete"
        ) || [];
      setOrders(filteredOrders);
    } catch (error) {
      console.error("Error in Fetching Orders", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filters Logic
  useEffect(() => {
    let tempOrders = orders;

    if (dateFilter) {
      const selectedDate = new Date(dateFilter).toLocaleDateString("en-PK");
      tempOrders = tempOrders.filter(
        (order) => order.cutsomDate === selectedDate
      );
    }

    setFilteredOrders(tempOrders);
  }, [orders, dateFilter]);

  // Date Handle Change Function
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateFilter(selectedDate.toISOString().split("T")[0]);
    }
  };

  const clearFilter = () => {
    setDateFilter("");
  };

  const onRefresh = () => {
    getRidersOrder();
  };

  return (
    <>
    {/* <StatusBar style="inverted" backgroundColor="#fff"/> */}
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.ordersTitle}>Delivered & Completed</Text>
        </View>

        {/* Date Picker */}
        <View
          style={{
            marginBottom: 6,
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              backgroundColor: "#203A43",
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 8,
              alignItems: "center",
              width: "65%",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16 }}>
              {dateFilter && dateFilter !== ""
                ? `Date : ${dateFilter}`
                : "Select Date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
            <Text style={{ color: "white" }}>Clear</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateFilter ? new Date(dateFilter) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              style={{
                marginTop: 10,
                backgroundColor: "#f8f8f8",
                borderRadius: 10,
              }}
            />
          )}
        </View>

        {/* Orders */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order, index) => (
            <LinearGradient
              colors={["#2193b0", "#6dd5ed"]}
              style={styles.orderCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              key={order._id}
            >
              <View>
                <Text style={styles.orderText}>
                  {index + 1}) {order.tracking_id}
                </Text>
                <Text style={styles.orderDetail}>
                  Customer Name: {order.cust_name}
                </Text>
                <Text style={styles.orderDetail}>
                  Customer City: {order.cust_city}
                </Text>
                <Text style={styles.orderDetail}>
                  Tracking ID: {order.tracking_id}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        order.status === "delivered"
                          ? "#52c234"
                          : order.status === "complete"
                          ? "#000"
                          : "#ccc",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
            </LinearGradient>
          ))
        ) : (
          <Text>No delivered orders found</Text>
        )}
      </ScrollView>
      <Toast />
    </>
  );
}

export default Delivered;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: "#f4f4f4",
  },
  header: {
    marginBottom: 20,
  },
  ordersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    textDecorationLine: "underline",
  },
  orderCard: {
    borderRadius: 15,
    padding: 20,
    marginVertical: 6,
    backgroundColor: "#fff",
  },
  orderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  orderDetail: {
    fontSize: 16,
    color: "#fff",
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: "#52c234",
    width: 80,
  },
  statusText: {
    fontSize: 14,
    color: "white",
  },
  statusPicker: {
    flex: 1,
    width: "70%",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
    color: "#555",
    paddingHorizontal: 8,
    height: 40,
  },
  clearButton: {
    backgroundColor: "#0575E6",
    padding: 8,
    borderRadius: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "25%",
  },
});
