import React from 'react';
import styles from './stats-overview.module.css';

export const StatsOverview: React.FC = () => {
    return (
        <div className={styles.container}>
            <div className={styles.row}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Study Trends</h3>
                    <div className={styles.chartPlaceholder}>
                        {/* Simple SVG Line Chart */}
                        <svg viewBox="0 0 300 100" width="100%" height="100%" preserveAspectRatio="none">
                            <path
                                d="M0,80 C50,80 50,30 100,30 C150,30 150,60 200,60 C250,60 250,10 300,10"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="4"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ff9a9e" />
                                    <stop offset="100%" stopColor="#fecfef" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Heatmap</h3>
                    <div className={styles.heatmap}>
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.heatmapCell} ${Math.random() > 0.7 ? styles[`level${Math.ceil(Math.random() * 4)}`] : ''
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Performance</h3>
                    <div className={styles.barChart}>
                        <div className={styles.bar} style={{ height: '40%' }}></div>
                        <div className={styles.bar} style={{ height: '70%' }}></div>
                        <div className={styles.bar} style={{ height: '50%' }}></div>
                        <div className={styles.bar} style={{ height: '90%' }}></div>
                        <div className={styles.bar} style={{ height: '30%' }}></div>
                        <div className={styles.bar} style={{ height: '60%' }}></div>
                        <div className={styles.bar} style={{ height: '80%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
