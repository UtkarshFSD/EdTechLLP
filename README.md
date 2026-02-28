# easybuyApp - EdTech Edition 🎓

A professional EdTech mobile application built with **React Native** and **Expo**, featuring a seamless course catalog, offline capabilities, and high-performance list rendering.

## 🚀 Key Features

### 🔐 Authentication & Security

- **Secure Login/Register:** Fully integrated with `/api/v1/users` endpoints.
- **Persistence:** Tokens are securely stored using `Expo SecureStore`.
- **Auto-Login:** Instant access on app restart with valid token handling.
- **Token Refresh:** Automated logic to keep user sessions alive.
- **Profile Management:** Detailed profile screens with stats (courses, progress) and avatar updates.

### 📚 Course Catalog (Native)

- **Dynamic Data:** Fetches instructors from `randomusers` API and courses from `randomproducts`.
- **High Performance:** Optimized with `LegendList` for butter-smooth scrolling and memoized components.
- **Interactivity:** Pull-to-refresh, real-time search filtering, and detailed course views.
- **Enrollment:** Instant visual feedback upon course enrollment.

### 🌐 WebView Integration

- **Embedded Viewer:** A dedicated screen to display rich course content.
- **Local Templates:** Displays local HTML templates for specialized content.
- **Native-to-Web Comms:** Custom headers and communication bridge for personalized web content.

### 🔔 Native Features

- **Smart Notifications:** Triggers local notifications after bookmarking 5+ courses.
- **Retention Reminders:** Automated local notifications if the app isn't opened for 24 hours.

### 🛠 State & Error Handling

- **Global State:** Managed via a hybrid of `Expo SecureStore` (Auth) and `AsyncStorage` (Preferences/Bookmarks).
- **Offline Mode:** Instant `OfflineBanner` UI when network is lost.
- **Resilience:** Retry mechanisms and timeout handling for all API requests.

---

## 💻 Tech Stack

- **Framework:** [Expo SDK 54](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Navigation:** [Expo Router](https://docs.expo.dev/router/introduction/)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Performance:** [@legendapp/list](https://legendapp.com/open-source/list/)
- **Storage:** Expo SecureStore & AsyncStorage
- **WebView:** React Native WebView

---

## 🛠 Setup Instructions

1. **Clone the repository:**

   ```bash
   git clone https://github.com/UtkarshFSD/EdTechLLP.git
   cd easybuyApp
   ```

2. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server:**

   ```bash
   npx expo start
   ```

4. **Build APK (Android):**
   ```bash
   npx eas build -p android --profile preview
   ```

---

## 📂 Project Structure

- `/app`: Expo Router navigation and screens.
- `/components`: Reusable UI components (CourseCard, OfflineBanner, etc.).
- `/context`: Global state providers (Auth, Preferences, Snackbar).
- `/services`: API and business logic layers.
- `/types`: TypeScript definition for the domain model.
- `/assets`: Images, fonts, and local HTML templates.

---

Built with ❤️ by [UtkarshFSD](https://github.com/UtkarshFSD)
