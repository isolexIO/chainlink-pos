import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Eye, Save, Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function WebsiteGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [merchant, setMerchant] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'restaurant',
    description: '',
    colors: {
      primary: '#7B2FD6',
      secondary: '#0FD17A'
    },
    features: [],
    style: 'modern'
  });
  
  const [generatedWebsite, setGeneratedWebsite] = useState(null);

  useEffect(() => {
    loadMerchant();
  }, []);

  const loadMerchant = async () => {
    try {
      setLoading(true);
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let currentUser = null;
      
      if (pinUserJSON) {
        currentUser = JSON.parse(pinUserJSON);
      } else {
        currentUser = await base44.auth.me();
      }
      
      if (currentUser?.merchant_id) {
        const merchants = await base44.entities.Merchant.filter({ id: currentUser.merchant_id });
        if (merchants && merchants.length > 0) {
          const merchantData = merchants[0];
          setMerchant(merchantData);
          setFormData(prev => ({
            ...prev,
            businessName: merchantData.business_name || merchantData.display_name || '',
            description: `${merchantData.business_name} - Your trusted local business`,
            colors: {
              primary: merchantData.settings?.primary_color || '#7B2FD6',
              secondary: merchantData.settings?.secondary_color || '#0FD17A'
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error loading merchant:', error);
      toast.error('Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.description) {
      toast.error('Please fill in business name and description');
      return;
    }

    try {
      setGenerating(true);
      
      const prompt = `Generate a complete, modern, single-page HTML website for a business with the following details:

Business Name: ${formData.businessName}
Business Type: ${formData.businessType}
Description: ${formData.description}
Style: ${formData.style}
Primary Color: ${formData.colors.primary}
Secondary Color: ${formData.colors.secondary}
Features to include: ${formData.features.join(', ') || 'About, Services, Contact'}

Requirements:
1. Create a complete HTML page with inline CSS (no external stylesheets)
2. Use the specified color scheme throughout
3. Include a navigation bar, hero section, about section, services/products section, and contact section
4. Make it fully responsive using Tailwind CSS classes via CDN
5. Add smooth scrolling and modern animations
6. Include a contact form
7. Use the ${formData.style} design style
8. Add appropriate stock images using Unsplash (https://source.unsplash.com/featured/)
9. Make it look professional and production-ready
10. Include all necessary meta tags for SEO

Return ONLY the complete HTML code, nothing else. Start with <!DOCTYPE html> and end with </html>.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedWebsite(response);
      toast.success('Website generated successfully!');
    } catch (error) {
      console.error('Error generating website:', error);
      toast.error('Failed to generate website. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedWebsite || !merchant) return;

    try {
      await base44.entities.Merchant.update(merchant.id, {
        settings: {
          ...merchant.settings,
          generated_website: {
            html: generatedWebsite,
            generated_at: new Date().toISOString(),
            config: formData
          }
        }
      });
      
      toast.success('Website saved to your merchant settings!');
    } catch (error) {
      console.error('Error saving website:', error);
      toast.error('Failed to save website');
    }
  };

  const handleDownload = () => {
    if (!generatedWebsite) return;

    const blob = new Blob([generatedWebsite], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.businessName.replace(/\s+/g, '-').toLowerCase()}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Website downloaded!');
  };

  const handleCopy = async () => {
    if (!generatedWebsite) return;

    try {
      await navigator.clipboard.writeText(generatedWebsite);
      setCopied(true);
      toast.success('HTML copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            AI Website Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate a professional website for your business in seconds
          </p>
        </div>
      </div>

      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedWebsite}>Preview</TabsTrigger>
          <TabsTrigger value="code" disabled={!generatedWebsite}>Code</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g., Joe's Pizza"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                      <SelectItem value="cafe">Cafe</SelectItem>
                      <SelectItem value="bar">Bar/Lounge</SelectItem>
                      <SelectItem value="food_truck">Food Truck</SelectItem>
                      <SelectItem value="service">Service Business</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your business, what makes you unique, your story..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design & Style</CardTitle>
              <CardDescription>Customize your website's appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.colors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colors: { ...formData.colors, primary: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.colors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colors: { ...formData.colors, primary: e.target.value }
                      })}
                      placeholder="#7B2FD6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={formData.colors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colors: { ...formData.colors, secondary: e.target.value }
                      })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.colors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        colors: { ...formData.colors, secondary: e.target.value }
                      })}
                      placeholder="#0FD17A"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Design Style</Label>
                <Select
                  value={formData.style}
                  onValueChange={(value) => setFormData({ ...formData, style: value })}
                >
                  <SelectTrigger id="style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="bold">Bold & Vibrant</SelectItem>
                    <SelectItem value="minimal">Minimal & Elegant</SelectItem>
                    <SelectItem value="playful">Playful & Fun</SelectItem>
                    <SelectItem value="professional">Professional & Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={generating || !formData.businessName || !formData.description}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Website
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {generatedWebsite && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Website Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                  <iframe
                    srcDoc={generatedWebsite}
                    className="w-full h-full"
                    title="Website Preview"
                    sandbox="allow-same-origin"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          {generatedWebsite && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>HTML Code</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleCopy} variant="outline">
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button onClick={handleDownload} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Copy this code and use it anywhere - upload to your hosting, edit as needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  <code>{generatedWebsite}</code>
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}