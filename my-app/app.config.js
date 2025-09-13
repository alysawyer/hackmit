export default {
  expo: {
    name: "my-app",
    slug: "my-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "This app uses location to detect nearby users and facilitate encounters.",
          locationAlwaysPermission: "This app uses location to detect nearby users and facilitate encounters in the background.",
          locationWhenInUsePermission: "This app uses location to detect nearby users and facilitate encounters.",
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      // Firebase Configuration - Updated with your actual values
      EXPO_PUBLIC_FB_API_KEY: process.env.EXPO_PUBLIC_FB_API_KEY || "AIzaSyB4x-VMjUzrKkvrvpo6Fhc4ngukq1Hk_KM",
      EXPO_PUBLIC_FB_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN || "hackmit-3752f.firebaseapp.com",
      EXPO_PUBLIC_FB_DATABASE_URL: process.env.EXPO_PUBLIC_FB_DATABASE_URL || "https://hackmit-3752f-default-rtdb.firebaseio.com/",
      EXPO_PUBLIC_FB_PROJECT_ID: process.env.EXPO_PUBLIC_FB_PROJECT_ID || "hackmit-3752f",
      EXPO_PUBLIC_FB_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET || "hackmit-3752f.firebasestorage.app",
      EXPO_PUBLIC_FB_MSG_SENDER_ID: process.env.EXPO_PUBLIC_FB_MSG_SENDER_ID || "283952690804",
      EXPO_PUBLIC_FB_APP_ID: process.env.EXPO_PUBLIC_FB_APP_ID || "1:283952690804:web:bbae57ded4f60fe5a0c321"
    }
  }
};
