import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function UserApprovals() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    };

    const handleApprove = async (userId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', userId);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert('Success', 'User approved successfully.');
            fetchPendingUsers(); // Refresh list
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.detail}>Email: {item.email}</Text>
                <Text style={styles.detail}>Dept: {item.department}</Text>
                <Text style={styles.detail}>College: {item.college_name || 'N/A'}</Text>
                <Text style={styles.detail}>Role: {item.role}</Text>
            </View>
            <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(item.id)}
            >
                <Text style={styles.buttonText}>Approve</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) return <ActivityIndicator style={styles.loader} size="large" />;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Pending Users', headerShown: true }} />
            {users.length === 0 ? (
                <Text style={styles.emptyText}>No pending users found.</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    loader: {
        marginTop: 50,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#666',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    infoContainer: {
        flex: 1,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    },
    approveButton: {
        backgroundColor: 'green',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
