// import { io } from "socket.io-client";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const initializeSocket = (setOrders) => {
//   const socket = io(process.env.EXPO_PUBLIC_URL);

//   socket.on("connect", () => {
//     console.log("Connected to socket server");
//   });

//   const handleNewOrder = (newOrder) => {
//     setOrders((prevOrders) => [...prevOrders, newOrder]);
//   };

//   const handleOrderUpdated = (data) => {
//     setOrders((prevOrders) =>
//       prevOrders.map((order) =>
//         order._id === data.orderId ? { ...order, status: data.status } : order
//       )
//     );
//   };

//   const handleOrdersStatusChanged = (data) => {
//     setOrders((prevOrders) => {
//       const updatedOrdersMap = new Map(
//         [...prevOrders, ...data.orders].map((order) => [order._id, order])
//       );
//       return Array.from(updatedOrdersMap.values());
//     });
//   };

//   const handleOrderDeleted = (data) => {
//     console.log("Order deleted:", data);
//     setOrders((prevOrders) =>
//       prevOrders.filter((order) => order._id !== data.orderId)
//     );
//   };

//   // Listen for various events
//   socket.on("newOrder", handleNewOrder);
//   socket.on("orderUpdated", handleOrderUpdated);
//   socket.on("ordersStatusChanged", handleOrdersStatusChanged);
//   socket.on("orderDeleted", handleOrderDeleted);

//   // Emit 'joinRoom' with riderId after getting it from AsyncStorage
//   AsyncStorage.getItem("id").then((id) => {
//     socket.emit("joinRoom", id);
//   });

//   // Cleanup the socket connections when the component unmounts
//   return () => {
//     socket.off("newOrder", handleNewOrder);
//     socket.off("orderUpdated", handleOrderUpdated);
//     socket.off("ordersStatusChanged", handleOrdersStatusChanged);
//     socket.off("orderDeleted", handleOrderDeleted);
//     socket.disconnect();
//   };
// };


// // useEffect(() => {
// //     // Initialize socket and handle socket connections and events
// //     const cleanupSocket = initializeSocket(setOrders);

// //     // Cleanup the socket connection when component unmounts
// //     return cleanupSocket;
// //   }, []); // Empty dependency array ensures this only runs once
