import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SelectionModal } from '../../components/ui/SelectionModal';
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
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showDriverModal, setShowDriverModal] = useState(false);

    useEffect(() => {
        fetchRequestDetails();
    }, [id]);

    // Fetch resources only after request details are loaded (need date/time for availability)
    useEffect(() => {
        if (isAdmin && request) {
            fetchVehicles();
            fetchDrivers();
        }
    }, [isAdmin, request]);

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
        if (!request) return;

        // 1. Fetch all active vehicles
        const { data: allVehicles, error: vError } = await supabase
            .from('vehicles')
            .select('*')
            .eq('status', 'active');

        if (vError || !allVehicles) {
            console.error('Error fetching vehicles:', vError);
            return;
        }

        // 2. Fetch approved requisitions for the same date
        const { data: conflicts, error: rError } = await supabase
            .from('requisitions')
            .select('assigned_vehicle_id, pickup_time, drop_time')
            .eq('status', 'approved')
            .eq('pickup_date', request.pickup_date);

        if (rError) {
            console.error('Error fetching conflicts:', rError);
            setVehicles(allVehicles); // Fallback to showing all
            return;
        }

        // 3. Filter out conflicts
        // Request Times
        // parseDateTime helper (Manual Parsing for stability)
        const parseDateTime = (dateStr: string, timeStr: string) => {
            try {
                // Expected format: YYYY-MM-DD and HH:MM:SS (or HH:MM)
                const [y, m, d] = dateStr.split('-').map(Number);
                const timeParts = timeStr.split(':');
                const hours = Number(timeParts[0]);
                const minutes = Number(timeParts[1]);
                const seconds = timeParts[2] ? Number(timeParts[2]) : 0;

                return new Date(y, m - 1, d, hours, minutes, seconds);
            } catch (e) {
                // Fallback
                return new Date(`${dateStr}T${timeStr}`);
            }
        };

        const fetchVehicles = async () => {
            if (!request) return;

            // 1. Fetch all active vehicles
            const { data: allVehicles, error: vError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('status', 'active');

            if (vError || !allVehicles) {
                console.error('Error fetching vehicles:', vError);
                return;
            }

            // 2. Fetch approved requisitions for the same date
            const { data: conflicts, error: rError } = await supabase
                .from('requisitions')
                .select('id, assigned_vehicle_id, pickup_time, drop_time')
                .eq('status', 'approved')
                .eq('pickup_date', request.pickup_date);

            if (rError) {
                console.error('Error fetching conflicts:', rError);
                setVehicles(allVehicles);
                return;
            }

            // 3. Filter out conflicts
            let reqStart = parseDateTime(request.pickup_date, request.pickup_time);
            const reqEnd = parseDateTime(request.pickup_date, request.drop_time);

            // Pragmatic Start: If today, don't check conflicts in the past relative to now.
            const now = new Date();
            const isToday = reqStart.toDateString() === now.toDateString();

            // BUFFER: Add 1 minute to "Now" to avoid edge cases where "Now" is exactly equal to DropTime
            if (isToday && reqStart < now) {
                reqStart = now;
            }

            const availableVehicles = allVehicles.filter(v => {
                const hasConflict = conflicts?.some(booking => {
                    if (booking.assigned_vehicle_id !== v.id) return false;

                    const existingStart = parseDateTime(request.pickup_date, booking.pickup_time);
                    const existingEnd = parseDateTime(request.pickup_date, booking.drop_time);

                    // Check Overlap
                    // We strictly check: (NewStart < OldEnd) AND (NewEnd > OldStart)
                    const isOverlap = (reqStart < existingEnd) && (reqEnd > existingStart);
                    return isOverlap;
                });

                return !hasConflict;
            });

            setVehicles(availableVehicles);
        };

        // ... fetchDrivers code ...

        // ... handleAction code ...

        if (loading || !request) return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
        );

        return (
            <View style={styles.mainContainer}>
                <Stack.Screen options={{ title: 'Review Request', headerShown: true, headerBackTitle: 'Back' }} />

                {/* Custom Header Removed - Using Native Header */}

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
                                {/* Vehicle Selection */}
                                <Text style={styles.inputLabel}>Assign Vehicle</Text>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowVehicleModal(true)}
                                >
                                    <Text style={[styles.pickerButtonText, !selectedVehicle && styles.placeholderText]}>
                                        {selectedVehicle
                                            ? (() => {
                                                const v = vehicles.find(v => v.id === selectedVehicle);
                                                return `${v?.name} (${v?.type})`;
                                            })()
                                            : 'Select Vehicle'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#64748B" />
                                </TouchableOpacity>

                                <SelectionModal
                                    visible={showVehicleModal}
                                    title="Select Vehicle"
                                    options={vehicles.map(v => ({ label: `${v.name} (${v.type})`, value: v.id }))}
                                    onSelect={setSelectedVehicle}
                                    onClose={() => setShowVehicleModal(false)}
                                    selectedValue={selectedVehicle}
                                />

                                {/* Driver Selection */}
                                <Text style={[styles.inputLabel, { marginTop: 15 }]}>Assign Driver</Text>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowDriverModal(true)}
                                >
                                    <Text style={[styles.pickerButtonText, !selectedDriver && styles.placeholderText]}>
                                        {selectedDriver
                                            ? drivers.find(d => d.id === selectedDriver)?.full_name
                                            : 'Select Driver'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color="#64748B" />
                                </TouchableOpacity>

                                <SelectionModal
                                    visible={showDriverModal}
                                    title="Select Driver"
                                    options={drivers.map(d => ({ label: d.full_name, value: d.id }))}
                                    onSelect={setSelectedDriver}
                                    onClose={() => setShowDriverModal(false)}
                                    selectedValue={selectedDriver}
                                />
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
        pickerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            borderWidth: 1,
            borderColor: '#E2E8F0',
            borderRadius: 12,
            paddingHorizontal: 15,
            height: 50,
        },
        pickerButtonText: {
            fontSize: 16,
            color: '#1E293B',
        },
        placeholderText: {
            color: '#64748B',
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
