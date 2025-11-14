import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MealAPI } from "../../services/mealAPI";
import { homeStyles } from "../../assets/styles/home.styles";
import { Image } from "expo-image";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import CategoryFilter from "../../components/filter";
import RecipeCard from "../../components/recipeCard";
import LoadingSpinner from "../../components/SpinnerLoad";
import IngredientRecipeSuggestions from "../../components/IngredientRecipeSuggestions";

const HomeScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredRecipe, setFeaturedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apiCategories, randomMeals, featuredMeal] = await Promise.all([
        MealAPI.getCategories(),
        MealAPI.getRandomMeals(12),
        MealAPI.getRandomMeal(),
      ]);

      const transformedCategories = apiCategories.map((cat, index) => ({
        id: index + 1,
        name: cat.strCategory,
        image: cat.strCategoryThumb,
        description: cat.strCategoryDescription,
      }));

      setCategories(transformedCategories);
      if (!selectedCategory) setSelectedCategory(transformedCategories[0]?.name);

      const transformedMeals = randomMeals
        .map(MealAPI.transformMealData)
        .filter(Boolean);
      setRecipes(transformedMeals);

      setFeaturedRecipe(MealAPI.transformMealData(featuredMeal));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryData = async (category) => {
    try {
      const meals = await MealAPI.filterByCategory(category);
      const transformed = meals.map(MealAPI.transformMealData).filter(Boolean);
      setRecipes(transformed);
    } catch (error) {
      console.error("Error loading category:", error);
      setRecipes([]);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    loadCategoryData(category);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !refreshing) {
    return <LoadingSpinner message="Loading delicious recipes..." />;
  }

  return (
    <FlatList
      data={[{ key: "content" }]}
      renderItem={() => (
        <View style={homeStyles.container}>
          {/* ANIMAL ICONS + CHATBOT */}
          <View style={homeStyles.welcomeSection}>
            <Image source={require("../../assets/images/lamb.png")} style={{ width: 100, height: 100 }} />
            <Image source={require("../../assets/images/chicken.png")} style={{ width: 100, height: 100 }} />
            <Image source={require("../../assets/images/pork.png")} style={{ width: 100, height: 100 }} />
            
          </View>

          {/* FEATURED */}
          {featuredRecipe && (
            <View style={homeStyles.featuredSection}>
              <TouchableOpacity
                style={homeStyles.featuredCard}
                onPress={() => router.push(`/recipe/${featuredRecipe.id}`)}
              >
                <View style={homeStyles.featuredImageContainer}>
                  <Image
                    source={{ uri: featuredRecipe.image }}
                    style={homeStyles.featuredImage}
                    contentFit="cover"
                    transition={500}
                  />
                  <View style={homeStyles.featuredOverlay}>
                    <View style={homeStyles.featuredBadge}>
                      <Text style={homeStyles.featuredBadgeText}>Featured</Text>
                    </View>
                    <View style={homeStyles.featuredContent}>
                      <Text style={homeStyles.featuredTitle} numberOfLines={2}>
                        {featuredRecipe.title}
                      </Text>
                      <View style={homeStyles.featuredMeta}>
                        <View style={homeStyles.metaItem}>
                          <Ionicons name="time-outline" size={16} color={COLORS.white} />
                          <Text style={homeStyles.metaText}>{featuredRecipe.cookTime}</Text>
                        </View>
                        <View style={homeStyles.metaItem}>
                          <Ionicons name="people-outline" size={16} color={COLORS.white} />
                          <Text style={homeStyles.metaText}>{featuredRecipe.servings}</Text>
                        </View>
                        {featuredRecipe.area && (
                          <View style={homeStyles.metaItem}>
                            <Ionicons name="location-outline" size={16} color={COLORS.white} />
                            <Text style={homeStyles.metaText}>{featuredRecipe.area}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          <IngredientRecipeSuggestions />

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          )}

          <View style={homeStyles.recipesSection}>
            <View style={homeStyles.sectionHeader}>
              <Text style={homeStyles.sectionTitle}>{selectedCategory}</Text>
            </View>

            {recipes.length > 0 ? (
              <FlatList
                data={recipes}
                renderItem={({ item }) => <RecipeCard recipe={item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={homeStyles.row}
                scrollEnabled={false}
              />
            ) : (
              <View style={homeStyles.emptyState}>
                <Ionicons name="restaurant-outline" size={64} color={COLORS.textLight} />
                <Text style={homeStyles.emptyTitle}>No recipes found</Text>
                <Text style={homeStyles.emptyDescription}>Try a different category</Text>
              </View>
            )}
          </View>
        </View>
      )}
      ListHeaderComponent={() => <View style={{ height: 20 }} />}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
};

export default HomeScreen;