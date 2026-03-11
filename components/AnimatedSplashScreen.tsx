import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
    runOnJS,
    withDelay,
} from 'react-native-reanimated';
import * as SplashScreen from 'expo-splash-screen';

interface AnimatedSplashScreenProps {
    onAnimationComplete: () => void;
}

export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Hide the native splash screen once our animated wrapper is mounted and ready
        // From this point forward, the React Native Animated View is indistinguishable from the native one
        SplashScreen.hideAsync();

        // Fade out the splash background
        opacity.value = withDelay(
            400, // Small delay so the user registers the logo before it flies away
            withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) })
        );

        // Zoom the logo out massively (scale 1 -> 50)
        scale.value = withDelay(
            400,
            withTiming(50, { duration: 700, easing: Easing.inOut(Easing.ease) }, () => {
                // Notify the parent layout once the animation is 100% finished to unmount the view
                runOnJS(onAnimationComplete)();
            })
        );
    }, [opacity, scale, onAnimationComplete]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <Animated.View style={[StyleSheet.absoluteFill, styles.container, animatedStyle]}>
            <Animated.Image
                source={require('../assets/images/splash-icon.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ffffff', // Must perfectly match the app.json native splash color
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Guarantee it stays above the navigation stack
    },
    image: {
        width: 200, // Must perfectly match the app.json imageWidth
        height: 200,
    },
});
