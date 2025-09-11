import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useAppData } from "../context/AppDataContext";
import { Colors } from "../constants/colors";

export default function DebugScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const data = useAppData();

  const handleOpenDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: Colors.backgroundSecondary }}>
        <TouchableOpacity onPress={handleOpenDrawer}>
          <Ionicons name="menu" size={28} color={Colors.whitePrimary} />
        </TouchableOpacity>
        <Text style={{ color: Colors.tanPrimary, fontSize: 20, marginLeft: 16 }}>Debug Console</Text>
      </View>
      {/* Main content area */}
      <View style={{ flex: 1, backgroundColor: Colors.backgroundPrimary }}>
        <ScrollView>
          <Text style={{ color: "#fff", fontSize: 12 }}>
            {data
              ? JSON.stringify(data, null, 2)
              : "Loading or no data available."}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}