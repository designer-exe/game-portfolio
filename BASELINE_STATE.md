# APPROVED BASELINE STATE — ANIMESH 3D PORTFOLIO

## Baseline Metadata
- **Baseline Name**: `portfolio-approved-baseline`
- **Baseline Tag**: `portfolio-approved-baseline`
- **Baseline Branch**: `portfolio-baseline`
- **Date Created**: 2026-08-28
- **Commit Message**: `APPROVED BASELINE - Current Portfolio Working State`

---

## Approved State Confirmation
This commit constitutes the official, locked, and fully verified baseline for the Animesh Gupta 3D Interactive Portfolio.

### Included & Verified Features:
1. **3D Interactive World & Driving Mechanics**:
   - Cyberpunk/desert 3D terrain, obstacles, and interactive zones.
   - Realistic car physics, steering (WASD / Arrows), drifting (Space), horn (H), and reactive camera tracking.
   - Projects showcase areas with interactive collisions and modals.
2. **Start Screen & Layout Hierarchy**:
   - Left-column information card with warm cream text, 2-column skills grid with amber bullet indicators.
   - Right-side character image (`/character.png`) anchored seamlessly with responsive scale and post-start floating transition.
3. **Top Navigation & Header HUD**:
   - 3 header pills (`ANIMESH GUPTA`, `Located in India, available worldwide.`, `Resume`) sharing normalized, identical **36px** outer box heights.
   - Interactive Contact drawer on the upper right with animated sliding form.
4. **Bottom Controls & Floating HUD**:
   - Music Player pill (`Aarzu`) and Ani / Gemini trigger button sharing normalized, identical **48px** outer box heights.
   - Balanced, intentional **15px** horizontal gap between the Music Player and Ani button without overlap.
5. **Ani AI Portfolio Assistant (Gemini 3.1)**:
   - Floating trigger button branded as **`[Ani Icon] Ani [GEMINI]`** utilizing `public/character.png`.
   - Dedicated chatbot panel positioned cleanly above the music player (`bottom: 88px; right: 24px;`).
   - Circular Ani avatar with gold accent border, online indicator, and white high-contrast header text.
   - Immediate speech cancellation (`window.speechSynthesis.cancel()`) on mute button toggle or panel close (`✕`).
   - Active network cancellation via `AbortController` preventing delayed speech playback.
   - Audio playback of music remains completely independent and decoupled from voice speech synthesis.
6. **Music Player & Song Suggestions**:
   - Compact bottom pill with rotating vinyl disc, play/pause toggle, and expand modal.
   - Firestore integration for community song suggestions and authenticated admin dashboard (`/admin/music`).

---

## Rollback & Recovery Instructions

Whenever a rollback is requested to restore the exact approved baseline state:

### Option A: Clean Working Directory & Hard Reset
```bash
git checkout portfolio-baseline
git reset --hard portfolio-approved-baseline
git clean -fd
npm run build
```

### Option B: Checkout Detached Tag
```bash
git checkout portfolio-approved-baseline
npm run build
```

### Verification Command:
```bash
git rev-parse HEAD
git status
npm run build
```
The commit hash must match the commit tagged by `portfolio-approved-baseline`.
