import React from "react";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { View, Text } from "react-native";
import { Colors } from "../constants/colors";

export default function CustomDrawer(props: any) {
  return (
    <DrawerContentScrollView
      {...props}
      style={{ flex: 1, backgroundColor: Colors.backgroundSecondary }}
    >
      <View style={{ padding: 16, paddingBottom: 8 }}>
      </View>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}