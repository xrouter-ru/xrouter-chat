import { ProviderService } from '@/services/provider.service';

export async function GET() {
  try {
    const providers = await ProviderService.getAvailableProviders();
    const status = ProviderService.getProviderStatus();

    return Response.json([{
      id: 'xrouter',
      status
    }]);

  } catch (error) {
    console.error('Error in providers API:', error);
    return new Response(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}
