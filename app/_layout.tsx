import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AnimatedSplashScreen } from '../components/AnimatedSplashScreen';
import { LanguageProvider } from '../contexts/LanguageContext';
import '../global.css';

// Keep the native splash screen showing while React Native warms up
SplashScreen.preventAutoHideAsync();

// Disable OS font scaling so the device's "larger text" / Dynamic Type setting
// can't break the app's fixed layout and typography.
type FontScalable = { defaultProps?: { allowFontScaling?: boolean } };
(Text as unknown as FontScalable).defaultProps = {
  ...(Text as unknown as FontScalable).defaultProps,
  allowFontScaling: false,
};
(TextInput as unknown as FontScalable).defaultProps = {
  ...(TextInput as unknown as FontScalable).defaultProps,
  allowFontScaling: false,
};

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
    <LanguageProvider>
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
                <View className="ml-1 flex-row items-center">
                  <Image
                    source={require('../assets/images/cuida-logo-transparent.png')}
                    style={{ width: 30, height: 30 }}
                    resizeMode="contain"
                  />
                  <Text className="ml-1.5 text-2xl font-bold text-[#E2725B]">
                    Cuida
                  </Text>
                </View>
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
    </LanguageProvider>
  );
}
