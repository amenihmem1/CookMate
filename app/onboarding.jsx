import React, { useEffect } from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OnboardingScreen() { const router = useRouter();
   const handleGetStarted = async () => { await AsyncStorage.setItem("hasSeenOnboarding", "true"); 
  router.replace("/authentification/signin"); };

  
  return (
    <ImageBackground
      source={require("../assets/images/recipe.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>
          Experience the Joy{"\n"}of Cooking in Every{"\n"}Delicious Recipe!
        </Text>

        <Text style={styles.subtitle}>
          Explore new flavors and create unforgettable meals that delight your senses.{"\n"}
          Discover, cook, and share recipes with your friends and family.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "flex-end" },
  overlay: { padding: 30, backgroundColor: "rgba(0,0,0,0.5)" },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subtitle: { color: "#ddd", fontSize: 14, textAlign: "center", marginBottom: 30 },
  button: { backgroundColor: "#FF9F1C", paddingVertical: 15, borderRadius: 30 },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 18, fontWeight: "bold" },
});
