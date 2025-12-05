import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
    const { user, role } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState({ pending: 0, approved: 0, total: 0 });

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        if (!user) return;

        // Simple stats for the user
        const { data } = await supabase
            .from('requisitions')
            .select('status')
            .eq('requester_id', user.id);

        if (data) {
            const pending = data.filter(r => r.status.includes('pending')).length;
            const approved = data.filter(r => r.status === 'approved').length;
            setStats({ pending, approved, total: data.length });
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.welcome}>Welcome, {user?.email?.split('@')[0]}!</Text>
            <Text style={styles.role}>Role: {role?.toUpperCase()}</Text>

            <View style={styles.statsContainer}>
                <View style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={styles.cardTitle}>Pending</Text>
                    <Text style={styles.cardNumber}>{stats.pending}</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
                    <Text style={styles.cardTitle}>Approved</Text>
                    <Text style={styles.cardNumber}>{stats.approved}</Text>
                </View>
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/create')}>
                    <Text style={styles.actionText}>+ New Request</Text>
                </TouchableOpacity>

                {(role === 'hod' || role === 'admin') && (
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={() => router.push('/(tabs)/approvals')}>
                        <Text style={[styles.actionText, { color: '#007AFF' }]}>Review Approvals</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Vehicle Availability</Text>
                <Text style={styles.infoText}>Check the calendar or list to see available vehicles (Coming Soon).</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
    },
    welcome: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    role: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    card: {
        width: '48%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    cardNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    actionContainer: {
        marginBottom: 30,
    },
    actionButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    actionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoText: {
        color: '#666',
    },
});
