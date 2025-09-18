import React from "react";
import { AppDataProvider } from "./src/context/AppDataContext";
import AppNavigator from "./src/navigation/Navigation";
import { UserLevelProvider } from "./src/context/UserLevelContext";
import { CompletedTasksProvider } from "./src/context/CompletedTasksContext";
import { ChatProvider } from "./src/context/ChatContext";

export default function App() {
  return (
    <AppDataProvider>
      <UserLevelProvider>
        <CompletedTasksProvider>
          <ChatProvider>
            <AppNavigator />
          </ChatProvider>
        </CompletedTasksProvider>
      </UserLevelProvider>
    </AppDataProvider>
  );
}