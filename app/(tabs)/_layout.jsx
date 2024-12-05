import { Tabs, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StyleSheet, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";

export default function TabLayout() {
  const route = useRouter();
  const theme = useColorScheme();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        route.push("/"); // Redirect to the home page
      } else {
        route.push("/RiderLogin"); // Redirect to login
      }
    };

    checkToken();
  }, [route]);

  return (
    <>
      <StatusBar
        backgroundColor={theme === "dark" ? "#203A43" : "#203A43"} // Set background color based on theme
        style={theme === "dark" ? "light" : "light"} // Set text color based on theme
      />

      <NavigationContainer>
        {/* <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2193b0",
            tabBarInactiveTintColor: "#8e8e93",
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
          }}
        >
          <Tabs.Screen
            name="Delivered"
            options={{
              headerShown: false,
              title: "History",
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <MaterialCommunityIcons
                    name="history"
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <Ionicons
                    name={focused ? "home-sharp" : "home-outline"}
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="Profile"
            options={{
              title: "Profile",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <Ionicons
                    name={focused ? "person-sharp" : "person-outline"}
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="Pending"
            options={{
              title: "Pending",
              headerShown: false,
              tabBarButton: () => null,

            }}
          />
        </Tabs> */}

        <Tabs
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: "#2193b0",
            tabBarInactiveTintColor: "#8e8e93",
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabItem,
          })}
        >
          <Tabs.Screen
            name="Delivered"
            options={{
              headerShown: false,
              title: "History",
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <MaterialCommunityIcons
                    name="history"
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <Ionicons
                    name={focused ? "home-sharp" : "home-outline"}
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="Profile"
            options={{
              title: "Profile",
              headerShown: false,
              tabBarIcon: ({ color, focused }) => (
                <View
                  style={[styles.iconContainer, focused && styles.iconActive]}
                >
                  <Ionicons
                    name={focused ? "person-sharp" : "person-outline"}
                    color={focused ? "#fff" : color}
                    size={25}
                  />
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="Pending"
            options={{
              title: "Pending",
              headerShown: false,
              tabBarItemStyle: {
                display: "none",
              },
            }}
          />
        </Tabs>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0F2027",
    height: 65,
    paddingBottom: 20,
    paddingTop: 8,
    borderTopWidth: 0,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    paddingTop: 4,
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 45,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  iconActive: {
    backgroundColor: "#2193b0",
  },
});
