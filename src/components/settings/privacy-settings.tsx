import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  User,
  Globe,
  Database,
  Cookie,
  MapPin,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  Trash2,
  FileText,
  Settings,
  Info,
  LockIcon,
  Key,
  Scan,
  BarChart3,
  RefreshCw,
  Save
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
import { Progress } from '../ui/progress';
import { usePrivacyPreferencesStore } from '../../lib/preferences/privacy-preferences';

interface PrivacySettingsProps {
  onSave?: () => void;
  onReset?: () => void;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
  onSave,
  onReset,
}) => {
  const privacyStore = usePrivacyPreferencesStore();
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle privacy settings change
  const handleChange = (key: string, value: any) => {
    privacyStore.updatePrivacyPreference(key as any, value);
    setIsDirty(true);
  };

  // Handle nested setting change
  const handleNestedChange = (section: string, key: string, value: any) => {
    privacyStore.updateNestedPreference(section as any, key, value);
    setIsDirty(true);
  };

  // Handle data retention change
  const handleRetentionChange = (section: string, days: number) => {
    privacyStore.updateDataRetention(section as any, days);
    setIsDirty(true);
  };

  // Request data export
  const handleDataExport = async () => {
    setIsExporting(true);
    try {
      const exportData = await privacyStore.requestDataExport();
      console.log('Data export requested:', exportData);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Request data deletion
  const handleDataDeletion = async () => {
    const confirmed = confirm(
      'Are you sure you want to request deletion of all your data? This action cannot be undone and will permanently delete your account.'
    );
    
    if (confirmed) {
      setIsDeleting(true);
      try {
        const success = await privacyStore.requestDataDeletion();
        if (success) {
          alert('Data deletion request submitted successfully. You will be logged out.');
        } else {
          alert('Failed to submit data deletion request. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete data:', error);
      } finally {
        setIsDeleting(false);
      }
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
      console.error('Failed to save privacy settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    if (confirm('Are you sure you want to reset all privacy settings to defaults? This may reduce your privacy protection.')) {
      privacyStore.resetToDefaults();
      setIsDirty(true);
    }
  };

  // Grant consent
  const handleGrantConsent = (category: string, purpose: string, duration: number) => {
    const consentId = privacyStore.grantConsent(category, purpose, duration);
    setIsDirty(true);
    return consentId;
  };

  // Revoke consent
  const handleRevokeConsent = (consentId: string) => {
    privacyStore.revokeConsent(consentId);
    setIsDirty(true);
  };

  // Add/remove blocked domain
  const handleDomainChange = (action: 'add' | 'remove', domain: string) => {
    if (action === 'add' && domain) {
      handleNestedChange('custom', 'blockedDomains', [...privacyStore.custom.blockedDomains, domain]);
    } else if (action === 'remove') {
      handleNestedChange('custom', 'blockedDomains', 
        privacyStore.custom.blockedDomains.filter(d => d !== domain));
    }
  };

  // Get privacy score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get compliance status color
  const getComplianceColor = (status: 'compliant' | 'partial' | 'non-compliant') => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'non-compliant': return 'text-red-600';
    }
  };

  // Get data collection level
  const getCollectionLevel = (enabled: number, total: number) => {
    const percentage = (enabled / total) * 100;
    if (percentage <= 25) return { level: 'Minimal', color: 'text-green-600', icon: '🛡️' };
    if (percentage <= 50) return { level: 'Limited', color: 'text-blue-600', icon: '🔒' };
    if (percentage <= 75) return { level: 'Moderate', color: 'text-yellow-600', icon: '⚖️' };
    return { level: 'Extensive', color: 'text-red-600', icon: '📊' };
  };

  const complianceStatus = privacyStore.checkComplianceStatus();
  const recommendations = privacyStore.getPrivacyRecommendations();
  const dataCollectionEntries = Object.entries(privacyStore.dataCollection);
  const enabledCount = dataCollectionEntries.filter(([_, enabled]) => enabled).length;
  const collectionLevel = getCollectionLevel(enabledCount, dataCollectionEntries.length);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Privacy Score Header */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(privacyStore.privacyScore)}`}>
                    {privacyStore.privacyScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Privacy Score</div>
                </div>
                <div className="border-l pl-6">
                  <h2 className="text-xl font-semibold mb-2">Privacy Overview</h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data Collection</span>
                      <Badge variant="outline" className={collectionLevel.color}>
                        {collectionLevel.icon} {collectionLevel.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">GDPR Compliance</span>
                      <Badge variant="outline" className={getComplianceColor(complianceStatus.gdpr.compliant ? 'compliant' : 'partial')}>
                        {complianceStatus.gdpr.compliant ? '✓' : '!'} {complianceStatus.gdpr.compliant ? 'Compliant' : 'Needs Attention'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Status</span>
                      <Badge variant="outline" className={getComplianceColor(complianceStatus.overall)}>
                        {complianceStatus.overall === 'compliant' ? '✓' : complianceStatus.overall === 'partial' ? '⚠' : '✗'}
                        {' '}{complianceStatus.overall.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button 
                  variant="outline" 
                  onClick={() => privacyStore.generatePrivacyReport()}
                  className="mb-2"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Privacy Report
                </Button>
                <p className="text-xs text-muted-foreground">
                  Last updated: {privacyStore.lastPrivacyCheck?.toLocaleDateString() || 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="data-collection" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="data-collection">
            <Database className="h-4 w-4 mr-2" />
            Data Collection
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile & Visibility
          </TabsTrigger>
          <TabsTrigger value="sharing">
            <Globe className="h-4 w-4 mr-2" />
            Data Sharing
          </TabsTrigger>
          <TabsTrigger value="tracking">
            <Cookie className="h-4 w-4 mr-2" />
            Cookies & Tracking
          </TabsTrigger>
          <TabsTrigger value="rights">
            <Shield className="h-4 w-4 mr-2" />
            GDPR Rights
          </TabsTrigger>
        </TabsList>

        {/* Data Collection Settings */}
        <TabsContent value="data-collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Data Collection Preferences
              </CardTitle>
              <CardDescription>
                Control what data we collect about you to improve our services.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dataCollectionEntries.map(([key, enabled]) => {
                  const labels = {
                    analytics: 'Analytics Data',
                    crashReports: 'Crash Reports',
                    usageData: 'Usage Statistics',
                    performanceData: 'Performance Metrics',
                    errorTracking: 'Error Tracking',
                    featureUsage: 'Feature Usage',
                  };
                  const descriptions = {
                    analytics: 'Help us understand how you use the application',
                    crashReports: 'Automatically report crashes to help fix bugs',
                    usageData: 'Track feature usage to improve user experience',
                    performanceData: 'Monitor app performance and speed',
                    errorTracking: 'Log errors to prevent future issues',
                    featureUsage: 'Analyze which features you use most',
                  };
                  
                  return (
                    <div key={key} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {descriptions[key as keyof typeof descriptions]}
                        </p>
                      </div>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => handleNestedChange('dataCollection', key, checked)}
                      />
                    </div>
                  );
                })}
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Data Collection Level</h4>
                <div className="flex items-center space-x-4">
                  <Progress value={(enabledCount / dataCollectionEntries.length) * 100} className="flex-1" />
                  <Badge variant="outline" className={collectionLevel.color}>
                    {collectionLevel.level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {enabledCount} of {dataCollectionEntries.length} data collection types enabled
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device & Location Information</CardTitle>
              <CardDescription>
                Manage device fingerprinting and location data collection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(privacyStore.locationDevice).map(([key, enabled]) => {
                  const labels = {
                    collectLocation: 'Location Data',
                    collectDeviceInfo: 'Device Information',
                    collectIPAddress: 'IP Address',
                    collectBrowserInfo: 'Browser Information',
                    collectScreenResolution: 'Screen Resolution',
                  };
                  const descriptions = {
                    collectLocation: 'Your geographic location',
                    collectDeviceInfo: 'Device type, OS, and hardware info',
                    collectIPAddress: 'Your IP address for security',
                    collectBrowserInfo: 'Browser version and capabilities',
                    collectScreenResolution: 'Screen size for responsive design',
                  };

                  return (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h5 className="font-medium text-sm">{labels[key as keyof typeof labels]}</h5>
                        <p className="text-xs text-muted-foreground">{descriptions[key as keyof typeof descriptions]}</p>
                      </div>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => handleNestedChange('locationDevice', key, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile & Visibility Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control who can see your profile and activity information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Profile Visibility</Label>
                <RadioGroup 
                  value={privacyStore.profileVisibility} 
                  onValueChange={(value) => handleChange('profileVisibility', value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="profile-public" />
                    <Label htmlFor="profile-public" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Anyone can view your profile</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="friends" id="profile-friends" />
                    <Label htmlFor="profile-friends" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Friends Only</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Only your connections can see your profile</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="profile-private" />
                    <Label htmlFor="profile-private" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Only you can see your profile</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="profile-custom" />
                    <Label htmlFor="profile-custom" className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Custom</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Custom privacy settings</p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Online Status</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Online Status</h5>
                      <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                    </div>
                    <Switch 
                      checked={privacyStore.onlineStatus.showOnlineStatus}
                      onCheckedChange={(checked) => handleNestedChange('onlineStatus', 'showOnlineStatus', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Last Seen</h5>
                      <p className="text-sm text-muted-foreground">Display when you were last active</p>
                    </div>
                    <Switch 
                      checked={privacyStore.onlineStatus.showLastSeen}
                      onCheckedChange={(checked) => handleNestedChange('onlineStatus', 'showLastSeen', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Show Activity Status</h5>
                      <p className="text-sm text-muted-foreground">Show what you're currently doing</p>
                    </div>
                    <Switch 
                      checked={privacyStore.onlineStatus.showActivityStatus}
                      onCheckedChange={(checked) => handleNestedChange('onlineStatus', 'showActivityStatus', checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sharing Settings */}
        <TabsContent value="sharing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Third-Party Data Sharing
              </CardTitle>
              <CardDescription>
                Control how your data is shared with third parties and partners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacyStore.dataSharing).map(([key, enabled]) => {
                const labels = {
                  allowThirdPartyAnalytics: 'Third-Party Analytics',
                  allowMarketingDataSharing: 'Marketing Data Sharing',
                  allowResearchParticipation: 'Research Participation',
                  allowDataBrokers: 'Data Brokers',
                };
                const descriptions = {
                  allowThirdPartyAnalytics: 'Share analytics data with partners',
                  allowMarketingDataSharing: 'Share data for marketing purposes',
                  allowResearchParticipation: 'Participate in research studies',
                  allowDataBrokers: 'Allow data brokers to access your information',
                };
                const icons = {
                  allowThirdPartyAnalytics: <BarChart3 className="h-4 w-4" />,
                  allowMarketingDataSharing: <User className="h-4 w-4" />,
                  allowResearchParticipation: <Scan className="h-4 w-4" />,
                  allowDataBrokers: <Key className="h-4 w-4" />,
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {icons[key as keyof typeof icons]}
                      <div>
                        <h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-muted-foreground">
                          {descriptions[key as keyof typeof descriptions]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {key === 'allowDataBrokers' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => handleNestedChange('dataSharing', key, checked)}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communications Tracking</CardTitle>
              <CardDescription>
                Manage email and communication tracking preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacyStore.communications).map(([key, enabled]) => {
                const labels = {
                  allowEmailTracking: 'Email Tracking',
                  allowLinkTracking: 'Link Tracking',
                  allowImageTracking: 'Image Tracking',
                  allowReadReceipts: 'Read Receipts',
                };
                const descriptions = {
                  allowEmailTracking: 'Track when emails are opened',
                  allowLinkTracking: 'Track clicks on links in emails',
                  allowImageTracking: 'Track when images are loaded',
                  allowReadReceipts: 'Show when you've read messages',
                };

                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h5 className="font-medium text-sm">{labels[key as keyof typeof labels]}</h5>
                      <p className="text-xs text-muted-foreground">{descriptions[key as keyof typeof descriptions]}</p>
                    </div>
                    <Switch 
                      checked={enabled}
                      onCheckedChange={(checked) => handleNestedChange('communications', key, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cookies & Tracking Settings */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cookie className="h-5 w-5 mr-2" />
                Cookies & Tracking Preferences
              </CardTitle>
              <CardDescription>
                Control which types of cookies and tracking technologies we use.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacyStore.cookiesTracking).map(([key, enabled]) => {
                const labels = {
                  essential: 'Essential Cookies',
                  functional: 'Functional Cookies',
                  analytics: 'Analytics Cookies',
                  marketing: 'Marketing Cookies',
                  social: 'Social Media Cookies',
                  thirdParty: 'Third-Party Cookies',
                };
                const descriptions = {
                  essential: 'Required for basic functionality (always on)',
                  functional: 'Remember your preferences and settings',
                  analytics: 'Help us understand how you use our site',
                  marketing: 'Track you across websites for advertising',
                  social: 'Enable social media features and sharing',
                  thirdParty: 'Cookies from external services',
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {descriptions[key as keyof typeof descriptions]}
                      </p>
                    </div>
                    <Switch 
                      checked={key === 'essential' ? true : enabled}
                      onCheckedChange={(checked) => handleNestedChange('cookiesTracking', key, checked)}
                      disabled={key === 'essential'}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Privacy Features</CardTitle>
              <CardDescription>
                Enhanced privacy and security features for advanced users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(privacyStore.advanced).map(([key, enabled]) => {
                const labels = {
                  useTorBrowser: 'Tor Browser Detection',
                  blockingerprinting: 'Block Fingerprinting',
                  blockWebRTC: 'Block WebRTC',
                  disableJavaScript: 'Disable JavaScript',
                  usePrivacyExtensions: 'Privacy Extensions',
                  blockThirdPartyCookies: 'Block Third-Party Cookies',
                  blockTrackingPixels: 'Block Tracking Pixels',
                  secureDNS: 'Use Secure DNS',
                };
                const descriptions = {
                  useTorBrowser: 'Detect and optimize for Tor browser usage',
                  blockingerprinting: 'Prevent device fingerprinting techniques',
                  blockWebRTC: 'Block WebRTC IP address leaks',
                  disableJavaScript: 'Disable JavaScript for enhanced privacy',
                  usePrivacyExtensions: 'Support for browser privacy extensions',
                  blockThirdPartyCookies: 'Block cookies from third-party sites',
                  blockTrackingPixels: 'Block invisible tracking pixels',
                  secureDNS: 'Use DNS over HTTPS for privacy',
                };

                return (
                  <div key={key} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h5 className="font-medium text-sm">{labels[key as keyof typeof labels]}</h5>
                      <p className="text-xs text-muted-foreground">{descriptions[key as keyof typeof descriptions]}</p>
                    </div>
                    <Switch 
                      checked={enabled}
                      onCheckedChange={(checked) => handleNestedChange('advanced', key, checked)}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Blocklist</CardTitle>
              <CardDescription>
                Add domains or services to block or whitelist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Blocked Domains</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="example.com"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleDomainChange('add', input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input?.value) {
                        handleDomainChange('add', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {privacyStore.custom.blockedDomains.map((domain) => (
                    <Badge key={domain} variant="outline" className="cursor-pointer" onClick={() => handleDomainChange('remove', domain)}>
                      {domain} ✕
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GDPR Rights & Data Management */}
        <TabsContent value="rights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                GDPR Rights & Data Portability
              </CardTitle>
              <CardDescription>
                Exercise your rights under GDPR and other privacy regulations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(privacyStore.gdprRights).map(([key, enabled]) => {
                  const labels = {
                    dataPortability: 'Data Portability',
                    rightToErasure: 'Right to Erasure',
                    rightToRectification: 'Right to Rectification',
                    rightToRestrictProcessing: 'Right to Restrict Processing',
                    rightToObject: 'Right to Object',
                    rightToWithdrawConsent: 'Right to Withdraw Consent',
                  };
                  const descriptions = {
                    dataPortability: 'Export your data in a machine-readable format',
                    rightToErasure: 'Request deletion of your personal data',
                    rightToRectification: 'Correct inaccurate personal data',
                    rightToRestrictProcessing: 'Limit how your data is processed',
                    rightToObject: 'Object to processing of your data',
                    rightToWithdrawConsent: 'Withdraw consent for data processing',
                  };

                  return (
                    <div key={key} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {descriptions[key as keyof typeof descriptions]}
                        </p>
                      </div>
                      <Switch 
                        checked={enabled}
                        onCheckedChange={(checked) => handleNestedChange('gdprRights', key, checked)}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention Policy</CardTitle>
              <CardDescription>
                Configure how long we keep different types of your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(privacyStore.dataRetention).map(([key, days]) => {
                const labels = {
                  accountData: 'Account Information',
                  activityLogs: 'Activity Logs',
                  searchHistory: 'Search History',
                  usageData: 'Usage Data',
                  communicationData: 'Communication Data',
                };
                const descriptions = {
                  accountData: 'Your profile and account details',
                  activityLogs: 'Logs of your actions and activities',
                  searchHistory: 'Your search queries and history',
                  usageData: 'How you use our services',
                  communicationData: 'Messages and communications',
                };

                return (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-muted-foreground">{descriptions[key as keyof typeof descriptions]}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{days} days</Badge>
                        <span className="text-sm text-muted-foreground">
                          ({Math.round(days / 30)} months)
                        </span>
                      </div>
                    </div>
                    <Slider
                      value={[days]}
                      onValueChange={([value]) => handleRetentionChange(key, value)}
                      min={1}
                      max={3650}
                      step={30}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Consent Management</CardTitle>
              <CardDescription>
                Manage your current consents and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {privacyStore.consents.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No active consents found. Consents will appear here when you grant them.
                </div>
              ) : (
                <div className="space-y-3">
                  {privacyStore.consents.map((consent) => (
                    <div key={consent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{consent.purpose}</h4>
                        <p className="text-sm text-muted-foreground">
                          Category: {consent.category} • Granted: {consent.grantedAt.toLocaleDateString()}
                          {consent.expiresAt && ` • Expires: ${consent.expiresAt.toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={consent.granted ? 'default' : 'secondary'}>
                          {consent.granted ? 'Active' : 'Revoked'}
                        </Badge>
                        {consent.granted && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRevokeConsent(consent.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data Export & Deletion</span>
                <Badge variant={complianceStatus.overall === 'compliant' ? 'default' : 'secondary'}>
                  GDPR Ready
                </Badge>
              </CardTitle>
              <CardDescription>
                Request a copy of your data or delete your account permanently.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Download className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Export Your Data</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download a complete copy of your data in a standard format.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={handleDataExport}
                    disabled={isExporting}
                    className="w-full"
                  >
                    {isExporting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Request Export
                  </Button>
                </div>

                <div className="p-4 border rounded-lg border-red-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <h4 className="font-medium text-red-900">Delete Your Data</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete all your data and close your account.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDataDeletion}
                    disabled={isDeleting}
                    className="w-full"
                  >
                    {isDeleting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Request Deletion
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900">Important Notice</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Data deletion requests are processed within 30 days according to GDPR regulations. 
                      Some data may be retained for legal compliance purposes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Recommendations</CardTitle>
              <CardDescription>
                Suggestions to improve your privacy protection level.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <p>Great job! No privacy recommendations at this time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <Badge variant={
                            recommendation.category === 'critical' ? 'destructive' :
                            recommendation.category === 'important' ? 'default' : 'secondary'
                          }>
                            {recommendation.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {recommendation.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Action:</strong> {recommendation.action}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {recommendation.impact} impact
                        </Badge>
                        <br />
                        <Badge variant="outline">
                          {recommendation.effort} effort
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Bar */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t">
        <div className="flex items-center space-x-4">
          {isDirty && (
            <div className="flex items-center text-amber-600">
              <AlertTriangle className="h-4 w-4 mr-2" />
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
          <div className="flex items-center text-blue-600">
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm">
              Privacy Score: {privacyStore.privacyScore}/100
            </span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleReset} disabled={!isDirty}>
            <RefreshCw className="h-4 w-4 mr-2" />
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

export default PrivacySettings;