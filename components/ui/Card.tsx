import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  
  onPress?: () => void;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export function Card({
  title,
  subtitle,
  children,
  onPress,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  ...rest
}: CardProps) {
  const container = (
    <View
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}
      {...rest}
    >
      
      {(title || subtitle) && (
        <View
          className={`px-4 pt-4 pb-2 border-b border-gray-100 ${headerClassName}`}
        >
          {title && (
            <Text className="text-base font-semibold text-gray-900">
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
          )}
        </View>
      )}

      
      <View className={`p-4 ${bodyClassName}`}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {container}
      </TouchableOpacity>
    );
  }

  return container;
}
