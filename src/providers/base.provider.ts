import { z } from 'zod';

// Common types for all providers
export interface ProviderConfig {
  apiUrl: string;
  apiKey: string;
}

export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface CompletionResult {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Base class for all providers
export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected responseSchema: z.ZodType;

  constructor(config: ProviderConfig, responseSchema: z.ZodType) {
    this.config = config;
    this.responseSchema = responseSchema;
  }

  // Abstract methods that must be implemented in each provider
  abstract createCompletion(
    messages: ProviderMessage[],
    options?: CompletionOptions
  ): Promise<CompletionResult>;

  abstract getModels(): Promise<string[]>;

  // Common methods for all providers
  protected validateResponse(response: unknown): unknown {
    return this.responseSchema.parse(response);
  }

  protected formatError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown error occurred');
  }

  protected validateOptions(options?: CompletionOptions): CompletionOptions {
    return {
      temperature: options?.temperature ?? 0.7,
      maxTokens: options?.maxTokens ?? 1000
    };
  }
}
