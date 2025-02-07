export const PROVIDER_CONFIG = {
  xrouter: {
    id: 'xrouter',
    displayName: 'XRouter'
  }
} as const;

export type ProviderType = keyof typeof PROVIDER_CONFIG;

export function getProviderDisplayName(providerId: ProviderType): string {
  if (!providerId || !PROVIDER_CONFIG[providerId]) {
    console.warn(`Unknown provider: ${providerId}, falling back to default name`);
    return String(providerId || 'Unknown');
  }
  return PROVIDER_CONFIG[providerId].displayName;
}
