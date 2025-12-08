import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function UserApprovals() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (userId: string) => {
        const { data, error, count } = await supabase
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', userId)
            .select('*');

        if (error) {
            console.error('Approval Error:', error);
            Alert.alert('Error', error.message);
        } else {
            if ((data && data.length === 0) && (count === null || count === 0)) {
                Alert.alert('Warning', 'Update seemed to fail (0 rows affected). Check Admin permissions.');
                return;
            }

            Alert.alert(
                'Success',
                'User approved successfully.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Optimistic Update: Remove from list immediately
                            setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));

                            // Re-fetch in background to ensure sync
                            setTimeout(() => {
                                fetchPendingUsers();
                            }, 500);
                        }
                    }
                ]
            );
        }
    };

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {item.full_name?.[0]?.toUpperCase() || 'U'}
                    </Text>
                </View>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{item.full_name}</Text>
                    <Text style={styles.role}>{item.role?.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApprove(item.id)}
                >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{item.email}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="business-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{item.department}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="school-outline" size={16} color="#64748B" />
                    <Text style={styles.detailText}>{item.college_name || 'N/A'}</Text>
                </View>
            </View>
        </Animated.View>
    );

    if (loading) return (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Pending Users', headerShown: true }} />

            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Pending Users</Text>
            </View>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No pending users found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
    },
    backButton: {
        marginRight: 15,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    listContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        ...Shadows.light.medium,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    headerInfo: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    role: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.primary,
        marginTop: 2,
    },
    approveButton: {
        backgroundColor: '#10B981',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        gap: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 13,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    cardBody: {
        padding: 16,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#64748B',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#94A3B8',
    },
});
