import React, { useMemo, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function CourseViewerScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const { user, token } = useAuth();


  const htmlTemplate = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            color: #1f2937;
            line-height: 1.6;
            background-color: #f9fafb;
          }
          .card {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #111827; font-size: 24px; margin-bottom: 8px; }
          .instructor { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
          .content-block { margin-bottom: 24px; }
          .header-info {
            background: #eff6ff;
            padding: 12px;
            border-radius: 8px;
            font-size: 12px;
            color: #1e40af;
            border: 1px solid #bfdbfe;
          }
          .badge {
            display: inline-block;
            background: #dcfce7;
            color: #166534;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        <div class="badge">Course Content</div>
        <h1>${title || "Course Material"}</h1>
        <p class="instructor">Course ID: ${id}</p>

        <div class="card">
          <div class="content-block">
            <h3>Module 1: Introduction</h3>
            <p>Welcome to this course! In this module, we will explore the fundamentals and set the stage for your learning journey.</p>
          </div>
          <div class="content-block">
            <h3>Module 2: Advanced Concepts</h3>
            <p>Dive deep into complex topics and master the skills required to excel in this field.</p>
          </div>
        </div>

        <div class="header-info">
          <strong>🔒 Security & Context Info</strong><br/>
          This viewer is communicating with the native app. <br/>
          Authenticated as: <strong>${user?.username || "Guest"}</strong>
        </div>

        <script>

          console.log("WebView loaded for course: ${id}");
        </script>
      </body>
    </html>
  `,
    [id, title, user],
  );

  const [webViewError, setWebViewError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  const handleReload = () => {
    setWebViewError(null);
    webViewRef.current?.reload();
  };

  if (webViewError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color="#ef4444"
          />
          <Text style={styles.errorText}>Failed to load course content</Text>
          <Text style={styles.errorSubtext}>{webViewError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="close" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Content Viewer
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{
          html: htmlTemplate,
          headers: {
            "X-Course-Id": id as string,
            "X-User-Token": token || "",
            "X-Platform": "iOS",
          },
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setWebViewError(nativeEvent.description);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setWebViewError(`HTTP Error: ${nativeEvent.statusCode}`);
        }}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 10, color: "#6b7280" }}>
              Loading content...
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    bg: "#fff",
  } as any,
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  backButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
