import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function CreateRequest() {
    const { user, role } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [pickupDate, setPickupDate] = useState<Date | null>(null);
    const [pickupTime, setPickupTime] = useState<Date | null>(null);
    const [dropTime, setDropTime] = useState<Date | null>(null);

    // Locations
    const [destination, setDestination] = useState('');
    const [pickupLocation, setPickupLocation] = useState('');

    // Autocomplete State
    const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
    const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
    const [showDestSuggestions, setShowDestSuggestions] = useState(false);
    const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);

    const [purpose, setPurpose] = useState('meeting');
    const [purposeDesc, setPurposeDesc] = useState('');

    // Category & Guest Details
    const [category, setCategory] = useState('In house Staff');
    const [guestName, setGuestName] = useState('');
    const [guestPhone, setGuestPhone] = useState('');

    const [vehicleType, setVehicleType] = useState('car');
    const [vehicleOptions, setVehicleOptions] = useState<string[]>([]);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('name')
                .eq('status', 'active');

            if (error) throw error;

            if (data) {
                // Get unique names
                const uniqueNames = Array.from(new Set(data.map(v => v.name)));
                setVehicleOptions(uniqueNames);
                if (uniqueNames.length > 0 && !uniqueNames.includes(vehicleType)) {
                    setVehicleType(uniqueNames[0]);
                }
            }
        } catch (error) {
            console.log('Error fetching vehicles:', error);
            // Fallback
            setVehicleOptions(['Kia', 'Bolero', 'Nexon', 'Bus']);
        }
    };

    const typingTimeoutRef = useRef<any>(null);

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
    const [showDropTimePicker, setShowDropTimePicker] = useState(false);

    const fetchAddressSuggestions = async (query: string, setSuggestionsFn: (data: any[]) => void, setShowFn: (show: boolean) => void) => {
        if (query.length < 3) {
            setSuggestionsFn([]);
            setShowFn(false);
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=in`, {
                headers: {
                    'User-Agent': 'TravelRequisitionApp/1.0'
                }
            });
            const data = await response.json();
            setSuggestionsFn(data);
            setShowFn(true);
        } catch (error) {
            console.warn('Autocomplete unavailable (Network/CORS):', error);
            setShowFn(false);
        }
    };

    const handleLocationChange = (text: string, isPickup: boolean) => {
        if (isPickup) setPickupLocation(text);
        else setDestination(text);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            fetchAddressSuggestions(
                text,
                isPickup ? setPickupSuggestions : setDestSuggestions,
                isPickup ? setShowPickupSuggestions : setShowDestSuggestions
            );
        }, 800);
    };

    const selectSuggestion = (item: any, isPickup: boolean) => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (isPickup) {
            setPickupLocation(item.display_name);
            setPickupSuggestions([]);
            setShowPickupSuggestions(false);
        } else {
            setDestination(item.display_name);
            setDestSuggestions([]);
            setShowDestSuggestions(false);
        }
    };

    const validateBuffer = (pTime: Date, dTime: Date) => {
        const start = pTime.getTime();
        const end = dTime.getTime();
        const diffInMinutes = (end - start) / (1000 * 60);

        if (diffInMinutes <= 0) {
            const msg = 'Drop time must be after pick-up time.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Invalid Time', msg);
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {

        if (!user) {
            console.error('Validation Failed: User session missing');
            const msg = 'User session not found.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

        if (!destination || !pickupLocation || !category || !pickupDate || !pickupTime || !dropTime) {
            console.error('Validation Failed: Missing required fields');
            const msg = 'Please fill in all required fields.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Missing Fields', msg);
            return;
        }

        if ((category === 'VIP Guest' || category === 'Guest') && (!guestName || !guestPhone)) {
            console.error('Validation Failed: Missing guest details');
            const msg = 'Please provide Guest Name and Phone Number.';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
            return;
        }

        // Normalize Dates
        // Validating time buffer requires combining the Date + Time
        const fullPickup = new Date(pickupDate);
        fullPickup.setHours(pickupTime.getHours(), pickupTime.getMinutes(), 0, 0);

        const fullDrop = new Date(pickupDate);
        fullDrop.setHours(dropTime.getHours(), dropTime.getMinutes(), 0, 0);

        if (!validateBuffer(fullPickup, fullDrop)) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('requisitions').insert({
                requester_id: user.id,
                pickup_date: pickupDate.toISOString().split('T')[0],
                pickup_time: fullPickup.toLocaleTimeString('en-US', { hour12: false }),
                drop_time: fullDrop.toLocaleTimeString('en-US', { hour12: false }),
                destination,
                pickup_location: pickupLocation,
                purpose,
                purpose_description: purposeDesc,
                category,
                guest_name: guestName,
                guest_phone: guestPhone,
                vehicle_type: vehicleType,
                status: (role === 'hod' || role === 'admin') ? 'pending_admin' : 'pending_hod',
            });

            if (error) throw error;

            // Reset Form Code
            setDestination('');
            setPickupLocation('');
            setPurpose('meeting');
            setPurposeDesc('');
            setPickupDate(null);
            setPickupTime(null);
            setDropTime(null);
            setGuestName('');
            setGuestPhone('');
            setVehicleType(vehicleOptions[0] || 'car');

            if (Platform.OS === 'web') {
                // Use setTimeout to allow UI to update if needed
                setTimeout(() => {
                    if (window.confirm('Success: Requisition created successfully! Go to History?')) {
                        router.replace('/(tabs)/history');
                    }
                }, 100);
            } else {
                Alert.alert('Success', 'Requisition created successfully!', [
                    { text: 'OK', onPress: () => router.replace('/(tabs)/history') }
                ]);
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.message || 'Submission failed';
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    // Date Restriction Logic
    const getMinDate = () => {
        // HOD/Director (role='hod' or 'admin') allowed same day
        const isPrivileged = role === 'hod' || role === 'admin';
        const d = new Date();
        if (!isPrivileged) {
            d.setDate(d.getDate() + 1); // Requesters: min date is tomorrow
        }
        return d;
    };

    const getMaxDate = () => {
        const d = new Date();
        d.setDate(d.getDate() + 3); // Everyone: max 3 days in advance
        return d;
    };

    const minDate = getMinDate();
    const maxDate = getMaxDate();

    const renderDateInput = (label: string, value: Date | null, onChange: (d: Date | null) => void, onPress: () => void, mode: 'date' | 'time', icon: any) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            {Platform.OS === 'web' ? (
                <View style={styles.inputContainer}>
                    <Ionicons name={icon} size={20} color={Colors.light.primary} style={styles.icon} />
                    {React.createElement('input', {
                        type: mode,
                        min: mode === 'date' ? minDate.toISOString().split('T')[0] : undefined,
                        max: mode === 'date' ? maxDate.toISOString().split('T')[0] : undefined,
                        value: value ? (mode === 'date' ? value.toISOString().split('T')[0] : value.toTimeString().slice(0, 5)) : '',
                        onChange: (e: any) => {
                            if (!e.target.value) {
                                onChange(null);
                                return;
                            }
                            const d = new Date();
                            if (mode === 'date') {
                                const [y, m, day] = e.target.value.split('-').map(Number);
                                d.setFullYear(y, m - 1, day);
                            } else {
                                const current = value || new Date();
                                const [h, m] = e.target.value.split(':').map(Number);
                                d.setFullYear(current.getFullYear(), current.getMonth(), current.getDate());
                                d.setHours(h, m);
                                d.setSeconds(0);
                            }
                            onChange(d);
                        },
                        style: {
                            border: 'none',
                            background: 'transparent',
                            fontSize: '16px',
                            color: '#1E293B',
                            width: '100%',
                            outline: 'none',
                            fontFamily: 'System',
                            height: '100%'
                        }
                    })}
                </View>
            ) : (
                <TouchableOpacity onPress={onPress} style={styles.inputContainer} activeOpacity={0.7}>
                    <Ionicons name={icon} size={20} color={Colors.light.primary} style={styles.icon} />
                    <Text style={value ? styles.inputText : styles.placeholder}>
                        {value ? (mode === 'date' ? value.toDateString() : value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : `Select ${label}`}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderAutocomplete = (label: string, value: string, setValue: any, suggestions: any[], showSuggestions: boolean, handleSelect: any, isPickup: boolean, icon: string) => (
        <View style={[styles.inputGroup, { zIndex: showSuggestions ? 100 : 1 }]}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <Ionicons name={icon as any} size={20} color={Colors.light.primary} style={styles.icon} />
                <TextInput
                    style={styles.textInput}
                    value={value}
                    onChangeText={(t) => setValue(t, isPickup)}
                    placeholder={`Enter ${label}`}
                    onFocus={() => value.length >= 3 && setValue(value, isPickup)}
                />
            </View>
            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.dropdown}>
                    {suggestions.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.dropdownItem} onPress={() => handleSelect(item, isPickup)}>
                            <Text style={styles.dropdownText}>{item.display_name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.header}>New Request</Text>
            <Text style={styles.subHeader}>Fill in the details for your travel requisition</Text>

            <Card title="Trip Details">
                {renderDateInput("Date", pickupDate, setPickupDate, () => setShowDatePicker(true), 'date', 'calendar')}
                <View style={styles.row}>
                    <View style={styles.half}>
                        {renderDateInput("Pick-up", pickupTime, setPickupTime, () => setShowPickupTimePicker(true), 'time', 'time')}
                    </View>
                    <View style={styles.half}>
                        {renderDateInput("Drop", dropTime, setDropTime, () => setShowDropTimePicker(true), 'time', 'time')}
                    </View>
                </View>

                {renderAutocomplete("Pickup Location", pickupLocation, handleLocationChange, pickupSuggestions, showPickupSuggestions, selectSuggestion, true, 'navigate')}
                {renderAutocomplete("Destination", destination, handleLocationChange, destSuggestions, showDestSuggestions, selectSuggestion, false, 'location')}
            </Card>

            <Card title="Purpose & Category">
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={category} onValueChange={setCategory}>
                        <Picker.Item label="In house Staff" value="In house Staff" />
                        <Picker.Item label="Guest" value="Guest" />
                        <Picker.Item label="VIP Guest" value="VIP Guest" />
                    </Picker>
                </View>

                {(category === 'Guest' || category === 'VIP Guest') && (
                    <View style={styles.guestSection}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Guest Name</Text>
                            <TextInput style={styles.input} value={guestName} onChangeText={setGuestName} placeholder="Guest Name" />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Guest Mobile</Text>
                            <TextInput style={styles.input} value={guestPhone} onChangeText={setGuestPhone} placeholder="Mobile Number" keyboardType="phone-pad" />
                        </View>
                    </View>
                )}

                <Text style={styles.label}>Purpose</Text>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={purpose} onValueChange={setPurpose}>
                        <Picker.Item label="Meeting" value="meeting" />
                        <Picker.Item label="In-house Event" value="in_house_event" />
                        <Picker.Item label="Session" value="session" />
                        <Picker.Item label="Visit" value="visit" />
                        <Picker.Item label="Other" value="other" />
                    </Picker>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Description</Text>
                    <TextInput style={[styles.input, { height: 80 }]} value={purposeDesc} onChangeText={setPurposeDesc} placeholder="Additional details..." multiline />
                </View>
            </Card>

            <Card title="Vehicle Preference">
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={vehicleType} onValueChange={setVehicleType}>
                        {vehicleOptions.length > 0 ? (
                            vehicleOptions.map((v, index) => (
                                <Picker.Item key={index} label={v} value={v} />
                            ))
                        ) : (
                            <Picker.Item label="Loading..." value="car" />
                        )}
                    </Picker>
                </View>
            </Card>

            <AnimatedButton title={loading ? "Submitting..." : "Submit Requisition"} onPress={handleSubmit} isLoading={loading} style={{ marginBottom: 40 }} />

            {/* Native Date Pickers */}
            {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={pickupDate || minDate}
                    minimumDate={minDate}
                    maximumDate={maxDate}
                    mode="date"
                    display="default"
                    onChange={(e, d) => {
                        setShowDatePicker(false);
                        if (d) setPickupDate(d);
                    }}
                />
            )}
            {showPickupTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={pickupTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(e, d) => {
                        setShowPickupTimePicker(false);
                        if (d) setPickupTime(d);
                    }}
                />
            )}
            {showDropTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                    value={dropTime || new Date()}
                    mode="time"
                    display="default"
                    onChange={(e, d) => {
                        setShowDropTimePicker(false);
                        if (d) setDropTime(d);
                    }}
                />
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: Colors.light.background },
    content: { padding: 20 },
    header: { fontSize: 28, fontWeight: '800', color: Colors.light.primary, marginBottom: 5 },
    subHeader: { fontSize: 14, color: '#64748B', marginBottom: 20 },

    inputGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 15, height: 50 },
    icon: { marginRight: 10 },
    textInput: { flex: 1, fontSize: 16, color: '#1E293B' },
    inputText: { fontSize: 16, color: '#1E293B' },
    placeholder: { fontSize: 16, color: '#94A3B8' },

    // Legacy Input style fallback
    input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 16, color: '#1E293B' },

    pickerWrapper: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },

    row: { flexDirection: 'row', gap: 15 },
    half: { flex: 1 },

    dropdown: { position: 'absolute', top: 55, left: 0, right: 0, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', elevation: 5, padding: 5, zIndex: 999 },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    dropdownText: { fontSize: 14, color: '#333' },

    guestSection: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#DBEAFE' },
});
