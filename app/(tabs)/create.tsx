import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function CreateRequest() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [pickupDate, setPickupDate] = useState(new Date());
    const [pickupTime, setPickupTime] = useState(new Date());
    const [dropTime, setDropTime] = useState(new Date());
    const [destination, setDestination] = useState('');
    const [purpose, setPurpose] = useState('meeting');
    const [purposeDesc, setPurposeDesc] = useState('');
    const [category, setCategory] = useState('');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
    const [showDropTimePicker, setShowDropTimePicker] = useState(false);

    const validateBuffer = () => {
        const start = pickupTime.getTime();
        const end = dropTime.getTime();
        const diffInHours = (end - start) / (1000 * 60 * 60);

        // Requirement: 1 hour buffer. 
        // Assuming this means the duration must be at least 1 hour? 
        // Or does it mean the user must book 1 hour in advance?
        // "Each request must include a one-hour buffer for both pick-up time and drop time."
        // Interpretation: The system should perhaps add a buffer, or ensure the gap is sufficient.
        // Let's enforce that Drop Time is at least 1 hour after Pickup Time.

        if (diffInHours < 1) {
            Alert.alert('Invalid Time', 'Drop time must be at least 1 hour after pick-up time.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!destination || !category) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        if (!validateBuffer()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('requisitions').insert({
                requester_id: user.id,
                pickup_date: pickupDate.toISOString().split('T')[0],
                pickup_time: pickupTime.toLocaleTimeString('en-US', { hour12: false }),
                drop_time: dropTime.toLocaleTimeString('en-US', { hour12: false }),
                destination,
                purpose,
                purpose_description: purposeDesc,
                category,
                status: 'pending_hod', // Initial status
            });

            if (error) throw error;

            Alert.alert('Success', 'Requisition submitted successfully!', [
                { text: 'OK', onPress: () => router.push('/(tabs)/history') }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setPickupDate(selectedDate);
    };

    const onPickupTimeChange = (event: any, selectedDate?: Date) => {
        setShowPickupTimePicker(false);
        if (selectedDate) setPickupTime(selectedDate);
    };

    const onDropTimeChange = (event: any, selectedDate?: Date) => {
        setShowDropTimePicker(false);
        if (selectedDate) setDropTime(selectedDate);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text>{pickupDate.toDateString()}</Text>
            </TouchableOpacity>
            {showDatePicker && (
                <DateTimePicker value={pickupDate} mode="date" onChange={onDateChange} />
            )}

            <Text style={styles.label}>Pick-up Time</Text>
            <TouchableOpacity onPress={() => setShowPickupTimePicker(true)} style={styles.input}>
                <Text>{pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showPickupTimePicker && (
                <DateTimePicker value={pickupTime} mode="time" onChange={onPickupTimeChange} />
            )}

            <Text style={styles.label}>Drop Time</Text>
            <TouchableOpacity onPress={() => setShowDropTimePicker(true)} style={styles.input}>
                <Text>{dropTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>
            {showDropTimePicker && (
                <DateTimePicker value={dropTime} mode="time" onChange={onDropTimeChange} />
            )}

            <Text style={styles.label}>Destination</Text>
            <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="e.g., City Center" />

            <Text style={styles.label}>Purpose Type</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={purpose} onValueChange={(itemValue: string) => setPurpose(itemValue)}>
                    <Picker.Item label="Meeting" value="meeting" />
                    <Picker.Item label="In-house Event" value="in_house_event" />
                    <Picker.Item label="Session" value="session" />
                    <Picker.Item label="Workshop" value="workshop" />
                    <Picker.Item label="Visit" value="visit" />
                    <Picker.Item label="Participation" value="participation" />
                    <Picker.Item label="Other" value="other" />
                </Picker>
            </View>

            <Text style={styles.label}>Purpose Description</Text>
            <TextInput style={styles.input} value={purposeDesc} onChangeText={setPurposeDesc} placeholder="Additional details..." multiline />

            <Text style={styles.label}>Category (VIP, Guest, etc.)</Text>
            <TextInput style={styles.input} value={category} onChangeText={setCategory} placeholder="e.g., VIP Movement" />

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5,
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        backgroundColor: '#fff',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
