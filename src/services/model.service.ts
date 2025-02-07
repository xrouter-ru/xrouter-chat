import { XRouterProvider } from '@/providers/xrouter/provider';

export class ModelService {
  private static modelCache: string[] | null = null;
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private static lastUpdate: number | null = null;
  private static provider: XRouterProvider | null = null;

  private static getProvider(): XRouterProvider {
    if (!this.provider) {
      this.provider = new XRouterProvider({
        apiUrl: process.env.XROUTER_API_URL || '',
        apiKey: process.env.XROUTER_API_KEY || ''
      });
    }
    return this.provider;
  }

  static async getModels(): Promise<string[]> {
    const now = Date.now();

    // Check cache
    if (
      this.modelCache &&
      this.lastUpdate &&
      now - this.lastUpdate < this.cacheTimeout
    ) {
      return this.modelCache;
    }

    try {
      const provider = this.getProvider();
      const models = await provider.getModels();

      // Update cache
      this.modelCache = models;
      this.lastUpdate = now;

      return models;
    } catch (error) {
      console.error('Error fetching XRouter models:', error);
      throw error;
    }
  }

  static clearCache() {
    this.modelCache = null;
    this.lastUpdate = null;
    this.provider = null;
  }
}
