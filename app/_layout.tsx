import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { GameProvider, useGame } from '../src/context/GameContext';
import { PedometerProvider } from '../src/context/PedometerContext';
import { RealtimeProvider } from '../src/context/RealtimeContext';
import { colors } from '../src/theme/colors';
import { VitaMascot } from '../src/components/mascot/VitaMascot';

SplashScreen.preventAutoHideAsync();

const SPLASH_DURATION = 3500;

function AuthGate() {
  const { hydrated, isAuthenticated } = useGame();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    const firstSegment: string | undefined = segments[0];
    const inAuthFlow = firstSegment === 'login';

    if (!isAuthenticated && !inAuthFlow) {
      router.replace('/login');
    } else if (isAuthenticated && inAuthFlow) {
      router.replace('/(tabs)');
    }
  }, [hydrated, isAuthenticated, segments, router]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    SplashScreen.hideAsync();
    const timer = setTimeout(() => setSplashDone(true), SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded || !splashDone) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameProvider>
          <PedometerProvider>
            <RealtimeProvider>
              <AuthGate />
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="mission/[id]"
                  options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                    title: 'Missao',
                    headerShown: false,
                  }}
                />
              </Stack>
            </RealtimeProvider>
          </PedometerProvider>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function LoadingScreen() {
  const vitaOpacity = useSharedValue(0.15);
  const vitaScale = useSharedValue(0.92);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(12);

  useEffect(() => {
    vitaOpacity.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.cubic) });
    vitaScale.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.cubic) });

    titleOpacity.value = withDelay(800, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    titleTranslateY.value = withDelay(800, withTiming(0, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, []);

  const vitaStyle = useAnimatedStyle(() => ({
    opacity: vitaOpacity.value,
    transform: [{ scale: vitaScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  return (
    <View style={loadingStyles.container}>
      <StatusBar style="light" />
      <Animated.View style={vitaStyle}>
        <VitaMascot size={180} expression="happy" />
      </Animated.View>
      <Animated.View style={titleStyle}>
        <Text style={loadingStyles.title}>WellMe</Text>
        <Text style={loadingStyles.subtitle}>Sua jornada de saude</Text>
      </Animated.View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    fontSize: 32,
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    textAlign: 'center',
  },
});
