// src/screens/MainTasksScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { treeManager, mainTree } from "../services/TreeBackend";

export default function MainTasksScreen() {

  const [state, setState] = useState(treeManager.getStateView());

  const currentNode = useMemo(
    () => mainTree.getNode(state.currentNode ?? ""),
    [state.currentNode]
  );

  const nextAdjacency = state.availableNextAdjacencies[0];

  const handleComplete = () => {
    if (!nextAdjacency) return;
    treeManager.moveToNode(nextAdjacency.to);
    setState(treeManager.getStateView());
  };

  const hasPreviousNode = state.currentPath.length > 1;

  const handleUncomplete = () => {
    if (!hasPreviousNode) return;
    treeManager.goBack();
    setState(treeManager.getStateView());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerCard}>
        <Image
          style={styles.icon}
          source={require("../../assets/Falling_Skies_Icon.webp")}
        />
        <Text style={styles.headerTitle}>Falling Skies</Text>
      </View>

      <View style={styles.taskCard}>
        <Text style={styles.sectionLabel}>Objective</Text>
        <Text style={styles.taskTitle}>
          {currentNode?.title ?? "Loading..."}
        </Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {currentNode?.description ??
              "This task card shows the current objective description."}
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, hasPreviousNode ? styles.buttonInactive : styles.buttonDisabled]}
            activeOpacity={0.7}
            onPress={handleUncomplete}
            disabled={!hasPreviousNode}
          >
            <Text style={styles.buttonText}>Uncomplete</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonActive]}
            onPress={handleComplete}
            disabled={!nextAdjacency}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 12,
    marginBottom: 20,
  },
  icon: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  taskCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#111",
  },
  sectionLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 1,
  },
  taskTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
  },
  descriptionBox: {
    minHeight: 120,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 24,
  },
  descriptionText: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonDisabled: {
    backgroundColor: "#800",
    opacity: 0.2,
  },
  buttonInactive: {
  backgroundColor: "#550000",
  },
  buttonActive: {
    backgroundColor: "#0a0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});