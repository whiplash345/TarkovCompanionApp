import React from "react";
import AppNavigator from "./src/navigation/Navigation";
import ChatAssistant from "./src/components/ChatAssistant";

export default function App() {
  return (
    <>
      <AppNavigator />
      <ChatAssistant />
    </>
  );
}