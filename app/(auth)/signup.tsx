import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Card } from '../../components/ui/Card';
import { COLLEGES } from '../../constants/colleges';
import { Colors } from '../../constants/theme';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    // Dropdown State
    // Dropdown State
    const [selectedCollege, setSelectedCollege] = useState('');
    const [selectedDept, setSelectedDept] = useState('');
    const [role, setRole] = useState('requester'); // Default to Requester

    // New Fields
    const [mobileNumber, setMobileNumber] = useState('');

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
        if (!email || !password || !fullName || !selectedDept || !selectedCollege || !mobileNumber) {
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
                    phone_number: mobileNumber,
                    role: role,
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

    const renderInput = (label: string, value: string, setValue: (t: string) => void, placeholder: string, icon: any, secure = false, keyboardType: any = 'default', editable = true) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputContainer, !editable && styles.disabledContainer]}>
                <Ionicons name={icon} size={20} color={Colors.light.primary} style={styles.icon} />
                <TextInput
                    style={[styles.input, !editable && styles.disabledInput]}
                    onChangeText={setValue}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={secure}
                    autoCapitalize="none"
                    keyboardType={keyboardType}
                    editable={editable}
                />
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Travel Requisition Portal</Text>
                </View>

                <Card title="Personal Details">
                    {renderInput("Full Name", fullName, setFullName, "John Doe", "person-outline")}
                    {renderInput("Email Address", email, setEmail, "email@address.com", "mail-outline", false, "email-address")}
                    {renderInput("Mobile Number", mobileNumber, setMobileNumber, "9876543210", "call-outline", false, "phone-pad")}
                    {renderInput("Password", password, setPassword, "Create a password", "lock-closed-outline", true)}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Role</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={role}
                                onValueChange={(itemValue) => setRole(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Requester" value="requester" />
                                <Picker.Item label="HOD" value="hod" />
                            </Picker>
                        </View>
                    </View>
                </Card>

                <Card title="Academic Details">
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>College Name</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedCollege}
                                onValueChange={(itemValue) => setSelectedCollege(itemValue)}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select College" value="" />
                                {COLLEGES.map((college, index) => (
                                    <Picker.Item key={index} label={college.name} value={college.name} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    {selectedCollege ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Department</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={selectedDept}
                                    onValueChange={(itemValue) => setSelectedDept(itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Department" value="" />
                                    {currentCollege?.departments.map((dept, index) => (
                                        <Picker.Item key={index} label={dept.name} value={dept.name} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    ) : null}
                </Card>

                {(hodName !== '' || directorName !== '') && (
                    <Card title="Authority Details">
                        {renderInput("HOD Name (Auto-filled)", hodName, setHodName, "", "person-circle-outline", false, "default", false)}
                        {renderInput("Director Name (Auto-filled)", directorName, setDirectorName, "", "school-outline", false, "default", false)}
                    </Card>
                )}

                <AnimatedButton
                    title={loading ? "Creating Account..." : "Sign Up"}
                    onPress={handleSignUp}
                    isLoading={loading}
                    style={styles.signUpButton}
                />

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                        <Text style={styles.linkText}>Sign In</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.light.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748B',
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
    },
    disabledContainer: {
        backgroundColor: '#F1F5F9',
        borderColor: '#E2E8F0',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    disabledInput: {
        color: '#64748B',
    },
    icon: {
        marginRight: 12,
    },
    pickerWrapper: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden', // iOS fix
    },
    picker: {
        height: Platform.OS === 'android' ? 50 : undefined,
    },
    signUpButton: {
        marginBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        gap: 8,
    },
    footerText: {
        fontSize: 15,
        color: '#64748B',
    },
    linkText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.light.primary,
    },
});
