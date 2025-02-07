import { XRouterProvider } from '@/providers/xrouter/provider';
import { ProviderConfig } from '@/providers/base.provider';

interface ProviderStatus {
  available: boolean;
  lastCheck: number;
  error?: string;
}

export class ProviderService {
  private static statusCache: ProviderStatus | null = null;
  private static checkInterval = 60 * 1000; // 1 minute
  private static provider: XRouterProvider | null = null;

  private static getProvider(): XRouterProvider {
    if (!this.provider) {
      const config: ProviderConfig = {
        apiUrl: process.env.XROUTER_API_URL || '',
        credentials: process.env.XROUTER_API_KEY || '',
      };
      this.provider = new XRouterProvider(config);
    }
    return this.provider;
  }

  static async getAvailableProviders(): Promise<string[]> {
    console.log('Checking XRouter availability');
    const isAvailable = await this.isProviderAvailable();
    console.log('XRouter availability:', isAvailable);
    return isAvailable ? ['xrouter'] : [];
  }

  static async isProviderAvailable(): Promise<boolean> {
    const now = Date.now();

    // Check cache
    if (this.statusCache && now - this.statusCache.lastCheck < this.checkInterval) {
      console.log('Using cached XRouter status:', this.statusCache);
      return this.statusCache.available;
    }

    try {
      console.log('Creating XRouter provider instance');
      const provider = this.getProvider();
      console.log('Listing XRouter models');
      await provider.listModels();

      const newStatus = {
        available: true,
        lastCheck: now
      };
      console.log('Setting XRouter status:', newStatus);
      this.statusCache = newStatus;

      return true;
    } catch (error) {
      console.error('Error checking XRouter availability:', error);
      const newStatus = {
        available: false,
        lastCheck: now,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      console.log('Setting XRouter error status:', newStatus);
      this.statusCache = newStatus;

      return false;
    }
  }

  static getProviderStatus(): ProviderStatus | null {
    return this.statusCache;
  }

  static clearCache() {
    this.statusCache = null;
    this.provider = null;
  }
}
