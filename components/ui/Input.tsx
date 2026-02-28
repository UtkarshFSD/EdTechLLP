import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  isPassword = false,
  containerClassName = "",
  inputClassName = "",
  labelClassName = "",
  errorClassName = "",
  ...rest
}: InputProps) {
  const [visible, setVisible] = useState(false);

  const hasError = Boolean(error);

  return (
    <View className={`gap-1 ${containerClassName}`}>
      
      {label && (
        <Text className={`text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
        </Text>
      )}

      
      <View
        className={`
          flex-row items-center
          border rounded-xl px-3 py-2.5 bg-white
          ${hasError ? "border-red-500" : "border-gray-300"}
        `.trim()}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}

        <TextInput
          className={`flex-1 text-base text-gray-900 ${inputClassName}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !visible}
          {...rest}
        />

        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            className="ml-2"
          >
            <Text className="text-xs text-blue-600">
              {visible ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !isPassword && <View className="ml-2">{rightIcon}</View>}
      </View>

      
      {hasError && (
        <Text className={`text-xs text-red-500 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
