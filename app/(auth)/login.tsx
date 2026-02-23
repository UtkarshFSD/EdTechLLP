import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { Button } from "../../components/ui";
import { Input } from "../../components/ui";
import { ApiError } from "../../services/api";

export default function LoginScreen() {
  const { login } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = "Username is required";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(username.trim(), password);
      showSuccess("Welcome back! You are now logged in.");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Login failed. Try again.";
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
        {/* Header */}
        <View className="mb-10">
          <Text className="text-3xl font-bold text-gray-900">Welcome back</Text>
          <Text className="text-base text-gray-500 mt-2">
            Sign in to continue shopping
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="Username"
            placeholder="utkarshrai"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            error={errors.username}
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
            label="Login"
            onPress={handleLogin}
            loading={loading}
            className="mt-2"
          />
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-8 gap-1">
          <Text className="text-gray-500">Don't have an account?</Text>
          <Link href="/(auth)/register">
            <Text className="text-blue-600 font-semibold">Register</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
