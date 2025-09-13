import React, { useEffect, useState } from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, ScrollView, Button } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserLevel } from "../context/UserLevelContext";
import { useCompletedTasks } from "../context/CompletedTasksContext";
import { StatusBar } from "react-native";
import { Picker } from "@react-native-picker/picker";

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

const [filter, setFilter] = useState<"available" | "completed">("available");

const { userLevel } = useUserLevel();
const { completedTasks, setCompletedTasks } = useCompletedTasks();

const [selectedMap, setSelectedMap] = useState<string>("all");
const [selectedTrader, setSelectedTrader] = useState<string>("all");


const tasksWithBehindCount = data && Array.isArray(data.tasks) ? enrichTasksWithBehindCount(data.tasks) : [];
const visibleTasks = getVisibleTasks(tasksWithBehindCount, completedTasks, userLevel);

const allMaps = Array.from(new Set(tasksWithBehindCount.map(task => task.map?.name).filter(Boolean)));
const allTraders = Array.from(new Set(tasksWithBehindCount.map(task => task.trader?.name).filter(Boolean)));

const sortedTasks = [...visibleTasks].sort((a, b) => (b.behindCount ?? 0) - (a.behindCount ?? 0));

  useFocusEffect(
  React.useCallback(() => {
    AsyncStorage.getItem("completedTasks").then(stored => {
      if (stored) setCompletedTasks(JSON.parse(stored));
    });
  }, [])
);

  // When marking a task complete:
async function markTaskComplete(taskName: string) {
  if (!completedTasks.includes(taskName)) {
    setCompletedTasks([...completedTasks, taskName]);
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

  let tasksToShow: Task[] = [];

  if (filter === "available") {
    tasksToShow = sortedTasks;
  } else {
    tasksToShow = [...tasksWithBehindCount]
      .filter(task => completedTasks.includes(task.name))
      .sort((a, b) => (b.behindCount ?? 0) - (a.behindCount ?? 0));
  }

  let filteredTasks = tasksToShow;

  if (selectedMap !== "all") {
    filteredTasks = filteredTasks.filter(task => task.map?.name === selectedMap);
  }
  if (selectedTrader !== "all") {
    filteredTasks = filteredTasks.filter(task => task.trader?.name === selectedTrader);
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#000" }}
      edges={["top", "left", "right"]}
    >
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: Colors.backgroundSecondary }}>
        <TouchableOpacity onPress={handleOpenDrawer}>
          <Ionicons name="menu" size={28} color={Colors.whitePrimary} />
        </TouchableOpacity>
        <Text style={{ color: Colors.tanPrimary, fontSize: 20, marginLeft: 16 }}>Tasks</Text>
      </View>
      {/* Main content area */}
      {/* Dropdowns Row */}
        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          marginVertical: 0,
          paddingVertical: 8, // <-- vertical padding
        }}>
          {/* Map Dropdown */}
          <View style={{
            flex: 1,
            marginRight: 4,
            marginLeft: 6,
            backgroundColor: Colors.backgroundSecondary,
            borderRadius: 12, // <-- rounded corners
            overflow: "hidden", // <-- ensures Picker is clipped to rounded corners
          }}>
            <Picker
              selectedValue={selectedMap}
              onValueChange={value => setSelectedMap(value)}
              style={{ color: Colors.tanPrimary }}
              dropdownIconColor={Colors.tanPrimary}
            >
              <Picker.Item label="All Maps" value="all" />
              {allMaps.map(map => (
                <Picker.Item key={map} label={map} value={map} />
              ))}
            </Picker>
          </View>
          {/* Trader Dropdown */}
          <View style={{
            flex: 1,
            marginLeft: 4,
            marginRight: 6,
            backgroundColor: Colors.backgroundSecondary,
            borderRadius: 12, // <-- rounded corners
            overflow: "hidden",
          }}>
            <Picker
              selectedValue={selectedTrader}
              onValueChange={value => setSelectedTrader(value)}
              style={{ color: Colors.tanPrimary }}
              dropdownIconColor={Colors.tanPrimary}
            >
              <Picker.Item label="All Traders" value="all" />
              {allTraders.map(trader => (
                <Picker.Item key={trader} label={trader} value={trader} />
              ))}
            </Picker>
          </View>
        </View>
      {/* Filter Bar */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 0, marginLeft: 6, marginRight: 6, backgroundColor: Colors.backgroundSecondary, borderRadius: 12, paddingVertical: 6 }}>
        <TouchableOpacity
          onPress={() => setFilter("available")}
          style={{
            padding: 8,
            borderBottomWidth: filter === "available" ? 2 : 0,
            borderBottomColor: Colors.blueSecondary,
            marginHorizontal: 12,
          }}
        >
          <Text style={{ color: filter === "available" ? Colors.blueSecondary : Colors.tanPrimary, fontWeight: "bold" }}>
            Available
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter("completed")}
          style={{
            padding: 8,
            borderBottomWidth: filter === "completed" ? 2 : 0,
            borderBottomColor: Colors.blueSecondary,
            marginHorizontal: 12,
          }}
        >
          <Text style={{ color: filter === "completed" ? Colors.blueSecondary : Colors.tanPrimary, fontWeight: "bold" }}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main content area */}
      <View style={{ flex: 1, backgroundColor: Colors.backgroundPrimary }}>
        <ScrollView>
          {filteredTasks.map(task => (
            <View key={task.id} style={{ margin: 10, padding: 10, backgroundColor: "#222", borderRadius: 8 }}>
              <Text style={{ color: "#fff", fontSize: 16 }}>{task.name}</Text>
              <Text style={{ color: "#ccc" }}>
                Trader: {task.trader?.name}
              </Text>
              <Text style={{ color: "#ccc" }}>
                Map: {task.map?.name}
              </Text>
              <Text style={{ color: "#ccc" }}>
                Tasks After: {(task.behindCount ?? 0)}
              </Text>
              <Button
                title={filter === "available" ? "Complete" : "Uncomplete"}
                onPress={() => {
                  if (filter === "available") {
                    markTaskComplete(task.name);
                  } else {
                    setCompletedTasks(completedTasks.filter(name => name !== task.name));
                  }
                }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}