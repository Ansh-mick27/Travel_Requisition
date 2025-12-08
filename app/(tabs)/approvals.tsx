import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Approvals() {
    const { user, role, isHOD, isAdmin } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            let query = supabase.from('requisitions').select('*, profiles:requester_id(full_name, department)');

            if (isHOD) {
                query = query.eq('status', 'pending_hod');
            } else if (isAdmin) {
                query = query.in('status', ['pending_hod', 'pending_admin']);
            }

            const { data, error } = await query;
            if (error) throw error;

            let filteredData = data || [];

            if (isHOD && user?.department) {
                filteredData = filteredData.filter(req => req.profiles?.department === user.department);
            }

            setRequests(filteredData);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [isHOD, isAdmin, user])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
        >
            <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/approval/${item.id}`)}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {item.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.requesterName}>{item.profiles?.full_name || 'Unknown User'}</Text>
                            <Text style={styles.departmentName}>{item.profiles?.department || 'No Dept'}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.row}>
                        <Ionicons name="calendar-outline" size={16} color={Colors.light.primary} />
                        <Text style={styles.metaText}>{new Date(item.pickup_date).toLocaleDateString()}</Text>

                        <View style={styles.dot} />

                        <Ionicons name="location-outline" size={16} color={Colors.light.primary} />
                        <Text style={styles.metaText}>{item.destination}</Text>
                    </View>

                    <Text style={styles.purposeText} numberOfLines={2}>
                        {item.purpose}
                    </Text>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.actionText}>Review Request</Text>
                    <Ionicons name="arrow-forward" size={16} color={Colors.light.primary} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Pending Approvals</Text>
            </View>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>All caught up! No pending approvals.</Text>
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
    headerContainer: {
        padding: 20,
        paddingBottom: 10,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    listContent: {
        padding: 20,
        paddingTop: 10,
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    avatarText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    requesterName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    departmentName: {
        fontSize: 12,
        color: '#64748B',
    },
    cardBody: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 8,
    },
    metaText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 6,
        fontWeight: '500',
    },
    purposeText: {
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: 12,
        backgroundColor: '#F8FAFC',
        gap: 4,
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.primary,
        textTransform: 'uppercase',
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
