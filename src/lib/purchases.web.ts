/** Web preview only: purchases always run in test mode. */
export type PaywallOption = {
  id: 'annual' | 'monthly';
  title: string;
  price: string;
  trial?: string;
};

export function purchasesLive(): boolean {
  return false;
}

export function initPurchases(): void {}

export async function loadOptions(): Promise<PaywallOption[]> {
  return [
    { id: 'annual', title: 'Yearly', price: 'Test price', trial: '7 days free' },
    { id: 'monthly', title: 'Monthly', price: 'Test price' },
  ];
}

export async function buy(_option: PaywallOption): Promise<boolean> {
  return true;
}

export async function restore(): Promise<boolean | null> {
  return null;
}

export async function fetchPremium(): Promise<boolean | null> {
  return null;
}
