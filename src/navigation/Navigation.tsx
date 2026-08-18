import React, { useState } from "react";
import { Alert, Image, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import CustomDrawer from "./CustomDrawer";

// Import screens
import PathSelectionScreen from "../screens/PathSelectionScreen";
import MainTasksScreen from "../screens/MainTasksScreen";
import SideTasksScreen from "../screens/SideTasksScreen";
import DebugScreen from "../screens/DebugScreen";

// Import Constants
import { Colors } from "../constants/colors";
import { treeManager } from "../services/TreeBackend";

// Define navigators
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Bottom tabs
function HomeScreen({
  hasCompletedPathSelection,
}: {
  hasCompletedPathSelection: boolean;
}) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // Hide Tab header
        tabBarStyle: { backgroundColor: Colors.backgroundSecondary },
        tabBarActiveTintColor: Colors.tanPrimary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={MainTasksScreen}
        listeners={{
          tabPress: e => {
            if (!hasCompletedPathSelection) {
              e.preventDefault();
              alert("Please complete the path selection screen first.");
            }
          },
        }}
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
        name="Items"
        component={SideTasksScreen}
        listeners={{
          tabPress: e => {
            if (!hasCompletedPathSelection) {
              e.preventDefault();
              alert("Please complete the path selection screen first.");
            }
          },
        }}
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
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [hasCompletedPathSelection, setHasCompletedPathSelection] = useState(false);
  const [selectedPathTag, setSelectedPathTag] = useState<string | null>(null);

  const handlePathSelected = (tag: string, navigation?: any) => {
    setSelectedPathTag(tag);

    if (hasCompletedPathSelection && navigation?.navigate) {
      navigation.navigate("Home");
    } else {
      setHasCompletedPathSelection(true);
    }

    treeManager.setUserPathChoice(tag);
  };
  const HomeScreenWrapper = () => (
    <HomeScreen hasCompletedPathSelection={hasCompletedPathSelection} />
  );

  const PathSelectionRoute = (props: any) => (
  <PathSelectionScreen {...props} onComplete={(tag: string) => handlePathSelected(tag, props.navigation)} />
  );

  if (!hasCompletedPathSelection) {
    return (
      <NavigationContainer>
        <PathSelectionRoute />
      </NavigationContainer>
    );
  }
  
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawer {...props} />}
        screenOptions={({ navigation }) => ({
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors.backgroundSecondary,
            borderBottomWidth: 2,
            borderBottomColor: Colors.tanPrimary,
          },
          headerTintColor: Colors.tanPrimary,
          headerTitle: selectedPathTag ?? "Choose a Path",
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ marginLeft: 12 }}>
              <Ionicons name="menu" size={24} color={Colors.tanPrimary} />
            </TouchableOpacity>
          ),
          drawerActiveTintColor: Colors.tanPrimary,
          drawerInactiveTintColor: Colors.whitePrimary,
          drawerLabelStyle: {
            color: Colors.whitePrimary,
          },
          drawerItemStyle: {
            borderRadius: 8,
          },
        })}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreenWrapper}
          options={{ drawerLabel: "Home" }}
        />
        <Drawer.Screen
          name="Path Selection"
          component={PathSelectionRoute}
          options={{ drawerLabel: "Path Selection" }}
        />
        <Drawer.Screen
          name="Debug"
          component={DebugScreen}
          options={{ drawerLabel: "Debug Console" }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}