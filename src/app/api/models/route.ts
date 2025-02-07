import { NextRequest } from 'next/server';
import { ModelService } from '@/services/model.service';

export async function GET(request: NextRequest) {
  try {
    const models = await ModelService.getModels();
    return Response.json(models);
  } catch (error) {
    console.error('Error in models API:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}
