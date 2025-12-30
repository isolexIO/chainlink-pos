import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Save, Eye, Code, Paintbrush, Type, Image as ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WebsiteEditor({ websiteId, merchantId, initialContent, initialBusinessInfo, onSave }) {
  const [content, setContent] = useState(initialContent || '');
  const [businessInfo, setBusinessInfo] = useState(initialBusinessInfo || {});
  const [previewMode, setPreviewMode] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  
  // Visual editing state
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#10B981');
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');

  useEffect(() => {
    if (initialContent) {
      extractColors(initialContent);
      extractTexts(initialContent);
    }
  }, [initialContent]);

  const extractColors = (html) => {
    const colorMatch = html.match(/#[0-9A-Fa-f]{6}/g);
    if (colorMatch && colorMatch.length >= 2) {
      setPrimaryColor(colorMatch[0]);
      setSecondaryColor(colorMatch[1]);
    }
  };

  const extractTexts = (html) => {
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      setBusinessName(titleMatch[1].split(' - ')[0]);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const websites = await base44.entities.GeneratedWebsite.filter({
        merchant_id: merchantId
      });
      
      if (websites && websites.length > 0) {
        await base44.entities.GeneratedWebsite.update(websites[0].id, {
          html_content: content,
          business_info: businessInfo
        });
      }
      
      if (onSave) {
        onSave(content, businessInfo);
      }
      
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const applyColorChange = () => {
    let updatedContent = content;
    
    // Replace colors in style tags
    updatedContent = updatedContent.replace(
      /background:\s*linear-gradient\([^)]+\)/g,
      `background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    );
    
    updatedContent = updatedContent.replace(
      /background-color:\s*#[0-9A-Fa-f]{6}/g,
      `background-color: ${primaryColor}`
    );
    
    updatedContent = updatedContent.replace(
      /color:\s*#[0-9A-Fa-f]{6}/g,
      `color: ${primaryColor}`
    );
    
    setContent(updatedContent);
    alert('Colors updated! Preview the changes and click Save.');
  };

  const applyTextChange = () => {
    let updatedContent = content;
    
    if (businessName) {
      // Replace business name in title
      updatedContent = updatedContent.replace(
        /<title>.*?<\/title>/g,
        `<title>${businessName} - Home</title>`
      );
      
      // Replace h1 tags
      updatedContent = updatedContent.replace(
        /<h1[^>]*>.*?<\/h1>/g,
        `<h1>${businessName}</h1>`
      );
    }
    
    if (tagline) {
      // Replace first paragraph after h1
      const h1Index = updatedContent.indexOf('</h1>');
      if (h1Index !== -1) {
        const nextPTag = updatedContent.indexOf('<p', h1Index);
        const closingPTag = updatedContent.indexOf('</p>', nextPTag);
        if (nextPTag !== -1 && closingPTag !== -1) {
          const pContent = updatedContent.substring(nextPTag, closingPTag + 4);
          updatedContent = updatedContent.replace(pContent, `<p>${tagline}</p>`);
        }
      }
    }
    
    setContent(updatedContent);
    alert('Text updated! Preview the changes and click Save.');
  };

  const extractPageContent = (pageName) => {
    if (!content) return '';
    
    const pattern = new RegExp(`===\\s*${pageName}\\.html\\s*===([\\s\\S]*?)(?====|$)`, 'i');
    const match = content.match(pattern);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return content;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Website Editor
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <Code className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {previewMode ? 'Edit Code' : 'Preview'}
            </Button>
            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual">
              <Paintbrush className="w-4 h-4 mr-2" />
              Visual Editor
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="w-4 h-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Color Customization */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Paintbrush className="w-4 h-4" />
                    Colors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <Button onClick={applyColorChange} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Apply Color Changes
                  </Button>
                </CardContent>
              </Card>

              {/* Text Customization */}
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tagline/Subtitle</Label>
                    <Textarea
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="Your business tagline"
                      rows={3}
                    />
                  </div>
                  <Button onClick={applyTextChange} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Apply Text Changes
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardHeader>
                <CardTitle className="text-sm">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Make changes above and click "Apply" to update the preview</li>
                  <li>• Switch to "Code Editor" tab for advanced HTML/CSS editing</li>
                  <li>• Use "Preview" tab to see your changes in real-time</li>
                  <li>• Click "Save Changes" when you're happy with the result</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="code" className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 overflow-auto" style={{ maxHeight: '600px' }}>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="font-mono text-sm bg-transparent text-green-400 border-none resize-none min-h-[500px]"
                placeholder="Edit your HTML/CSS code here..."
              />
            </div>
            <Badge variant="outline" className="mt-2">
              Editing {content.length} characters
            </Badge>
          </TabsContent>

          <TabsContent value="preview">
            <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
              <iframe
                srcDoc={extractPageContent('home')}
                className="w-full h-full"
                title="Website Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}