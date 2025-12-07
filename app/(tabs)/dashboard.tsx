import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
    const { user, role } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });
    const [fleetStats, setFleetStats] = useState({ total: 0, booked: 0, free: 0 });

    const fetchStats = useCallback(async () => {
        if (!user) return;

        // User Stats
        const { data, error } = await supabase
            .from('requisitions')
            .select('status')
            .eq('requester_id', user.id);

        if (data && !error) {
            const pending = data.filter(r => r.status.includes('pending')).length;
            const approved = data.filter(r => r.status === 'approved').length;
            setStats({ pending, approved, total: data.length });
        }

        // Fleet Stats (Global)
        const { count: totalVehicles } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        const today = new Date().toISOString().split('T')[0];
        const { count: bookedVehicles } = await supabase
            .from('requisitions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
            .gte('pickup_date', today); // Approximating booked as approved requests from today onwards

        const total = totalVehicles || 0;
        const booked = bookedVehicles || 0;
        setFleetStats({ total, booked, free: total - booked });

    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const renderStatCard = (icon: any, label: string, count: number, color: string, bgColor: string) => (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.statCount}>{count}</Text>
            <Text style={[styles.statLabel, { color: color }]}>{label}</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcomeText}>Welcome back,</Text>
                        <Text style={styles.userName}>{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</Text>
                    </View>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{role?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    {renderStatCard('time', 'Pending', stats.pending, '#F59E0B', '#FEF3C7')}
                    {renderStatCard('checkmark-circle', 'Approved', stats.approved, '#10B981', '#D1FAE5')}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <View style={styles.actionsGrid}>
                    <AnimatedButton
                        title="New Request"
                        onPress={() => router.push('/(tabs)/create')}
                        style={styles.actionButton}
                        icon={<Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 8 }} />}
                    />

                    {(role === 'hod' || role === 'admin') && (
                        <AnimatedButton
                            title="Approvals"
                            onPress={() => router.push('/(tabs)/approvals')}
                            style={[styles.actionButton, { marginTop: 12 }]}
                            icon={<Ionicons name="documents-outline" size={24} color="#fff" style={{ marginRight: 8 }} />}
                        />
                    )}

                    {role === 'admin' && (
                        <AnimatedButton
                            title="Transport Panel"
                            onPress={() => router.push('/admin/transport_panel')}
                            style={[styles.actionButton, { marginTop: 12, backgroundColor: Colors.light.secondary }]}
                            icon={<Ionicons name="analytics-outline" size={24} color="#fff" style={{ marginRight: 8 }} />}
                        />
                    )}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>System Status</Text>
                </View>

                <TouchableOpacity
                    onPress={() => role === 'admin' && router.push('/admin/transport_panel')}
                    activeOpacity={role === 'admin' ? 0.7 : 1}
                >
                    <Card>
                        <View style={styles.infoRow}>
                            <Ionicons name="car-sport-outline" size={24} color={Colors.light.primary} />
                            <View style={styles.infoContent}>
                                <Text style={styles.infoTitle}>Fleet Status</Text>
                                <Text style={styles.infoDesc}>
                                    <Text style={{ fontWeight: '700', color: Colors.light.primary }}>{fleetStats.free}</Text> Free •
                                    <Text style={{ fontWeight: '700', color: '#F59E0B' }}> {fleetStats.booked}</Text> Booked •
                                    <Text style={{ fontWeight: '700' }}> {fleetStats.total}</Text> Total
                                </Text>
                            </View>
                            {role === 'admin' && <Ionicons name="chevron-forward" size={20} color="#94A3B8" />}
                        </View>
                    </Card>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
    },
    welcomeText: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    roleBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        gap: 15,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'flex-start',
    },
    statIconContainer: {
        padding: 8,
        borderRadius: 10,
        marginBottom: 12,
    },
    statCount: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    actionsGrid: {
        marginBottom: 30,
    },
    actionButton: {
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
        marginLeft: 15,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 2,
    },
    infoDesc: {
        fontSize: 14,
        color: '#64748B',
    },
});
