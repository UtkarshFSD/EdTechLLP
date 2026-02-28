import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { courseService } from "../../../services/courseService";
import { Course } from "../../../types/course";
import { useSnackbar } from "../../../context/SnackbarContext";
import { usePreferences } from "../../../context/PreferencesContext";
import { CourseCard } from "../../../components/ui";

export default function CourseListScreen() {
  const router = useRouter();
  const { showError } = useSnackbar();
  const { isBookmarked, toggleBookmark } = usePreferences();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCourses = useCallback(async () => {
    try {
      const data = await courseService.getCatalog();
      setCourses(data);
    } catch (err: any) {
      showError(err.message || "Failed to load courses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showError]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query) ||
        c.instructor?.name.first.toLowerCase().includes(query) ||
        c.instructor?.name.last.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

  const handlePressCourse = useCallback(
    (id: number) => {
      router.push(`/(tabs)/courses/${id}`);
    },
    [router],
  );

  const handleToggleBookmark = useCallback(
    (id: number) => {
      toggleBookmark(id.toString());
    },
    [toggleBookmark],
  );

  const renderCourse = useCallback(
    ({ item }: { item: Course }) => (
      <CourseCard
        item={item}
        onPress={handlePressCourse}
        isBookmarked={isBookmarked(item.id.toString())}
        onToggleBookmark={handleToggleBookmark}
      />
    ),
    [handlePressCourse, isBookmarked, handleToggleBookmark],
  );

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      
      <View className="bg-white px-6 pt-16 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          Course Catalog
        </Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2">
          <MaterialCommunityIcons name="magnify" size={20} color="#9ca3af" />
          <TextInput
            placeholder="Search courses or instructors..."
            className="flex-1 ml-2 text-sm text-gray-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <LegendList
        data={filteredCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 32,
        }}
        onRefresh={onRefresh}
        refreshing={refreshing}
        estimatedItemSize={250}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <MaterialCommunityIcons
              name="book-search-outline"
              size={64}
              color="#d1d5db"
            />
            <Text className="text-gray-500 mt-4 text-base">
              No courses found
            </Text>
          </View>
        }
      />
    </View>
  );
}
