# Mobility

A mobility and stretching app: pick the areas you want to move better, get a weekly plan, follow guided sessions, track progress.

Built with **Expo (React Native) + TypeScript**. iPhone first, Android later from the same code.

---

## Run it on your iPhone (Windows is fine)

1. Install **Node.js LTS** from nodejs.org.
2. Install **Expo Go** from the App Store on your iPhone.
3. In this folder, run:

   ```bash
   npm install
   npx expo start
   ```

4. Scan the QR code with your iPhone camera. The app opens in Expo Go.

Phone and computer need to be on the same Wi-Fi. If it won't connect, run `npx expo start --tunnel` instead.

**Testing shortcuts** (only while developing): Settings → Testing has a **Premium (test)** switch and **Start again from Welcome**.

---

## How the app is laid out

| Flow | Screens |
| --- | --- |
| First run | Welcome → Areas → Goal + experience → Days → Length → Building → Your plan → Session → Complete → Save progress → Premium → Reminder → Today |
| Tabs | Today · Plan · Progress · Settings |
| Premium moments | Weekly limit sheet · "Add an area?" · "Where are you stiff today?" · Programmes · Areas trained |
| Other | Area detail · Exercise detail · Share card · Account · Edit plan |

| Folder | What's in it |
| --- | --- |
| `src/app` | Every screen (file name = route) |
| `src/components` | Body map, pose bubbles, cards, buttons, tab bar, sheets |
| `src/data` | **Exercises** (`exercises.ts`), pose drawings (`poses.ts`), programmes and options (`content.ts`) |
| `src/lib` | Plan generator (`plan.ts`), progress and streaks, reminders, purchases, sharing |
| `src/store` | Saved app state (plan, history, settings) on the phone |
| `src/constants` | Colours, fonts and app settings (`config.ts`) |

---

## Product rules (easy to change)

- **Free:** `config.freeWeeklySessions` sessions a week (now **3**) in `src/constants/config.ts`. One number changes the limit everywhere.
- **Premium:** unlimited sessions, changing areas, "stiff today" sessions, programmes, plan adjusts from feedback, areas-trained history.
- **Plan generator:** experience level decides which moves are allowed; goal nudges the order; areas are interleaved; thin areas borrow related moves so sessions never loop two moves.
- **Accounts:** sign in with Apple or email is stored **on the phone only** for now. Cloud sync (e.g. Supabase) is the next backend step, so progress follows people to a new phone.

---

## Before you ship

1. **Names:** replace `com.CHANGEME.mobility` and the app name in `app.json`, and `appName` + `links` in `src/constants/config.ts`.
2. **Subscriptions:** in App Store Connect create a yearly and a monthly subscription (with a 7-day free trial). In RevenueCat add an entitlement called `premium` and an offering with **Annual** and **Monthly** packages.
3. **Keys:** copy `.env.example` to `.env.local` and paste your RevenueCat public iOS key. Without a key the paywall runs in **test mode** (no payment taken).
4. **Real purchases and Apple sign-in** need a development build instead of Expo Go:

   ```bash
   npx expo install expo-dev-client
   npx eas-cli@latest build:configure
   npx eas-cli@latest build --profile development --platform ios
   ```

5. **TestFlight / App Store:**

   ```bash
   npx eas-cli@latest build --profile production --platform ios
   npx eas-cli@latest submit --platform ios
   ```

EAS builds in the cloud, so no Mac is needed. You do need an Apple Developer account.

---

## Checks

```bash
npm run typecheck
npm run lint
```
