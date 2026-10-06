/**
 * App-wide settings. Change the working name, links and Premium rules here.
 */
export const config = {
  /** Working name. Also change "name" in app.json when you pick the real one. */
  appName: 'Mobility',

  /** Free users can complete this many sessions per week (Monday to Sunday). */
  freeWeeklySessions: 3,

  /** RevenueCat entitlement that unlocks Premium. */
  premiumEntitlement: 'premium',

  /** RevenueCat public SDK keys. Put them in a .env file (see .env.example). */
  revenueCatIosKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '',
  revenueCatAndroidKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '',

  /** Replace with your real addresses before release. */
  links: {
    help: 'mailto:hello@example.com',
    privacy: 'https://example.com/privacy',
    terms: 'https://example.com/terms',
  },
} as const;
