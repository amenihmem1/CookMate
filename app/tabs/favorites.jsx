import { View, Text, Alert, ScrollView, TouchableOpacity, FlatList } from "react-native";
import { useClerk, useUser, useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { API_URL } from "../../constants/api";
import { favoritesStyles } from "../../assets/styles/favorites.style.js";
import { COLORS } from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import RecipeCard from "../../components/recipeCard.jsx";
import NoFavoritesFound from "../../components/NoFavoritesFound.jsx";
import LoadingSpinner from "../../components/SpinnerLoad.jsx";

const FavoritesScreen = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/favorites/${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch favorites");

        const favorites = await response.json();

        // transform the data to match the RecipeCard component's expected format
        const transformedFavorites = favorites.map((favorite) => ({
          ...favorite,
          id: favorite.recipeId,
        }));

        setFavoriteRecipes(transformedFavorites);
      } catch (error) {
        console.log("Error loading favorites", error);
        Alert.alert("Error", "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user.id]);

  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    console.log('Attempting to sign out...');
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            console.log('User confirmed logout, signing out...');
            try {
              console.log('Checking auth state:', { isLoaded, isSignedIn });
              console.log('Calling signOut method...');
              await signOut();
              console.log('Signed out successfully');
              
              // Force navigation to sign-in screen
              router.replace("/(auth)/sign-in");
            } catch (error) {
              console.error('Error signing out:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              Alert.alert(
                "Error",
                "Failed to sign out. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  // Temporary helper to test signOut without Alert (useful for debugging)
  const directSignOut = async () => {
    console.log('Direct signOut invoked (bypassing Alert)');
    try {
      await signOut();
      console.log('Direct signOut completed');
      router.replace("/(auth)/sign-in");
    } catch (err) {
      console.error('Direct signOut failed:', err);
      Alert.alert('Error', 'Direct sign out failed. See logs.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading your favorites..." />;

  return (
    <View style={favoritesStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={favoritesStyles.header}>
          <Text style={favoritesStyles.title}>Favorites</Text>
          
          {/* Quick debug button (development only) */}
          {__DEV__ && (
            <TouchableOpacity
              style={[favoritesStyles.logoutButton, { marginLeft: 12 }]}
              onPress={directSignOut}
            >
              <Ionicons name="log-out-outline" size={22} color={COLORS.text} />

            </TouchableOpacity>
          )}
        </View>

        <View style={favoritesStyles.recipesSection}>
          <FlatList
            data={favoriteRecipes}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={favoritesStyles.row}
            contentContainerStyle={favoritesStyles.recipesGrid}
            scrollEnabled={false}
            ListEmptyComponent={<NoFavoritesFound />}
          />
        </View>
      </ScrollView>
    </View>
  );
};
export default FavoritesScreen;