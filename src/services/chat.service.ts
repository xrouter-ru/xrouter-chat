import { GenerationOptions, ProviderMessage } from '@/providers/base.provider';
import { GENERATION_CONFIG } from '@/config/generation';
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
    options?: GenerationOptions
  ) {
    try {
      // Get or create chat
      const chat = chatId 
        ? await prisma.chat.findUnique({ where: { id: chatId } })
        : await prisma.chat.create({ 
            data: { 
              provider: 'xrouter'
            } 
          });

      if (!chat) {
        throw new Error('Chat not found');
      }

      // Get previous messages for context
      const previousMessages = await prisma.message.findMany({
        where: { chatId: chat.id },
        orderBy: { timestamp: 'asc' },
        take: 10
      });

      // Format messages for provider
      const context = previousMessages.map(msg => ({
        role: msg.response ? 'assistant' : 'user',
        content: msg.response || msg.message
      })) as ProviderMessage[];

      // Get response from provider
      const response = await this.provider.generateResponse(
        message,
        options,
        context
      );

      // Save message to DB
      const savedMessage = await prisma.message.create({
        data: {
          chatId: chat.id,
          message: message,
          response: response.text,
          model: options?.model || 'gigachat/gigachat',
          provider: 'xrouter',
          temperature: options?.temperature || GENERATION_CONFIG.temperature.default,
          maxTokens: options?.maxTokens || GENERATION_CONFIG.maxTokens.default
        }
      });

      return {
        message: savedMessage,
        chatId: chat.id,
        usage: response.usage
      };

    } catch (error) {
      console.error('Error in ChatService:', error);
      throw error;
    }
  }

  async getHistory(chatId: string) {
    return prisma.message.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' }
    });
  }
}
