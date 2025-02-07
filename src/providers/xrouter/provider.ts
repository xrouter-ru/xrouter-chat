import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import axios from 'axios';
import {
  BaseProvider,
  GenerationOptions,
  GenerationResult,
  ProviderConfig,
  ProviderMessage
} from '../base.provider';

// Response schema based on the API specification
const xrouterResponseSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  provider: z.string(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.string(),
              function: z.object({
                name: z.string(),
                arguments: z.string()
              })
            })
          )
          .optional()
      }),
      finish_reason: z.string()
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number()
  }),
  system_fingerprint: z.string().optional()
});

type XRouterResponse = z.infer<typeof xrouterResponseSchema>;

export class XRouterProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config, xrouterResponseSchema);
  }

  async generateResponse(
    message: string,
    options?: GenerationOptions,
    previousMessages?: ProviderMessage[]
  ): Promise<GenerationResult> {
    try {
      const validatedOptions = this.validateOptions(options);
      const messages = this.formatMessages(message, previousMessages);

      console.log('Generating response with options:', validatedOptions);
      console.log('Formatted messages:', messages);

      const response = await axios.post(
        `${this.config.apiUrl}/api/v1/chat/completions`,
        {
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          model: options?.model || 'gigachat/gigachat',
          temperature: validatedOptions.temperature,
          max_tokens: validatedOptions.maxTokens,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.config.credentials,
            'X-Request-ID': uuidv4()
          }
        }
      );

      console.log('Raw API response:', JSON.stringify(response.data, null, 2));
      const validated = this.validateResponse(response.data) as XRouterResponse;

      return {
        text: validated.choices[0].message.content,
        usage: {
          promptTokens: validated.usage.prompt_tokens,
          completionTokens: validated.usage.completion_tokens,
          totalTokens: validated.usage.total_tokens
        }
      };
    } catch (error) {
      console.error('Error in XRouterProvider:', error);
      if (axios.isAxiosError(error)) {
        console.error('XRouter API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw this.formatError(error);
    }
  }

  async listModels(): Promise<string[]> {
    try {
      console.log('Requesting XRouter models');
      const response = await axios.get(
        `${this.config.apiUrl}/api/v1/models`,
        {
          headers: {
            'Authorization': this.config.credentials,
            'X-Request-ID': uuidv4()
          }
        }
      );

      console.log('Available XRouter models:', response.data);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error listing XRouter models:', error);
      if (axios.isAxiosError(error)) {
        console.error('XRouter API error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
      }
      throw this.formatError(error);
    }
  }

  protected formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown error occurred in XRouter provider');
  }
}
