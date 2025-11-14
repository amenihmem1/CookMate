import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSignIn } from "@clerk/clerk-expo";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { authStyles } from "../../assets/styles/authentification.styles";
import { COLORS } from "../../constants/colors";

const SignInScreen = () => {
  const router = useRouter();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guardLoading, setGuardLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding").then((value) => {
      if (value !== "true") {
        router.replace("/onboarding");
      } else {
        setGuardLoading(false);
      }
    });
  }, []);

  if (guardLoading) return null; 

 const handleSignIn = async () => {
  if (!email || !password) {
    Alert.alert("Error", "Please fill in all fields");
    return;
  }

  if (!isLoaded) return;

  setLoading(true);

  try {
    const signInAttempt = await signIn.create({ identifier: email, password });

    if (signInAttempt.status === "complete") {
      await setActive({ session: signInAttempt.createdSessionId });
      router.replace("/tabs"); // redirection après login
    } else {
      // Cas rare où le status n'est pas 'complete' mais pas d'erreur explicite
      Alert.alert("Error", "Sign in failed. Please check your credentials.");
      console.error(JSON.stringify(signInAttempt, null, 2));
    }
  } catch (err) {
    // Ici on capture les erreurs connues de Clerk (email/mdp incorrect, utilisateur non trouvé, etc.)
    let message = "Sign in failed. Please try again.";

    if (err.errors && err.errors.length > 0) {
      const code = err.errors[0].code;
      if (code === "authentication_failed") {
        message = "Email or password is incorrect.";
      } else if (code === "not_found") {
        message = "Account not found. Please sign up first.";
      } else {
        message = err.errors[0].message;
      }
    }

    Alert.alert("Error", message);
    console.error(JSON.stringify(err, null, 2));
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={authStyles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={authStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={authStyles.imageContainer}>
            <Image
              source={require("../../assets/images/i1.png")}
              style={authStyles.image}
              contentFit="contain"
            />
          </View>

          <Text style={authStyles.title}>Welcome Back</Text>

          <View style={authStyles.formContainer}>
            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter email"
                placeholderTextColor={COLORS.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={authStyles.inputContainer}>
              <TextInput
                style={authStyles.textInput}
                placeholder="Enter password"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={authStyles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[authStyles.authButton, loading && authStyles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={authStyles.buttonText}>{loading ? "Signing In..." : "Sign In"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={authStyles.linkContainer} onPress={() => router.push("/authentification/signup")}>
              <Text style={authStyles.linkText}>
                Don&apos;t have an account? <Text style={authStyles.link}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignInScreen;
