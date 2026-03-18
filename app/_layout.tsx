import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import '../global.css';

// Keep the native splash screen showing while React Native warms up
SplashScreen.preventAutoHideAsync();

const CuidaTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#C2185B',
    background: '#fff6e8',
    card: '#fff6e8',
    text: '#4E342E',
    border: '#D7CCC8',
  },
};

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Perform API calls, DB checks, font loading here if needed
        // await new Promise(resolve => setTimeout(resolve, 200));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Return null so the native splash holds until we say so
  }

  return (
    <ThemeProvider value={CuidaTheme}>
      <View className="flex-1">
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: '',
              headerStyle: { backgroundColor: CuidaTheme.colors.background },
              headerShadowVisible: false,
              headerLeft: () => (
                <Text className="ml-1 text-2xl font-bold text-[#C2185B]">
                  Cuida
                </Text>
              ),
              headerRight: () => (
                <Link href="/settings" asChild>
                  <TouchableOpacity activeOpacity={0.7} className="mr-1 p-1">
                    <MaterialCommunityIcons name="cog-outline" size={24} color="#6D4C41" />
                  </TouchableOpacity>
                </Link>
              ),
            }}
          />
          <Stack.Screen
            name="know-your-rights"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              animation: 'fade', // provides a smoother transition
            }}
          />
          <Stack.Screen
            name="volunteer"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="feedback"
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
        </Stack>
        {!splashAnimationComplete && (
          <AnimatedSplashScreen
            onAnimationComplete={() => setSplashAnimationComplete(true)}
          />
        )}
      </View>
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </ThemeProvider>
  );
}
