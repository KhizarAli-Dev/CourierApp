import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button, Alert, Image } from "react-native";
import { CameraView, Camera } from "expo-camera";
import axiosInstance from "../../utils/axiosInstance";

const OrderScan = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [scanOrderDetails, setScanOrderDetails] = useState([]);

  // Permission Request
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // Handle BarCode Scanning
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setScannedData(data);
  };

  // Render Scanner or Scan Result
  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const AddToProcess = async () => {
    try {
      const res = await axiosInstance.post(process.env.EXPO_PUBLIC_ORDER_SCAN, {
        tracking_id: scannedData,
      });
      //   console.log(res.data);
      setScanOrderDetails(res.data.data);
      // Alert.alert(res.data.message);
    } catch (error) {
      console.log(error);
      // Alert.alert("Error", error.response.data.message);
    }
  };

  if (scanned === true) {
    AddToProcess();
  }

  return (
    <View style={styles.container}>
      {scanned ? (
        <View style={styles.resultContainer}>
          <Text style={styles.header}>Your Scanned Order</Text>
          <Text style={styles.resultText}>
            <Text style={{ fontWeight: "bold" }}>Tracking ID: </Text>
            {scanOrderDetails.tracking_id}
          </Text>
          <Text style={styles.resultText}>
            <Text style={{ fontWeight: "bold" }}>Customer Name: </Text>
            {scanOrderDetails.cust_name}
          </Text>
          <Button title={"Scan Next Order"} onPress={() => setScanned(false)} />
        </View>
      ) : (
        <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject} // Camera fills the screen
          />
          {/* Scanner Frame */}
          <View style={styles.frameContainer}>
            <View style={styles.scannerFrame}></View>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderScan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  frameContainer: {
    position: "absolute",
    top: "30%",
    left: "10%",
    width: "80%",
    height: "40%",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerFrame: {
    width: "100%",
    height: "100%",
    borderWidth: 3,
    borderColor: "#38b000",
    borderRadius: 10,
  },

  resultContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
  },
});
