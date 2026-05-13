# DesiDiet AI Frontend

> **A Premium, AI-Native Nutrition Platform for Bangladesh.**

DesiDiet AI is a state-of-the-art nutritional dashboard and AI assistant specifically developed for the Bangladeshi population. Grounded in the **National Dietary Guidelines (NDG) Bangladesh 2025**, the platform provides a deeply personalized experience through advanced AI, GraphRAG technology, and a world-class user interface.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

---

##  Table of Contents
- [Core Philosophy](#-core-philosophy)
- [Key Modules](#-key-modules)
- [Technical Architecture](#-technical-architecture)
- [Tech Stack](#-tech-stack)
- [Design System](#-design-system)
- [Installation & Setup](#-installation--setup)

---

## Core Philosophy
DesiDiet is designed to bridge the gap between complex nutritional science and daily Bangladeshi lifestyle. 
- **Cultural Context:** Understands local foods (e.g., *Shuhtki*, *Rui Fish*, *Lau Shak*).
- **Medical Intelligence:** Tailors advice for Diabetes, Hypertension, CKD, and Obesity.
- **Language Native:** Full bilingual support (Bangla & English) as a first-class citizen.

---

## Key Modules

### 1. AI Chat Companion (SSE Streaming)
A real-time conversational interface where users can ask complex questions.
- **Context-Aware:** Uses your health profile to answer questions like *"Can I eat this as a Diabetic?"*.
- **Live Streaming:** Responses appear word-by-word for a fluid, natural feel.

### 2. Dynamic Meal Planner
The centerpiece of the platform.
- **AI-Generated:** Creates custom plans based on your BMI and health goals.
- **Interactive Editing:** Users can swap foods, add snacks, and remove items inline.
- **Slot Completion:** Track your daily progress with "Eaten/Not Eaten" status.

### 3. Food Database & Safety Explorer
A search engine for 370+ local foods.
- **Personalized Safety:** Foods are tagged as **Safe**, **Caution**, or **Avoid** based on your specific conditions.
- **AI Insights:** Real-time dietary reasoning for why a food is good or bad for you.

### 4. Health & Vital Logging
Track long-term progress with beautiful visualizations.
- **Metrics:** Weight, Blood Pressure, Blood Sugar, and HbA1c.
- **Analytics:** Interactive trend charts powered by `Recharts`.

---

## Technical Architecture

The frontend is built with a focus on **Performance**, **Security**, and **Scalability**.

### State Management & Data Fetching
- **Auth Context:** Centralized authentication and profile state.
- **Custom API Layer:** A robust, typed fetch wrapper in `src/lib/api.ts` with automatic token refreshing and error handling.

### Internationalization (i18n)
- Powered by `react-i18next`.
- Centralized resource dictionary in `src/lib/i18n.ts`.
- Dynamic language switching that persists across sessions.

### Layout Engine
- **DashboardLayout:** A high-end sidebar-driven layout for authenticated users.
- **Motion Orchestration:** Complex page transitions and staggered entrance animations.

---

##  Tech Stack

- **Framework:** React 18 (with TypeScript)
- **Styling:** Vanilla CSS + Tailwind CSS v3
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Charts:** Recharts
- **Routing:** React Router v6
- **i18n:** React-i18next

---

##  Design System

We follow a **"Magazine-Brutalist"** aesthetic:
- **Palette:** `Cream (#F5F0E8)` background with `Ink (#1A1714)` typography and `Accent (#C8472A)` highlights.
- **Typography:** 
  - *English:* Space Grotesk (Body) & Playfair Display (Heading)
  - *Bangla:* Hind Siliguri
- **Atmosphere:** Soft glassmorphism, cinematic grain textures, and organic micro-interactions.

---

##  Installation & Setup

### 1. Clone & Install
```bash
git clone https://github.com/LegendaryBeast/DesiDiet.git
cd DesiDiet/frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `frontend` directory:
```env
# Backend API URL (optional, defaults to empty for Vite proxy)
VITE_API_URL=http://localhost:8000
```

### 3. Run Development Server
```bash
npm run dev
```

---

# Legal & Disclaimer
DesiDiet AI is an AI-powered assistant and **not a medical device**. Users are encouraged to consult registered professionals for serious health concerns. Full details can be found on our `/conditions` page.

Developed with for the people of Bangladesh. 
