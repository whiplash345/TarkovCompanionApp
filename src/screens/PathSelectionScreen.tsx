import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  onComplete?: () => void;
};

export default function PathSelectionScreen({ onComplete }: Props) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
      <Text style={{ color: "#fff" }}>Choose your path</Text>
      <TouchableOpacity onPress={() => onComplete?.()}>
        <Text style={{ color: "#f00" }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}