import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      firebase: {
        configured: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
          process.env.NEXT_PUBLIC_FB_API_KEY
        ),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 
                   process.env.NEXT_PUBLIC_FB_PROJECT_ID || 
                   'not-configured'
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}