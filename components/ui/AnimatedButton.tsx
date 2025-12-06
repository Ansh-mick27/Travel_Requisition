import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/theme';

export interface AnimatedButtonProps {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    style?: any;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
}

export const AnimatedButton = ({ title, onPress, isLoading, style, variant = 'primary', icon }: AnimatedButtonProps) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        scale.value = withSpring(1);
    };

    const getBackgroundColor = () => {
        if (variant === 'secondary') return Colors.light.secondary;
        if (variant === 'outline') return 'transparent';
        return Colors.light.primary;
    };

    const getTextColor = () => {
        if (variant === 'outline') return Colors.light.primary;
        return '#fff';
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
            style={({ pressed }) => [style, { opacity: pressed ? 0.9 : 1 }]}
        >
            <Animated.View style={[styles.container, animatedStyle, { backgroundColor: getBackgroundColor() }, variant === 'outline' && styles.outline]}>
                {isLoading ? (
                    <ActivityIndicator color={getTextColor()} />
                ) : (
                    <View style={styles.contentContainer}>
                        {icon && <View style={styles.iconContainer}>{icon}</View>}
                        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
                    </View>
                )}
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.light.small,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: 8,
    },
    outline: {
        borderWidth: 2,
        borderColor: Colors.light.primary,
        backgroundColor: 'transparent',
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
