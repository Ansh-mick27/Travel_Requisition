import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [department, setDepartment] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [hodName, setHodName] = useState('');
    const [directorName, setDirectorName] = useState('');

    async function handleSignUp() {
        if (!email || !password || !fullName || !department || !collegeName) {
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
                    department: department,
                    college_name: collegeName,
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
                <Text style={styles.label}>Department *</Text>
                <TextInput style={styles.input} onChangeText={setDepartment} value={department} placeholder="Computer Science" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>College Name *</Text>
                <TextInput style={styles.input} onChangeText={setCollegeName} value={collegeName} placeholder="Acropolis Institute" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>HOD Name</Text>
                <TextInput style={styles.input} onChangeText={setHodName} value={hodName} placeholder="Dr. HOD Name" />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Director Name</Text>
                <TextInput style={styles.input} onChangeText={setDirectorName} value={directorName} placeholder="Dr. Director Name" />
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
                    onPress={() => router.back()}
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
