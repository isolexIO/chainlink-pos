import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Eye, Download, Globe, Image as ImageIcon, Palette, FileCode, Zap, ShoppingCart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PermissionGate from '../components/PermissionGate';

export default function AIWebsiteGenerator() {
  const [businessInfo, setBusinessInfo] = useState({
    businessName: '',
    industry: '',
    description: '',
    features: '',
    colors: '',
    targetAudience: '',
    includePages: {
      home: true,
      about: true,
      services: true,
      contact: true,
      gallery: false,
      blog: false
    },
    enableOnlineOrdering: false,
    generateLogo: false,
    generateImages: false
  });
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState(null);
  const [generatedLogo, setGeneratedLogo] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [merchantSettings, setMerchantSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    loadUserAndSettings();
  }, []);

  const loadUserAndSettings = async () => {
    try {
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let user = null;
      if (pinUserJSON) {
        user = JSON.parse(pinUserJSON);
      } else {
        user = await base44.auth.me();
      }
      setCurrentUser(user);

      if (user?.merchant_id) {
        const settings = await base44.entities.MerchantSettings.filter({ merchant_id: user.merchant_id });
        if (settings && settings.length > 0) {
          setMerchantSettings(settings[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user and settings:', error);
    }
  };

  const handleGenerate = async () => {
    if (!businessInfo.businessName || !businessInfo.industry || !businessInfo.description) {
      alert('Please fill in at least Business Name, Industry, and Description');
      return;
    }

    setLoading(true);
    try {
      const prompt = `Generate a complete, modern, professional HTML website for the following business:

Business Name: ${businessInfo.businessName}
Industry: ${businessInfo.industry}
Description: ${businessInfo.description}
Key Features/Services: ${businessInfo.features || 'Not specified'}
Preferred Colors: ${businessInfo.colors || 'Professional theme'}
Target Audience: ${businessInfo.targetAudience || 'General public'}

Requirements:
- Create a complete, single-page HTML file with inline CSS and JavaScript
- Include modern, responsive design with mobile support
- Use clean, professional styling with gradients and modern UI elements
- Include sections: Hero, About, Services/Features, Contact
- Add smooth scrolling and animations
- Include a working contact form (can use mailto: or a form service)
- Use the business name and description throughout
- Make it visually appealing with the specified color scheme
- Include meta tags for SEO
- Add social media links placeholders
- Ensure all code is production-ready

Generate ONLY the complete HTML code, nothing else. No explanations, just the HTML.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setGeneratedWebsite(response);
      setPreviewMode(true);
    } catch (error) {
      console.error('Error generating website:', error);
      alert('Failed to generate website. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedWebsite) return;

    const blob = new Blob([generatedWebsite], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessInfo.businessName.replace(/\s+/g, '-').toLowerCase()}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    if (!generatedWebsite) return;
    navigator.clipboard.writeText(generatedWebsite);
    alert('HTML code copied to clipboard!');
  };

  return (
    <PermissionGate permission="manage_settings">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                AI Website Generator
              </h1>
              <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                Beta
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Generate a professional website for your business in seconds using AI
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Joe's Coffee Shop"
                    value={businessInfo.businessName}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Restaurant, Retail, Services"
                    value={businessInfo.industry}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your business, what makes it unique, your mission..."
                    rows={4}
                    value={businessInfo.description}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Key Features/Services</Label>
                  <Textarea
                    id="features"
                    placeholder="List your main products, services, or features (one per line)"
                    rows={3}
                    value={businessInfo.features}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, features: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colors">Preferred Color Scheme</Label>
                  <Input
                    id="colors"
                    placeholder="e.g., Blue and white, Modern dark theme"
                    value={businessInfo.colors}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, colors: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Young professionals, Families, Tech enthusiasts"
                    value={businessInfo.targetAudience}
                    onChange={(e) => setBusinessInfo({ ...businessInfo, targetAudience: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Your Website...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Website
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview & Download</CardTitle>
                  {generatedWebsite && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {previewMode ? 'Show Code' : 'Show Preview'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCode}
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!generatedWebsite ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      No website generated yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Fill in the form and click "Generate Website" to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewMode ? (
                      <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                        <iframe
                          srcDoc={generatedWebsite}
                          className="w-full h-full"
                          title="Website Preview"
                          sandbox="allow-same-origin"
                        />
                      </div>
                    ) : (
                      <div className="border rounded-lg overflow-hidden bg-gray-900 text-green-400 p-4" style={{ height: '600px', overflowY: 'auto' }}>
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                          {generatedWebsite}
                        </pre>
                      </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Next Steps:
                      </h3>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>• Download the HTML file using the button above</li>
                        <li>• Upload it to your web hosting service</li>
                        <li>• Or use the code in your website builder</li>
                        <li>• Customize further as needed</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}