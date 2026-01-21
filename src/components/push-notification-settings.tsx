import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Loader2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePushNotifications } from '@/hooks/use-push-notifications';

interface PushNotificationSettingsProps {
  userId?: string;
  className?: string;
}

export const PushNotificationSettings = ({ userId, className }: PushNotificationSettingsProps) => {
  const { toast } = useToast();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  } = usePushNotifications();

  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(isSubscribed);
  }, [isSubscribed]);

  const handleToggle = async () => {
    if (!isSupported) {
      toast({
        title: 'Not Supported',
        description: 'Push notifications are not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }

    if (isEnabled) {
      try {
        await unsubscribe();
        toast({
          title: 'Notifications Disabled',
          description: 'You will no longer receive push notifications.',
        });
        setIsEnabled(false);
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to disable notifications.',
          variant: 'destructive',
        });
      }
    } else {
      // Subscribe might take time - let the hook handle loading state
      try {
        await subscribe();
        if (!error) {
          toast({
            title: 'Notifications Enabled',
            description: 'You will now receive push notifications.',
          });
          setIsEnabled(true);
        }
      } catch (err) {
        // Error is already handled by the hook
        console.error('Toggle subscription error:', err);
      }
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="text-green-600"><Check className="w-3 h-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="secondary">Default</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            To receive push notifications, please use a modern browser that supports Progressive Web Apps.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          {getPermissionBadge()}
        </div>
        <CardDescription>
          Receive notifications about new commissions, payments, and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label htmlFor="push-notifications" className="text-sm font-medium">
              Enable Push Notifications
            </label>
            <p className="text-xs text-muted-foreground">
              Get instant updates on your device
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading || permission === 'denied'}
          />
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Notifications are blocked in your browser settings. Please enable them in your browser preferences.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span className="text-sm">Processing...</span>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">You'll receive notifications for:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• New commission earnings</li>
            <li>• Payment confirmations</li>
            <li>• Important account updates</li>
            <li>• New product announcements</li>
          </ul>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const result = await requestPermission();
            if (result === 'granted') {
              toast({
                title: 'Permission Granted',
                description: 'You can now enable push notifications',
              });
            } else {
              toast({
                title: 'Permission Denied',
                description: 'Please enable notifications in browser settings',
                variant: 'destructive'
              });
            }
          }}
          disabled={isLoading}
          className="w-full"
        >
          {permission === 'granted' ? '✅ Permission Granted' : 
           permission === 'denied' ? '❌ Permission Denied' : 
           '🔔 Request Browser Permission'}
        </Button>
      </CardContent>
    </Card>
  );
};