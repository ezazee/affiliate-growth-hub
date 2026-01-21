import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PushNotificationSenderProps {
  className?: string;
}

interface SendResult {
  success: boolean;
  message: string;
  sent?: number;
  failed?: number;
  total?: number;
}

export const PushNotificationSender = ({ className }: PushNotificationSenderProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('/');
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [lastResult, setLastResult] = useState<SendResult | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both title and message body',
        variant: 'destructive',
      });
      return;
    }

    if (targetType === 'specific' && !targetUserId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please specify a target user email',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setLastResult(null);

    try {
      const payload: any = {
        title: title.trim(),
        body: body.trim(),
        url: url.trim() || '/',
      };

      if (targetType === 'specific') {
        payload.targetUserId = targetUserId.trim();
      }

      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send notification');
      }

      setLastResult(result);
      
      toast({
        title: 'Notification Sent',
        description: result.message,
      });

      // Reset form on success
      setTitle('');
      setBody('');
      setUrl('/');

    } catch (error: any) {
      console.error('Send notification error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const templates = [
    {
      name: 'New Commission',
      title: '🎉 New Commission Earned!',
      body: 'Congratulations! You\'ve earned a new commission. Check your dashboard for details.',
      url: '/affiliator',
    },
    {
      name: 'Payment Confirmation',
      title: '💳 Payment Confirmed',
      body: 'Your payment has been processed and will be credited to your account soon.',
      url: '/affiliator',
    },
    {
      name: 'New Product',
      title: '🆕 New Product Available',
      body: 'Check out our latest product and start earning commissions today!',
      url: '/',
    },
    {
      name: 'System Update',
      title: '🔧 System Update',
      body: 'We\'ve updated our system with new features and improvements.',
      url: '/',
    },
  ];

  const useTemplate = (template: typeof templates[0]) => {
    setTitle(template.title);
    setBody(template.body);
    setUrl(template.url);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            <CardTitle>Send Push Notification</CardTitle>
          </div>
          <CardDescription>
            Send push notifications to users about commissions, updates, and announcements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates</Label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.name}
                  variant="outline"
                  size="sm"
                  onClick={() => useTemplate(template)}
                  className="text-left"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Target Selection */}
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={targetType} onValueChange={(value: 'all' | 'specific') => setTargetType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
            
            {targetType === 'specific' && (
              <Input
                placeholder="User email address"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Notification Content */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message *</Label>
              <Textarea
                id="body"
                placeholder="Notification message body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {body.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Redirect URL</Label>
              <Input
                id="url"
                placeholder="/ (default)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          {/* Send Button */}
          <Button 
            onClick={handleSend} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Notification
              </>
            )}
          </Button>

          {/* Results */}
          {lastResult && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">Send Results:</h4>
                    <Badge variant={lastResult.success ? 'default' : 'destructive'}>
                      {lastResult.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  
                  {lastResult.sent !== undefined && (
                    <div className="text-xs space-y-1">
                      <p>Total users: {lastResult.total}</p>
                      <p>Successfully sent: {lastResult.sent}</p>
                      <p>Failed: {lastResult.failed}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {lastResult.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {(title || body) && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 mt-1 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">{title || 'Notification Title'}</p>
                      <p className="text-xs text-muted-foreground">{body || 'Notification message'}</p>
                      <p className="text-xs text-blue-600">{url || '/'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};