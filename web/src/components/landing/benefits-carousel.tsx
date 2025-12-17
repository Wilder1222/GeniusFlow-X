'use client';

import { useState, useRef, useEffect } from 'react';
import { LuZap, LuTarget, LuTrendingUp, LuSparkles } from 'react-icons/lu';
import styles from './benefits-carousel.module.css';

const benefits = [
    {
        Icon: LuZap,
        title: '10倍效率提升',
        description: 'AI辅助创建闪卡，告别繁琐的手动输入，专注于学习本身。',
        color: '#fbbf24'
    },
    {
        Icon: LuTarget,
        title: '精准记忆',
        description: '科学算法确保您在遗忘之前复习，大幅提高长期记忆保留率。',
        color: '#f472b6'
    },
    {
        Icon: LuTrendingUp,
        title: '可视化进步',
        description: '清晰的数据仪表板让您的每一点进步都清晰可见，持续保持动力。',
        color: '#34d399'
    },
    {
        Icon: LuSparkles,
        title: '愉悦体验',
        description: '精心设计的界面和动效，让学习成为一种享受而非负担。',
        color: '#a78bfa'
    }
];

export default function BenefitsCarousel() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [statsInView, setStatsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    // Physics state refs
    const state = useRef({
        targetIndex: 0,
        currentProgress: 0,
        velocity: 0,
        isDragging: false,
        startX: 0,
        lastX: 0,
        isScrollLocked: false,
        scrollAccumulator: 0,
        lastScrollTime: 0
    });

    const totalCards = benefits.length;

    // Main animation loop
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            const s = state.current;

            // Spring physics parameters
            const tension = 0.08;
            const friction = 0.85;

            // Calculate force towards target
            const diff = s.targetIndex - s.currentProgress;

            if (!s.isDragging) {
                s.velocity += diff * tension;
                s.velocity *= friction;
                s.currentProgress += s.velocity;
            }

            // Apply transforms securely directly to DOM
            if (trackRef.current) {
                const cards = trackRef.current.children;
                for (let i = 0; i < cards.length; i++) {
                    const card = cards[i] as HTMLElement;
                    const offset = i - s.currentProgress;
                    const absOffset = Math.abs(offset);

                    // Card visual logic
                    const scale = Math.max(0.85, 1 - absOffset * 0.1);
                    const opacity = Math.max(0.4, 1 - absOffset * 0.3);
                    const zIndex = 100 - Math.round(absOffset * 10);

                    // Dynamic 3D transform
                    const x = offset * 412; // 380 + 32 spacing
                    const rotateY = offset * -25; // Dramatic rotation
                    const z = -absOffset * 100;

                    card.style.transform = `
                        translate(-50%, -50%) 
                        translateX(${x}px) 
                        translateZ(${z}px) 
                        rotateY(${rotateY}deg) 
                        scale(${scale})
                    `;
                    card.style.opacity = opacity.toString();
                    card.style.zIndex = zIndex.toString();

                    // Specific class for active styling if roughly centered
                    if (Math.abs(offset) < 0.3) {
                        card.classList.add(styles.cardActive);
                    } else {
                        card.classList.remove(styles.cardActive);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [totalCards]);

    // Sync state for UI updates (dots)
    useEffect(() => {
        const checkIndex = setInterval(() => {
            if (state.current.targetIndex !== activeIndex) {
                setActiveIndex(state.current.targetIndex);
            }
        }, 100);
        return () => clearInterval(checkIndex);
    }, [activeIndex]);

    // Wheel event handler
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            const s = state.current;
            const rect = container.getBoundingClientRect();

            // Only capture scroll when section is prominently visible (center of viewport)
            const sectionCenterY = rect.top + rect.height / 2;
            const viewportCenterY = window.innerHeight / 2;
            const distanceFromCenter = Math.abs(sectionCenterY - viewportCenterY);
            const isNearCenter = distanceFromCenter < window.innerHeight * 0.4;

            // Check if trying to scroll past boundaries
            const atStart = s.targetIndex <= 0 && e.deltaY < 0;
            const atEnd = s.targetIndex >= totalCards - 1 && e.deltaY > 0;

            // Allow normal scroll if at boundaries or section not centered
            if (atStart || atEnd || !isNearCenter) {
                s.isScrollLocked = false;
                return; // Don't prevent default - allow page scroll
            }

            // Only now prevent default and capture scroll for carousel
            e.preventDefault();
            s.isScrollLocked = true;

            const now = Date.now();
            if (now - s.lastScrollTime > 80) {
                s.scrollAccumulator = 0;
            }
            s.lastScrollTime = now;
            s.scrollAccumulator += e.deltaY;

            // Card change threshold - higher = less sensitive
            const threshold = 120;
            if (Math.abs(s.scrollAccumulator) > threshold) {
                const direction = s.scrollAccumulator > 0 ? 1 : -1;
                const nextIndex = Math.max(0, Math.min(totalCards - 1, s.targetIndex + direction));

                if (nextIndex !== s.targetIndex) {
                    s.targetIndex = nextIndex;
                    s.scrollAccumulator = 0;
                }
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [totalCards]);

    // Touch/Drag handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        const s = state.current;
        s.isDragging = true;
        s.startX = e.clientX;
        s.lastX = e.clientX;
        s.velocity = 0;
        if (trackRef.current) trackRef.current.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const s = state.current;
        if (!s.isDragging) return;

        const delta = s.lastX - e.clientX;
        s.lastX = e.clientX;

        // Direct pixel to progress mapping (sensitivity)
        s.currentProgress += delta / 412;
    };

    const handlePointerUp = () => {
        const s = state.current;
        if (!s.isDragging) return;
        s.isDragging = false;
        if (trackRef.current) trackRef.current.style.cursor = 'grab';

        // Snap to nearest
        let snapIndex = Math.round(s.currentProgress);
        snapIndex = Math.max(0, Math.min(totalCards - 1, snapIndex));
        s.targetIndex = snapIndex;
    };

    // Viewport observer for stats animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setStatsInView(true);
            },
            { threshold: 0.5 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section id="benefits" className={styles.benefits} ref={containerRef}>
            {/* Flowing gradient background */}
            <div className={styles.flowingBackground}>
                <div className={styles.gradientOrb1}></div>
                <div className={styles.gradientOrb2}></div>
                <div className={styles.gradientOrb3}></div>
            </div>

            <div className={styles.container}>
                <div className={styles.header}>
                    <span className={styles.badge}>💡 为什么选择我们</span>
                    <h2 className={styles.title}>学习效率的革命性提升</h2>
                </div>

                <div
                    className={styles.carouselWrapper}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <div className={styles.carouselTrack} ref={trackRef}>
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className={styles.card}
                                // No inline styles here, controlled by JS loop
                                onClick={() => {
                                    state.current.targetIndex = index;
                                }}
                            >
                                <div className={styles.cardGlow}></div>
                                <div
                                    className={styles.cardIcon}
                                    style={{ color: benefit.color }}
                                >
                                    <benefit.Icon size={36} />
                                </div>
                                <h3 className={styles.cardTitle}>{benefit.title}</h3>
                                <p className={styles.cardDescription}>{benefit.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress indicator */}
                <div className={styles.progress}>
                    {benefits.map((_, index) => (
                        <div
                            key={index}
                            className={`${styles.progressDot} ${index === activeIndex ? styles.progressDotActive : ''}`}
                            onClick={() => {
                                state.current.targetIndex = index;
                                setActiveIndex(index);
                            }}
                        />
                    ))}
                </div>

                {/* Stats */}
                <div className={`${styles.stats} ${statsInView ? styles.statsVisible : ''}`}>
                    <div className={styles.statItem} style={{ '--delay': '0s' } as any}>
                        <div className={styles.statValue}>10K+</div>
                        <div className={styles.statLabel}>活跃用户</div>
                    </div>
                    <div className={styles.statItem} style={{ '--delay': '0.1s' } as any}>
                        <div className={styles.statValue}>1M+</div>
                        <div className={styles.statLabel}>AI生成卡片</div>
                    </div>
                    <div className={styles.statItem} style={{ '--delay': '0.2s' } as any}>
                        <div className={styles.statValue}>95%</div>
                        <div className={styles.statLabel}>记忆保留率</div>
                    </div>
                    <div className={styles.statItem} style={{ '--delay': '0.3s' } as any}>
                        <div className={styles.statValue}>80%</div>
                        <div className={styles.statLabel}>时间节省</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
