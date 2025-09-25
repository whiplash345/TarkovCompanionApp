import React, { createContext, useContext, useState } from "react";

// Import AI Reference Data
import achievementData from "../data/AchievementData.json";
import barterData from "../data/BarterData.json";
import bossesData from "../data/BossesData.json";
import craftsData from "../data/CraftsData.json";
import hideoutData from "../data/HideoutStationsData.json";
import itemsData1 from "../data/ItemsData1.json";
import itemsData2 from "../data/ItemsData2.json";
import itemsData3 from "../data/ItemsData3.json";
import itemsData4 from "../data/ItemsData4.json";
import itemsData5 from "../data/ItemsData5.json";
import itemsData6 from "../data/ItemsData6.json";
import itemsData7 from "../data/ItemsData7.json";
import itemsData8 from "../data/ItemsData8.json";
import itemsData9 from "../data/ItemsData9.json";
import itemsData10 from "../data/ItemsData10.json";
import mapsData from "../data/MapsData.json";
import tasksData from "../data/TasksData.json";
import tradersData from "../data/TradersData.json";

type Message = {
  text: string;
  sender: "user" | "ai";
};

type ChatContextType = {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  referenceData: {
    achievements: any[];
    barters: any[];
    bosses: any[];
    crafts: any[];
    hideoutStations: any[];
    items: any[];
    maps: any[];
    tasks: any[];
    traders: any[];
  };
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const allItems = [
  ...(itemsData1 ?? []),
  ...(itemsData2 ?? []),
  ...(itemsData3 ?? []),
  ...(itemsData4 ?? []),
  ...(itemsData5 ?? []),
  ...(itemsData6 ?? []),
  ...(itemsData7 ?? []),
  ...(itemsData8 ?? []),
  ...(itemsData9 ?? []),
  ...(itemsData10 ?? []),
];

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const referenceData = {
    achievements: achievementData.achievements ?? [],
    barters: barterData.barters ?? [],
    bosses: bossesData.bosses ?? [],
    crafts: craftsData.crafts ?? [],
    hideoutStations: hideoutData.hideoutStations ?? [],
    items: allItems,
    maps: mapsData.maps ?? [],
    tasks: tasksData.tasks ?? [],
    traders: tradersData.traders ?? [],
  };

  return (
    <ChatContext.Provider value={{ messages, setMessages, loading, setLoading, referenceData }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within a ChatProvider");
  return context;
}