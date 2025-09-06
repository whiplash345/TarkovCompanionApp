// Import Dependencies
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "react-native";

// Import screens
import TasksScreen from "../screens/TasksScreen";
import HideoutScreen from "../screens/HideoutScreen";
import ItemsScreen from "../screens/ItemsScreen";
import CultistCircleScreen from "../screens/CultistCircleScreen";

// Define navigators
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom tabs
function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide Tab header
        tabBarStyle: { backgroundColor: "#383838" },
        tabBarActiveTintColor: "#c4a86d",
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/tasks.png")}
              style={{ width: size * 1.45, height: size * 1.45, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Hideout"
        component={HideoutScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/house.png")}
              style={{ width: size * 1.45, height: size * 1.45, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Items"
        component={ItemsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/case.png")}
              style={{ width: size * 1.45, height: size * 1.45, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cultist Circle"
        component={CultistCircleScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require("../../assets/unheard.png")}
              style={{ width: size * 1.45, height: size * 1.45, tintColor: color }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#212121" },
          headerTintColor: "#fff",
          drawerType: "front",
          headerShown: true, // Show header with hamburger menu
        }}
      >
        <Drawer.Screen
          name="Main"
          component={BottomTabs}
          options={{ drawerLabel: "Home", title: "Tasks" }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}