'use client';

import Link from "next/link";
import styles from "./offline.module.css";

export default function Offline() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.icon}>📶 ❌</div>
                <h1>您处于离线状态</h1>
                <p>不用担心! GeniusFlow-X 可以在离线状态下运行，但是您当前访问的页面尚未被缓存。</p>
                <Link href="/study" className={styles.button}>
                    去学习 (离线可用)
                </Link>
                <Link href="/" className={styles.buttonSecondary}>
                    返回首页
                </Link>
            </div>
        </div>
    );
}
