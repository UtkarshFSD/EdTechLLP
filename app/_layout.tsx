import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { PreferencesProvider } from "../context/PreferencesContext";
import { SnackbarProvider } from "../context/SnackbarContext";
import { OfflineBanner } from "../components/ui";
import { View, ActivityIndicator } from "react-native";
import { notificationService } from "../services/notificationService";

function RootGuard() {
  const { token, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {

    notificationService.registerForNotifications();
    notificationService.scheduleInactivityReminder();

    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <OfflineBanner />
        <SnackbarProvider>
          <RootGuard />
        </SnackbarProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}
