"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const PushNotificationTester = () => {
  const { toast } = useToast();
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testTitle, setTestTitle] = useState('Test Notification');
  const [testBody, setTestBody] = useState('This is a test push notification from PE Skinpro Affiliate');
  const [testUrl, setTestUrl] = useState('/');

  const handleTestNotification = async () => {
    setIsTestLoading(true);
    
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: testTitle,
          body: testBody,
          url: testUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test notification');
      }

      toast({
        title: 'Test Notification Sent',
        description: `${result.sent || 0} notifications sent successfully`,
      });

    } catch (error: any) {
      console.error('Test notification error:', error);
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to send test notification',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          <CardTitle>Test Push Notifications</CardTitle>
        </div>
        <CardDescription>
          Test the push notification system before deploying
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-title">Test Title</Label>
          <Input
            id="test-title"
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            placeholder="Notification title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-body">Test Message</Label>
          <Textarea
            id="test-body"
            value={testBody}
            onChange={(e) => setTestBody(e.target.value)}
            placeholder="Notification message"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="test-url">Test URL</Label>
          <Input
            id="test-url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="/"
          />
        </div>

        <Button 
          onClick={handleTestNotification} 
          disabled={isTestLoading}
          className="w-full"
          variant="outline"
        >
          {isTestLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Test...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Test Notification
            </>
          )}
        </Button>

        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Testing Checklist:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>✅ Service worker registered</li>
            <li>✅ VAPID keys configured</li>
            <li>✅ API endpoints created</li>
            <li>⏳ Test notification subscription</li>
            <li>⏳ Test notification delivery</li>
            <li>⏳ Test notification click behavior</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};