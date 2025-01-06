import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Clipboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import axiosInstance from "../../utils/axiosInstance";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Linking } from "react-native";
import Icon from "@expo/vector-icons/Feather";
import Modal from "react-native-modal";
import Close from "@expo/vector-icons/EvilIcons";
import { io } from "socket.io-client";

function Pending() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const initializeSocket = async () => {
      const id = await AsyncStorage.getItem("id");
      const socket = io(process.env.EXPO_PUBLIC_URL, {
        query: { riderId: id },
      });

      socket.on("connect", () => {
        console.log("Connected to socket server");
      });

      // Listen for the 'orderUpdated' event from the server
      socket.on("orderUpdated", (data) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === data.orderId
              ? { ...order, status: data.status }
              : order
          )
        );
      });

      // Listen for the 'orderDeleted' event from the server
      socket.on("orderDeleted", (data) => {
        console.log("Order deleted:", data);
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== data.orderId)
        );
      });

      socket.emit("joinRoom", id);
      socket.on("newOrder", (newOrder) => {
        setOrders((prevOrders) => [...prevOrders, newOrder]);
      });

      return () => {
        socket.off("connect");
        socket.off("newOrder");
        socket.off("orderUpdated");
        socket.off("orderDeleted");
        socket.disconnect();
      };
    };

    initializeSocket();
  }, []);

  // Detail Modal Toggle Function
  const toggleDetailModal = (order = null) => {
    setSelectedOrder(order);
    setDetailModalVisible(!isDetailModalVisible);
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

  // Get Riders Orders Delivered & Complete
  const getRidersOrder = async () => {
    try {
      setRefreshing(true);
      const response = await axiosInstance.get(
        process.env.EXPO_PUBLIC_RIDER_SPECIFIC
      );
      const filteredOrders =
        response?.data?.data?.filter((order) => order.status === "pending") ||
        [];
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
          <Text style={styles.ordersTitle}>Pending Orders</Text>
        </View>

        {/* Filters & Pickers */}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            height: 60,
            borderRadius: 10,
            width: "100%",
          }}
        >
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={{
              backgroundColor: "#203A43",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignItems: "center",
              width: "70%",
            }}
          >
            <Text style={{ color: "white" }}>
              {/* <AntDesign name="calendar" size={16} /> */}
              {dateFilter ? "Selected Date: " + dateFilter : "Select Your Date"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
            <Text style={{ color: "white" }}>Clear</Text>
          </TouchableOpacity>
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
                <View
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    width: "100%",
                    padding: 4,
                    borderBottomWidth: 0.3,
                    marginBottom: 10,
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 18 }}>
                      Tracking # {order.tracking_id}
                    </Text>
                  </View>

                  <View>
                    <TouchableOpacity onPress={() => toggleDetailModal(order)}>
                      <Icon name="info" size={18} color={"black"} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.orderDetail}>
                  <Ionicons name="person" size={16} />
                  {" : "}
                  {order.cust_name || "Customer Name"}
                </Text>

                <Text style={styles.orderDetail}>
                  <Ionicons name="call" size={16} />
                  {" : "}
                  <Text
                    style={{ color: "white" }}
                    onPress={() => {
                      let whatsappNumber = order.cust_number;

                      // Check if the number starts with "03"
                      if (whatsappNumber.startsWith("03")) {
                        // Replace the leading "0" with "+92"
                        whatsappNumber = "+92" + whatsappNumber.slice(1);
                      }

                      // Open WhatsApp URL
                      Linking.openURL(`https://wa.me/${whatsappNumber}`);
                    }}
                    onLongPress={() => {
                      // Copy the number to the clipboard
                      Clipboard.setString(order.cust_number);
                    }}
                  >
                    {order.cust_number}
                  </Text>
                </Text>

                <Text style={styles.orderDetail}>
                  <Ionicons name="location-sharp" size={16} />
                  {" : "}
                  {order.cust_town}
                </Text>
                <Text style={styles.orderDetail}>
                  <MaterialIcons name="attach-money" size={20} />
                  {": "}
                  {`Rs. ${order.amount}`}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        order.status === "pending" ? "#fbd100" : "#d1d5db",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>
            </LinearGradient>
          ))
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text>No Pending Orders Found</Text>
          </View>
        )}

        {/* Detail Modal */}
        <Modal
          isVisible={isDetailModalVisible}
          animationIn={"bounceInUp"}
          animationOut={"bounceOutDown"}
          animationOutTiming={1000}
          animationInTiming={1000}
          onBackButtonPress={toggleDetailModal}
          onBackdropPress={toggleDetailModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalTableContent}>
              {selectedOrder && (
                <>
                  <TouchableOpacity
                    onPress={toggleDetailModal}
                    style={[
                      styles.closeButtonContainer,
                      { alignSelf: "flex-end" },
                    ]}
                  >
                    <Close name="close" size={30} color={"black"} />
                  </TouchableOpacity>
                  <Text style={styles.modalTableTitle}>Order Details</Text>

                  {/* Table View */}
                  <View style={styles.table}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Name:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cust_name}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Contact #:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cust_number}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Address:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cust_address}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>City:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cust_city}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Town:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cust_town}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Amount:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.amount}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Feedback:</Text>
                      <Text style={styles.tableValue}>
                        {!selectedOrder.feedback
                          ? "No Feedback"
                          : selectedOrder.feedback}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Date:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.cutsomDate}
                      </Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Status:</Text>
                      <Text style={styles.tableValue}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Toast />
    </>
  );
}

export default Pending;

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
    marginVertical: 1,
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
    color: "black",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  modalTableContent: {
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#232526",
  },
  table: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: "black",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "black",
  },
  tableLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#232526",
    flex: 1,
  },
  tableValue: {
    fontSize: 16,
    color: "#232526",
    flex: 1,
    textAlign: "left",
  },
  statusPicker: {
    flex: 1,
    width: "70%",
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    fontSize: 16,
    color: "#555",
    paddingHorizontal: 8,
  },
});
