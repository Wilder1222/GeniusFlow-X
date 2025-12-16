'use client';

import React, { useState, useEffect } from 'react';
import styles from './tts-player.module.css';

interface Props {
    text: string;
    lang?: string;
    autoPlay?: boolean;
}

export default function TTSPlayer({ text, lang = 'zh-CN', autoPlay = false }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSupported, setIsSupported] = useState(true);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<string>('');
    const [rate, setRate] = useState(1);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setIsSupported(false);
            return;
        }

        const loadVoices = () => {
            const availableVoices = speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Find matching voice for language
            const matchingVoice = availableVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
            if (matchingVoice) {
                setSelectedVoice(matchingVoice.name);
            }
        };

        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        if (autoPlay && text) {
            speak();
        }

        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    const speak = () => {
        if (!text || !isSupported) return;

        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;

        // Set selected voice
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) {
            utterance.voice = voice;
        }

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        speechSynthesis.speak(utterance);
    };

    const stop = () => {
        speechSynthesis.cancel();
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (isPlaying) {
            stop();
        } else {
            speak();
        }
    };

    if (!isSupported) {
        return (
            <div className={styles.unsupported}>
                您的浏览器不支持语音合成
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <button
                className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                onClick={togglePlay}
                aria-label={isPlaying ? '停止' : '朗读'}
            >
                {isPlaying ? '⏹️' : '🔊'}
            </button>

            <div className={styles.controls}>
                <div className={styles.speedControl}>
                    <label className={styles.label}>语速</label>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className={styles.slider}
                    />
                    <span className={styles.rateValue}>{rate}x</span>
                </div>

                {voices.length > 1 && (
                    <select
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className={styles.voiceSelect}
                    >
                        {voices.filter(v => v.lang.startsWith(lang.split('-')[0])).map(voice => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
}
