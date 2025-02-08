import { CompletionOptions, ProviderMessage } from '@/providers/base.provider';
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
    messages: { role: string; content: string }[],
    options?: CompletionOptions
  ) {
    try {
      const response = await this.provider.createCompletion(
        messages,
        options
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
