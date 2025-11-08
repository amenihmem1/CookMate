// Stack : pour définir une pile de navigation (pile d'écrans)
import { Redirect, Stack } from "expo-router";

// On importe le hook useAuth depuis Clerk pour gérer l'authentification
import { useAuth } from "@clerk/clerk-expo";

export default function AuthRoutesLayout() {
  // On récupère l'état d'authentification de l'utilisateur
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href={"/tabs"} />;

  // screenOptions={{ headerShown: false }} : on cache la barre d'en-tête
  return <Stack screenOptions={{ headerShown: false }} />;
}
