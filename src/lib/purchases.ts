import { Platform } from 'react-native';
import Purchases, { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { config } from '@/constants/config';

/**
 * Premium through RevenueCat. Without a key (see .env.example) the app runs in test mode:
 * buying unlocks Premium on this device with no payment, so the whole flow can be tried in Expo Go.
 */
export type PaywallOption = {
  id: 'annual' | 'monthly';
  title: string;
  price: string;
  trial?: string;
  pkg?: PurchasesPackage;
};

let configured = false;

function apiKey(): string {
  return Platform.OS === 'android' ? config.revenueCatAndroidKey : config.revenueCatIosKey;
}

export function purchasesLive(): boolean {
  return configured;
}

export function initPurchases(): void {
  const key = apiKey();
  if (!key || configured) return;
  Purchases.configure({ apiKey: key });
  configured = true;
}

const TEST_OPTIONS: PaywallOption[] = [
  { id: 'annual', title: 'Yearly', price: 'Test price', trial: '7 days free' },
  { id: 'monthly', title: 'Monthly', price: 'Test price' },
];

function trialText(pkg: PurchasesPackage): string | undefined {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return undefined;
  const unit = intro.periodUnit.toLowerCase();
  return `${intro.periodNumberOfUnits} ${unit}${intro.periodNumberOfUnits === 1 ? '' : 's'} free`;
}

export async function loadOptions(): Promise<PaywallOption[]> {
  if (!configured) return TEST_OPTIONS;
  try {
    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    const options: PaywallOption[] = [];
    const annual = packages.find((p) => p.packageType === PACKAGE_TYPE.ANNUAL);
    const monthly = packages.find((p) => p.packageType === PACKAGE_TYPE.MONTHLY);
    if (annual) options.push({ id: 'annual', title: 'Yearly', price: annual.product.priceString, trial: trialText(annual), pkg: annual });
    if (monthly) options.push({ id: 'monthly', title: 'Monthly', price: monthly.product.priceString, trial: trialText(monthly), pkg: monthly });
    return options.length ? options : TEST_OPTIONS;
  } catch {
    return TEST_OPTIONS;
  }
}

/** Returns true when Premium is active after the purchase. */
export async function buy(option: PaywallOption): Promise<boolean> {
  if (!configured || !option.pkg) return true;
  try {
    const { customerInfo } = await Purchases.purchasePackage(option.pkg);
    return customerInfo.entitlements.active[config.premiumEntitlement] !== undefined;
  } catch (error) {
    if ((error as { userCancelled?: boolean }).userCancelled) return false;
    throw error;
  }
}

export async function restore(): Promise<boolean | null> {
  if (!configured) return null;
  const info = await Purchases.restorePurchases();
  return info.entitlements.active[config.premiumEntitlement] !== undefined;
}

/** Current Premium status from the store, or null in test mode. */
export async function fetchPremium(): Promise<boolean | null> {
  if (!configured) return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active[config.premiumEntitlement] !== undefined;
  } catch {
    return null;
  }
}
