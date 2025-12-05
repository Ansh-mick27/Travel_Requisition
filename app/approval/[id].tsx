import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

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
            .select('*, profiles:requester_id(full_name, department, phone_number)')
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
        const { data } = await supabase.from('profiles').select('*').eq('role', 'driver');
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
                    const driverName = drivers.find(d => d.id === selectedDriver)?.full_name || 'Driver';

                    const message = `Travel Requisition Approved!\nVehicle: ${vehicleName}\nDriver: ${driverName}\nPickup: ${request.pickup_time}`;

                    await SMS.sendSMSAsync(
                        [request.profiles.phone_number],
                        message
                    );
                }
            }

            Alert.alert('Success', `Request ${action}d successfully!`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !request) return <Text style={styles.loading}>Loading...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.section}>
                <Text style={styles.label}>Requester</Text>
                <Text style={styles.value}>{request.profiles?.full_name} ({request.profiles?.department})</Text>
                <Text style={styles.value}>{request.profiles?.phone_number}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Trip Details</Text>
                <Text style={styles.value}>Date: {request.pickup_date}</Text>
                <Text style={styles.value}>Time: {request.pickup_time} - {request.drop_time}</Text>
                <Text style={styles.value}>Destination: {request.destination}</Text>
                <Text style={styles.value}>Purpose: {request.purpose} ({request.category})</Text>
                <Text style={styles.value}>Desc: {request.purpose_description}</Text>
            </View>

            {isAdmin && (
                <View style={styles.section}>
                    <Text style={styles.label}>Assign Vehicle</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedVehicle}
                            onValueChange={(itemValue: string) => setSelectedVehicle(itemValue)}
                        >
                            <Picker.Item label="Select Vehicle" value="" />
                            {vehicles.map(v => (
                                <Picker.Item key={v.id} label={`${v.name} (${v.type})`} value={v.id} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={[styles.label, { marginTop: 15 }]}>Assign Driver</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedDriver}
                            onValueChange={(itemValue: string) => setSelectedDriver(itemValue)}
                        >
                            <Picker.Item label="Select Driver" value="" />
                            {drivers.map(d => (
                                <Picker.Item key={d.id} label={d.full_name || d.email} value={d.id} />
                            ))}
                        </Picker>
                    </View>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.label}>Remarks</Text>
                <TextInput
                    style={styles.input}
                    value={remarks}
                    onChangeText={setRemarks}
                    placeholder="Add comments..."
                    multiline
                />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={() => handleAction('reject')}>
                    <Text style={styles.buttonText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.approveButton]} onPress={() => handleAction('approve')}>
                    <Text style={styles.buttonText}>Approve</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 50,
    },
    loading: {
        marginTop: 50,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 16,
        marginBottom: 2,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        height: 80,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 0.48,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    approveButton: {
        backgroundColor: 'green',
    },
    rejectButton: {
        backgroundColor: 'red',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
