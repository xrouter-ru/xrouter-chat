'use client';

import { useEffect, useState } from 'react';
import { ProviderType, getProviderDisplayName } from '@/config/providers';

interface ProviderSelectorProps {
  selectedProvider: ProviderType;
  onProviderChange: (provider: ProviderType) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

interface ProviderStatus {
  id: ProviderType;
  status: {
    available: boolean;
    lastCheck: number;
    error?: string;
  } | null;
}

export default function ProviderSelector({
  selectedProvider,
  onProviderChange,
  disabled = false,
  isLoading = false
}: ProviderSelectorProps) {
  const [provider, setProvider] = useState<ProviderStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProvider() {
      try {
        const response = await fetch('/api/providers');
        if (!response.ok) throw new Error('Failed to load provider status');
        const data = await response.json();
        setProvider(data[0]); // XRouter is the only provider
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    loadProvider();
  }, []);

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <span>Error: {error}</span>
      </div>
    );
  }

  const isAvailable = provider?.status?.available ?? false;

  return (
    <div className="flex items-center gap-4 text-sm">
      <label htmlFor="provider" className="text-gray-600 dark:text-gray-400">
        Provider:
      </label>
      <select
        id="provider"
        value={selectedProvider}
        onChange={(e) => onProviderChange(e.target.value as ProviderType)}
        disabled={disabled || isLoading || !isAvailable}
        className="px-2 py-1 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <option value="">Loading...</option>
        ) : (
          <option value="xrouter" disabled={!isAvailable}>
            {getProviderDisplayName('xrouter')} {!isAvailable && '(unavailable)'}
          </option>
        )}
      </select>
      {provider?.status?.error && (
        <span className="text-sm text-red-600 dark:text-red-400">
          {provider.status.error}
        </span>
      )}
    </div>
  );
}
