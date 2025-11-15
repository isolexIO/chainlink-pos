import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DealerOnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    owner_name: '',
    owner_email: '',
    contact_email: '',
    contact_phone: '',
    primary_color: '#7B2FD6',
    secondary_color: '#0FD17A',
    billing_mode: 'root_fallback',
    commission_percent: 20
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await base44.auth.me();
      setCurrentUser(user);
      
      // Pre-fill form with user info
      setFormData(prev => ({
        ...prev,
        owner_name: user.full_name || '',
        owner_email: user.email || '',
        contact_email: user.email || ''
      }));
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create dealer
      const dealer = await base44.entities.Dealer.create({
        ...formData,
        status: 'trial',
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        total_merchants: 0,
        total_revenue_generated: 0,
        commission_earned: 0,
        commission_paid_out: 0,
        commission_pending: 0
      });

      // Update user to be dealer_admin
      if (currentUser && !currentUser.dealer_id) {
        await base44.entities.User.update(currentUser.id, {
          dealer_id: dealer.id,
          role: currentUser.role === 'root_admin' ? 'root_admin' : 'dealer_admin',
          can_view_all_merchants: true
        });
      }

      setStep(3); // Success step
    } catch (error) {
      console.error('Error creating dealer:', error);
      alert('Error creating dealer account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Welcome to ChainLINK!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Your dealer account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Set up your Stripe Connect account to receive payouts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Configure your custom domain and branding</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Invite your first merchant to get started</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => window.location.href = createPageUrl('DealerDashboard')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Become a ChainLINK Dealer</CardTitle>
              <CardDescription>
                Start your white-label POS business in minutes
                {currentUser?.role === 'root_admin' && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Root Admin Mode
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Business Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="ACME POS Solutions"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="acme-pos"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for your custom subdomain
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner_name">Owner Name *</Label>
                  <Input
                    id="owner_name"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="owner_email">Owner Email *</Label>
                  <Input
                    id="owner_email"
                    name="owner_email"
                    type="email"
                    value={formData.owner_email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_email">Support Email *</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Support Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Branding */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Branding</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      name="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={handleInputChange}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => setFormData(prev => ({...prev, primary_color: e.target.value}))}
                      placeholder="#7B2FD6"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondary_color"
                      name="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={handleInputChange}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => setFormData(prev => ({...prev, secondary_color: e.target.value}))}
                      placeholder="#0FD17A"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Commission */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Revenue Share</h3>
              <div>
                <Label htmlFor="commission_percent">Commission Percentage *</Label>
                <Input
                  id="commission_percent"
                  name="commission_percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commission_percent}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Percentage of merchant fees you'll earn
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Dealer Account'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}