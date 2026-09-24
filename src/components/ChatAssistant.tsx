import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/colors";
import { getPlaceholderReply, ChatMessage } from "../services/ChatBackend";

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Ask me about your current tasks, objectives, or the path ahead.",
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: getPlaceholderReply(text),
      },
    ]);
    setInput("");
  };

  return (
    <>
      {!isOpen && (
        <TouchableOpacity
          accessibilityLabel="Open Tarkov assistant"
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={() => setIsOpen(true)}
          style={styles.floatingButton}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color={Colors.backgroundPrimary} />
        </TouchableOpacity>
      )}

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
        onDismiss={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.modalRoot}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
            style={styles.keyboardView}
          >
            <View style={styles.chatPanel}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>TACTICAL SUPPORT</Text>
                  <Text style={styles.title}>Tarkov Assistant</Text>
                </View>
                <TouchableOpacity
                  accessibilityLabel="Close assistant"
                  accessibilityRole="button"
                  onPress={() => setIsOpen(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={22} color={Colors.whitePrimary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={messages}
                keyExtractor={(message) => message.id}
                style={styles.messageListView}
                contentContainerStyle={styles.messageList}
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={[styles.message, item.role === "user" ? styles.userMessage : styles.assistantMessage]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                )}
              />

              <View style={styles.composer}>
                <TextInput
                  accessibilityLabel="Message Tarkov Assistant"
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={sendMessage}
                  placeholder="Ask about a task..."
                  placeholderTextColor="#7d8585"
                  returnKeyType="send"
                  style={styles.input}
                />
                <TouchableOpacity
                  accessibilityLabel="Send message"
                  accessibilityRole="button"
                  activeOpacity={0.8}
                  disabled={!input.trim()}
                  onPress={sendMessage}
                  style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
                >
                  <Ionicons name="arrow-up" size={20} color={Colors.backgroundPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.tanPrimary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "android" ? 28 : 0,
    backgroundColor: "rgba(0, 0, 0, 0.52)",
  },
  keyboardView: { width: "100%", height: "78%" },
  chatPanel: {
    flex: 1,
    backgroundColor: Colors.backgroundPrimary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#4c4a42",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: "#3c3c38",
  },
  eyebrow: { color: Colors.bluePrimary, fontSize: 10, fontWeight: "700", letterSpacing: 1.5 },
  title: { color: Colors.whitePrimary, fontSize: 20, fontWeight: "700", marginTop: 3 },
  closeButton: { padding: 6 },
  messageListView: { flex: 1 },
  messageList: { padding: 18, gap: 12 },
  message: { maxWidth: "84%", padding: 13, borderRadius: 16 },
  assistantMessage: { alignSelf: "flex-start", backgroundColor: Colors.backgroundTetriary, borderBottomLeftRadius: 4 },
  userMessage: { alignSelf: "flex-end", backgroundColor: Colors.tanPrimary, borderBottomRightRadius: 4 },
  messageText: { color: Colors.whitePrimary, fontSize: 15, lineHeight: 21 },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: "#30302c",
    backgroundColor: Colors.backgroundSecondary,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#51514a",
    borderRadius: 15,
    color: Colors.whitePrimary,
    fontSize: 15,
    backgroundColor: Colors.backgroundPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.tanPrimary,
  },
  sendButtonDisabled: { opacity: 0.4 },
});