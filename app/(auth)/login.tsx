import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Error', error.message);
        setLoading(false);
    }

    async function signUpWithEmail() {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) Alert.alert('Error', error.message);
        else Alert.alert('Success', 'Check your email for the confirmation link!');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Travel Requisition</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize="none"
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={signInWithEmail}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
                </TouchableOpacity>
            </View>
            <View style={styles.verticallySpaced}>
                <TouchableOpacity
                    style={[styles.button, styles.buttonOutline, loading && styles.buttonDisabled]}
                    onPress={signUpWithEmail}
                    disabled={loading}
                >
                    <Text style={styles.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 40,
        padding: 12,
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    inputContainer: {
        marginBottom: 12,
    },
    input: {
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        padding: 12,
        fontSize: 16,
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
        marginTop: 10,
    },
    buttonOutlineText: {
        color: '#007AFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
