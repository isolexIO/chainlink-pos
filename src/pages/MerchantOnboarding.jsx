import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Store, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function MerchantOnboarding() {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    setup_demo_data: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting merchant signup...', formData);
      const response = await base44.functions.invoke('createMerchantAccount', formData);
      console.log('Response received:', response);

      if (response.success) {
        setCredentials({
          pin: response.pin,
          email: response.user.email,
          temp_password: response.temp_password
        });
        setSuccess(true);
      } else {
        setError(response.error || 'Failed to create merchant account');
      }
    } catch (err) {
      console.error('Merchant signup error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create merchant account. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success && credentials) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl dark:text-white">Account Created Successfully!</CardTitle>
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
                  <Label className="text-gray-600 dark:text-gray-300">6-Digit PIN (for quick login)</Label>
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
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Save these credentials securely! You can use either your PIN for quick access or email/password for full account access.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold dark:text-white">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                <li>Log in using your PIN or email credentials</li>
                <li>Complete your business profile</li>
                <li>Add your products and inventory</li>
                <li>Configure payment methods</li>
                <li>Start processing orders!</li>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Store className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl dark:text-white">Create Your Merchant Account</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Start your 30-day free trial today
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error creating account</p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="business_name" className="dark:text-gray-200">Business Name *</Label>
                <Input
                  id="business_name"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Your Business Name"
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
              <Label htmlFor="phone" className="dark:text-gray-200">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="address" className="dark:text-gray-200">Business Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State, ZIP"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="setup_demo_data"
                checked={formData.setup_demo_data}
                onCheckedChange={(checked) => setFormData({ ...formData, setup_demo_data: checked })}
              />
              <label
                htmlFor="setup_demo_data"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-gray-200"
              >
                Set up demo products and sample data to get started quickly
              </label>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-semibold mb-2 dark:text-white">What you'll get:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>30-day free trial - no credit card required</li>
                <li>Full access to all POS features</li>
                <li>Multi-location support</li>
                <li>Inventory management</li>
                <li>Customer loyalty programs</li>
                <li>Detailed analytics and reports</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <a href={createPageUrl('PinLogin')} className="text-blue-600 dark:text-blue-400 hover:underline">
                Sign in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}