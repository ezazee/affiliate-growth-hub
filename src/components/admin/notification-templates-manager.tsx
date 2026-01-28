"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, EyeOff, Settings, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  defaultTitle: string;
  defaultBody: string;
  defaultUrl: string;
  roles: string[];
  category: string;
  customTitle: string;
  customBody: string;
  customUrl: string;
  enabled: boolean;
  isCustomized: boolean;
}

export default function NotificationTemplatesManager() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/templates`);
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = (id: string, field: keyof NotificationTemplate, value: any) => {
    setTemplates(prev => prev.map(template =>
      template.id === id ? { ...template, [field]: value } : template
    ));
  };

  const resetToDefault = (id: string) => {
    setTemplates(prev => prev.map(template =>
      template.id === id ? {
        ...template,
        customTitle: '',
        customBody: '',
        customUrl: '',
        isCustomized: false
      } : template
    ));
  };

  const saveTemplates = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templates: templates.map(t => ({
            templateId: t.id,
            title: t.customTitle || undefined,
            body: t.customBody || undefined,
            url: t.customUrl || undefined,
            enabled: t.enabled
          }))
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Success',
          description: `Updated ${data.updated} notification templates`
        });
        await fetchTemplates(); // Refresh data
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error saving templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification templates',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return <ShoppingCart className="w-4 h-4" />;
      case 'affiliate': return <Users className="w-4 h-4" />;
      case 'withdrawal': return <DollarSign className="w-4 h-4" />;
      case 'commission': return <DollarSign className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryTemplates = (category: string) => {
    return templates.filter(t => t.category === category);
  };

  const renderTemplate = (template: NotificationTemplate) => (
    <Card key={template.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getCategoryIcon(template.category)}
            <CardTitle className="text-lg">{template.name}</CardTitle>
            <Badge variant="outline" className="text-xs">
              {template.roles.join(', ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={template.enabled}
              onCheckedChange={(checked) => updateTemplate(template.id, 'enabled', checked)}
            />
            {template.isCustomized && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetToDefault(template.id)}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Judul Notifikasi</label>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Default: {template.defaultTitle}</div>
            <Input
              placeholder="Default: Use default title"
              value={template.customTitle}
              onChange={(e) => updateTemplate(template.id, 'customTitle', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Isi Notifikasi</label>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Default: {template.defaultBody}</div>
            <Textarea
              placeholder="Default: Use default body"
              value={template.customBody}
              onChange={(e) => updateTemplate(template.id, 'customBody', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">URL Redirect</label>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Default: {template.defaultUrl}</div>
            <Input
              placeholder="Default: Use default URL"
              value={template.customUrl}
              onChange={(e) => updateTemplate(template.id, 'customUrl', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading notification templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Templates</h2>
          <p className="text-muted-foreground">Customize notification text and settings</p>
        </div>
        <Button onClick={saveTemplates} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Templates by Category */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Order Notifications
          </h3>
          {getCategoryTemplates('order').map(renderTemplate)}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Affiliate Notifications
          </h3>
          {getCategoryTemplates('affiliate').map(renderTemplate)}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Withdrawal Notifications
          </h3>
          {getCategoryTemplates('withdrawal').map(renderTemplate)}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Commission Notifications
          </h3>
          {getCategoryTemplates('commission').map(renderTemplate)}
        </div>
      </div>

      {/* Variables Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Available Variables
          </CardTitle>
          <CardDescription>Use these variables in your notification templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{orderId}'}</code>
              <p className="text-muted-foreground">Order ID</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{amount}'}</code>
              <p className="text-muted-foreground">Amount in Rupiah</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{customerName}'}</code>
              <p className="text-muted-foreground">Customer name</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{name}'}</code>
              <p className="text-muted-foreground">User name</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{email}'}</code>
              <p className="text-muted-foreground">User email</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{balance}'}</code>
              <p className="text-muted-foreground">Account balance</p>
            </div>
            <div>
              <code className="bg-muted px-2 py-1 rounded">{'{reason}'}</code>
              <p className="text-muted-foreground">Rejection reason</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}