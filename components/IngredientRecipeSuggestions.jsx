import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { COLORS } from "../constants/colors";
import { generateFromOllama } from "../services/ollamaService";
import { MealAPI } from "../services/mealAPI";

export default function IngredientRecipeSuggestions() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateRecipes = async () => {
    if (!ingredients.trim()) {
      setErrorMsg("Veuillez saisir au moins un ingrédient");
      return;
    }

    setLoading(true);
    setRecipes([]);
    setErrorMsg("");

    const ingredientsArray = ingredients.split(",").map((i) => i.trim().toLowerCase());

    try {
      let mealDBRecipes = [];
      for (const ing of ingredientsArray) {
        const meals = await MealAPI.filterByIngredient(ing);
        if (meals && meals.length) {
          const transformed = meals.map((m) => ({
            title: m.strMeal,
            description: `Recette de ${m.strMeal}`,
          }));
          mealDBRecipes = [...mealDBRecipes, ...transformed];
        }
      }

      let ollamaRecipes = [];
      try {
        const prompt = `
          J'ai ces ingrédients : ${ingredients}.
          Propose une recette simples à réaliser uniquement avec ces ingrédients.
          Pour chaque recette, fournis :
          - title
          - short description
          Format JSON :
          {
            "Recipes": [
              {"title": "...", "description": "..."},
              ...
            ]
          }
        `;
        const response = await generateFromOllama({
          model: "llama2",
          prompt,
          max_tokens: 500,
        });

        if (typeof response === "string") {
          try {
            const parsed = JSON.parse(response);
            ollamaRecipes = parsed.Recipes || [];
          } catch {
            ollamaRecipes = [{ title: "Recette ", description: response }];
          }
        } else {
          ollamaRecipes = response;
        }
      } catch (err) {
        console.warn("Ollama indisponible", err);
      }

      const combined = [...mealDBRecipes, ...ollamaRecipes];

      if (combined.length === 0) {
        setErrorMsg(
          "Aucune recette trouvée pour ces ingrédients.\nAssure-toi que les ingrédients sont corrects."
        );
      }

      setRecipes(combined);
    } catch (err) {
      console.error("Erreur génération recettes :", err);
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeCard = ({ item }) => (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      <Text style={styles.recipeDesc}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recettes selon vos ingrédients</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex: poulet, tomates, riz"
        value={ingredients}
        onChangeText={setIngredients}
      />

      <TouchableOpacity style={styles.button} onPress={handleGenerateRecipes} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Génération..." : "Générer recettes"}</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color={COLORS.primary} />}

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={renderRecipeCard}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8F8F8" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  recipeCard: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeTitle: { fontWeight: "bold", fontSize: 18, color: "#222", marginBottom: 6 },
  recipeDesc: { fontSize: 14, color: "#666", lineHeight: 20 },
  errorText: { color: "red", marginTop: 16, textAlign: "center", fontSize: 16 },
});
