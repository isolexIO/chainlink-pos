import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Upload, Trash2, Plus, Clock, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function CustomerDisplayTab({ settings: initialSettings, onUpdate }) {
  const [settings, setSettings] = useState({
    welcome_text: 'Welcome',
    welcome_subtitle: 'Your order will appear here',
    logo_url: '',
    background_color_start: '#1a2a6c',
    background_color_end: '#b21f1f',
    tip_suggestions: [15, 20, 25],
    allow_custom_tip: true,
    ads: [],
    return_to_idle_seconds: 8,
    ...initialSettings,
  });
  const [uploading, setUploading] = useState(false);

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleSettingChange('logo_url', file_url);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAdFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/');
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const newAds = [...settings.ads];
      newAds[index].url = file_url;
      newAds[index].type = isVideo ? 'video' : 'image';
      handleSettingChange('ads', newAds);
    } catch (error) {
      console.error('Error uploading ad file:', error);
      alert('Error uploading ad: ' + error.message);
    }
  };
  
  const handleAdChange = (index, field, value) => {
    const newAds = [...settings.ads];
    newAds[index][field] = value;
    handleSettingChange('ads', newAds);
  };

  const addAd = () => {
    handleSettingChange('ads', [...settings.ads, { type: 'image', url: '', duration_seconds: 10 }]);
  };

  const removeAd = (index) => {
    handleSettingChange('ads', settings.ads.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Ensure tip suggestions are an array of numbers
    const processedSettings = {
      ...settings,
      tip_suggestions: Array.isArray(settings.tip_suggestions) 
        ? settings.tip_suggestions 
        : String(settings.tip_suggestions).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
    };
    onUpdate(processedSettings);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Branding & Welcome Screen</CardTitle>
          <CardDescription>Customize the look and feel of your customer-facing display.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Business Logo</Label>
            <div className="flex items-center gap-4">
              {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 w-12 rounded-md object-contain bg-gray-200" />}
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <Button asChild variant="outline" disabled={uploading}>
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Label>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="welcome-text">Welcome Title</Label>
                <Input id="welcome-text" value={settings.welcome_text} onChange={e => handleSettingChange('welcome_text', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="welcome-subtitle">Welcome Subtitle</Label>
                <Input id="welcome-subtitle" value={settings.welcome_subtitle} onChange={e => handleSettingChange('welcome_subtitle', e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bg-start">Background Gradient Start</Label>
                <Input id="bg-start" type="color" value={settings.background_color_start} onChange={e => handleSettingChange('background_color_start', e.target.value)} className="w-24 p-1 h-10" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="bg-end">Background Gradient End</Label>
                <Input id="bg-end" type="color" value={settings.background_color_end} onChange={e => handleSettingChange('background_color_end', e.target.value)} className="w-24 p-1 h-10" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Idle Screen Advertisements</CardTitle>
          <CardDescription>Display images or videos on the welcome screen when the POS is idle. These will cycle automatically.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.ads.length === 0 && (
            <p className="text-sm text-muted-foreground">No ads configured. Click "Add Advertisement" to get started.</p>
          )}
          {settings.ads.map((ad, index) => (
            <div key={index} className="flex items-start gap-2 p-4 border rounded-lg bg-muted/50">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Media URL or Upload</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={ad.url} 
                        onChange={e => handleAdChange(index, 'url', e.target.value)}
                        placeholder="https://example.com/image.png"
                        className="flex-1"
                      />
                      <Input 
                        id={`ad-upload-${index}`}
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={(e) => handleAdFileUpload(e, index)}
                        className="hidden"
                      />
                      <Button asChild variant="outline" size="sm">
                        <Label htmlFor={`ad-upload-${index}`} className="cursor-pointer">
                          <Upload className="w-4 h-4" />
                        </Label>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Duration (seconds)</Label>
                    <Input 
                      type="number"
                      min="1"
                      value={ad.duration_seconds} 
                      onChange={e => handleAdChange(index, 'duration_seconds', Number(e.target.value))}
                    />
                  </div>
                </div>
                {ad.url && (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-20 border rounded overflow-hidden bg-black">
                      {ad.type === 'video' || ad.url.match(/\.(mp4|webm|mov|ogg)$/i) ? (
                        <video src={ad.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={ad.url} alt="Ad preview" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {ad.type === 'video' || ad.url.match(/\.(mp4|webm|mov|ogg)$/i) ? <Play className="w-4 h-4 inline mr-1" /> : null}
                      Preview
                    </span>
                  </div>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeAd(index)} className="flex-shrink-0">
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
           <Button variant="outline" onClick={addAd}>
            <Plus className="w-4 h-4 mr-2" /> Add Advertisement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipping & Checkout Configuration</CardTitle>
          <CardDescription>Set up tipping options and checkout flow for your customers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Tip Suggestions (%)</Label>
            <Input 
              value={Array.isArray(settings.tip_suggestions) ? settings.tip_suggestions.join(', ') : settings.tip_suggestions} 
              onChange={e => handleSettingChange('tip_suggestions', e.target.value)}
              placeholder="e.g., 15, 20, 25"
            />
            <p className="text-sm text-muted-foreground mt-1">Enter comma-separated percentage values.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="custom-tip" checked={settings.allow_custom_tip} onCheckedChange={checked => handleSettingChange('allow_custom_tip', checked)} />
            <Label htmlFor="custom-tip">Allow custom tip amounts</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idle-delay">Return to Idle Delay (seconds)</Label>
            <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Input 
                  id="idle-delay"
                  type="number"
                  min="1"
                  value={settings.return_to_idle_seconds} 
                  onChange={e => handleSettingChange('return_to_idle_seconds', Number(e.target.value))}
                  className="w-24"
                />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Time to show success/fail screen before returning to ads.</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Display Settings
        </Button>
      </div>
    </div>
  );
}