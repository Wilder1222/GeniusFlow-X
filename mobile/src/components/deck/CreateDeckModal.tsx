/**
 * CreateDeckModal Component - 创建卡组弹窗
 * 
 * 提供创建新卡组的表单界面
 */

import React, { useState } from 'react';
import { View, StyleSheet, Text, Switch } from 'react-native';
import { Modal, Input, Button } from '../common';
import { useTheme } from '../../contexts/ThemeContext';
import { CreateDeckData } from '../../types/decks';

interface CreateDeckModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: CreateDeckData) => Promise<void>;
}

export const CreateDeckModal: React.FC<CreateDeckModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (!title.trim()) {
            setError('请输入卡组名称');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await onSave({
                title: title.trim(),
                description: description.trim(),
                is_public: isPublic,
                tags: [], // 初始标签为空，可以在详情页编辑
            });
            // 成功后重置并关闭
            setTitle('');
            setDescription('');
            setIsPublic(false);
            onClose();
        } catch (err: any) {
            setError(err.message || '创建失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            title="创建新卡组"
        >
            <View style={styles.container}>
                <Input
                    label="卡组名称"
                    value={title}
                    onChangeText={(text) => {
                        setTitle(text);
                        if (error) setError('');
                    }}
                    placeholder="例如：考研英语、Javascript基础"
                    error={error}
                />

                <Input
                    label="描述 (可选)"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="简单介绍一下这个卡组..."
                    multiline
                    numberOfLines={3}
                />

                <View style={styles.switchRow}>
                    <View>
                        <Text style={[styles.switchLabel, { color: theme.colors.text.primary }]}>
                            公开卡组
                        </Text>
                        <Text style={[styles.switchSubLabel, { color: theme.colors.text.secondary }]}>
                            允许其他用户搜索和使用此卡组
                        </Text>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={setIsPublic}
                        trackColor={{ false: theme.colors.border.primary, true: theme.colors.interactive.primary }}
                        thumbColor="#FFFFFF"
                    />
                </View>

                <Button
                    title="创建卡组"
                    onPress={handleSave}
                    loading={loading}
                    fullWidth
                    size="lg"
                    style={{ marginTop: 24 }}
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 4,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    switchSubLabel: {
        fontSize: 12,
    },
});
