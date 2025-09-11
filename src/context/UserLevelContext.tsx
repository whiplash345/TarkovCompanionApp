import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserLevelContextType = {
  userLevel: number;
  setUserLevel: (level: number) => void;
};

const UserLevelContext = createContext<UserLevelContextType | undefined>(undefined);

export const UserLevelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLevel, setUserLevelState] = useState<number>(1);

  useEffect(() => {
    AsyncStorage.getItem("userLevel").then(stored => {
      if (stored) setUserLevelState(Number(stored));
    });
  }, []);

  const setUserLevel = (level: number) => {
    setUserLevelState(level);
    AsyncStorage.setItem("userLevel", String(level));
  };

  return (
    <UserLevelContext.Provider value={{ userLevel, setUserLevel }}>
      {children}
    </UserLevelContext.Provider>
  );
};

export const useUserLevel = () => {
  const context = useContext(UserLevelContext);
  if (!context) throw new Error("useUserLevel must be used within a UserLevelProvider");
  return context;
};