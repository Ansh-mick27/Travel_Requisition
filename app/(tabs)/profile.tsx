import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert, Button, StyleSheet, Text, View } from 'react-native';
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>Email: {user?.email}</Text>
            <Text style={styles.info}>Role: {role}</Text>
            <Text style={styles.info}>Department: {user?.department || 'N/A'}</Text>

            <View style={{ marginTop: 20 }}>
                {role === 'admin' && (
                    <Button
                        title="Manage Pending Users"
                        onPress={() => router.push('/admin/user_approvals')}
                    />
                )}
                <View style={{ height: 10 }} />
                <Button title="Sign Out" onPress={handleSignOut} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
    },
});
