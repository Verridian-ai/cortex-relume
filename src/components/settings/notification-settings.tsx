import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Volume2,
  Clock,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  Phone,
  Monitor,
  Settings,
  Save,
  RotateCcw,
  TestTube,
  VolumeX,
  Moon,
  Sun,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Slider } from '../ui/slider';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useNotificationPreferencesStore } from '../../lib/preferences/notification-preferences';

interface NotificationSettingsProps {
  onSave?: () => void;
  onReset?: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  onSave,
  onReset,
}) => {
  const notificationStore = useNotificationPreferencesStore();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [testInProgress, setTestInProgress] = useState<string | null>(null);

  // Handle notification settings change
  const handleChange = (key: string, value: any) => {
    notificationStore.updateNotificationPreference(key as any, value);
    setIsDirty(true);
  };

  // Handle nested setting change
  const handleNestedChange = (section: string, key: string, value: any) => {
    notificationStore.updateChannelPreference(section as any, key, value);
    setIsDirty(true);
  };

  // Handle type setting change
  const handleTypeChange = (type: string, key: string, value: any) => {
    notificationStore.updateTypePreference(type as any, key, value);
    setIsDirty(true);
  };

  // Test notification
  const handleTestNotification = async (channel: string, type: string) => {
    setTestInProgress(`${channel}-${type}`);
    try {
      await notificationStore.testNotification(channel, type);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    } finally {
      setTimeout(() => setTestInProgress(null), 2000);
    }
  };

  // Request permission
  const handleRequestPermission = async (channel: 'push' | 'sms') => {
    const granted = await notificationStore.requestPermission(channel);
    if (!granted) {
      alert(`Permission for ${channel} was denied. Please enable it in your browser settings.`);
    }
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setIsDirty(false);
      onSave?.();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      notificationStore.resetToDefaults();
      setIsDirty(true);
    }
  };

  // Get permission status
  const getPermissionStatus = (channel: 'push' | 'sms') => {
    const status = notificationStore.getPermissionStatus(channel);
    const badges = {
      default: { color: 'bg-gray-100 text-gray-800', text: 'Not requested' },
      granted: { color: 'bg-green-100 text-green-800', text: 'Granted' },
      denied: { color: 'bg-red-100 text-red-800', text: 'Denied' },
      unsupported: { color: 'bg-yellow-100 text-yellow-800', text: 'Not supported' },
    };
    return badges[status as keyof typeof badges] || badges.default;
  };

  // Get notification type config
  const getNotificationTypeConfig = (type: string) => {
    const configs = {
      security: {
        icon: <Shield className="h-4 w-4" />,
        description: 'Security alerts and authentication',
        color: 'text-red-600',
      },
      updates: {
        icon: <RefreshCw className="h-4 w-4" />,
        description: 'App updates and new features',
        color: 'text-blue-600',
      },
      marketing: {
        icon: <Users className="h-4 w-4" />,
        description: 'Promotions and marketing content',
        color: 'text-purple-600',
      },
      social: {
        icon: <MessageSquare className="h-4 w-4" />,
        description: 'Social interactions and mentions',
        color: 'text-green-600',
      },
      system: {
        icon: <Settings className="h-4 w-4" />,
        description: 'System status and errors',
        color: 'text-gray-600',
      },
      builder: {
        icon: <Zap className="h-4 w-4" />,
        description: 'Builder workflow notifications',
        color: 'text-orange-600',
      },
      library: {
        icon: <Bell className="h-4 w-4" />,
        description: 'Component library updates',
        color: 'text-indigo-600',
      },
    };
    return configs[type as keyof typeof configs] || configs.system;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Bell className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Smartphone className="h-4 w-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="types">
            <Settings className="h-4 w-4 mr-2" />
            Types
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            <Clock className="h-4 w-4 mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="h-4 w-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                General Notification Settings
              </CardTitle>
              <CardDescription>
                Configure basic notification preferences and global settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Master toggle for all notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.enabled}
                    onCheckedChange={(checked) => handleChange('enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sound</h4>
                    <p className="text-sm text-muted-foreground">
                      Play sound for notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.sound}
                    onCheckedChange={(checked) => handleChange('sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Vibration</h4>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on mobile devices
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.vibration}
                    onCheckedChange={(checked) => handleChange('vibration', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Badge</h4>
                    <p className="text-sm text-muted-foreground">
                      Show notification badge
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.badge}
                    onCheckedChange={(checked) => handleChange('badge', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Volume Level</Label>
                <div className="mt-3">
                  <Slider
                    value={[notificationStore.volumeLevel || 75]}
                    onValueChange={([value]) => handleChange('volumeLevel', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>{notificationStore.volumeLevel || 75}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Max Notifications</Label>
                  <Input
                    type="number"
                    value={notificationStore.maxNotifications || 100}
                    onChange={(e) => handleChange('maxNotifications', parseInt(e.target.value))}
                    min={10}
                    max={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum notifications to store
                  </p>
                </div>

                <div>
                  <Label>Retention (days)</Label>
                  <Input
                    type="number"
                    value={notificationStore.retentionDays || 30}
                    onChange={(e) => handleChange('retentionDays', parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    How long to keep notifications
                  </p>
                </div>

                <div>
                  <Label>Read Receipts</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch 
                      checked={notificationStore.readReceipts || false}
                      onCheckedChange={(checked) => handleChange('readReceipts', checked)}
                    />
                    <span className="text-sm">
                      {notificationStore.readReceipts ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Channels */}
        <TabsContent value="channels" className="space-y-6">
          {/* Email Channel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-blue-600" />
                  Email Notifications
                </div>
                <Switch 
                  checked={notificationStore.channels.email.enabled}
                  onCheckedChange={(checked) => handleNestedChange('email', 'enabled', checked)}
                />
              </CardTitle>
              <CardDescription>
                Configure email notification preferences and frequency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select 
                    value={notificationStore.channels.email.frequency} 
                    onValueChange={(value) => handleNestedChange('email', 'frequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow email open tracking
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.channels.email.quietHours.enabled}
                    onCheckedChange={(checked) => handleNestedChange('email', 'quietHours', {
                      ...notificationStore.channels.email.quietHours,
                      enabled: checked
                    })}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Quiet Hours</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={notificationStore.channels.email.quietHours.start}
                      onChange={(e) => handleNestedChange('email', 'quietHours', {
                        ...notificationStore.channels.email.quietHours,
                        start: e.target.value
                      })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={notificationStore.channels.email.quietHours.end}
                      onChange={(e) => handleNestedChange('email', 'quietHours', {
                        ...notificationStore.channels.email.quietHours,
                        end: e.target.value
                      })}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleTestNotification('email', 'test')}
                      disabled={testInProgress === 'email-test'}
                    >
                      {testInProgress === 'email-test' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-green-600" />
                  Push Notifications
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPermissionStatus('push').color}>
                    {getPermissionStatus('push').text}
                  </Badge>
                  <Switch 
                    checked={notificationStore.channels.push.enabled}
                    onCheckedChange={(checked) => handleNestedChange('push', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                Browser and device push notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sound</h4>
                    <p className="text-sm text-muted-foreground">
                      Play sound for push notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.channels.push.sound}
                    onCheckedChange={(checked) => handleNestedChange('push', 'sound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Badge</h4>
                    <p className="text-sm text-muted-foreground">
                      Show app badge
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.channels.push.badge}
                    onCheckedChange={(checked) => handleNestedChange('push', 'badge', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Vibration</h4>
                    <p className="text-sm text-muted-foreground">
                      Vibrate on mobile
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.channels.push.vibrate}
                    onCheckedChange={(checked) => handleNestedChange('push', 'vibrate', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Service Worker</h4>
                    <p className="text-sm text-muted-foreground">
                      Enable background notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.channels.push.serviceWorker}
                    onCheckedChange={(checked) => handleNestedChange('push', 'serviceWorker', checked)}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleRequestPermission('push')}
                >
                  Request Permission
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTestNotification('push', 'test')}
                  disabled={testInProgress === 'push-test'}
                >
                  {testInProgress === 'push-test' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Notification
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-purple-600" />
                  In-App Notifications
                </div>
                <Switch 
                  checked={notificationStore.channels.inApp.enabled}
                  onCheckedChange={(checked) => handleNestedChange('inApp', 'enabled', checked)}
                />
              </CardTitle>
              <CardDescription>
                Toast messages and in-app notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Position</Label>
                  <Select 
                    value={notificationStore.channels.inApp.position} 
                    onValueChange={(value) => handleNestedChange('inApp', 'position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-center">Top Center</SelectItem>
                      <SelectItem value="bottom-center">Bottom Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (seconds)</Label>
                  <div className="mt-2">
                    <Slider
                      value={[notificationStore.channels.inApp.toastDuration / 1000]}
                      onValueChange={([value]) => handleNestedChange('inApp', 'toastDuration', value * 1000)}
                      min={1}
                      max={30}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>1s</span>
                      <span>{notificationStore.channels.inApp.toastDuration / 1000}s</span>
                      <span>30s</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Show During Inactivity</h4>
                  <p className="text-sm text-muted-foreground">
                    Show notifications when app is not active
                  </p>
                </div>
                <Switch 
                  checked={notificationStore.channels.inApp.showInactivity}
                  onCheckedChange={(checked) => handleNestedChange('inApp', 'showInactivity', checked)}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleTestNotification('inApp', 'test')}
                  disabled={testInProgress === 'inApp-test'}
                >
                  {testInProgress === 'inApp-test' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Toast
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-orange-600" />
                  SMS Notifications
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPermissionStatus('sms').color}>
                    {getPermissionStatus('sms').text}
                  </Badge>
                  <Switch 
                    checked={notificationStore.channels.sms.enabled}
                    onCheckedChange={(checked) => handleNestedChange('sms', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
              <CardDescription>
                SMS notifications for critical alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone Number</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={notificationStore.channels.sms.phoneNumber}
                  onChange={(e) => handleNestedChange('sms', 'phoneNumber', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number for SMS notifications
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Verified</h4>
                  <p className="text-sm text-muted-foreground">
                    Phone number verification status
                  </p>
                </div>
                <Badge variant={notificationStore.channels.sms.verified ? 'default' : 'secondary'}>
                  {notificationStore.channels.sms.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>

              <div className="flex space-x-3">
                {!notificationStore.channels.sms.verified && (
                  <Button variant="outline">
                    Verify Number
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleTestNotification('sms', 'test')}
                  disabled={testInProgress === 'sms-test' || !notificationStore.channels.sms.verified}
                >
                  {testInProgress === 'sms-test' ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test SMS
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Types */}
        <TabsContent value="types" className="space-y-6">
          {Object.entries(notificationStore.types).map(([type, config]) => {
            const typeConfig = getNotificationTypeConfig(type);
            return (
              <Card key={type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      {typeConfig.icon}
                      <span className="ml-2 capitalize">{type}</span>
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        Notifications
                      </span>
                    </div>
                    <Switch 
                      checked={config.enabled}
                      onCheckedChange={(checked) => handleTypeChange(type, 'enabled', checked)}
                    />
                  </CardTitle>
                  <CardDescription>
                    {typeConfig.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Channels</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['email', 'push', 'inApp', 'sms'].map((channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={config.channels.includes(channel as any)}
                            onChange={(e) => {
                              const newChannels = e.target.checked
                                ? [...config.channels, channel as any]
                                : config.channels.filter(c => c !== channel);
                              handleTypeChange(type, 'channels', newChannels);
                            }}
                            className="rounded"
                          />
                          <Label className="text-sm capitalize">{channel}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {type === 'security' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Critical Priority</h4>
                        <p className="text-sm text-muted-foreground">
                          Send security alerts immediately
                        </p>
                      </div>
                      <Switch 
                        checked={config.critical}
                        onCheckedChange={(checked) => handleTypeChange(type, 'critical', checked)}
                      />
                    </div>
                  )}

                  {type === 'updates' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">New Features</Label>
                        <Switch 
                          checked={config.newFeatures}
                          onCheckedChange={(checked) => handleTypeChange(type, 'newFeatures', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Bug Fixes</Label>
                        <Switch 
                          checked={config.bugFixes}
                          onCheckedChange={(checked) => handleTypeChange(type, 'bugFixes', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Maintenance</Label>
                        <Switch 
                          checked={config.maintenance}
                          onCheckedChange={(checked) => handleTypeChange(type, 'maintenance', checked)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleTestNotification('inApp', type)}
                      disabled={testInProgress === `inApp-${type}`}
                    >
                      {testInProgress === `inApp-${type}` ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Scheduling */}
        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Do Not Disturb
              </CardTitle>
              <CardDescription>
                Configure quiet hours and scheduling preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Do Not Disturb</h4>
                  <p className="text-sm text-muted-foreground">
                    Silence notifications during specified hours
                  </p>
                </div>
                <Switch 
                  checked={notificationStore.scheduling.doNotDisturb.enabled}
                  onCheckedChange={(checked) => notificationStore.setDoNotDisturb(
                    checked,
                    notificationStore.scheduling.doNotDisturb.start,
                    notificationStore.scheduling.doNotDisturb.end,
                    notificationStore.scheduling.doNotDisturb.days
                  )}
                />
              </div>

              {notificationStore.scheduling.doNotDisturb.enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={notificationStore.scheduling.doNotDisturb.start}
                        onChange={(e) => notificationStore.setDoNotDisturb(
                          true,
                          e.target.value,
                          notificationStore.scheduling.doNotDisturb.end,
                          notificationStore.scheduling.doNotDisturb.days
                        )}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={notificationStore.scheduling.doNotDisturb.end}
                        onChange={(e) => notificationStore.setDoNotDisturb(
                          true,
                          notificationStore.scheduling.doNotDisturb.start,
                          e.target.value,
                          notificationStore.scheduling.doNotDisturb.days
                        )}
                      />
                    </div>
                    <div>
                      <Label>Days</Label>
                      <Select 
                        value={notificationStore.scheduling.doNotDisturb.days.join(',')} 
                        onValueChange={(value) => {
                          const days = value.split(',').map(Number);
                          notificationStore.setDoNotDisturb(
                            true,
                            notificationStore.scheduling.doNotDisturb.start,
                            notificationStore.scheduling.doNotDisturb.end,
                            days
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                          <SelectItem value="0,6">Weekends</SelectItem>
                          <SelectItem value="1,2,3,4,5">Weekdays</SelectItem>
                          <SelectItem value="0,1,2,3,4,5,6">Every Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Weekend & Vacation Mode
              </CardTitle>
              <CardDescription>
                Configure weekend and vacation notification behavior.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Weekend Mode</Label>
                <RadioGroup 
                  value={notificationStore.scheduling.weekendMode} 
                  onValueChange={(value) => notificationStore.setWeekendMode(value as any)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="weekend-all" />
                    <Label htmlFor="weekend-all">Send all notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical-only" id="weekend-critical" />
                    <Label htmlFor="weekend-critical">Critical notifications only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="weekend-none" />
                    <Label htmlFor="weekend-none">No notifications</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Vacation Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically disable notifications during vacation
                  </p>
                </div>
                <Switch 
                  checked={notificationStore.scheduling.vacationMode.enabled}
                  onCheckedChange={(checked) => notificationStore.setVacationMode(
                    checked,
                    notificationStore.scheduling.vacationMode.startDate,
                    notificationStore.scheduling.vacationMode.endDate,
                    notificationStore.scheduling.vacationMode.message
                  )}
                />
              </div>

              {notificationStore.scheduling.vacationMode.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={notificationStore.scheduling.vacationMode.startDate}
                      onChange={(e) => notificationStore.setVacationMode(
                        true,
                        e.target.value,
                        notificationStore.scheduling.vacationMode.endDate,
                        notificationStore.scheduling.vacationMode.message
                      )}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={notificationStore.scheduling.vacationMode.endDate}
                      onChange={(e) => notificationStore.setVacationMode(
                        true,
                        notificationStore.scheduling.vacationMode.startDate,
                        e.target.value,
                        notificationStore.scheduling.vacationMode.message
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Auto-reply Message</Label>
                    <Input
                      placeholder="I'm currently on vacation and will respond when I return."
                      value={notificationStore.scheduling.vacationMode.message}
                      onChange={(e) => notificationStore.setVacationMode(
                        true,
                        notificationStore.scheduling.vacationMode.startDate,
                        notificationStore.scheduling.vacationMode.endDate,
                        e.target.value
                      )}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Advanced Settings
              </CardTitle>
              <CardDescription>
                Fine-tune notification behavior and privacy settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Group Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Group similar notifications together
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.grouping}
                    onCheckedChange={(checked) => handleChange('grouping', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Export Notifications</h4>
                    <p className="text-sm text-muted-foreground">
                      Allow notification data export
                    </p>
                  </div>
                  <Switch 
                    checked={notificationStore.exportNotifications}
                    onCheckedChange={(checked) => handleChange('exportNotifications', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Minimum Importance Level</Label>
                <RadioGroup 
                  value={notificationStore.filters.minimumImportance} 
                  onValueChange={(value) => handleTypeChange('filters', 'minimumImportance', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="importance-low" />
                    <Label htmlFor="importance-low">Low - Show all notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="importance-medium" />
                    <Label htmlFor="importance-medium">Medium - Hide low importance</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="importance-high" />
                    <Label htmlFor="importance-high">High - Show important only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="critical" id="importance-critical" />
                    <Label htmlFor="importance-critical">Critical - Security alerts only</Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <Label>Keywords (block notifications containing these words)</Label>
                <Input
                  placeholder="Enter keywords separated by commas"
                  value={notificationStore.filters.keywords.join(', ')}
                  onChange={(e) => handleChange('keywords', e.target.value.split(', ').filter(Boolean))}
                />
              </div>

              <div>
                <Label>Quiet Keywords (reduce priority for these words)</Label>
                <Input
                  placeholder="Enter keywords separated by commas"
                  value={notificationStore.filters.quietKeywords.join(', ')}
                  onChange={(e) => handleChange('quietKeywords', e.target.value.split(', ').filter(Boolean))}
                />
              </div>

              <div>
                <Label>Trusted Senders (always allow emails from these addresses)</Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={notificationStore.filters.fromAddresses.join(', ')}
                  onChange={(e) => handleChange('fromAddresses', e.target.value.split(', ').filter(Boolean))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Statistics</CardTitle>
              <CardDescription>
                Overview of your notification settings and usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground">
                Notification statistics will appear here after you start receiving notifications.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="flex items-center space-x-4">
          {isDirty && (
            <div className="flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}
          {lastSaved && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
          {notificationStore.isInQuietHours() && (
            <div className="flex items-center text-blue-600">
              <Moon className="h-4 w-4 mr-2" />
              <span className="text-sm">Currently in quiet hours</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving}
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;