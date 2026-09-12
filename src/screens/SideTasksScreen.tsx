import React, { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getSideTreeManager,
  SideTaskDefinition,
  sideTaskDefinitions,
} from "../services/SideTasksBackend";

export default function SideTasksScreen() {
  const [, setRefreshTick] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const selectedTask = sideTaskDefinitions.find((task) => task.id === selectedTaskId);
  const manager = selectedTask ? getSideTreeManager(selectedTask.id) : undefined;
  const currentNode = manager?.getCurrentTreeNode();
  const nextAdjacency = manager?.getAvailableNextAdjacencies()[0];
  const hasPreviousNode = (manager?.currentPath.length ?? 0) > 1;
  const isChoiceNode = currentNode?.type === "choice";

  const refresh = () => setRefreshTick((tick) => tick + 1);

  const handleComplete = () => {
    if (!manager || !nextAdjacency) return;
    manager.moveToNode(nextAdjacency.to);
    refresh();
  };

  const handleUncomplete = () => {
    if (!manager || !hasPreviousNode) return;
    manager.goBack();
    refresh();
  };

  if (!selectedTask || !manager) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.selectionContent}>
          {sideTaskDefinitions.map((task) => (
            <SideTaskCard key={task.id} task={task} onPress={() => setSelectedTaskId(task.id)} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.headerCard} activeOpacity={0.8} onPress={() => setSelectedTaskId(null)}>
        <Image style={styles.icon} source={selectedTask.icon} />
        <Text style={styles.headerTitle}>{selectedTask.name}</Text>
      </TouchableOpacity>

      <View style={styles.taskCard}>
        <Text style={styles.sectionLabel}>Objective</Text>
        <Text style={styles.taskTitle}>{currentNode?.title ?? "Loading..."}</Text>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            {currentNode?.description ?? "This task card shows the current objective description."}
          </Text>
        </View>

        {isChoiceNode ? (
          <View style={styles.choiceContainer}>
            {currentNode.outgoing.map((adjacency) => (
              <TouchableOpacity
                key={adjacency.id}
                style={styles.choiceButton}
                onPress={() => {
                  manager.moveToNode(adjacency.to);
                  refresh();
                }}
              >
                <Text style={styles.buttonText}>{adjacency.label ?? "Continue"}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.choiceUncompleteButton, !hasPreviousNode && styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={handleUncomplete}
              disabled={!hasPreviousNode}
            >
              <Text style={[styles.buttonText, !hasPreviousNode && styles.buttonTextDisabled]}>Uncomplete</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, hasPreviousNode ? styles.buttonDangerActive : styles.buttonDisabled]}
              activeOpacity={0.7}
              onPress={handleUncomplete}
              disabled={!hasPreviousNode}
            >
              <Text style={[styles.buttonText, !hasPreviousNode && styles.buttonTextDisabled]}>Uncomplete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, nextAdjacency ? styles.buttonSuccessActive : styles.buttonDisabled]}
              onPress={handleComplete}
              disabled={!nextAdjacency}
            >
              <Text style={[styles.buttonText, !nextAdjacency && styles.buttonTextDisabled]}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function SideTaskCard({ task, onPress }: { task: SideTaskDefinition; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.selectionCard} activeOpacity={0.8} onPress={onPress}>
      <Image style={styles.selectionIcon} source={task.icon as ImageSourcePropType} />
      <Text style={styles.selectionTitle}>{task.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", padding: 16 },
  selectionContent: { gap: 16, paddingBottom: 16 },
  selectionCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 12,
    backgroundColor: "#111",
  },
  selectionIcon: { width: 52, height: 52, marginRight: 14, borderRadius: 10 },
  selectionTitle: { color: "#bac3c3", fontSize: 20, fontWeight: "700" },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 12,
    marginBottom: 20,
  },
  icon: { width: 48, height: 48, marginRight: 12, borderRadius: 10 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  taskCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    backgroundColor: "#111",
  },
  sectionLabel: { color: "#aaa", fontSize: 12, marginBottom: 6, letterSpacing: 1 },
  taskTitle: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 18 },
  descriptionBox: {
    minHeight: 120,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#222",
    marginBottom: 24,
  },
  descriptionText: { color: "#ccc", fontSize: 14, lineHeight: 20 },
  choiceContainer: { gap: 12 },
  choiceButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center", backgroundColor: "#0a0" },
  choiceUncompleteButton: { paddingVertical: 16, borderRadius: 12, alignItems: "center" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  button: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginHorizontal: 4 },
  buttonDangerActive: { backgroundColor: "#7a1d1d" },
  buttonSuccessActive: { backgroundColor: "#0a0" },
  buttonDisabled: { backgroundColor: "#2f2f2f" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  buttonTextDisabled: { opacity: 0.45 },
});