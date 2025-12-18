<div align="center">

# 🧠 GeniusFlow-X

> **AI 驱动的智能闪卡学习应用 · 随时随地，高效掌握**

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.76-blue?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-black?logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)](#)

[English](./README.md) · **简体中文** · [提交反馈](https://github.com/Start-to-input-your-repo-url/issues)

<br/>

![GeniusFlow-X Demo](web/public/assets/landing-demo.webp)

</div>

---

## 📖 项目简介

**GeniusFlow-X** 是一款融合了 **AI 智能生成** 与 **先进间隔重复算法 (FSRS)** 的现代学习工具。我们致力于通过技术手段，让知识的获取与记忆变得更加轻松、高效。

本项目采用 **Monorepo** 架构，统一管理 Web 端与移动端代码，确保一致的开发体验与高效的代码复用。

## ✨ 核心亮点

<table>
  <tr>
    <td align="center">🤖 <b>AI 内容生成</b></td>
    <td align="center">🧠 <b>FSRS 算法</b></td>
    <td align="center">📱 <b>多端实时同步</b></td>
  </tr>
  <tr>
    <td>利用 OpenAI 自动生成高质量、多维度的闪卡内容，告别手动制卡。</td>
    <td>内置最新的 Free Spaced Repetition Scheduler 算法，科学规划复习时间。</td>
    <td>Web端与移动端数据无缝互通，基于 Supabase 实现毫秒级同步。</td>
  </tr>
  <tr>
    <td align="center">🎨 <b>极致个性化</b></td>
    <td align="center">📊 <b>数据可视化</b></td>
    <td align="center">🗣️ <b>智能语音 (TTS)</b></td>
  </tr>
   <tr>
    <td>支持自定义主题、卡片样式与学习目标，打造专属学习空间。</td>
    <td>详尽的学习热力图与进度分析，让每一次进步都清晰可见。</td>
    <td>集成高质量语音合成，支持多语言朗读，强化听力记忆。</td>
  </tr>
</table>

## 🏗 技术架构

### 🖥️ Web 端 (`/web`)
- **核心框架**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI系统**: React 19, Tailwind CSS, Radix UI, Framer Motion
- **数据层**: Supabase (Auth, Postgres, Realtime)
- **特色功能**: PWA 支持, 服务端渲染 (SSR)

### 📱 移动端 (`/mobile`)
- **核心框架**: [React Native](https://reactnative.dev/) (via Expo)
- **路由管理**: Expo Router
- **样式方案**: NativeWind (Tailwind for RN)
- **交互体验**: Reanimated 2, Gesture Handler

## 📂 目录结构

```bash
GeniusFlow-X/
├── 📂 docs/          # 📚 项目文档中心 (PRD, 技术方案)
├── 📂 mobile/        # 📱 React Native 移动端源码
├── 📂 web/           # 🖥️ Next.js Web 端源码
├── 📄 README.md      # 📌 项目说明
└── ...
```

## 🚀 快速上手

### 前置要求
*   **Node.js**: v18.17.0 或更高版本
*   **包管理器**: npm 或 yarn
*   **服务依赖**: Supabase 项目 (需配置环境变量)

### 🛠️ 启动 Web 端
```bash
cd web
npm install
# 配置 .env.local 后
npm run dev
# 访问: http://localhost:3000
```

### 📱 启动 移动端
```bash
cd mobile
npm install
# 配置 .env 后
npm start
# 按 'a' 启动 Android, 'i' 启动 iOS
```

## 🤝 参与贡献

我们非常欢迎社区的贡献！如果您有好的想法或发现了 Bug，请先查看 `docs/guides/CONTRIBUTING.md` (需创建)。

1.  Fork 本仓库
2.  创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交您的修改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  提交 Pull Request

## 📄 许可证

本项目采用 **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** 许可协议。

✅ **您可以**：
*   **共享** — 在任何媒介以任何形式复制、发行本作品。
*   **演绎** — 修改、转换或以本作品为基础进行创作。

⛔ **但必须遵守以下条件**：
*   **不可商业使用** — 您不得将本作品用于商业目的。
*   **署名** — 您必须给予适当的署名，提供指向本许可协议的链接，同时标明是否（对原始作品）作了修改。

[查看许可证全文](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

<div align="center">
  <sub>Built with ❤️ by GeniusFlow-X Team</sub>
</div>
