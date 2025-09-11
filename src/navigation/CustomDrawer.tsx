import React, { useEffect, useState } from "react";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View, Text, TouchableHighlight } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useUserLevel } from "../context/UserLevelContext";

// Import Constants
import { Colors } from "../constants/colors";

export default function CustomDrawer(props: any) {
  const { userLevel, setUserLevel } = useUserLevel();

  useEffect(() => {
    AsyncStorage.getItem("userLevel").then(stored => {
      if (stored) setUserLevel(Number(stored));
    });
  }, []);

  const changeUserLevel = (delta: number) => {
  const newLevel = Math.max(1, userLevel + delta);
  setUserLevel(newLevel);
};

  return (
    <View style={{ flex: 1, backgroundColor: "#222" }}>
      {/* Custom header always at the top */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: Colors.backgroundSecondary,
        marginBottom: 8,
        paddingTop: 25,
      }}>
        <Text style={{ color: Colors.whitePrimary, fontSize: 18, marginRight: 8 }}>Level:</Text>
        <TouchableHighlight onPress={() => changeUserLevel(-1)} style={{ marginHorizontal: 4 }}>
          <Ionicons name="arrow-down" size={24} color={Colors.whitePrimary} />
        </TouchableHighlight>
        <Text style={{ color:Colors.blueSecondary, fontSize: 18, marginHorizontal: 4 }}>{userLevel}</Text>
        <TouchableHighlight onPress={() => changeUserLevel(1)} style={{ marginHorizontal: 4 }}>
          <Ionicons name="arrow-up" size={24} color={Colors.whitePrimary} />
        </TouchableHighlight>
      </View>
      {/* Drawer items below */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
    </View>
  );
}