import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CompletedTasksContextType = {
  completedTasks: string[];
  setCompletedTasks: (tasks: string[]) => void;
  resetCompletedTasks: () => void;
};

const CompletedTasksContext = createContext<CompletedTasksContextType | undefined>(undefined);

export const CompletedTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [completedTasks, setCompletedTasksState] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("completedTasks").then(stored => {
      if (stored) setCompletedTasksState(JSON.parse(stored));
    });
  }, []);

  const setCompletedTasks = (tasks: string[]) => {
    setCompletedTasksState(tasks);
    AsyncStorage.setItem("completedTasks", JSON.stringify(tasks));
  };

  const resetCompletedTasks = () => {
    setCompletedTasksState([]);
    AsyncStorage.setItem("completedTasks", JSON.stringify([]));
  };

  return (
    <CompletedTasksContext.Provider value={{ completedTasks, setCompletedTasks, resetCompletedTasks }}>
      {children}
    </CompletedTasksContext.Provider>
  );
};

export const useCompletedTasks = () => {
  const context = useContext(CompletedTasksContext);
  if (!context) throw new Error("useCompletedTasks must be used within a CompletedTasksProvider");
  return context;
};