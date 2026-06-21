# 🌍 EcoVision Web — AI-Powered Sustainability Dashboard

> Track your carbon footprint, scan waste, get AI-powered eco advice, and earn green badges — all from your browser.

EcoVision Web is a **single-page web application** converted from the original [EcoVision React Native](../EcoVision/) mobile app. It delivers the same complete sustainability experience using **zero dependencies** — just vanilla HTML, CSS, and JavaScript.

---

## 📸 Screenshots

| Welcome | Assessment Results | Dashboard |
|---|---|---|
| ![Welcome](https://via.placeholder.com/300x200?text=Welcome+Screen) | ![Results](https://via.placeholder.com/300x200?text=Assessment+Results) | ![Dashboard](https://via.placeholder.com/300x200?text=Dashboard) |

| Carbon Simulator | AI Coach | Profile |
|---|---|---|
| ![Simulator](https://via.placeholder.com/300x200?text=Simulator) | ![Coach](https://via.placeholder.com/300x200?text=AI+Coach) | ![Profile](https://via.placeholder.com/300x200?text=Profile) |

---

## ✨ Features

### 🏠 Home / Dashboard
- **Welcome card** on first visit with quick-start actions
- **Eco Score ring** — animated SVG circular progress indicator (green ≥70, yellow ≥40, red <40)
- **Carbon footprint card** displaying monthly CO₂ in kg
- **Active challenge** and **latest achievement** at a glance

### 📋 Carbon Footprint Assessment
- **4-step guided wizard** with animated step indicator
  - **Step 1** — Transportation mode (Bike, Public Transport, Car, Frequent Flyer)
  - **Step 2** — Diet type (Vegan, Vegetarian, Mixed, Meat-heavy)
  - **Step 3** — Daily energy usage with ±buttons, progress bar, and quick presets
  - **Step 4** — Shopping habits (Minimal, Low, Medium, High)
- **Real-time calculation** using scientifically-modeled carbon factors
- **Results page** with score ring, footprint breakdown bar chart, and personalized tips
- Results persist to `localStorage` across sessions

### 📸 Waste Scanner
- **Drag-and-drop** or click-to-upload image zone
- **Mock AI classification** — simulates YOLOv8 object detection returning:
  - Detected object name
  - Waste category with color-coded badge (Plastic, Paper, Glass, Metal, Organic, Electronic)
  - Environmental impact level (Low / Medium / High / Critical)
  - CO₂ savings estimate
  - Actionable recycling suggestion
- **Scan history** with color-coded timeline

### 🧠 AI Eco Coach
- **"Get AI Advice"** button simulates Gemini API call
- Returns **personalized suggestions** and **quick tips**
- **Eco Challenges** — 7 built-in challenges (Cycle Commuter, Plastic Detox, Energy Saver, etc.) with progress tracking
- **Achievement system** — completing challenges unlocks badges

### 📊 Carbon Simulator
- **4 improvement toggles** with CO₂ savings per option:
  - Switch to bike (saves 6.5 kg)
  - Go vegetarian (saves 8.0 kg)
  - Reduce energy by 50% (saves 3.5 kg)
  - Shop minimal (saves 5.0 kg)
- **Real-time projected footprint** and **score** recalculation
- **Before vs After** bar chart comparison

### 👤 Profile
- **Avatar** with first-letter initial
- **Editable username** (click to edit, saves to localStorage)
- **Stats grid** — Eco Points, Scans, Assessments, Badges
- **Eco Score ring** display
- **Achievement gallery** with unlock dates
- **Clear All Data** with confirmation modal

---

## 🏗️ Architecture

```
EcoVision-Web/
├── index.html     # App shell — sidebar nav, bottom nav, modals, toast
├── index.css      # Design system — dark glassmorphism theme (~1100 lines)
└── app.js         # SPA logic — router, pages, business logic (~720 lines)
```

### How It Works

```
┌─────────────────────────────────────────────────────┐
│                    index.html                       │
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Sidebar  │  │         Main Content             │ │
│  │   Nav    │  │  ┌──────────────────────────┐    │ │
│  │          │  │  │   Page Container         │    │ │
│  │  Home    │  │  │   (rendered by app.js)    │    │ │
│  │  Assess  │  │  │                          │    │ │
│  │  Scan    │  │  │  - Dynamic HTML          │    │ │
│  │  Coach   │  │  │  - SVG Eco Score rings   │    │ │
│  │  Sim     │  │  │  - CSS bar charts        │    │ │
│  │  Profile │  │  │  - Interactive forms      │    │ │
│  │          │  │  └──────────────────────────┘    │ │
│  └──────────┘  └──────────────────────────────────┘ │
│                 ┌──── Bottom Nav (mobile) ────┐     │
└─────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
    Hash Router          localStorage
   (#home, #scan,      (assessments,
    #coach, etc.)       scan history,
                        challenges,
                        achievements)
```

### Client-Side SPA Router

Navigation uses **hash-based routing** (`#home`, `#assessment`, `#scan`, etc.). Each page has a render function that dynamically generates the HTML content using template literals. No page reloads — everything happens in the browser.

### Data Persistence

All data is stored in `localStorage` using the same keys as the mobile app:

| Key | Data |
|---|---|
| `ecovision_assessment` | Last assessment result (score, footprint, breakdown) |
| `ecovision_scan_history` | Array of scan results (up to 50) |
| `ecovision_achievements` | Unlocked achievement badges (up to 100) |
| `ecovision_challenges` | Challenge progress states |
| `ecovision_username` | User display name |

### Carbon Calculation Formula

The footprint is computed using weighted factors from real-world emission data:

```
Transport = transportFactor × 2.5
Food      = foodFactor × 7
Energy    = dailyKWh × 0.5 × 30
Shopping  = shoppingFactor × 4

Total Footprint = Transport + Food + Energy + Shopping (kg CO₂/month)
Eco Score       = max(0, min(100, 100 - (footprint / 50) × 100))
```

**Transport Factors:** Bike (0), Public (1.5), Car (4.2), Plane (6.8)
**Food Factors:** Vegan (1.5), Vegetarian (2.0), Mixed (3.5), Meat-heavy (5.5)
**Shopping Factors:** Minimal (0.5), Low (1.5), Medium (3.0), High (5.0)

---

## 🚀 Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No Node.js, npm, or build tools required

### Run Locally

```bash
# Simply open the file in your browser
open index.html

# Or use any local server
python3 -m http.server 3000
# Then visit http://localhost:3000
```

### Quick Demo Flow

1. **Open EcoVision** → See the welcome card
2. **Start Assessment** → Answer 4 questions → Get your eco score
3. **Go Home** → Dashboard shows your score, footprint, and active challenge
4. **Scan Waste** → Upload any image → Get mock waste classification
5. **AI Coach** → Click "Get AI Advice" → See suggestions, complete challenges
6. **Simulator** → Toggle green improvements → Watch projected footprint drop
7. **Profile** → See your stats, edit username, view badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | HTML5 (semantic elements) |
| **Styling** | Vanilla CSS (custom properties, glassmorphism, CSS animations) |
| **Logic** | Vanilla JavaScript (ES6+, no frameworks) |
| **Charts** | Pure CSS bar charts |
| **Score Ring** | Inline SVG with animated `stroke-dashoffset` |
| **Typography** | Google Fonts — Inter |
| **Storage** | Browser `localStorage` |
| **Routing** | Hash-based SPA router |

---

## 🗺️ Future Improvements

### 🔌 Backend Integration
- [ ] **Connect to FastAPI backend** — Replace mock data with real API calls to the existing `backend/` service (`POST /api/assessment`, `POST /api/scan`, `POST /api/coach`)
- [ ] **User authentication** — Add login/signup with JWT tokens for multi-device sync
- [ ] **Cloud database** — Migrate from localStorage to Supabase/Firebase for persistent cross-device storage

### 🤖 AI Enhancements
- [ ] **Real waste detection** — Integrate a TensorFlow.js or ONNX.js model (YOLOv8 Nano) for actual in-browser image classification without a backend
- [ ] **Gemini API integration** — Connect to Google Gemini for truly personalized, context-aware sustainability coaching
- [ ] **Smart recommendations** — Use assessment history to generate trend-based suggestions (e.g., "Your energy usage increased 15% this month")

### 📊 Data & Visualization
- [ ] **Assessment history tracking** — Store multiple assessments and show progress over time with line/area charts
- [ ] **Carbon reduction streak** — Track consecutive days of meeting reduction goals
- [ ] **Leaderboard** — Community rankings to gamify sustainability (requires backend)
- [ ] **Export reports** — PDF/CSV export of carbon footprint data for personal records

### 🎨 UI/UX Improvements
- [ ] **PWA support** — Add service worker and manifest for offline access and "Add to Home Screen"
- [ ] **Dark/Light mode toggle** — Allow users to switch between dark glassmorphism and a light nature theme
- [ ] **Onboarding tour** — Interactive walkthrough for first-time users highlighting key features
- [ ] **Animated transitions** — Page transition animations with FLIP technique for smoother navigation
- [ ] **Accessibility (a11y)** — Full ARIA labels, keyboard navigation, screen reader support, focus management

### 📱 Platform Expansion
- [ ] **Camera API integration** — Use `getUserMedia()` to capture photos directly from the browser for real-time scanning
- [ ] **Push notifications** — Remind users about active challenges and daily sustainability tips
- [ ] **Social sharing** — Share eco score cards to social media with OG image generation
- [ ] **Multi-language support** — i18n for Hindi, Spanish, French, and other languages

### 🧪 Code Quality
- [ ] **Unit tests** — Add Jest/Vitest test suite for carbon calculation logic and storage helpers
- [ ] **E2E tests** — Playwright or Cypress tests for the full user flow
- [ ] **TypeScript migration** — Port `app.js` to TypeScript for type safety
- [ ] **Component system** — Refactor into web components or a lightweight framework (Lit, Alpine.js) for better maintainability

### 🌐 Deployment
- [ ] **GitHub Pages** — Deploy as a static site for free hosting
- [ ] **Custom domain** — Set up `ecovision.app` with SSL
- [ ] **SEO optimization** — Add Open Graph meta tags, structured data, and sitemap
- [ ] **Analytics** — Integrate privacy-respecting analytics (Plausible/Umami) to understand user engagement

---

## 📁 Related Projects

- **EcoVision Mobile** — The original React Native (Expo) app: [`../EcoVision/`](../EcoVision/)
- **Backend API** — FastAPI server with YOLOv8 + Gemini AI: [`../EcoVision/EcoVision/backend/`](../EcoVision/EcoVision/backend/)

---

## 📄 License

This project was created for the EcoVision hackathon. All rights reserved.

---

<p align="center">
  <strong>Built with 🌱 for a greener planet</strong>
</p>
