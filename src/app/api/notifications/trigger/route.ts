import { NextRequest, NextResponse } from 'next/server';
import { sendTemplateNotification } from '@/lib/notification-service-server';
import { notificationTemplates } from '@/lib/notification-templates';

export async function POST(request: NextRequest) {
  try {
    const { templateId, variables, targetUserId, targetRole, title, body, url }: any = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Determine target
    let targetOverride: any = {};
    if (targetUserId) {
      targetOverride.userEmail = targetUserId; // Assuming userUserId passed is email, or handle logic
    }
    if (targetRole) {
      targetOverride.role = targetRole;
    }

    if (Object.keys(targetOverride).length === 0) {
      targetOverride = undefined;
    }

    const result = await sendTemplateNotification(
      templateId,
      variables || {},
      targetOverride
    );

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('Trigger notification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to trigger notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test and list templates
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      templates: notificationTemplates,
      usage: {
        endpoint: '/api/notifications/trigger',
        method: 'POST',
        body: {
          templateId: 'new_order_affiliate',
          variables: {
            orderId: 'ORD-001',
            amount: '250000',
            customerName: 'John Doe'
          },
          targetRole: 'affiliator' // or targetUserId: 'email@example.com'
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    );
  }
}