import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { db } from "../firebaseConfig/config";


export default function Notes({ route }) {
  const { categoryId, categoryName, mainCatName} = route.params; // Parametreleri alıyoruz
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{categoryName} Alt Kategorileri:</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subcategoryCard: {
    backgroundColor: "#FFDDC1",
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  subcategoryText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
