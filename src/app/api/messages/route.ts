import { NextRequest } from 'next/server';
import { ChatService } from '@/services/chat.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return new Response('Chat ID is required', { status: 400 });
    }

    const chatService = new ChatService();
    const messages = await chatService.getHistory(chatId);

    return Response.json(messages);

  } catch (error) {
    console.error('Error in messages API:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
