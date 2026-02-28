import React, { memo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Card } from "./Card";
import { Course } from "../../types/course";

interface CourseCardProps {
  item: Course;
  onPress: (id: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

export const CourseCard = memo(
  ({ item, onPress, isBookmarked, onToggleBookmark }: CourseCardProps) => {
    return (
      <TouchableOpacity
        onPress={() => onPress(item.id)}
        activeOpacity={0.7}
        className="mb-4"
      >
        <Card className="p-0 overflow-hidden">
          <Image
            source={{ uri: item.thumbnail }}
            className="w-full h-40"
            resizeMode="cover"
          />
          <View className="p-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 mr-2">
                <Text
                  className="text-lg font-bold text-gray-900"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text className="text-sm text-gray-500 mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
              <TouchableOpacity
                className="p-1"
                onPress={() => onToggleBookmark(item.id)}
              >
                <MaterialCommunityIcons
                  name={isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={24}
                  color="#2563eb"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mt-4">
              <Image
                source={{ uri: item.instructor?.picture.thumbnail }}
                className="w-8 h-8 rounded-full bg-gray-100"
              />
              <Text className="text-xs text-gray-600 ml-2 font-medium">
                {item.instructor?.name.first} {item.instructor?.name.last}
              </Text>
              <View className="flex-1" />
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                <Text className="text-xs font-bold text-gray-700 ml-1">
                  {item.rating}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.isBookmarked === nextProps.isBookmarked &&
      prevProps.item.rating === nextProps.item.rating &&
      prevProps.item.title === nextProps.item.title
    );
  },
);
