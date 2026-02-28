import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from "react-native";



type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
}



const variantStyles: Record<Variant, { container: string; label: string }> = {
  primary: {
    container: "bg-blue-600 active:bg-blue-700",
    label: "text-white font-semibold",
  },
  secondary: {
    container: "bg-gray-200 active:bg-gray-300",
    label: "text-gray-800 font-semibold",
  },
  outline: {
    container: "border border-blue-600 bg-transparent active:bg-blue-50",
    label: "text-blue-600 font-semibold",
  },
  ghost: {
    container: "bg-transparent active:bg-gray-100",
    label: "text-blue-600 font-semibold",
  },
  danger: {
    container: "bg-red-500 active:bg-red-600",
    label: "text-white font-semibold",
  },
};

const sizeStyles: Record<Size, { container: string; label: string }> = {
  sm: { container: "px-3 py-1.5 rounded-lg", label: "text-sm" },
  md: { container: "px-5 py-3 rounded-xl", label: "text-base" },
  lg: { container: "px-6 py-4 rounded-2xl", label: "text-lg" },
};



export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  labelClassName = "",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center gap-2
        ${variantStyles[variant].container}
        ${sizeStyles[size].container}
        ${isDisabled ? "opacity-50" : ""}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "outline" || variant === "ghost" ? "#2563eb" : "#fff"
          }
        />
      ) : (
        <>
          {leftIcon && <View>{leftIcon}</View>}
          <Text
            className={`
              ${variantStyles[variant].label}
              ${sizeStyles[size].label}
              ${labelClassName}
            `.trim()}
          >
            {label}
          </Text>
          {rightIcon && <View>{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
