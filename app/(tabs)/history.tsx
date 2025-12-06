import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

type Requisition = {
    id: string;
    pickup_date: string;
    pickup_time: string;
    destination: string;
    status: string;
    purpose: string;
    vehicle_type: string;
};

export default function History() {
    const { user } = useAuth();
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequisitions = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('requisitions')
                .select('*')
                .eq('requester_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequisitions(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequisitions();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#10B981';
            case 'rejected': return '#EF4444';
            case 'pending_hod': return '#F59E0B';
            case 'pending_admin': return '#3B82F6';
            default: return '#64748B';
        }
    };

    const renderItem = ({ item, index }: { item: Requisition; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            layout={Layout.springify()}
            style={styles.card}
        >
            <View style={styles.cardHeader}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={16} color={Colors.light.primary} />
                    <Text style={styles.dateText}>{new Date(item.pickup_date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.replace('_', ' ').toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Ionicons name="location-outline" size={18} color="#64748B" style={styles.icon} />
                    <Text style={styles.destinationText}>{item.destination}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.pickup_time.slice(0, 5)}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="car-outline" size={16} color="#94A3B8" />
                        <Text style={styles.metaText}>{item.vehicle_type || 'Any'}</Text>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    if (loading) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Your Requests</Text>
            </View>
            <FlatList
                data={requisitions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="documents-outline" size={64} color="#CBD5E1" />
                        <Text style={styles.emptyText}>No requisitions found.</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardBody: {
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    destinationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 12,
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
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
