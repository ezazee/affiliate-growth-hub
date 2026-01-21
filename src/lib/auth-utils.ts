import { NextRequest } from 'next/server';

export async function getUserFromRequest(request: NextRequest): Promise<{ email: string; userId: string } | null> {
  try {
    // Get session from Authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('affiliate_user_session')?.value;
    
    let sessionData = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      // For API clients using Bearer token
      const token = authHeader.substring(7);
      sessionData = JSON.parse(atob(token)); // Simple token decode for demo
    } else if (sessionCookie) {
      // For browser clients with cookie
      sessionData = JSON.parse(sessionCookie);
    } else {
      // Fallback to simple auth header with user email
      const userEmail = request.headers.get('x-user-email');
      if (userEmail) {
        return { email: userEmail, userId: userEmail };
      }
      return null;
    }
    
    if (sessionData?.user?.email) {
      return { 
        email: sessionData.user.email, 
        userId: sessionData.user._id || sessionData.user.id 
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}