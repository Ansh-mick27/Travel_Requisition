import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

type Requisition = {
    id: string;
    pickup_date: string;
    pickup_time: string;
    destination: string;
    status: string;
    purpose: string;
};

export default function History() {
    const { user } = useAuth();
    const [requisitions, setRequisitions] = useState<Requisition[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRequisitions = async () => {
        try {
            const { data, error } = await supabase
                .from('requisitions')
                .select('*')
                .eq('requester_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequisitions(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequisitions();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequisitions();
    };

    const renderItem = ({ item }: { item: Requisition }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.date}>{item.pickup_date}</Text>
                <Text style={[styles.status, getStatusStyle(item.status)]}>{item.status.replace('_', ' ').toUpperCase()}</Text>
            </View>
            <Text style={styles.details}>Dest: {item.destination}</Text>
            <Text style={styles.details}>Time: {item.pickup_time}</Text>
            <Text style={styles.details}>Purpose: {item.purpose}</Text>
        </View>
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'approved': return { color: 'green' };
            case 'rejected': return { color: 'red' };
            case 'pending_hod': return { color: 'orange' };
            case 'pending_admin': return { color: 'blue' };
            default: return { color: 'gray' };
        }
    };

    if (loading) return <ActivityIndicator style={{ marginTop: 20 }} />;

    return (
        <View style={styles.container}>
            <FlatList
                data={requisitions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No requisitions found.</Text>}
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
    date: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    status: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    details: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#666',
    },
});
