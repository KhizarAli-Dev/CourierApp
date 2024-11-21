import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "@expo/vector-icons/Feather";
import Close from "@expo/vector-icons/EvilIcons";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import { Picker } from "@react-native-picker/picker";
import WelcomeCard from "@/components/WelcomeCard";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Linking } from "react-native";

export default function Home() {
  // States
  const [orders, setOrders] = useState([]);
  const [id, setId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [isStatusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal Toggle Function
  const toggleDetailModal = (order = null) => {
    setSelectedOrder(order);
    setDetailModalVisible(!isDetailModalVisible);
  };

  // Status Modal Function
  const toggleStatusModal = (order = null) => {
    setSelectedOrder(order);
    setStatus(order?.status || "");
    setStatusModalVisible(!isStatusModalVisible);
  };

  // Get Id from Async Storage Open
  useEffect(() => {
    const fetchId = async () => {
      const storedId = await AsyncStorage.getItem("id");
      if (storedId) {
        setId(storedId);
      }
    };

    fetchId();
  }, []);

  useEffect(() => {
    if (id) {
      getRidersOrder();
    }
  }, [id]);
  // Get Id from Async Storage Close

  // Filters Logic
  useEffect(() => {
    let tempOrders = orders.filter(
      (order) => order.status !== "delivered" && order.status !== "complete"
    );

    if (statusFilter) {
      tempOrders = tempOrders.filter((order) => order.status === statusFilter);
    }

    // if (searchTerm) {
    //   tempOrders = tempOrders.filter((order) => {
    //     const trackingId = order.tracking_id || order.cust_number;
    //     return trackingId
    //       .toString()
    //       .toLowerCase()
    //       .includes(searchTerm.toLowerCase());
    //   });
    // }

    if (searchTerm) {
      tempOrders = tempOrders.filter((order) => {
        const trackingId = order.tracking_id
          ? order.tracking_id.toString()
          : "";
        const custNumber = order.cust_number
          ? order.cust_number.toString()
          : "";
        return (
          trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          custNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (dateFilter) {
      const selectedDate = new Date(dateFilter).toLocaleDateString("en-PK");
      tempOrders = tempOrders.filter(
        (order) => order.cutsomDate === selectedDate
      );
    }

    setFilteredOrders(tempOrders);
  }, [orders, statusFilter, searchTerm, dateFilter]);

  // Date Handle Change Function
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDateFilter(selectedDate.toISOString().split("T")[0]);
    }
  };

  // Riders Specific Orders Function
  const getRidersOrder = async () => {
    try {
      const response = await axiosInstance.get(
        `${process.env.EXPO_PUBLIC_RIDER_SPECIFIC}`
      );
      setOrders(response?.data?.data || []);
    } catch (error) {
      console.log("Error in Fetching Orders", error);
    }
  };

  useEffect(() => {
    getRidersOrder();
  }, []);

  // Status Update Function
  const updateStatus = async (e) => {
    e.preventDefault();
    const updatedOrderData = { feedback, status };

    try {
      const response = await axiosInstance.put(
        `/order/${selectedOrder._id}`,
        updatedOrderData
      );
      if (response.data.success) {
        alert("Order Updated Successfully");
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedOrder._id
              ? { ...order, status, feedback }
              : order
          )
        );
        toggleStatusModal();
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Error updating order");
    }
  };

  const clearFilter = () => {
    setStatusFilter("");
    setSearchTerm("");
    setDateFilter("");
  };

  const onRefresh = () => {
    getRidersOrder();
  };

  return (
    <>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <WelcomeCard searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ScrollView style={styles.container}>
          {/* Date Picker */}
          <View>
            {/* <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: "#203A43",
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {dateFilter && dateFilter !== ""
                  ? `Date : ${dateFilter}`
                  : "Select Date"}
              </Text>
            </TouchableOpacity> */}
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

          {/* Status Picker */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 60,
              borderRadius: 10,
              width: "100%",
            }}
          >
            <Picker
              selectedValue={statusFilter}
              onValueChange={(value) => setStatusFilter(value)}
              style={styles.statusPicker}
            >
              <Picker.Item label="Statuses" value="" />
              <Picker.Item label="Pending" value="pending" />
              <Picker.Item label="Hold" value="hold" />
              <Picker.Item label="Canceled" value="canceled" />
              <Picker.Item label="In Process" value="inprocess" />
            </Picker>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: "#203A43",
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white" }}>
                <AntDesign name="calendar" size={16} />
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
              <Text style={{ color: "white" }}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Fetch Orders */}

          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const buttonStyle =
                order.status === "pending"
                  ? styles.pendingButton
                  : order.status === "canceled"
                  ? styles.canceledButton
                  : order.status === "return"
                  ? styles.returnButton
                  : order.status === "in process"
                  ? styles.inProcessButton
                  : order.status === "hold"
                  ? styles.holdButton
                  : styles.defaultButton;

              return (
                <LinearGradient
                  key={order._id}
                  colors={["#2193b0", "#6dd5ed"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.card}
                >
                  <View style={styles.card}>
                    <View
                      style={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexDirection: "row",
                        width: "100%",
                        padding: 4,
                        borderBottomWidth: 0.3,
                        marginBottom: 10,

                        // backgroundColor:"purple"
                      }}
                    >
                      <View>
                        <Text style={{ fontSize: 18 }}>
                          Tracking # {order.tracking_id}
                        </Text>
                      </View>

                      <View>
                        <TouchableOpacity
                          onPress={() => toggleDetailModal(order)}
                        >
                          <Icon name="info" size={18} color={"black"} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* <Text style={styles.trackingTitle}>
                      <Text
                        style={{
                          color: "#0F2027",
                          textDecorationLine: "underline",
                          fontWeight: "500",
                        }}
                      >
                        Tracking #
                      </Text>{" "}
                      {order.tracking_id || "Tacking Id"}
                    </Text> */}
                    <Text style={styles.orderTitle}>
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
                          const whatsappNumber = order.cust_number;
                          Linking.openURL(`https://wa.me/${whatsappNumber}`);
                        }}
                      >
                        {order.cust_number}
                      </Text>
                    </Text>

                    {/*
                    <Text style={styles.orderDetail}>
                      <Ionicons name="call" size={16} />
                      {" : "}
                      {order.cust_number}
                    </Text>
                     */}
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
                    <View style={styles.statusContainer}>
                      <Text style={styles.orderDetail}>Status:</Text>
                      <TouchableOpacity
                        onPress={() => toggleStatusModal(order)}
                      >
                        <Text style={[styles.statusButton, buttonStyle]}>
                          {order.status}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              );
            })
          ) : (
            <Text>No orders found</Text>
          )}

          {/* Detail Modal */}
          <Modal
            isVisible={isDetailModalVisible}
            animationIn={"bounceInUp"}
            animationOut={"bounceOutDown"}
            animationOutTiming={1000}
            animationInTiming={1000}
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
                        <Text style={styles.tableLabel}>Delivery Charges:</Text>
                        <Text style={styles.tableValue}>
                          {selectedOrder.delivery_charges}
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

          {/* Status Update Modal */}
          <Modal
            isVisible={isStatusModalVisible}
            animationIn={"bounceInUp"}
            animationOut={"bounceOutDown"}
            animationOutTiming={1000}
            animationInTiming={1000}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Update Status</Text>
                <Picker
                  selectedValue={status}
                  style={styles.picker}
                  onValueChange={(itemValue) => setStatus(itemValue)}
                >
                  <Picker.Item label="Return" value="return" />
                  <Picker.Item label="Delivered" value="delivered" />
                  <Picker.Item label="Hold" value="hold" />
                  <Picker.Item label="Canceled" value="canceled" />
                </Picker>
                {["return", "hold", "canceled"].includes(status) ? (
                  <TextInput
                    style={styles.feedbackInput}
                    placeholder="Feedback"
                    value={feedback}
                    onChangeText={setFeedback}
                    editable={true}
                  />
                ) : (
                  <TextInput
                    style={[styles.feedbackInput, { display: "none" }]}
                    placeholder="Feedback"
                    value={feedback}
                    onChangeText={setFeedback}
                  />
                )}
                <TouchableOpacity
                  onPress={updateStatus}
                  style={styles.updateButtonContainer}
                >
                  <Text style={styles.updateButton}>Update Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleStatusModal}
                  style={styles.closeButtonContainer}
                >
                  <Text style={styles.closeButton}>
                    <Close name="close" size={30} color={"black"} />
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#FAF9F6" },

  card: {
    borderRadius: 15,
    padding: 8,
    marginVertical: 6,
  },
  orderTitle: { fontSize: 18, color: "white" },
  trackingTitle: {
    fontSize: 18,

    color: "white",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  modalContent: {
    backgroundColor: "#f8f9fa",
    padding: 25,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 6,
    textAlign: "center",
  },
  picker: {
    width: "100%",
    marginVertical: 15,
    paddingLeft: 10,
    backgroundColor: "#e9ecef",
  },
  feedbackInput: {
    width: "100%",
    padding: 12,
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    marginTop: 10,
    fontSize: 15,
    color: "#333",
  },
  updateButtonContainer: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  updateButton: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },

  closeButton: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
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
  closeButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
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

  pendingButton: {
    backgroundColor: "#fbd100",
    color: "black",
    padding: 4,
    borderRadius: 5,
  },
  canceledButton: {
    backgroundColor: "#e53e3e",
    color: "white",
    padding: 4,
    borderRadius: 5,
  },
  returnButton: {
    backgroundColor: "#f97316",
    color: "white",
    padding: 4,
    borderRadius: 5,
  },
  inProcessButton: {
    backgroundColor: "#3b82f6",
    color: "white",
    padding: 4,
    borderRadius: 5,
  },
  holdButton: {
    backgroundColor: "#8b5cf6",
    color: "white",
    padding: 4,
    borderRadius: 5,
  },
  defaultButton: {
    backgroundColor: "#d1d5db",
    color: "black",
    padding: 4,
    borderRadius: 5,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  orderDetail: {
    fontSize: 16,
    color: "#fff",
    marginRight: 8,
  },
  statusButton: {
    fontSize: 16,
    padding: 8,
    borderRadius: 5,
    textAlign: "center",
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
  clearButton: {
    backgroundColor: "#0575E6",
    padding: 8,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 40,
    width: "30%",
  },
});
