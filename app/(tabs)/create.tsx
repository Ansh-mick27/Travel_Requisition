import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function CreateRequest() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState<Date | null>(null);
    const [dropTime, setDropTime] = useState<Date | null>(null);
    const [destination, setDestination] = useState('');
    const [purpose, setPurpose] = useState('meeting');
    const [purposeDesc, setPurposeDesc] = useState('');
    const [category, setCategory] = useState('');
    const [vehicleType, setVehicleType] = useState('car');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
    const [showDropTimePicker, setShowDropTimePicker] = useState(false);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`);
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    };

    const handleDestinationChange = (text: string) => {
        setDestination(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 800);
    };

    const selectSuggestion = (item: any) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        setDestination(item.display_name);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const validateBuffer = () => {
        if (!pickupTime || !dropTime) return false;
        const start = pickupTime.getTime();
        const end = dropTime.getTime();
        const diffInHours = (end - start) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            Alert.alert('Invalid Time', 'Drop time must be at least 1 hour after pick-up time.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!destination || !category || !pickupDate || !pickupTime || !dropTime) {
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
                vehicle_type: vehicleType,
                status: 'pending_hod',
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
        if (Platform.OS !== 'web') setShowDatePicker(false);
        if (selectedDate) setPickupDate(selectedDate);
    };

    const onPickupTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS !== 'web') setShowPickupTimePicker(false);
        if (selectedDate) setPickupTime(selectedDate);
    };

    const onDropTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS !== 'web') setShowDropTimePicker(false);
        if (selectedDate) setDropTime(selectedDate);
    };

    // Helper to render Web inputs
    const renderWebInput = (mode: 'date' | 'time', value: Date | null, onChange: (e: any, date?: Date) => void) => {
        const inputValue = value ? (
            mode === 'date'
                ? value.toISOString().split('T')[0]
                : value.toTimeString().slice(0, 5)
        ) : '';

        return React.createElement('input', {
            type: mode,
            value: inputValue,
            onChange: (e: any) => {
                const val = e.target.value;
                if (!val) {
                    // Handle clear if needed, or just ignore
                    return;
                }
                const newDate = new Date();
                if (mode === 'date') {
                    const [y, m, d] = val.split('-').map(Number);
                    newDate.setFullYear(y, m - 1, d);
                } else {
                    const [h, m] = val.split(':').map(Number);
                    newDate.setHours(h, m);
                    newDate.setSeconds(0);
                }
                onChange(null, newDate);
            },
            style: {
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                width: '100%',
                fontSize: '16px',
                fontFamily: 'System',
                boxSizing: 'border-box'
            }
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.label}>Date</Text>
            {Platform.OS === 'web' ? (
                renderWebInput('date', pickupDate, onDateChange)
            ) : (
                <>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                        <Text style={!pickupDate ? styles.placeholder : undefined}>
                            {pickupDate ? pickupDate.toDateString() : 'Select Date'}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker value={pickupDate || new Date()} mode="date" onChange={onDateChange} />
                    )}
                </>
            )}

            <Text style={styles.label}>Pick-up Time</Text>
            {Platform.OS === 'web' ? (
                renderWebInput('time', pickupTime, onPickupTimeChange)
            ) : (
                <>
                    <TouchableOpacity onPress={() => setShowPickupTimePicker(true)} style={styles.input}>
                        <Text style={!pickupTime ? styles.placeholder : undefined}>
                            {pickupTime ? pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Pick-up Time'}
                        </Text>
                    </TouchableOpacity>
                    {showPickupTimePicker && (
                        <DateTimePicker value={pickupTime || new Date()} mode="time" onChange={onPickupTimeChange} />
                    )}
                </>
            )}

            <Text style={styles.label}>Drop Time</Text>
            {Platform.OS === 'web' ? (
                renderWebInput('time', dropTime, onDropTimeChange)
            ) : (
                <>
                    <TouchableOpacity onPress={() => setShowDropTimePicker(true)} style={styles.input}>
                        <Text style={!dropTime ? styles.placeholder : undefined}>
                            {dropTime ? dropTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Drop Time'}
                        </Text>
                    </TouchableOpacity>
                    {showDropTimePicker && (
                        <DateTimePicker value={dropTime || new Date()} mode="time" onChange={onDropTimeChange} />
                    )}
                </>
            )}

            <Text style={styles.label}>Vehicle Preference</Text>
            <View style={styles.pickerContainer}>
                <Picker selectedValue={vehicleType} onValueChange={(itemValue: string) => setVehicleType(itemValue)}>
                    <Picker.Item label="Kia" value="Kia" />
                    <Picker.Item label="Bolero" value="Bolero" />
                    <Picker.Item label="Curve" value="Curve" />
                    <Picker.Item label="Nexon" value="Nexon" />
                    <Picker.Item label="Tiago" value="Tiago" />
                    <Picker.Item label="Bus" value="Bus" />
                </Picker>
            </View>

            <Text style={styles.label}>Destination</Text>
            <View style={styles.autocompleteContainer}>
                <TextInput
                    style={styles.input}
                    value={destination}
                    onChangeText={handleDestinationChange}
                    placeholder="Search destination..."
                    onFocus={() => destination.length >= 3 && setShowSuggestions(true)}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ScrollView
                        style={styles.suggestionsList}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => selectSuggestion(item)}
                            >
                                <Text style={styles.suggestionText}>{item.display_name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

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
    webPickerContainer: {
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 5,
    },
    placeholder: {
        color: '#999',
    },
    autocompleteContainer: {
        zIndex: 10,
        position: 'relative',
    },
    suggestionsList: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5, // For Android shadow
        shadowColor: '#000', // For iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    suggestionItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    suggestionText: {
        fontSize: 14,
        color: '#333',
    },
});
