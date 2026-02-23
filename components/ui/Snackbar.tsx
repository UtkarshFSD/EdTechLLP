import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, TouchableOpacity, View } from "react-native";

export type SnackbarType = "success" | "error";

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: SnackbarType;
  onHide: () => void;
}

const SLIDE_DURATION = 280;
const BOTTOM_OFFSET = Platform.OS === "ios" ? 48 : 24;

export function Snackbar({
  visible,
  message,
  type = "success",
  onHide,
}: SnackbarProps) {
  const translateY = useRef(new Animated.Value(120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 120,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const isSuccess = type === "success";

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      className="absolute left-4 right-4 z-50"
      style={{ bottom: BOTTOM_OFFSET, transform: [{ translateY }], opacity }}
    >
      <View
        className={`flex-row items-center rounded-xl px-4 py-[14px] gap-x-2.5 shadow-md ${
          isSuccess ? "bg-green-700" : "bg-red-600"
        }`}
      >
        <View
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSuccess ? "bg-green-300" : "bg-red-300"
          }`}
        />

        <Text
          className="flex-1 text-white text-sm font-medium leading-5"
          numberOfLines={2}
        >
          {message}
        </Text>

        <TouchableOpacity
          onPress={onHide}
          hitSlop={12}
          className="pl-1 shrink-0"
        >
          <Text className="text-white/80 text-sm font-semibold">✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
