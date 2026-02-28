import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PreferencesState {
  bookmarks: string[];
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
}

interface PreferencesContextValue {
  preferences: PreferencesState;
  toggleBookmark: (courseId: string) => Promise<void>;
  updateTheme: (theme: PreferencesState["theme"]) => Promise<void>;
  updateNotifications: (enabled: boolean) => Promise<void>;
  isBookmarked: (courseId: string) => boolean;
}

const PREFERENCES_KEY = "user_preferences";
const INITIAL_STATE: PreferencesState = {
  bookmarks: [],
  theme: "system",
  notificationsEnabled: true,
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<PreferencesState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newState: PreferencesState) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(newState));
      setPreferences(newState);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    }
  };

  const toggleBookmark = async (courseId: string) => {
    const isBookmarkedRow = preferences.bookmarks.includes(courseId);
    const newBookmarks = isBookmarkedRow
      ? preferences.bookmarks.filter((id) => id !== courseId)
      : [...preferences.bookmarks, courseId];

    await savePreferences({ ...preferences, bookmarks: newBookmarks });
  };

  const updateTheme = async (theme: PreferencesState["theme"]) => {
    await savePreferences({ ...preferences, theme });
  };

  const updateNotifications = async (enabled: boolean) => {
    await savePreferences({ ...preferences, notificationsEnabled: enabled });
  };

  const isBookmarked = (courseId: string) => {
    return preferences.bookmarks.includes(courseId);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        toggleBookmark,
        updateTheme,
        updateNotifications,
        isBookmarked,
      }}
    >
      {!isLoading && children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
