import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Card } from '../../components/ui/Card';
import { Colors, Shadows } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Profile() {
    const { user, role } = useAuth();

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (err) {
            console.error('Sign out error:', err);
            Alert.alert(
                "Sign Out Failed",
                "Could not reach the server. Do you want to force sign out locally?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Force Sign Out",
                        onPress: async () => {
                            await AsyncStorage.removeItem('supabase-auth-token');
                            router.replace('/(auth)/login');
                        }
                    }
                ]
            );
        }
    };

    const renderInfoRow = (icon: any, label: string, value: string | undefined) => (
        <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={20} color={Colors.light.primary} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value || 'Not set'}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {user?.email?.[0].toUpperCase() || 'U'}
                    </Text>
                </View>
                <Text style={styles.userName}>
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
                </View>
            </View>

            <Card title="Personal Information">
                {renderInfoRow('mail-outline', 'Email Address', user?.email)}
                {renderInfoRow('business-outline', 'Department', user?.user_metadata?.department)}
                {renderInfoRow('school-outline', 'College', user?.user_metadata?.college_name)}
            </Card>

            <View style={styles.actionsContainer}>
                {role === 'admin' && (
                    <AnimatedButton
                        title="Manage Pending Users"
                        onPress={() => router.push('/admin/user_approvals')}
                        variant="secondary"
                        style={{ marginBottom: 12 }}
                        icon={<Ionicons name="people-outline" size={20} color="#fff" style={{ marginRight: 8 }} />}
                    />
                )}

                <AnimatedButton
                    title="Edit Profile"
                    onPress={() => router.push('/edit-profile')}
                    variant="secondary"
                    style={{ marginBottom: 12 }}
                    icon={<Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />}
                />

                <AnimatedButton
                    title="Sign Out"
                    onPress={handleSignOut}
                    variant="outline"
                    icon={<Ionicons name="log-out-outline" size={20} color={Colors.light.primary} style={{ marginRight: 8 }} />}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: Colors.light.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EFF6FF', // Light Blue
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#fff',
        ...Shadows.light.medium,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: Colors.light.primary,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        color: Colors.light.primary,
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    actionsContainer: {
        marginTop: 24,
    },
});
