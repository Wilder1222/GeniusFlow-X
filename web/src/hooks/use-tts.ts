import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTTSOptions {
    rate?: number;
    pitch?: number;
    volume?: number;
    lang?: string;
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export function useTTS(options: UseTTSOptions = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const synth = useRef<SpeechSynthesis | null>(null);
    const utterance = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synth.current = window.speechSynthesis;
            setIsSupported(true);
        }
    }, []);

    const cancel = useCallback(() => {
        if (synth.current) {
            synth.current.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (!synth.current) return;

        // Cancel any current speaking
        cancel();

        const u = new SpeechSynthesisUtterance(text);
        u.rate = options.rate || 1;
        u.pitch = options.pitch || 1;
        u.volume = options.volume || 1;
        u.lang = options.lang || 'en-US'; // Default to English, but we should detect content or user setting

        // Detect language if Chinese characters are present
        if (/[\u4e00-\u9fa5]/.test(text)) {
            u.lang = 'zh-CN';
        }

        u.onstart = () => {
            setIsSpeaking(true);
            setIsPaused(false);
        };

        u.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            options.onEnd?.();
        };

        u.onerror = (e) => {
            console.error('TTS Error:', e);
            setIsSpeaking(false);
            setIsPaused(false);
            options.onError?.(e);
        };

        utterance.current = u;
        synth.current.speak(u);
    }, [cancel, options]);

    const pause = useCallback(() => {
        if (synth.current && !isPaused && isSpeaking) {
            synth.current.pause();
            setIsPaused(true);
            setIsSpeaking(false);
        }
    }, [isPaused, isSpeaking]);

    const resume = useCallback(() => {
        if (synth.current && isPaused) {
            synth.current.resume();
            setIsPaused(false);
            setIsSpeaking(true);
        }
    }, [isPaused]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return {
        speak,
        cancel,
        pause,
        resume,
        isSpeaking,
        isPaused,
        isSupported
    };
}
