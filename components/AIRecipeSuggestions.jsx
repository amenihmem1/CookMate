import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { COLORS } from "../constants/colors";
import { generateFromOllama } from "../services/ollamaService";

const THEMES = [
  "Quick Meals",
  "Healthy Options",
  "Sweet Cravings",
  "Mediterranean",
  "Asian Fusion",
  "Vegetarian",
  "Breakfast",
  "Party Food",
  "Seafood",
];

export default function AIRecipeSuggestions() {
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [activeTheme, setActiveTheme] = useState(null);

  const handleThemeClick = async (theme) => {
    setLoading(true);
    setActiveTheme(theme);

    const prompt = `
      Génère 5 recettes pour le thème "${theme}".
      Pour chaque recette, fournis :
      - title
      - short description
      Format en JSON :
      {
        "Recipes": [
          {"title": "...", "description": "..."},
          ...
        ]
      }
    `;

    try {
      // Appel au service Ollama
      const rawResponse = await generateFromOllama({
        model: "llama2",
        prompt,
        max_tokens: 500,
      });

      let parsed = [];
      try {
        // 1️⃣ Parser la réponse brute d'Ollama
        const ollamaData = JSON.parse(rawResponse);

        // 2️⃣ Extraire la string JSON contenue dans "response"
        const recipesJson = ollamaData.response;

        // 3️⃣ Parser la string JSON pour obtenir le tableau "Recipes"
        const recipesData = JSON.parse(recipesJson);
        parsed = recipesData.Recipes || [];
      } catch (err) {
        console.error("Error parsing Ollama response:", err, rawResponse);
        parsed = [];
      }

      setRecipes(parsed);
    } catch (err) {
      console.error("Error generating recipes:", err);
      setRecipes([]);
    } finally {
      setLoading(false);
      setActiveTheme(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RecipeBot</Text>

      {/* Themes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.themeScroll}
      >
        {THEMES.map((theme, index) => (
          <TouchableOpacity
            key={index.toString()}
            onPress={() => handleThemeClick(theme)}
            style={[
              styles.themeButton,
              activeTheme === theme && { backgroundColor: COLORS.primary },
            ]}
            disabled={loading}
          >
            <Text
              style={[
                styles.themeText,
                activeTheme === theme && { color: "white" },
              ]}
            >
              {theme}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}

      {/* No recipes */}
      {!loading && recipes.length === 0 && (
        <Text style={styles.noRecipes}>No recipes yet.</Text>
      )}

      {/* Recipes list */}
      <FlatList
        data={recipes}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeDesc}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  themeScroll: {
    marginBottom: 16,
  },
  themeButton: {
    padding: 12,
    backgroundColor: COLORS.background,
    marginRight: 8,
    borderRadius: 8,
  },
  themeText: {
    color: COLORS.text,
  },
  noRecipes: {
    color: COLORS.textLight,
    marginTop: 16,
    textAlign: "center",
  },
  recipeCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  recipeTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  recipeDesc: {
    color: COLORS.textLight,
    marginTop: 4,
  },
});
