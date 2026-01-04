import React, { useState, useEffect } from 'react';
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
import { Modal } from './Modal';
import { Button } from './Button';
import { Card } from './Card';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { aiService, GeneratedCard, AIUsageStatus } from '../../services/ai.service';
import * as DocumentPicker from 'expo-document-picker';

interface AIGeneratorModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (cards: GeneratedCard[]) => void;
    deckId?: string;
}

type InputMode = 'text' | 'file';
type GenerationStep = 'input' | 'generating' | 'preview';

const DOMAINS = [
    { value: 'general', label: '通用' },
    { value: 'language', label: '语言学习' },
    { value: 'science', label: '科学' },
    { value: 'history', label: '历史' },
    { value: 'programming', label: '编程' },
    { value: 'interview', label: '面试准备' },
];

export function AIGeneratorModal({ visible, onClose, onSave, deckId }: AIGeneratorModalProps) {
    const { theme } = useTheme();
    const [inputMode, setInputMode] = useState<InputMode>('text');
    const [step, setStep] = useState<GenerationStep>('input');
    const [textInput, setTextInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string; mimeType: string } | null>(null);
    const [extractedText, setExtractedText] = useState('');
    const [domain, setDomain] = useState('general');
    const [cardCount, setCardCount] = useState(5);
    const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
    const [usageStatus, setUsageStatus] = useState<AIUsageStatus | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            fetchUsageStatus();
        }
    }, [visible]);

    const fetchUsageStatus = async () => {
        try {
            const status = await aiService.getUsageStatus();
            setUsageStatus(status);
        } catch (error) {
            console.error('Failed to fetch usage status:', error);
        }
    };

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            setSelectedFile({
                name: file.name,
                uri: file.uri,
                mimeType: file.mimeType || 'application/octet-stream'
            });

            // 提取文件文本
            setLoading(true);
            try {
                const extracted = await aiService.extractFromFile(file.uri, file.name, file.mimeType || 'application/octet-stream');
                setExtractedText(extracted.text);
                Alert.alert('成功', `已提取 ${extracted.charCount} 个字符`);
            } catch (error: any) {
                Alert.alert('错误', error.message || '文件提取失败');
                setSelectedFile(null);
            } finally {
                setLoading(false);
            }
        } catch (error: any) {
            Alert.alert('错误', '文件选择失败');
        }
    };

    const handleGenerate = async () => {
        if (!usageStatus?.canGenerate) {
            Alert.alert('使用限制', '您已达到本月的AI生成次数上限');
            return;
        }

        const content = inputMode === 'text' ? textInput : extractedText;
        if (!content.trim()) {
            Alert.alert('提示', '请输入内容或上传文件');
            return;
        }

        setStep('generating');
        setLoading(true);

        try {
            const cards = await aiService.generateFlashcards({
                topic: content,
                count: cardCount,
                domain,
                sourceType: inputMode
            });

            setGeneratedCards(cards);
            setStep('preview');
            await fetchUsageStatus(); // 更新使用状态
        } catch (error: any) {
            Alert.alert('生成失败', error.message || '请稍后重试');
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCard = (index: number, field: 'front' | 'back', value: string) => {
        const updated = [...generatedCards];
        updated[index][field] = value;
        setGeneratedCards(updated);
    };

    const handleDeleteCard = (index: number) => {
        setGeneratedCards(cards => cards.filter((_, i) => i !== index));
    };

    const handleSave = () => {
        if (generatedCards.length === 0) {
            Alert.alert('提示', '没有可保存的卡片');
            return;
        }
        onSave(generatedCards);
        handleClose();
    };

    const handleClose = () => {
        setStep('input');
        setTextInput('');
        setSelectedFile(null);
        setExtractedText('');
        setGeneratedCards([]);
        onClose();
    };

    const renderInputStep = () => (
        <ScrollView style={styles.content}>
            {/* 使用状态 */}
            {usageStatus && (
                <Card style={styles.usageCard}>
                    <View style={styles.usageHeader}>
                        <Ionicons name="flash" size={20} color={theme.colors.interactive.primary} />
                        <Text style={[styles.usageText, { color: theme.colors.text.primary }]}>
                            本月剩余: {usageStatus.remaining}/{usageStatus.limit}
                        </Text>
                    </View>
                    <Text style={[styles.usageTier, { color: theme.colors.text.tertiary }]}>
                        {usageStatus.tier === 'pro' ? 'Pro会员' : '免费版'}
                    </Text>
                </Card>
            )}

            {/* 输入模式选择 */}
            <View style={styles.modeSelector}>
                <TouchableOpacity
                    style={[
                        styles.modeButton,
                        inputMode === 'text' && styles.modeButtonActive,
                        { borderColor: theme.colors.border.primary }
                    ]}
                    onPress={() => setInputMode('text')}
                >
                    <Ionicons
                        name="text"
                        size={20}
                        color={inputMode === 'text' ? theme.colors.interactive.primary : theme.colors.text.tertiary}
                    />
                    <Text style={[
                        styles.modeButtonText,
                        { color: inputMode === 'text' ? theme.colors.interactive.primary : theme.colors.text.tertiary }
                    ]}>
                        文本输入
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.modeButton,
                        inputMode === 'file' && styles.modeButtonActive,
                        { borderColor: theme.colors.border.primary }
                    ]}
                    onPress={() => setInputMode('file')}
                >
                    <Ionicons
                        name="document"
                        size={20}
                        color={inputMode === 'file' ? theme.colors.interactive.primary : theme.colors.text.tertiary}
                    />
                    <Text style={[
                        styles.modeButtonText,
                        { color: inputMode === 'file' ? theme.colors.interactive.primary : theme.colors.text.tertiary }
                    ]}>
                        文件上传
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 输入区域 */}
            {inputMode === 'text' ? (
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: theme.colors.text.primary }]}>输入内容</Text>
                    <TextInput
                        style={[
                            styles.textInput,
                            {
                                backgroundColor: theme.colors.background.secondary,
                                color: theme.colors.text.primary,
                                borderColor: theme.colors.border.primary
                            }
                        ]}
                        placeholder="输入要生成卡片的内容..."
                        placeholderTextColor={theme.colors.text.tertiary}
                        multiline
                        value={textInput}
                        onChangeText={setTextInput}
                        maxLength={5000}
                    />
                    <Text style={[styles.charCount, { color: theme.colors.text.tertiary }]}>
                        {textInput.length}/5000
                    </Text>
                </View>
            ) : (
                <View style={styles.inputSection}>
                    <Text style={[styles.label, { color: theme.colors.text.primary }]}>选择文件</Text>
                    <TouchableOpacity
                        style={[styles.fileButton, { borderColor: theme.colors.border.primary }]}
                        onPress={handlePickFile}
                        disabled={loading}
                    >
                        <Ionicons name="cloud-upload" size={24} color={theme.colors.interactive.primary} />
                        <Text style={[styles.fileButtonText, { color: theme.colors.text.primary }]}>
                            {selectedFile ? selectedFile.name : '选择 PDF, DOCX 或 TXT 文件'}
                        </Text>
                    </TouchableOpacity>
                    {extractedText && (
                        <Text style={[styles.extractedInfo, { color: theme.colors.text.tertiary }]}>
                            已提取 {extractedText.length} 个字符
                        </Text>
                    )}
                </View>
            )}

            {/* 领域选择 */}
            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>选择领域</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainScroll}>
                    {DOMAINS.map(d => (
                        <TouchableOpacity
                            key={d.value}
                            style={[
                                styles.domainChip,
                                domain === d.value && styles.domainChipActive,
                                { borderColor: theme.colors.border.primary }
                            ]}
                            onPress={() => setDomain(d.value)}
                        >
                            <Text style={[
                                styles.domainChipText,
                                { color: domain === d.value ? theme.colors.interactive.primary : theme.colors.text.secondary }
                            ]}>
                                {d.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* 卡片数量 */}
            <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.colors.text.primary }]}>生成数量: {cardCount}</Text>
                <View style={styles.countSelector}>
                    {[3, 5, 10, 15, 20].map(count => (
                        <TouchableOpacity
                            key={count}
                            style={[
                                styles.countButton,
                                cardCount === count && styles.countButtonActive,
                                { borderColor: theme.colors.border.primary }
                            ]}
                            onPress={() => setCardCount(count)}
                        >
                            <Text style={[
                                styles.countButtonText,
                                { color: cardCount === count ? theme.colors.interactive.primary : theme.colors.text.secondary }
                            ]}>
                                {count}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );

    const renderGeneratingStep = () => (
        <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.interactive.primary} />
            <Text style={[styles.generatingText, { color: theme.colors.text.primary }]}>
                AI 正在生成卡片...
            </Text>
            <Text style={[styles.generatingHint, { color: theme.colors.text.tertiary }]}>
                这可能需要几秒钟
            </Text>
        </View>
    );

    const renderPreviewStep = () => (
        <ScrollView style={styles.content}>
            <View style={styles.previewHeader}>
                <Text style={[styles.previewTitle, { color: theme.colors.text.primary }]}>
                    生成了 {generatedCards.length} 张卡片
                </Text>
                <Text style={[styles.previewHint, { color: theme.colors.text.tertiary }]}>
                    点击编辑或删除卡片
                </Text>
            </View>

            {generatedCards.map((card, index) => (
                <Card key={index} style={styles.cardPreview}>
                    <View style={styles.cardPreviewHeader}>
                        <Text style={[styles.cardNumber, { color: theme.colors.text.tertiary }]}>
                            卡片 {index + 1}
                        </Text>
                        <TouchableOpacity onPress={() => handleDeleteCard(index)}>
                            <Ionicons name="trash-outline" size={20} color={theme.colors.status.error} />
                        </TouchableOpacity>
                    </View>

                    <Text style={[styles.cardLabel, { color: theme.colors.text.secondary }]}>问题</Text>
                    <TextInput
                        style={[
                            styles.cardInput,
                            {
                                backgroundColor: theme.colors.background.secondary,
                                color: theme.colors.text.primary,
                                borderColor: theme.colors.border.primary
                            }
                        ]}
                        value={card.front}
                        onChangeText={(text) => handleEditCard(index, 'front', text)}
                        multiline
                    />

                    <Text style={[styles.cardLabel, { color: theme.colors.text.secondary }]}>答案</Text>
                    <TextInput
                        style={[
                            styles.cardInput,
                            {
                                backgroundColor: theme.colors.background.secondary,
                                color: theme.colors.text.primary,
                                borderColor: theme.colors.border.primary
                            }
                        ]}
                        value={card.back}
                        onChangeText={(text) => handleEditCard(index, 'back', text)}
                        multiline
                    />
                </Card>
            ))}
        </ScrollView>
    );

    return (
        <Modal visible={visible} onClose={handleClose} title="AI 生成卡片">
            {step === 'input' && renderInputStep()}
            {step === 'generating' && renderGeneratingStep()}
            {step === 'preview' && renderPreviewStep()}

            <View style={styles.footer}>
                {step === 'input' && (
                    <Button
                        title="生成卡片"
                        onPress={handleGenerate}
                        disabled={loading || !usageStatus?.canGenerate}
                        loading={loading}
                    />
                )}
                {step === 'preview' && (
                    <>
                        <Button
                            title="重新生成"
                            onPress={() => setStep('input')}
                            variant="outline"
                            style={{ flex: 1, marginRight: 8 }}
                        />
                        <Button
                            title={`保存 ${generatedCards.length} 张卡片`}
                            onPress={handleSave}
                            style={{ flex: 1 }}
                        />
                    </>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    usageCard: {
        marginBottom: 16,
        padding: 12,
    },
    usageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    usageText: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    usageTier: {
        fontSize: 12,
        marginLeft: 28,
    },
    modeSelector: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    modeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
    },
    modeButtonActive: {
        borderWidth: 2,
    },
    modeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    textInput: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 12,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },
    fileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderStyle: 'dashed',
    },
    fileButtonText: {
        fontSize: 14,
        marginLeft: 8,
    },
    extractedInfo: {
        fontSize: 12,
        marginTop: 8,
    },
    domainScroll: {
        marginHorizontal: -4,
    },
    domainChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginHorizontal: 4,
    },
    domainChipActive: {
        borderWidth: 2,
    },
    domainChipText: {
        fontSize: 13,
        fontWeight: '500',
    },
    countSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    countButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    countButtonActive: {
        borderWidth: 2,
    },
    countButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    generatingText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    generatingHint: {
        fontSize: 14,
        marginTop: 8,
    },
    previewHeader: {
        marginBottom: 16,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    previewHint: {
        fontSize: 13,
        marginTop: 4,
    },
    cardPreview: {
        marginBottom: 16,
        padding: 16,
    },
    cardPreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardNumber: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        marginBottom: 4,
    },
    cardInput: {
        borderRadius: 8,
        borderWidth: 1,
        padding: 10,
        minHeight: 60,
        textAlignVertical: 'top',
    },
    footer: {
        flexDirection: 'row',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
});
