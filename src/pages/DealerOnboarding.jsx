import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DealerOnboarding() {
  const [formData, setFormData] = useState({
    dealer_name: '',
    owner_name: '',
    owner_email: '',
    contact_phone: '',
    slug: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState('');

  const handleSlugChange = (value) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    setFormData({ ...formData, slug: sanitized });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.slug.length < 3) {
      setError('Slug must be at least 3 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await base44.functions.invoke('createDealerAccount', formData);

      if (response.success) {
        setCredentials({
          pin: response.credentials.pin,
          email: response.user.email,
          temp_password: response.credentials.temp_password,
          slug: response.dealer.slug
        });
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to create dealer account');
      }
    } catch (err) {
      console.error('Dealer signup error:', err);
      setError(err.message || 'Failed to create dealer account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl dark:text-white">Dealer Account Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 dark:text-white">Your Login Credentials</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">Email</Label>
                  <div className="font-mono bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600 dark:text-white">
                    {credentials.email}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">6-Digit PIN</Label>
                  <div className="font-mono text-2xl font-bold bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600 dark:text-white">
                    {credentials.pin}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">Temporary Password</Label>
                  <div className="font-mono bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600 dark:text-white break-all">
                    {credentials.temp_password}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600 dark:text-gray-300">Your Dealer URL</Label>
                  <div className="font-mono bg-white dark:bg-gray-700 p-3 rounded border dark:border-gray-600 dark:text-white">
                    https://{credentials.slug}.chainlinkpos.isolex.io
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Check your email for detailed setup instructions. These credentials have also been sent to your email address.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold dark:text-white">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Log in to your dealer dashboard</li>
                <li>Configure your white-label branding</li>
                <li>Set up Stripe Connect for commission payouts</li>
                <li>Customize your dealer landing page</li>
                <li>Start inviting merchants to your platform!</li>
              </ol>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={() => window.location.href = createPageUrl('PinLogin')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <CardTitle className="text-2xl dark:text-white">Become a ChainLINK Dealer</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            White-label POS platform with commission-based revenue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dealer_name" className="dark:text-gray-200">Dealer/Company Name *</Label>
                <Input
                  id="dealer_name"
                  value={formData.dealer_name}
                  onChange={(e) => setFormData({ ...formData, dealer_name: e.target.value })}
                  placeholder="Your Company Name"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="owner_name" className="dark:text-gray-200">Your Name *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="John Doe"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="owner_email" className="dark:text-gray-200">Email Address *</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                placeholder="your@email.com"
                required
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone" className="dark:text-gray-200">Phone Number</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="dark:text-gray-200">Dealer Slug (URL) *</Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="yourcompany"
                  required
                  pattern="[a-z0-9-]{3,30}"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your URL: https://{formData.slug || 'yourcompany'}.chainlinkpos.isolex.io
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold mb-2 dark:text-white">Dealer Benefits:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>20% commission on all merchant transactions</li>
                <li>White-label branding with your logo and colors</li>
                <li>Custom domain support</li>
                <li>Stripe Connect automated payouts</li>
                <li>Merchant management dashboard</li>
                <li>30-day free trial</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Dealer Account...
                </>
              ) : (
                'Create Dealer Account'
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already a dealer?{' '}
              <a href={createPageUrl('PinLogin')} className="text-purple-600 dark:text-purple-400 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}