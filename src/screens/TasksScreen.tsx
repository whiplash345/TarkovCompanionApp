import React, { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserLevel } from "../context/UserLevelContext";

// Import Types
import { Task, TaskRequirement } from "../types/TaskTypes";

// Import Functions
import { enrichTasksWithBehindCount } from "../lib/enrichTasks";

// Import Constants
import { Colors } from "../constants/colors";
import { useAppData } from "../context/AppDataContext";

type AppDataContextType = {
  tasks: Task[];
  // add other fields if needed
};

const TASK_BLACKLIST: string[] = [
  "Compensation for Damage - Trust",
  "Compensation for Damage - Wager",
  "Compensation for Damage - Barkeep",
  "Compensation for Damage - Collection",
  "Compensation for Damage - Wergild",
];

export default function TasksScreen() {
  const navigation = useNavigation();
  const data = useAppData() as AppDataContextType | null;

  const { userLevel } = useUserLevel();
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

const tasksWithBehindCount = data && Array.isArray(data.tasks) ? enrichTasksWithBehindCount(data.tasks) : [];
const visibleTasks = getVisibleTasks(tasksWithBehindCount, completedTasks, userLevel);

const sortedTasks = [...visibleTasks].sort((a, b) => (b.behindCount ?? 0) - (a.behindCount ?? 0));

  useFocusEffect(
  React.useCallback(() => {
    AsyncStorage.getItem("completedTasks").then(stored => {
      if (stored) setCompletedTasks(JSON.parse(stored));
    });
  }, [])
);

  // Function to mark a task as complete
  async function markTaskComplete(taskName: string) {
    if (!completedTasks.includes(taskName)) {
      const updated = [...completedTasks, taskName];
      setCompletedTasks(updated);
      await AsyncStorage.setItem("completedTasks", JSON.stringify(updated));
    }
  }

  // Example filtering function (replace with your actual logic)
  function getVisibleTasks(allTasks: Task[], completedTasks: string[], userLevel: number) {
  if (!allTasks) return [];
  return allTasks
    .filter(task => !TASK_BLACKLIST.includes(task.name))
    .filter(task => !task.minPlayerLevel || userLevel >= task.minPlayerLevel)
    .filter(task => !completedTasks.includes(task.name)) // <-- Exclude completed tasks
    .filter(task => {
      if (!task.taskRequirements || task.taskRequirements.length === 0) return true;
      return task.taskRequirements.every(
        (req: TaskRequirement) =>
          req.task &&
          typeof req.task.name === "string" &&
          completedTasks.includes(req.task.name)
      );
    });
}

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
        <Text style={{ color: Colors.tanPrimary, fontSize: 20, marginLeft: 16 }}>Tasks</Text>
      </View>
      {/* Main content area */}
      <View style={{ flex: 1, backgroundColor: Colors.backgroundPrimary }}>
        <ScrollView>
          {sortedTasks.map(task => (
            <View key={task.id} style={{ margin: 10, padding: 10, backgroundColor: "#222", borderRadius: 8 }}>
              <Text style={{ color: "#fff", fontSize: 16 }}>{task.name}</Text>
              <Text style={{ color: "#ccc" }}>
                Trader: {task.trader?.name}
              </Text>
              <Text style={{ color: "#ccc" }}>
                Map: {task.map?.name}
              </Text>
              <Text style={{ color: "#ccc" }}>
                Tasks After: {(task.behindCount ?? 0) - 1}
              </Text>
              <Button title="Complete" onPress={() => markTaskComplete(task.name)} />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}