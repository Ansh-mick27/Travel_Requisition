import { Picker } from '@react-native-picker/picker'; // You might need to install this: npx expo install @react-native-picker/picker
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLLEGES } from '../../constants/colleges';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Dropdown State
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedDept, setSelectedDept] = useState('');

    // Auto-filled State
    const [hodName, setHodName] = useState('');
    const [directorName, setDirectorName] = useState('');

    // Update Director and Reset Dept when College changes
    useEffect(() => {
        const college = COLLEGES.find(c => c.name === selectedCollege);
        if (college) {
            setDirectorName(college.director_name);
            setHodName(''); // Reset HOD until dept is selected
            setSelectedDept('');
        }
    }, [selectedCollege]);

    // Update HOD and Director (if override exists) when Dept changes
    useEffect(() => {
        const college = COLLEGES.find(c => c.name === selectedCollege);
        if (college) {
            const dept = college.departments.find(d => d.name === selectedDept);
            if (dept) {
                setHodName(dept.hod_name);
                // Check for director override
                if (dept.director_name) {
                    setDirectorName(dept.director_name);
                } else {
                    // Revert to college director if no override
                    setDirectorName(college.director_name);
                }
            }
        }
    }, [selectedDept, selectedCollege]);

    async function handleSignUp() {
        if (!email || !password || !fullName || !selectedDept || !selectedCollege) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    department: selectedDept,
                    college_name: selectedCollege,
                    hod_name: hodName,
                    director_name: directorName,
                },
            },
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert(
                'Success',
                'Account created! Please wait for Admin approval before logging in.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        }
        setLoading(false);
    }

    const currentCollege = COLLEGES.find(c => c.name === selectedCollege);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Create Account</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput style={styles.input} onChangeText={setFullName} value={fullName} placeholder="John Doe" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder="email@address.com" autoCapitalize="none" keyboardType="email-address" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password *</Text>
                <TextInput style={styles.input} onChangeText={setPassword} value={password} secureTextEntry placeholder="******" autoCapitalize="none" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>College Name *</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCollege}
                        onValueChange={(itemValue) => setSelectedCollege(itemValue)}
                    >
                        <Picker.Item label="Select College" value="" />
                        {COLLEGES.map((college, index) => (
                            <Picker.Item key={index} label={college.name} value={college.name} />
                        ))}
                    </Picker>
                </View>
            </View>

            {selectedCollege ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Department *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedDept}
                            onValueChange={(itemValue) => setSelectedDept(itemValue)}
                        >
                            <Picker.Item label="Select Department" value="" />
                            {currentCollege?.departments.map((dept, index) => (
                                <Picker.Item key={index} label={dept.name} value={dept.name} />
                            ))}
                        </Picker>
                    </View>
                </View>
            ) : null}

            <View style={styles.inputContainer}>
                <Text style={styles.label}>HOD Name (Auto-filled)</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={hodName} editable={false} />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Director Name (Auto-filled)</Text>
                <TextInput style={[styles.input, styles.disabledInput]} value={directorName} editable={false} />
            </View>

            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                </TouchableOpacity>
            </View>

            <View style={styles.verticallySpaced}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonOutline]}
                    onPress={() => router.replace('/(auth)/login')}
                >
                    <Text style={styles.buttonOutlineText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 50,
        paddingBottom: 50,
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 15,
    },
    label: {
        marginBottom: 5,
        color: '#666',
        fontWeight: 'bold',
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#888',
    },
    pickerContainer: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    buttonOutlineText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
