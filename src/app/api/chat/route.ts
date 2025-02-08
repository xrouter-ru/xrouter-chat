import { NextRequest } from 'next/server';
import { ChatService } from '@/services/chat.service';
import { CompletionOptions } from '@/providers/base.provider';

export async function POST(request: NextRequest) {
  try {
    const { messages, model, temperature, max_tokens } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response('Messages array is required', { status: 400 });
    }

    const chatService = new ChatService();
    const completionOptions: CompletionOptions = {
      model,
      temperature,
      max_tokens: max_tokens
    };

    const result = await chatService.sendMessage(
      messages,
      completionOptions
    );

    return Response.json(result);

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}
