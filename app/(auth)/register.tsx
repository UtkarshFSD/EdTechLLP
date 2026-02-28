import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link, router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { Button } from "../../components/ui";
import { Input } from "../../components/ui";
import { ApiError } from "../../services/api";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Username is required";
    else if (username.trim().length < 3) e.username = "Minimum 3 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password);
      showSuccess("Account created! Please log in to continue.");
      router.replace("/(auth)/login");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Registration failed. Try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">
            Create account
          </Text>
          <Text className="text-base text-gray-500 mt-2">
            Join EasyBuy and start shopping
          </Text>
        </View>

        <View className="gap-4">
          <Input
            label="Username"
            placeholder="johndoe"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            error={errors.username}
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            error={errors.password}
          />

          <Button
            label="Create Account"
            onPress={handleRegister}
            loading={loading}
            className="mt-2"
          />
        </View>

        <View className="flex-row justify-center mt-8 gap-1">
          <Text className="text-gray-500">Already have an account?</Text>
          <Link href="/(auth)/login">
            <Text className="text-blue-600 font-semibold">Login</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
