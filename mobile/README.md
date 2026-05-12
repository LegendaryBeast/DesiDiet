# Khadok-Bangla AI — Mobile App

Expo React Native mobile app for Khadok-Bangla AI, matching the web frontend's premium editorial aesthetic.

## Stack

- **Expo SDK** ~54.0.33 with React Native 0.81.5
- **Expo Router** ~6.0.23 (file-based routing)
- **React Native Reanimated** ~4.1.1 (animations)
- **Lucide React Native** (icons)
- **Axios** (HTTP client)
- **AsyncStorage** (JWT persistence)

## Fonts

- **Hind Siliguri** — Bengali body text
- **Playfair Display** — English display headings
- **Space Grotesk** — English body text

## Design System

| Token | Value |
|-------|-------|
| Cream | `#F5F0E8` |
| Ink | `#1A1714` |
| Accent (Terracotta) | `#C8472A` |
| Gold | `#B8933E` |
| Forest | `#2C5530` |

## Backend Connection

Update `lib/api.ts`:
```ts
const API_BASE_URL = 'http://YOUR_BACKEND_IP:8000';
```

- **Web/Emulator**: Use `http://localhost:8000`
- **Physical Device (Expo Go)**: Use your machine's LAN IP (e.g., `http://192.168.1.100:8000`)

CORS is already configured in the FastAPI backend for Expo dev clients.

## Running

```bash
cd DesiDiet/mobile
npx expo start        # Metro bundler
npx expo start --web  # Web preview
```

Scan the QR code with Expo Go (iOS/Android) or press `w` for web preview.

## Project Structure

```
app/
  (auth)/          # Auth flow (welcome, login, register, onboarding)
  (tabs)/          # Main app tabs (home, meals, chat, profile)
  _layout.tsx      # Root layout with fonts + auth provider
  index.tsx        # Redirect to welcome
components/        # Reusable UI components
context/
  AuthContext.tsx  # JWT auth state
lib/
  api.ts           # Axios client + API endpoints
  theme.ts         # Colors, fonts, spacing, radius
```

## Auth Flow

1. **Welcome** → Register or Login
2. **Register** → Phone + Password → Onboarding
3. **Onboarding** → Profile details → Tabs
4. **Login** → Phone/Email + Password → Tabs (if profile exists) or Onboarding

## Features

- **Home**: Daily calorie target, macros, BMI, today's meal plan
- **Meals**: Daily + weekly meal plans with expandable days
- **Chat**: SSE streaming AI assistant in Bengali
- **Profile**: Stats, health trends, logout
