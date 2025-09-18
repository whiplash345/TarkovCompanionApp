import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";

export default function LoadingDots() {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev === 3 ? 1 : prev + 1));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={styles.dots}>
      {".".repeat(dotCount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  dots: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: 2,
  },
});