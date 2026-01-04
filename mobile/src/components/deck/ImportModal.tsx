import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { importExportService, ImportCard } from '../../services/import-export.service';

interface ImportModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ImportModal({ visible, onClose, onSuccess }: ImportModalProps) {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cards, setCards] = useState<ImportCard[]>([]);
    const [step, setStep] = useState<1 | 2>(1); // 1: Select File, 2: Review & Settings

    const handlePickFile = async () => {
        try {
            setLoading(true);
            const result = await importExportService.pickAndParseFile();
            if (result) {
                setTitle(result.title);
                setCards(result.cards);
                setStep(2);
            }
        } catch (error: any) {
            Alert.alert('导入失败', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!title.trim()) {
            Alert.alert('提示', '请输入卡组标题');
            return;
        }

        try {
            setLoading(true);
            const result = await importExportService.importDeck(title, description, cards);
            if (result.success) {
                Alert.alert('成功', `已成功导入卡组并添加了 ${result.cards_imported} 张卡片`);
                onSuccess();
                handleClose();
            } else {
                Alert.alert('错误', result.error || '解析文件失败');
            }
        } catch (error: any) {
            Alert.alert('错误', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setTitle('');
        setDescription('');
        setCards([]);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            onClose={handleClose}
            title="导入卡组"
        >
            <View style={styles.container}>
                {step === 1 ? (
                    <View style={styles.uploadSection}>
                        <Ionicons name="cloud-upload-outline" size={64} color={theme.colors.interactive.primary} />
                        <Text style={[styles.uploadText, { color: theme.colors.text.secondary }]}>
                            支持 JSON、CSV 格式
                        </Text>
                        <Button
                            title="选择文件"
                            onPress={handlePickFile}
                            loading={loading}
                            style={styles.uploadBtn}
                        />
                        <View style={styles.formatInfo}>
                            <Text style={[styles.formatTitle, { color: theme.colors.text.primary }]}>格式要求：</Text>
                            <Text style={[styles.formatDesc, { color: theme.colors.text.tertiary }]}>
                                CSV: 正面, 反面, 标签1;标签2{"\n"}
                                JSON: {"{ \"title\": \"...\", \"cards\": [...] }"}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.form}>
                            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>卡组标题</Text>
                            <TextInput
                                style={[styles.input, {
                                    backgroundColor: theme.colors.background.secondary,
                                    color: theme.colors.text.primary,
                                    borderColor: theme.colors.border.primary
                                }]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="输入卡组名称"
                                placeholderTextColor={theme.colors.text.tertiary}
                            />

                            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>卡组描述 (可选)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, {
                                    backgroundColor: theme.colors.background.secondary,
                                    color: theme.colors.text.primary,
                                    borderColor: theme.colors.border.primary
                                }]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="输入卡组描述"
                                placeholderTextColor={theme.colors.text.tertiary}
                                multiline
                                numberOfLines={3}
                            />

                            <View style={styles.previewHeader}>
                                <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
                                    待导入卡片 ({cards.length})
                                </Text>
                                <TouchableOpacity onPress={() => setStep(1)}>
                                    <Text style={{ color: theme.colors.interactive.primary }}>重新选择</Text>
                                </TouchableOpacity>
                            </View>

                            {cards.slice(0, 5).map((card, index) => (
                                <Card key={index} style={styles.previewCard}>
                                    <Text style={[styles.previewFront, { color: theme.colors.text.primary }]} numberOfLines={1}>
                                        {card.front}
                                    </Text>
                                    <Text style={[styles.previewBack, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                                        {card.back}
                                    </Text>
                                </Card>
                            ))}
                            {cards.length > 5 && (
                                <Text style={[styles.moreText, { color: theme.colors.text.tertiary }]}>
                                    ... 以及另外 {cards.length - 5} 张卡片
                                </Text>
                            )}
                        </View>

                        <Button
                            title={`导入 ${cards.length} 张卡片`}
                            onPress={handleImport}
                            loading={loading}
                            fullWidth
                            size="lg"
                            style={styles.importBtn}
                        />
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
    },
    uploadSection: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    uploadText: {
        marginTop: 16,
        fontSize: 16,
    },
    uploadBtn: {
        marginTop: 24,
        width: 160,
    },
    formatInfo: {
        marginTop: 40,
        width: '100%',
        padding: 16,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    formatTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    formatDesc: {
        fontSize: 12,
        lineHeight: 18,
    },
    form: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        fontSize: 16,
    },
    textArea: {
        height: 80,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    previewCard: {
        padding: 12,
        marginBottom: 8,
    },
    previewFront: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    previewBack: {
        fontSize: 13,
        marginTop: 4,
    },
    moreText: {
        textAlign: 'center',
        fontSize: 12,
        marginVertical: 8,
    },
    importBtn: {
        marginBottom: 16,
    }
});
