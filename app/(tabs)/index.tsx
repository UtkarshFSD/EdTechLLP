import { View, Text, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { Button } from "../../components/ui";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useSnackbar();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            showSuccess("You have been logged out.");
          } catch {
            showError("Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 px-6 pt-16">
      {/* Greeting */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900">
          Hello, {user?.name ?? "there"} 👋
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{user?.email}</Text>
      </View>

      {/* Placeholder content */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-base">
          Your home screen content goes here
        </Text>
      </View>

      {/* Logout */}
      <Button
        label="Logout"
        variant="outline"
        onPress={handleLogout}
        className="mb-8"
      />
    </View>
  );
}
