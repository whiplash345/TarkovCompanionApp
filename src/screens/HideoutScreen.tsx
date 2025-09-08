import React from "react";
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";

// Import Constants
import { Colors } from "../constants/colors";

export default function TasksScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }} // Safe area is white
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: Colors.backgroundSecondary }}>
        <TouchableOpacity onPress={handleOpenDrawer}>
          <Ionicons name="menu" size={28} color={Colors.whitePrimary} />
        </TouchableOpacity>
        <Text style={{ color: Colors.tanPrimary, fontSize: 20, marginLeft: 16 }}>Hideout</Text>
      </View>
      {/* Main content area */}
      <View style={{ flex: 1, backgroundColor: Colors.backgroundPrimary }}>
        {/* ...rest of your screen content... */}
      </View>
    </SafeAreaView>
  );
}