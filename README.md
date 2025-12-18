<div align="center">

# 🧠 GeniusFlow-X

> **AI-Powered Intelligent Flashcard App · Master Knowledge Anytime, Anywhere**

[![License: CC BY-NC 4.0](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc/4.0/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.76-blue?logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-black?logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase&logoColor=white)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)](https://openai.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen)](#)

**English** · [简体中文](./README_zh-CN.md) · [Feedback](https://github.com/Start-to-input-your-repo-url/issues)

<br/>

![GeniusFlow-X Demo](web/public/assets/landing-demo.webp)

</div>

---

## 📖 Introduction

**GeniusFlow-X** is a modern learning tool that fuses **AI Content Generation** with the **Advanced Spaced Repetition Algorithm (FSRS)**. We are dedicated to making knowledge acquisition and retention easier and more efficient through technology.

This project uses a **Monorepo** architecture to unify Web and Mobile code management, ensuring a consistent development experience and efficient code reuse.

## ✨ Core Features

<table>
  <tr>
    <td align="center">🤖 <b>AI Content Generation</b></td>
    <td align="center">🧠 <b>FSRS Algorithm</b></td>
    <td align="center">📱 <b>Multi-Platform Sync</b></td>
  </tr>
  <tr>
    <td>Automatically generate high-quality, multi-dimensional flashcards using OpenAI.</td>
    <td>Built-in latest Free Spaced Repetition Scheduler algorithm to scientifically plan review times.</td>
    <td>Seamless data sync between Web and Mobile, achieved via Supabase with millisecond latency.</td>
  </tr>
  <tr>
    <td align="center">🎨 <b>Extreme Customization</b></td>
    <td align="center">📊 <b>Data Visualization</b></td>
    <td align="center">🗣️ <b>Smart TTS</b></td>
  </tr>
   <tr>
    <td>Support for custom themes, card styles, and learning goals to create a personalized study space.</td>
    <td>Detailed learning heatmaps and progress analysis make every step of progress visible.</td>
    <td>Integrated high-quality Text-to-Speech, supporting multiple languages to reinforce auditory memory.</td>
  </tr>
</table>

## 🏗 Tech Stack

### 🖥️ Web (`/web`)
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI System**: React 19, Tailwind CSS, Radix UI, Framer Motion
- **Data Layer**: Supabase (Auth, Postgres, Realtime)
- **Features**: PWA Support, Server-Side Rendering (SSR)

### 📱 Mobile (`/mobile`)
- **Framework**: [React Native](https://reactnative.dev/) (via Expo)
- **Router**: Expo Router
- **Styling**: NativeWind (Tailwind for RN)
- **Interaction**: Reanimated 2, Gesture Handler

## 📂 Project Structure

```bash
GeniusFlow-X/
├── 📂 docs/          # 📚 Documentation (PRD, Tech Specs)
├── 📂 mobile/        # 📱 React Native Mobile App
├── 📂 web/           # 🖥️ Next.js Web App
├── 📄 README.md      # 📌 Project Readme (English)
└── ...
```

## 🚀 Quick Start

### Prerequisites
*   **Node.js**: v18.17.0 or higher
*   **Package Manager**: npm or yarn
*   **Service Dependency**: Supabase Project (Env vars required)

### 🛠️ Start Web
```bash
cd web
npm install
# Configure .env.local
npm run dev
# Visit: http://localhost:3000
```

### 📱 Start Mobile
```bash
cd mobile
npm install
# Configure .env
npm start
# Press 'a' to run Android, 'i' to run iOS
```

## 🤝 Contribution

We welcome contributions! If you have ideas or found bugs, please check `docs/guides/CONTRIBUTING.md` (to be created).

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

✅ **You are free to**:
*   **Share** — copy and redistribute the material in any medium or format.
*   **Adapt** — remix, transform, and build upon the material.

⛔ **Under the following terms**:
*   **NonCommercial** — You may not use the material for commercial purposes.
*   **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.

[View Full License](https://creativecommons.org/licenses/by-nc/4.0/legalcode)

---

<div align="center">
  <sub>Built with ❤️ by GeniusFlow-X Team</sub>
</div>
