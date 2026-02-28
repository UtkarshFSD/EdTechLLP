import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Set up notification handler safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.warn(
    "Notifications: Failed to set handler (likely running in Expo Go Android)",
    error,
  );
}

export const notificationService = {
  async registerForNotifications() {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for local notification!");
        return false;
      }

      if (Platform.OS === "android") {
        try {
          await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        } catch (e) {
          console.warn("Notifications: Failed to set channel", e);
        }
      }

      return true;
    } catch (error) {
      console.warn("Notifications: Registration failed", error);
      return false;
    }
  },

  async sendMilestoneNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Course Enthusiast! 📚",
          body: "Wow! You've bookmarked 5 or more courses. Ready to start learning?",
          data: { screen: "Courses" },
        },
        trigger: null,
      });
    } catch (error) {
      console.warn(
        "Notifications: Failed to schedule milestone notification",
        error,
      );
    }
  },

  async scheduleInactivityReminder() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "We miss you! 👋",
          body: "It's been 24 hours since your last visit. Check out what's new in the course catalog!",
          data: { screen: "Courses" },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 24 * 60 * 60,
          repeats: false,
        } as Notifications.TimeIntervalTriggerInput,
      });
    } catch (error) {
      console.warn(
        "Notifications: Failed to schedule inactivity reminder",
        error,
      );
    }
  },
};
