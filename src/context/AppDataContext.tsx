import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppDataContext = createContext(null);

const QUERY = `
  query {
    tasks(lang: en) {
      id
      name
      trader { name imageLink }
      map { name }
      wikiLink
      objectives { description }
      minPlayerLevel
      taskRequirements { task { name } status }
    }
  }
`;

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log("Starting fetchData...");
      try {
        const response = await fetch("https://api.tarkov.dev/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: QUERY }),
        });
        const result = await response.json();
        setData(result.data);
        await AsyncStorage.setItem("tarkovData", JSON.stringify(result.data));
        console.log("Fetched data:", result.data);
      } catch (error) {
        console.error("Fetch error:", error); // <-- Add this line
        // If fetch fails, try to load from local storage
        const localData = await AsyncStorage.getItem("tarkovData");
        if (localData) {
          setData(JSON.parse(localData));
          console.log("Loaded local data:", JSON.parse(localData)); // Optional: log local data
        } else {
          console.warn("No local data found."); // Optional: log missing local data
        }
      }
    }
    fetchData();
  }, []);

  return (
    <AppDataContext.Provider value={data}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}