import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { courseService } from "../../../services/courseService";
import { Course } from "../../../types/course";
import { useSnackbar } from "../../../context/SnackbarContext";
import { Button } from "../../../components/ui";

const BOOKMARKS_KEY = "course_bookmarks";

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catalog = await courseService.getCatalog();
        const found = catalog.find((c) => c.id.toString() === id);
        if (found) {
          setCourse(found);
          const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
          if (bookmarks) {
            const list = JSON.parse(bookmarks);
            setIsBookmarked(list.includes(found.id));
          }
        }
      } catch (err: any) {
        showError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, showError]);

  const toggleBookmark = async () => {
    if (!course) return;
    try {
      const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
      let list = bookmarks ? JSON.parse(bookmarks) : [];
      if (isBookmarked) {
        list = list.filter((b: number) => b !== course.id);
      } else {
        list.push(course.id);
      }
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(list));
      setIsBookmarked(!isBookmarked);
      showSuccess(
        isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      );


      if (!isBookmarked && list.length >= 5) {
        const {
          notificationService,
        } = require("../../../services/notificationService");
        notificationService.sendMilestoneNotification();
      }
    } catch {
      showError("Failed to update bookmarks");
    }
  };

  const handleEnroll = async () => {
    setEnrolling(true);

    setTimeout(() => {
      setEnrolling(false);
      showSuccess("Enrolled in course successfully!");
    }, 1500);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-gray-500 text-center">Course not found</Text>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1">
        
        <View className="relative">
          <Image
            source={{ uri: course.thumbnail }}
            className="w-full h-72"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-12 left-6 bg-white/90 w-10 h-10 rounded-full items-center justify-center shadow-sm"
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#1f2937"
            />
          </TouchableOpacity>
        </View>

        <View className="px-6 py-6">
          
          <View className="flex-row justify-between items-start">
            <Text className="text-2xl font-bold text-gray-900 flex-1 mr-4">
              {course.title}
            </Text>
            <TouchableOpacity onPress={toggleBookmark} className="p-1">
              <MaterialCommunityIcons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={28}
                color="#2563eb"
              />
            </TouchableOpacity>
          </View>

          
          <View className="flex-row items-center mt-6 p-4 bg-gray-50 rounded-2xl">
            <Image
              source={{ uri: course.instructor?.picture.medium }}
              className="w-12 h-12 rounded-full border border-white"
            />
            <View className="ml-3">
              <Text className="text-sm font-bold text-gray-900">
                {course.instructor?.name.title} {course.instructor?.name.first}{" "}
                {course.instructor?.name.last}
              </Text>
              <Text className="text-xs text-gray-500">Course Instructor</Text>
            </View>
            <View className="flex-1" />
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-blue-700">Expert</Text>
            </View>
          </View>

          
          <View className="flex-row justify-around py-6 mt-2 border-b border-gray-100">
            <View className="items-center">
              <MaterialCommunityIcons name="star" size={20} color="#fbbf24" />
              <Text className="text-sm font-bold text-gray-900 mt-1">
                {course.rating}
              </Text>
              <Text className="text-xs text-gray-500">Rating</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#10b981"
              />
              <Text className="text-sm font-bold text-gray-900 mt-1">
                12h 45m
              </Text>
              <Text className="text-xs text-gray-500">Duration</Text>
            </View>
            <View className="items-center">
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color="#6366f1"
              />
              <Text className="text-sm font-bold text-gray-900 mt-1">
                2.5k+
              </Text>
              <Text className="text-xs text-gray-500">Students</Text>
            </View>
          </View>

          
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/courses/viewer",
                params: { id: course.id, title: course.title },
              })
            }
            className="mt-6 flex-row items-center justify-center bg-blue-50 py-4 rounded-xl border border-blue-100"
          >
            <MaterialCommunityIcons
              name="play-circle-outline"
              size={24}
              color="#2563eb"
            />
            <Text className="ml-2 font-bold text-blue-700">
              View Course Content (WebView)
            </Text>
          </TouchableOpacity>

          
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Description
            </Text>
            <Text className="text-sm text-gray-600 leading-6">
              {course.description}. This course covers everything you need to
              know about the subject. Learn from industry experts and get
              hands-on experience with real-world projects.
            </Text>
          </View>
        </View>
      </ScrollView>

      
      <View className="px-6 py-4 border-t border-gray-100 bg-white flex-row items-center">
        <View className="mr-6">
          <Text className="text-xs text-gray-500">Total Price</Text>
          <Text className="text-2xl font-bold text-gray-900">
            ${course.price}
          </Text>
        </View>
        <Button
          label="Enroll Now"
          onPress={handleEnroll}
          loading={enrolling}
          className="flex-1"
        />
      </View>
    </View>
  );
}
