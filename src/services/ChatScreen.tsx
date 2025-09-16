import React, { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import { askBot } from "./openai";

type ChatScreenProps = {
  graphData?: any; // Replace 'any' with your actual GraphQL data type if you have it
};

export default function ChatScreen({ graphData }: ChatScreenProps) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    // Pass graphData to askBot
    const reply = await askBot(input, graphData);
    setResponse(reply);
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Ask the bot..."
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title="Send" onPress={sendMessage} />
      <Text style={{ marginTop: 20 }}>{response}</Text>
    </View>
  );
}