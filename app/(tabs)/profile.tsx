import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { Button, Card } from "../../components/ui";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout, updateAvatar } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const stats = [
    { label: "Courses Enrolled", value: "12", icon: "book-open-variant" },
    { label: "Completed", value: "4", icon: "check-circle-outline" },
    { label: "Progress", value: "65%", icon: "trending-up" },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            showSuccess("Logged out successfully.");
          } catch {
            showError("Logout failed.");
          }
        },
      },
    ]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your gallery to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUpdatingAvatar(true);
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("avatar", { uri, name: filename, type } as any);

      await updateAvatar(formData);
      showSuccess("Profile picture updated!");
    } catch (err: any) {
      showError(err.message || "Failed to update profile picture.");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-6 pt-16 pb-8 border-b border-gray-100">
        <View className="items-center">
          <View className="relative">
            <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center overflow-hidden border-2 border-blue-50">
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-bold text-blue-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={pickImage}
              disabled={updatingAvatar}
              className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-sm"
            >
              {updatingAvatar ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <MaterialCommunityIcons name="camera" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mt-4">
            {user?.username}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">{user?.email}</Text>
          <View className="bg-blue-50 px-3 py-1 rounded-full mt-3">
            <Text className="text-xs font-semibold text-blue-700 uppercase">
              {user?.role}
            </Text>
          </View>
        </View>
      </View>

      <View className="px-6 py-8">
        <Text className="text-lg font-bold text-gray-900 mb-4">
          Your Statistics
        </Text>
        <View className="flex-row flex-wrap gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="flex-1 min-w-[140px] p-4 items-center">
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mb-2">
                <MaterialCommunityIcons
                  name={stat.icon as any}
                  size={20}
                  color="#4b5563"
                />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {stat.value}
              </Text>
              <Text className="text-xs text-gray-500 text-center">
                {stat.label}
              </Text>
            </Card>
          ))}
        </View>
      </View>

      <View className="px-6 pb-8">
        <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-50">
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={22}
              color="#4b5563"
            />
            <Text className="flex-1 ml-3 text-gray-700">Edit Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#d1d5db"
            />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-4 py-4 border-b border-gray-50">
            <MaterialCommunityIcons
              name="bell-outline"
              size={22}
              color="#4b5563"
            />
            <Text className="flex-1 ml-3 text-gray-700">Notifications</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#d1d5db"
            />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center px-4 py-4">
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={22}
              color="#4b5563"
            />
            <Text className="flex-1 ml-3 text-gray-700">
              Privacy & Security
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#d1d5db"
            />
          </TouchableOpacity>
        </View>

        <Button
          label="Logout"
          variant="outline"
          onPress={handleLogout}
          className="mt-8"
        />
      </View>
    </ScrollView>
  );
}
