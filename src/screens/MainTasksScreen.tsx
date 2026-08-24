import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { treeManager, mainTree } from "../services/TreeBackend";

export default function MainTasksScreen() {
  const [, setRefreshTick] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshTick((tick) => tick + 1);
    }, [])
  );

  const state = treeManager.getStateView();

  const currentNode = useMemo(
    () => mainTree.getNode(state.currentNode ?? ""),
    [state.currentNode]
  );

  const nextAdjacency = state.availableNextAdjacencies[0];
  const hasPreviousNode = state.currentPath.length > 1;
  const isChoiceNode = currentNode?.type === "choice";

  const handleComplete = () => {
    if (!nextAdjacency) return;
    treeManager.moveToNode(nextAdjacency.to);
    setRefreshTick((tick) => tick + 1);
  };

  const handleChoiceComplete = (adjacency: { to: string; id: string; label?: string }) => {
    if (!treeManager.isAdjacencyAvailableForCurrentPath(adjacency)) return;

    treeManager.moveToNode(adjacency.to);
    setRefreshTick((tick) => tick + 1);
  };

  const handleUncomplete = () => {
    if (!hasPreviousNode) return;
    treeManager.goBack();
    setRefreshTick((tick) => tick + 1);
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
            {currentNode?.description ?? "This task card shows the current objective description."}
          </Text>
        </View>

        {isChoiceNode && currentNode?.type === "choice" ? (
          <View style={styles.choiceContainer}>
            {currentNode.outgoing.slice(0, 2).map((adjacency) => {
              const isEnabled = treeManager.isAdjacencyAvailableForCurrentPath(adjacency);

              return (
                <TouchableOpacity
                  key={adjacency.id}
                  style={[
                    styles.choiceButton,
                    isEnabled ? styles.choiceButtonActive : styles.choiceButtonDisabled,
                  ]}
                  activeOpacity={isEnabled ? 0.85 : 1}
                  disabled={!isEnabled}
                  onPress={() => handleChoiceComplete(adjacency)}
                >
                  <Text style={styles.choiceButtonText}>
                    {adjacency.label ?? "Continue"}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.choiceUncompleteButton,
                hasPreviousNode ? styles.buttonDangerActive : styles.buttonDangerDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handleUncomplete}
              disabled={!hasPreviousNode}
            >
              <Text
                style={[
                  styles.buttonText,
                  !hasPreviousNode && styles.buttonTextDisabled,
                ]}
              >
                Uncomplete
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.button,
                hasPreviousNode ? styles.buttonDangerActive : styles.buttonDangerDisabled,
              ]}
              activeOpacity={0.7}
              onPress={handleUncomplete}
              disabled={!hasPreviousNode}
            >
              <Text
                style={[
                  styles.buttonText,
                  !hasPreviousNode && styles.buttonTextDisabled,
                ]}
              >
                Uncomplete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                nextAdjacency ? styles.buttonSuccessActive : styles.buttonSuccessDisabled,
              ]}
              onPress={handleComplete}
              disabled={!nextAdjacency}
            >
              <Text
                style={[
                  styles.buttonText,
                  !nextAdjacency && styles.buttonTextDisabled,
                ]}
              >
                Complete
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
  choiceContainer: {
    gap: 12,
  },
  choiceButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  choiceButtonActive: {
    backgroundColor: "#0a0",
  },
  choiceButtonDisabled: {
    backgroundColor: "#2f2f2f",
    opacity: 0.35,
  },
  choiceButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  choiceUncompleteButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
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
  buttonDangerActive: {
    backgroundColor: "#7a1d1d",
  },
  buttonDangerDisabled: {
    backgroundColor: "#2f2f2f",
  },
  buttonSuccessActive: {
    backgroundColor: "#0a0",
  },
  buttonSuccessDisabled: {
    backgroundColor: "#2f2f2f",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextDisabled: {
    opacity: 0.45,
  },
});