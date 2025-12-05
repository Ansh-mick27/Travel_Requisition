import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';
import { supabase } from '../../lib/supabase';

export default function Profile() {
    const { user, role } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.info}>Email: {user?.email}</Text>
            <Text style={styles.info}>Role: {role}</Text>
            <Text style={styles.info}>Department: {user?.department || 'N/A'}</Text>

            <View style={{ marginTop: 20 }}>
                <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    info: {
        fontSize: 16,
        marginBottom: 10,
    },
});
