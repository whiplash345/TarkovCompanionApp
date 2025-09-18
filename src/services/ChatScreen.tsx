import React, { useEffect, useRef, useState } from "react";
import { View, TextInput, Text, TouchableOpacity, StyleSheet, FlatList, KeyboardAvoidingView, Platform, Animated } from "react-native";
import { askBot } from "./openai";

// If using React Navigation:
import { useNavigation } from "@react-navigation/native";

import LoadingDots from "../lib/LoadingDots";

import { useChat } from "../context/ChatContext";

type Message = {
  text: string;
  sender: "user" | "ai";
};

type ChatScreenProps = {
  graphData?: any;
};

export default function ChatScreen({ graphData }: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Use navigation to go back
  const navigation = useNavigation();

  const { messages, setMessages } = useChat();


  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    const reply = await askBot(userMsg.text, graphData);
    setMessages((prev) => [...prev, { text: reply, sender: "ai" }]);
    setLoading(false);
  };

    return (
    <View style={styles.container}>
      {/* Removed the top right close button */}
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item, index }) => (
          <View style={[
            styles.bubble,
            item.sender === "user" ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        )}
        ListFooterComponent={
          loading && messages.length > 0 && messages[messages.length - 1].sender === "user" ? (
            <View style={[styles.bubble, styles.aiBubble]}>
              <LoadingDots />
            </View>
          ) : null
        }
        contentContainerStyle={{ paddingVertical: 24 }}
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#aaa"
            style={styles.input}
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
            <Text style={styles.sendText}>{loading ? "..." : "SEND"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#222",
    paddingTop: 40,
    paddingHorizontal: 0,
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    marginVertical: 6,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: "#2196F3",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#444",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    color: "#fff",
    fontSize: 16,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#222",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    fontSize: 16,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1,
  },
});