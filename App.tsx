import React from "react";
import { AppDataProvider } from "./src/context/AppDataContext";
import AppNavigator from "./src/navigation/Navigation";
import { UserLevelProvider } from "./src/context/UserLevelContext";

export default function App() {
  return (
    <AppDataProvider>
      <UserLevelProvider>
        <AppNavigator />
      </UserLevelProvider>
    </AppDataProvider>
  );
}