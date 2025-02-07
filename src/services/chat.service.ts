import { CompletionOptions, ProviderMessage } from '@/providers/base.provider';
import { COMPLETION_CONFIG } from '@/config/completion';
import prisma from '@/lib/db';
import { XRouterProvider } from '@/providers/xrouter/provider';

export class ChatService {
  private provider: XRouterProvider;

  constructor() {
    this.provider = new XRouterProvider({
      apiUrl: process.env.XROUTER_API_URL || '',
      apiKey: process.env.XROUTER_API_KEY || ''
    });
  }

  async sendMessage(
    message: string,
    chatId?: string,
    options?: CompletionOptions
  ) {
    try {
      const context: ProviderMessage[] = [];

      // Get response from provider
      const response = await this.provider.createCompletion(
        message,
        options,
        context
      );

      return {
        message: response.text,
        usage: response.usage
      };

    } catch (error) {
      console.error('Error in ChatService:', error);
      throw error;
    }
  }

}
