import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Shadows } from '../../constants/theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    title?: string;
}

export const Card = ({ children, style, title }: CardProps) => {
    return (
        <View style={[styles.card, style]}>
            {title && <Text style={styles.title}>{title}</Text>}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.light.card,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        ...Shadows.light.medium,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.primary,
        marginBottom: 16,
        letterSpacing: 0.5,
    }
});
