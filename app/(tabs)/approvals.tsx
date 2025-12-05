import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Approvals() {
    const { user, role, isHOD, isAdmin } = useAuth();
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequests = async () => {
        try {
            let query = supabase.from('requisitions').select('*, profiles:requester_id(full_name, department)');

            if (isHOD) {
                // HOD sees requests pending HOD approval
                // Ideally filter by department, but for now show all pending_hod
                query = query.eq('status', 'pending_hod');
            } else if (isAdmin) {
                // Admin sees requests pending Admin approval
                query = query.eq('status', 'pending_admin');
            }

            const { data, error } = await query;
            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [role]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/approval/${item.id}`)}
        >
            <View style={styles.header}>
                <Text style={styles.requester}>{item.profiles?.full_name || 'Unknown User'}</Text>
                <Text style={styles.date}>{item.pickup_date}</Text>
            </View>
            <Text style={styles.dept}>{item.profiles?.department || 'No Dept'}</Text>
            <Text style={styles.details}>Dest: {item.destination}</Text>
            <Text style={styles.details}>Purpose: {item.purpose}</Text>
            <Text style={styles.actionPrompt}>Tap to Review</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={requests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No pending approvals.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f5f5f5',
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    requester: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    date: {
        color: '#666',
    },
    dept: {
        fontStyle: 'italic',
        marginBottom: 5,
        color: '#444',
    },
    details: {
        fontSize: 14,
        color: '#333',
    },
    actionPrompt: {
        marginTop: 10,
        color: '#007AFF',
        fontWeight: '600',
        textAlign: 'right',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
    },
});
