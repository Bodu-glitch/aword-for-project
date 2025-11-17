import React from "react";
import { View, Text } from "react-native";
import { Link } from "expo-router";

const AdminIndex = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 12 }}>Admin index page</Text>
      <Link href="/admin/vocab">Go to Vocab</Link>
      <Link href="/admin/root">Go to Root</Link>
      <Link href="/admin/vocab_senses">Go to Vocab Senses</Link>
      <Link href="/admin/vocab_examples">Go to Vocab Examples</Link>
    </View>
  );
};

export default AdminIndex;
