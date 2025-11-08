import { Slot, useRouter } from "expo-router";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import SafeScreen from "@/components/SafeScreen";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

const customTokenCache = {
  async getToken(key) {
    try {
      console.log('Getting token for key:', key);
      const token = await SecureStore.getItemAsync(key);
      console.log('Token retrieved:', token ? 'exists' : 'null');
      return token;
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      console.log('Saving token for key:', key);
      if (value === null) {
        console.log('Deleting token for key:', key);
        await SecureStore.deleteItemAsync(key);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
      console.log('Token operation completed successfully');
    } catch (err) {
      console.error('Error saving/deleting token:', err);
    }
  },
  async deleteToken(key) {
    try {
      console.log('Explicitly deleting token for key:', key);
      await SecureStore.deleteItemAsync(key);
      console.log('Token deleted successfully');
    } catch (err) {
      console.error('Error deleting token:', err);
    }
  },
};

const PUBLISHABLE_KEY = "pk_test_cG9zc2libGUtcHVtYS02My5jbGVyay5hY2NvdW50cy5kZXYk";

export default function RootLayout() {
  const router = useRouter();

  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      tokenCache={customTokenCache}
      signOut={{
        onSignOut: async () => {
          console.log('ClerkProvider onSignOut callback triggered');
          try {
            // Clear all authentication tokens
            await customTokenCache.deleteToken('clerk-db-jwt');
            await customTokenCache.deleteToken('clerk-js-session');
            console.log('All tokens cleared successfully');
            
            // Force navigation to sign-in
            router.replace("/(auth)/sign-in");
          } catch (error) {
            console.error('Error during token cleanup:', error);
          }
        },
      }}
    >
      <SafeScreen>
        <Slot />
      </SafeScreen>
    </ClerkProvider>
  );
}