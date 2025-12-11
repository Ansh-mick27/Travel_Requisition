import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Shadows } from '../../constants/theme';

interface Option {
    label: string;
    value: string;
}

interface SelectionModalProps {
    visible: boolean;
    title: string;
    options: Option[];
    onSelect: (value: string) => void;
    onClose: () => void;
    selectedValue?: string;
}

export const SelectionModal = ({ visible, title, options, onSelect, onClose, selectedValue }: SelectionModalProps) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {options.map((option) => {
                            const isSelected = option.value === selectedValue;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[styles.optionItem, isSelected && styles.selectedOption]}
                                    onPress={() => {
                                        onSelect(option.value);
                                        onClose();
                                    }}
                                >
                                    <Text style={[styles.optionLabel, isSelected && styles.selectedLabel]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={20} color={Colors.light.primary} />}
                                </TouchableOpacity>
                            );
                        })}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '70%',
        ...Shadows.light.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    closeButton: {
        padding: 4,
    },
    list: {
        padding: 20,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
        borderRadius: 12, // For touch target
    },
    selectedOption: {
        backgroundColor: '#EFF6FF',
    },
    optionLabel: {
        fontSize: 16,
        color: '#475569',
        fontWeight: '500',
    },
    selectedLabel: {
        color: Colors.light.primary,
        fontWeight: '700',
    },
});
