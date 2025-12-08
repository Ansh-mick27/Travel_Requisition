import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, Shadows } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

// Premium Components
const InfoRow = ({ icon, label, value, isLast = false }: { icon: string; label: string; value: string; isLast?: boolean }) => (
    <View style={[styles.infoRow, isLast && styles.lastInfoRow]}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={20} color={Colors.light.primary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

export default function ApprovalDetail() {
    const { id } = useLocalSearchParams();
    const { user, isHOD, isAdmin } = useAuth();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState('');

    // Admin specific state
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [drivers, setDrivers] = useState<any[]>([]);
    const [selectedDriver, setSelectedDriver] = useState('');

    useEffect(() => {
        fetchRequestDetails();
        if (isAdmin) {
            fetchVehicles();
            fetchDrivers();
        }
    }, [id]);

    const fetchRequestDetails = async () => {
        const { data, error } = await supabase
            .from('requisitions')
            .select('*, profiles:requester_id(full_name, department, phone_number, college_name, hod_name, director_name)')
            .eq('id', id)
            .single();

        if (error) console.error(error);
        else setRequest(data);
        setLoading(false);
    };

    const fetchVehicles = async () => {
        const { data } = await supabase.from('vehicles').select('*').eq('status', 'active');
        if (data) setVehicles(data);
    };

    const fetchDrivers = async () => {
        const { data } = await supabase.from('drivers').select('*').eq('status', 'active');
        if (data) setDrivers(data);
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        setLoading(true);
        try {
            const updates: any = {};

            if (isHOD) {
                updates.hod_id = user.id;
                updates.hod_action_date = new Date().toISOString();
                updates.hod_remarks = remarks;
                updates.status = action === 'approve' ? 'pending_admin' : 'rejected';
            } else if (isAdmin) {
                if (action === 'approve') {
                    if (!selectedVehicle) {
                        Alert.alert('Error', 'Please assign a vehicle.');
                        setLoading(false);
                        return;
                    }
                    if (!selectedDriver) {
                        Alert.alert('Error', 'Please assign a driver.');
                        setLoading(false);
                        return;
                    }
                    updates.assigned_vehicle_id = selectedVehicle;
                    updates.assigned_driver_id = selectedDriver;
                }
                updates.admin_id = user.id;
                updates.admin_action_date = new Date().toISOString();
                updates.admin_remarks = remarks;
                updates.status = action === 'approve' ? 'approved' : 'rejected';
            }

            const { error } = await supabase
                .from('requisitions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;

            // SMS Logic
            if (isAdmin && action === 'approve' && request.profiles?.phone_number) {
                const isAvailable = await SMS.isAvailableAsync();
                if (isAvailable) {
                    const vehicleName = vehicles.find(v => v.id === selectedVehicle)?.name || 'Vehicle';
                    const driverObj = drivers.find(d => d.id === selectedDriver);
                    const driverName = driverObj?.full_name || 'Driver';
                    const driverPhone = driverObj?.phone_number || 'N/A';

                    const message = `Travel Requisition Approved!\nVehicle: ${vehicleName}\nDriver: ${driverName} (${driverPhone})\nPickup: ${request.pickup_time}`;

                    await SMS.sendSMSAsync(
                        [request.profiles.phone_number],
                        message
                    );
                }
            }

            Alert.alert('Success', `Request ${action}d successfully!`, [
                { text: 'OK', onPress: () => router.replace('/(tabs)/approvals') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !request) return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <Stack.Screen options={{ title: 'Review Request', headerShown: true }} />

            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/approvals')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
                <Text style={styles.pageTitle}>Review Request</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Requester Details Card */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="person" size={20} color={Colors.light.primary} />
                        <Text style={styles.cardTitle}>Requester Details</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <InfoRow icon="person-outline" label="Name" value={request.profiles?.full_name} />
                        <InfoRow icon="business-outline" label="Department" value={request.profiles?.department} />
                        <InfoRow icon="school-outline" label="College" value={request.profiles?.college_name || 'N/A'} />
                        <InfoRow icon="call-outline" label="Phone" value={request.profiles?.phone_number || 'N/A'} isLast />
                    </View>
                </Animated.View>

                {/* Trip Details Card */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="car-sport" size={20} color={Colors.light.primary} />
                        <Text style={styles.cardTitle}>Trip Details</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <InfoRow icon="calendar-outline" label="Date" value={request.pickup_date} />
                        <InfoRow icon="time-outline" label="Time" value={`${request.pickup_time} - ${request.drop_time}`} />
                        <InfoRow icon="location-outline" label="Destination" value={request.destination} />
                        <InfoRow icon="briefcase-outline" label="Purpose" value={`${request.purpose} (${request.category})`} />
                        <View style={[styles.infoRow, styles.lastInfoRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="document-text-outline" size={20} color={Colors.light.primary} />
                                </View>
                                <Text style={styles.infoLabel}>Description</Text>
                            </View>
                            <Text style={[styles.infoValue, { marginLeft: 34 }]}>{request.purpose_description}</Text>
                        </View>
                    </View>
                </Animated.View>

                {isAdmin && (
                    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="construct" size={20} color={Colors.light.primary} />
                            <Text style={styles.cardTitle}>Assignment</Text>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.inputLabel}>Assign Vehicle</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedVehicle}
                                    onValueChange={(itemValue: string) => setSelectedVehicle(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Vehicle" value="" enabled={false} />
                                    {vehicles.map(v => (
                                        <Picker.Item key={v.id} label={`${v.name} (${v.type})`} value={v.id} />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={[styles.inputLabel, { marginTop: 15 }]}>Assign Driver</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedDriver}
                                    onValueChange={(itemValue: string) => setSelectedDriver(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Driver" value="" enabled={false} />
                                    {drivers.map(d => (
                                        <Picker.Item key={d.id} label={d.full_name} value={d.id} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </Animated.View>
                )}

                <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="chatbox" size={20} color={Colors.light.primary} />
                        <Text style={styles.cardTitle}>Remarks</Text>
                    </View>
                    <TextInput
                        style={styles.textArea}
                        value={remarks}
                        onChangeText={setRemarks}
                        placeholder="Add your comments here..."
                        multiline
                        numberOfLines={4}
                    />
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleAction('reject')}
                        disabled={loading}
                    >
                        <Ionicons name="close-circle" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleAction('approve')}
                        disabled={loading}
                    >
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 10,
        backgroundColor: Colors.light.background,
    },
    backButton: {
        marginRight: 15,
        padding: 4,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.light.primary,
    },
    scrollContent: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        ...Shadows.light.medium,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        gap: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    lastInfoRow: {
        marginBottom: 0,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F0F9FF',
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
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F8FAFC',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    textArea: {
        padding: 16,
        fontSize: 15,
        color: '#334155',
        minHeight: 100,
        textAlignVertical: 'top',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 15,
        marginTop: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        ...Shadows.light.small,
    },
    approveButton: {
        backgroundColor: '#10B981',
    },
    rejectButton: {
        backgroundColor: '#EF4444',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
