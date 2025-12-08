import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { Card } from '../components/ui/Card';
import { Colors } from '../constants/theme';
import { useAuth } from '../contexts/AuthProvider';
import { supabase } from '../lib/supabase';

export default function EditProfile() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.user_metadata?.phone_number || '');

    const handleUpdate = async () => {
        if (!fullName || !phoneNumber) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        setLoading(true);
        try {
            // 1. Update Public Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone_number: phoneNumber,
                })
                .eq('id', user?.id);

            if (profileError) throw profileError;

            // 2. Update Auth Metadata (for immediate UI reflection)
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: fullName,
                    phone_number: phoneNumber
                }
            });

            if (authError) throw authError;

            await refreshProfile();

            Alert.alert('Success', 'Profile updated successfully!', [
                {
                    text: 'OK',
                    onPress: () => {
                        router.back();
                    }
                }
            ]);

        } catch (error: any) {
            console.error(error);
            Alert.alert('Update Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Edit Profile</Text>
                <Text style={styles.subtitle}>Update your personal details below</Text>
            </View>

            <Card>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#64748B" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Full Name"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="call-outline" size={20} color="#64748B" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email (Read-only)</Text>
                    <View style={[styles.inputContainer, { backgroundColor: '#F1F5F9' }]}>
                        <Ionicons name="mail-outline" size={20} color="#94A3B8" style={styles.icon} />
                        <Text style={[styles.input, { color: '#64748B', paddingTop: 14 }]}>{user?.email}</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.actions}>
                <AnimatedButton
                    title="Save Changes"
                    onPress={handleUpdate}
                    isLoading={loading}
                />
                <AnimatedButton
                    title="Cancel"
                    onPress={() => router.back()}
                    variant="outline"
                    style={{ marginTop: 12 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
        padding: 20,
    },
    header: {
        marginBottom: 24,
        marginTop: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#64748B',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        height: '100%',
    },
    actions: {
        marginTop: 24,
    }
});
