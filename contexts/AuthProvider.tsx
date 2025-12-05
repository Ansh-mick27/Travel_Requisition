import { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'requester' | 'hod' | 'admin' | 'driver' | null;

type AuthContextType = {
    session: Session | null;
    user: any | null;
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
    isHOD: boolean;
    isDriver: boolean;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    isAdmin: false,
    isHOD: false,
    isDriver: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoading(false);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setUser(data);
                setRole(data.role);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        user,
        role,
        loading,
        isAdmin: role === 'admin',
        isHOD: role === 'hod',
        isDriver: role === 'driver',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
