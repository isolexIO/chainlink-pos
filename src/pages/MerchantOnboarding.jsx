
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Checkbox } from '@/components/ui/checkbox'; // Added import for Checkbox

export default function MerchantOnboarding() {
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    owner_email: '',
    phone: '',
    address: '',
    setup_demo_data: false // Added new field for demo data setup
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Changed initial state from null to empty string
  const [success, setSuccess] = useState(false); // Kept as boolean to control success screen display
  const [createdPin, setCreatedPin] = useState(null);
  const [successMessageDetails, setSuccessMessageDetails] = useState(''); // New state for additional success message details

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors
    setSuccess(false); // Reset success status
    setSuccessMessageDetails(''); // Clear previous success message details

    console.log('[pages/MerchantOnboarding.js] MerchantOnboarding: Submitting form...', formData);

    try {
      // Client-side validation removed as per outline (e.g., for business_name, owner_name, owner_email, and email format)
      // Relying on backend for validation.

      const response = await base44.functions.invoke('createMerchantAccount', {
        business_name: formData.business_name,
        owner_name: formData.owner_name,
        owner_email: formData.owner_email,
        phone: formData.phone,
        address: formData.address,
        plan: 'basic', // Assuming 'basic' plan by default
        dealer_id: null, // 'dealerId || null' from outline, assuming null as it's not provided in UI/props
        setup_demo_data: formData.setup_demo_data // Added from outline
      });

      console.log('[pages/MerchantOnboarding.js] MerchantOnboarding: Response:', response);

      if (response.data?.success) {
        const { merchant, user, pin } = response.data; // Destructure to get merchant, user, and pin details

        setSuccess(true); // Set overall success flag
        setCreatedPin(pin); // Set the generated PIN to display prominently

        // Construct the detailed success message as per outline, but adapted for existing UI structure
        setSuccessMessageDetails(
          `Business Name: ${merchant.business_name}\n` +
          `Owner Email: ${user.email}\n\n` +
          `You can log in using your PIN or your email address.`
        );
        
        // Show success for 5 seconds, then redirect to PIN Login page as per outline
        setTimeout(() => {
          window.location.href = createPageUrl('PinLogin');
        }, 5000);
      } else {
        // If success is false, but response is received, use its error message
        throw new Error(response.data?.error || 'Failed to create merchant account');
      }
    } catch (err) {
      console.error('[pages/MerchantOnboarding.js] MerchantOnboarding: Error:', err);
      // Extract error message from response or generic fallback
      setError(err.response?.data?.error || err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Account Created Successfully!</CardTitle>
            <CardDescription>
              Your ChainLINK POS merchant account has been created.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  {/* Display additional success details */}
                  {successMessageDetails && (
                    <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {successMessageDetails}
                    </p>
                  )}
                  <p className="font-semibold">Your PIN Code:</p>
                  <p className="text-3xl font-mono text-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    {createdPin}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please save this PIN. You'll need it to log in to your POS terminal.
                  </p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="pt-4 space-y-2">
              <Button
                onClick={() => window.location.href = createPageUrl('PinLogin')}
                className="w-full"
              >
                Go to PIN Login
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = createPageUrl('EmailLogin')}
                className="w-full"
              >
                Go to Email Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Merchant Account</CardTitle>
          <CardDescription>
            Start your free 30-day trial of ChainLINK POS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Your Business Name"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Your Full Name *</Label>
              <Input
                id="owner_name"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_email">Email Address *</Label>
              <Input
                id="owner_email"
                name="owner_email"
                type="email"
                value={formData.owner_email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, City, State ZIP"
                disabled={loading}
              />
            </div>

            {/* Added checkbox for setup_demo_data */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setup_demo_data"
                name="setup_demo_data"
                checked={formData.setup_demo_data}
                onCheckedChange={(checked) => handleChange({ target: { name: 'setup_demo_data', type: 'checkbox', checked } })}
                disabled={loading}
              />
              <Label htmlFor="setup_demo_data">Set up with demo data</Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a
                href={createPageUrl('EmailLogin')}
                className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Log in here
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
