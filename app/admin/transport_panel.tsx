import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card } from '../../components/ui/Card';
import { Colors, Shadows } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

// Analytics Component
const AnalyticsDashboard = ({ vehicles, drivers, todayTrips, driverTripCounts }: { vehicles: any[], drivers: any[], todayTrips: any[], driverTripCounts: Record<string, number> }) => {
    // 1. Fleet Utilization
    const totalVehicles = vehicles.length;
    const busyVehicles = vehicles.filter(v => todayTrips.find(t => t.assigned_vehicle_id === v.id)).length;
    const utilizationRate = totalVehicles > 0 ? (busyVehicles / totalVehicles) * 100 : 0;

    // 2. Top Driver
    const sortedDrivers = [...drivers].sort((a, b) => (driverTripCounts[b.id] || 0) - (driverTripCounts[a.id] || 0));
    const topDriver = sortedDrivers[0];
    const topDriverCount = topDriver ? (driverTripCounts[topDriver.id] || 0) : 0;

    return (
        <View style={styles.dashboardContainer}>
            {/* Fleet Status Card */}
            <Card style={styles.analyticsCard}>
                <View style={styles.analyticsHeader}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="pie-chart" size={20} color="#fff" />
                    </View>
                    <Text style={styles.analyticsTitle}>Fleet Utilization</Text>
                </View>

                <View style={styles.chartContainer}>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${utilizationRate}%` }]} />
                    </View>
                    <View style={styles.chartLabels}>
                        <Text style={styles.chartLabelText}>{Math.round(utilizationRate)}% In Use</Text>
                        <Text style={styles.chartValueText}>{busyVehicles} / {totalVehicles} Vehicles</Text>
                    </View>
                </View>
            </Card>

            <View style={styles.statsRow}>
                {/* Active Trips Badge */}
                <Card style={[styles.statCard, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.statCardLabel}>Active Trips</Text>
                    <Text style={styles.statCardValue}>{todayTrips.length}</Text>
                    <Ionicons name="pulse" size={16} color={Colors.light.primary} style={styles.statIcon} />
                </Card>

                {/* Top Driver Badge */}
                <Card style={[styles.statCard, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.statCardLabel}>Top Driver</Text>
                    <Text style={styles.statCardValueSmall} numberOfLines={1}>{topDriver?.full_name || 'N/A'}</Text>
                    <Text style={styles.statCardSub}>{topDriverCount} Rides</Text>
                    <Ionicons name="trophy" size={16} color="#F59E0B" style={styles.statIcon} />
                </Card>
            </View>
        </View>
    );
};

export default function TransportPanel() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');

    // Data State
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [todayTrips, setTodayTrips] = useState<any[]>([]); // For vehicle status
    const [driverTripCounts, setDriverTripCounts] = useState<Record<string, number>>({});

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Vehicle Form
    const [vehicleForm, setVehicleForm] = useState({ name: '', registration_number: '', type: '4-wheeler', capacity: '4' });
    // Driver Form
    const [driverForm, setDriverForm] = useState({ full_name: '', phone_number: '' });

    const fetchData = async () => {
        setLoading(true);

        // 1. Fetch Vehicles
        const { data: vehicleData } = await supabase.from('vehicles').select('*').order('name');

        // 2. Fetch Drivers
        const { data: driverData } = await supabase.from('drivers').select('*').order('full_name');

        // 3. Fetch Today's Active Trips (for Vehicle Status)
        const today = new Date().toISOString().split('T')[0];
        const { data: tripsData } = await supabase
            .from('requisitions')
            .select('*, profiles:requester_id(full_name), vehicle:assigned_vehicle_id(name)')
            .eq('status', 'approved')
            .gte('pickup_date', today);

        // 4. Fetch Total Trip Counts for Drivers (Historical)
        const { data: allTrips } = await supabase
            .from('requisitions')
            .select('assigned_driver_id')
            .eq('status', 'approved')
            .not('assigned_driver_id', 'is', null);

        const counts: Record<string, number> = {};
        allTrips?.forEach((t: any) => {
            counts[t.assigned_driver_id] = (counts[t.assigned_driver_id] || 0) + 1;
        });

        setVehicles(vehicleData || []);
        setDrivers(driverData || []);
        setTodayTrips(tripsData || []);
        setDriverTripCounts(counts);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    // --- Actions ---

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentId(null);
        if (activeTab === 'vehicles') {
            setVehicleForm({ name: '', registration_number: '', type: '4-wheeler', capacity: '4' });
        } else {
            setDriverForm({ full_name: '', phone_number: '' });
        }
        setModalVisible(true);
    };

    const handleEdit = (item: any) => {
        setIsEditing(true);
        setCurrentId(item.id);
        if (activeTab === 'vehicles') {
            setVehicleForm({
                name: item.name,
                registration_number: item.registration_number || '',
                type: item.type,
                capacity: item.capacity?.toString() || '4'
            });
        } else {
            setDriverForm({
                full_name: item.full_name,
                phone_number: item.phone_number || ''
            });
        }
        setModalVisible(true);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to remove ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const table = activeTab === 'vehicles' ? 'vehicles' : 'drivers';
                        const { error } = await supabase.from(table).delete().eq('id', id);
                        if (error) Alert.alert('Error', error.message);
                        else {
                            Alert.alert('Success', 'Item removed.');
                            fetchData();
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        let result;
        if (activeTab === 'vehicles') {
            if (!vehicleForm.name) return Alert.alert('Error', 'Name is required');
            const payload = { ...vehicleForm, capacity: parseInt(vehicleForm.capacity) || 4, status: 'active' };

            if (isEditing && currentId) {
                result = await supabase.from('vehicles').update(payload).eq('id', currentId);
            } else {
                result = await supabase.from('vehicles').insert(payload);
            }
        } else {
            if (!driverForm.full_name) return Alert.alert('Error', 'Name is required');
            const payload = { ...driverForm, status: 'active' };

            if (isEditing && currentId) {
                result = await supabase.from('drivers').update(payload).eq('id', currentId);
            } else {
                result = await supabase.from('drivers').insert(payload);
            }
        }

        if (result.error) {
            Alert.alert('Error', result.error.message);
        } else {
            Alert.alert('Success', 'Saved successfully.');
            setModalVisible(false);
            fetchData();
        }
    };

    // --- Renderers ---

    const renderVehicleCard = ({ item, index }: { item: any, index: number }) => {
        const trip = todayTrips.find(t => t.assigned_vehicle_id === item.id);
        const isAvailable = !trip;

        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Card>
                    <View style={styles.cardHeader}>
                        <View style={styles.iconBox}>
                            <Ionicons name={item.type === 'bus' ? 'bus' : 'car-sport'} size={24} color={Colors.light.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.titleText}>{item.name}</Text>
                            <Text style={styles.subText}>{item.registration_number || 'No Reg. #'}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: isAvailable ? '#D1FAE5' : '#FEF3C7', marginRight: 10 }]}>
                            <Text style={[styles.badgeText, { color: isAvailable ? '#10B981' : '#F59E0B' }]}>
                                {isAvailable ? 'Free' : 'Busy'}
                            </Text>
                        </View>
                        <RowActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id, item.name)} />
                    </View>
                    {!isAvailable && trip && (
                        <View style={styles.tripInfo}>
                            <View style={styles.divider} />
                            <Text style={styles.label}>Creating Trip:</Text>
                            <Text style={styles.infoText}>{trip.profiles?.full_name} • {trip.destination}</Text>
                        </View>
                    )}
                </Card>
            </Animated.View>
        );
    };

    const renderDriverCard = ({ item, index }: { item: any, index: number }) => {
        const tripCount = driverTripCounts[item.id] || 0;
        return (
            <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
                <Card>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconBox, { backgroundColor: '#F0F9FF', borderRadius: 20 }]}>
                            <Ionicons name="person" size={24} color="#0284C7" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.titleText}>{item.full_name}</Text>
                            <Text style={styles.subText}>{item.phone_number || 'No Phone'}</Text>
                        </View>
                        <View style={styles.statBadge}>
                            <Text style={styles.statNumber}>{tripCount}</Text>
                            <Text style={styles.statLabel}>Rides</Text>
                        </View>
                        <View style={{ width: 10 }} />
                        <RowActions onEdit={() => handleEdit(item)} onDelete={() => handleDelete(item.id, item.full_name)} />
                    </View>
                </Card>
            </Animated.View>
        );
    };

    const RowActions = ({ onEdit, onDelete }: { onEdit: () => void, onDelete: () => void }) => (
        <View style={{ flexDirection: 'row', gap: 4 }}>
            <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Transport Analytics', headerShown: true }} />

            <FlatList
                data={activeTab === 'vehicles' ? vehicles : drivers}
                keyExtractor={item => item.id}
                renderItem={activeTab === 'vehicles' ? renderVehicleCard : renderDriverCard}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View>
                        <AnalyticsDashboard
                            vehicles={vehicles}
                            drivers={drivers}
                            todayTrips={todayTrips}
                            driverTripCounts={driverTripCounts}
                        />

                        {/* Tabs */}
                        <View style={styles.tabsContainer}>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'vehicles' && styles.activeTab]}
                                onPress={() => setActiveTab('vehicles')}
                            >
                                <Text style={[styles.tabText, activeTab === 'vehicles' && styles.activeTabText]}>Vehicles</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tab, activeTab === 'drivers' && styles.activeTab]}
                                onPress={() => setActiveTab('drivers')}
                            >
                                <Text style={[styles.tabText, activeTab === 'drivers' && styles.activeTabText]}>Drivers</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Header Row */}
                        <View style={styles.headerRow}>
                            <Text style={styles.sectionTitle}>{activeTab === 'vehicles' ? 'Fleet Management' : 'Driver Roster'}</Text>
                            <TouchableOpacity onPress={handleAdd} style={styles.addBtn}>
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.addBtnText}>Add {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
            />

            {/* Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {isEditing ? 'Edit' : 'Add New'} {activeTab === 'vehicles' ? 'Vehicle' : 'Driver'}
                        </Text>

                        {activeTab === 'vehicles' ? (
                            <>
                                <Text style={styles.inputLabel}>Vehicle Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={vehicleForm.name}
                                    onChangeText={t => setVehicleForm({ ...vehicleForm, name: t })}
                                    placeholder="e.g. Kia, Bolero 1"
                                />
                                <Text style={styles.inputLabel}>Registration Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={vehicleForm.registration_number}
                                    onChangeText={t => setVehicleForm({ ...vehicleForm, registration_number: t })}
                                    placeholder="e.g. MP09 XX 1234"
                                />
                                {/* ... Type/Capacity inputs ... */}
                                <Text style={styles.inputLabel}>Type</Text>
                                <View style={styles.typeRow}>
                                    {['4-wheeler', 'bus'].map(t => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[styles.typeOption, vehicleForm.type === t && styles.typeSelected]}
                                            onPress={() => setVehicleForm({ ...vehicleForm, type: t })}
                                        >
                                            <Text style={[styles.typeText, vehicleForm.type === t && styles.typeTextSelected]}>{t}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.inputLabel}>Capacity</Text>
                                <TextInput
                                    style={styles.input}
                                    value={vehicleForm.capacity}
                                    onChangeText={t => setVehicleForm({ ...vehicleForm, capacity: t })}
                                    keyboardType="numeric"
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={driverForm.full_name}
                                    onChangeText={t => setDriverForm({ ...driverForm, full_name: t })}
                                    placeholder="Driver Name"
                                />
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <TextInput
                                    style={styles.input}
                                    value={driverForm.phone_number}
                                    onChangeText={t => setDriverForm({ ...driverForm, phone_number: t })}
                                    placeholder="+91..."
                                    keyboardType="phone-pad"
                                />
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmit} style={styles.saveBtn}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Header Actions
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.primary, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
    addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

    listContent: { padding: 20, paddingBottom: 100 },

    // Tabs
    tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 4, marginVertical: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: '#EFF6FF' },
    tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
    activeTabText: { color: Colors.light.primary, fontWeight: '700' },

    // Analytics Dashboard
    dashboardContainer: { marginBottom: 4 },
    analyticsCard: { padding: 0, overflow: 'hidden', marginBottom: 16, backgroundColor: Colors.light.primary },
    analyticsHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
    iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    analyticsTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
    chartContainer: { padding: 20 },
    progressBarBg: { height: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
    progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
    chartLabels: { flexDirection: 'row', justifyContent: 'space-between' },
    chartLabelText: { color: '#fff', fontSize: 24, fontWeight: '800' },
    chartValueText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500', marginTop: 8 },

    statsRow: { flexDirection: 'row' },
    statCard: { padding: 16, alignItems: 'flex-start', position: 'relative' },
    statCardLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 4 },
    statCardValue: { fontSize: 24, color: '#1E293B', fontWeight: '800' },
    statCardValueSmall: { fontSize: 18, color: '#1E293B', fontWeight: '700', marginBottom: 2 },
    statCardSub: { fontSize: 12, color: Colors.light.primary, fontWeight: '600' },
    statIcon: { position: 'absolute', top: 16, right: 16, opacity: 0.5 },

    // Card Styles (from before)
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
    titleText: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    subText: { fontSize: 12, color: '#64748B' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    iconBtn: { padding: 6 },
    tripInfo: { marginTop: 12 },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
    label: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
    infoText: { fontSize: 13, color: '#475569', marginTop: 2 },

    driverAvatar: { backgroundColor: '#F0F9FF', borderRadius: 100 },
    statBadge: { alignItems: 'center', backgroundColor: '#F8FAFC', padding: 4, borderRadius: 8, minWidth: 40 },
    statNumber: { fontWeight: '800', fontSize: 16, color: Colors.light.primary },
    statLabel: { fontSize: 10, color: '#64748B' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 24, ...Shadows.light.medium },
    modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.light.primary, marginBottom: 20, textAlign: 'center' },
    inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8, marginTop: 12 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, color: '#1E293B' },
    typeRow: { flexDirection: 'row', gap: 12 },
    typeOption: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    typeSelected: { backgroundColor: '#EFF6FF', borderColor: Colors.light.primary },
    typeText: { color: '#64748B', fontWeight: '600' },
    typeTextSelected: { color: Colors.light.primary },
    modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
    cancelBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' },
    saveBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: Colors.light.primary, alignItems: 'center' },
    cancelText: { fontWeight: '600', color: '#64748B' },
    saveText: { fontWeight: '600', color: '#fff' },
});
