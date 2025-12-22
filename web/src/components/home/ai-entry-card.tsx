'use client';

import { LuSparkles, LuBrain, LuArrowRight } from 'react-icons/lu';
import styles from './ai-entry-card.module.css';

interface AIEntryCardProps {
    onStart: () => void;
}

export default function AIEntryCard({ onStart }: AIEntryCardProps) {
    return (
        <div className={styles.card}>
            <div className={styles.content}>
                <div className={styles.iconWrapper}>
                    <LuSparkles size={24} className={styles.icon} />
                </div>
                <div className={styles.text}>
                    <h2 className={styles.title}>
                        AI 智能生成闪卡
                        <span className={styles.badge}>BETA</span>
                    </h2>
                    <p className={styles.description}>
                        输入任意主题，AI 即可为您瞬间构建专属知识库。无论是准备考试还是学习新技能，都能事半功倍。
                    </p>
                </div>
                <button onClick={onStart} className={styles.actionButton}>
                    <span>立刻体验</span>
                    <LuArrowRight size={18} />
                </button>
            </div>

            {/* Background decoration */}
            <div className={styles.decoration}>
                <LuBrain size={120} className={styles.bgIcon} />
                <div className={styles.glow} />
            </div>
        </div>
    );
}
