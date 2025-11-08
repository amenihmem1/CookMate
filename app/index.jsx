import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

// Route root depending on auth state to avoid direct access to /tabs when
// unauthenticated and to stop redirect loops.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return null;

  if (isSignedIn) return <Redirect href="/tabs" />;

  return <Redirect href="/authentification/signin" />;
}
