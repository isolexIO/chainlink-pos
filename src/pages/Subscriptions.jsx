
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Check,
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Bitcoin,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import PermissionGate from '../components/PermissionGate';

export default function SubscriptionsPage() {
  const [user, setUser] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check localStorage first for impersonation
      let currentUser;
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      if (pinUserJSON) {
        currentUser = JSON.parse(pinUserJSON);
      } else {
        currentUser = await base44.auth.me();
      }
      
      setUser(currentUser);

      // Load available subscription plans from database
      const plans = await base44.entities.SubscriptionPlan.filter(
        { is_active: true },
        'sort_order'
      );
      setAvailablePlans(plans);

      if (currentUser.merchant_id) {
        const merchants = await base44.entities.Merchant.filter({ id: currentUser.merchant_id });
        if (merchants && merchants.length > 0) {
          setMerchant(merchants[0]);
          
          // Load subscription
          const subs = await base44.entities.Subscription.filter({ merchant_id: currentUser.merchant_id });
          if (subs && subs.length > 0) {
            setSubscription(subs[0]);
            
            // Mock payment history (in real app, this would be from payment records)
            const mockHistory = [
              {
                id: '1',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                amount: subs[0].price,
                status: 'paid',
                method: 'card',
                invoice_id: 'INV-001'
              },
              {
                id: '2',
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                amount: subs[0].price,
                status: 'paid',
                method: 'card',
                invoice_id: 'INV-002'
              }
            ];
            setPaymentHistory(mockHistory);
          }
        }
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const confirmUpgrade = () => {
    setShowUpgradeDialog(false);
    setShowPaymentDialog(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    // Add validation checks
    if (!user?.merchant_id) {
      alert('Merchant information not found. Please refresh and try again.');
      return;
    }

    if (!merchant) {
      alert('Merchant data not loaded. Please refresh and try again.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (subscription) {
        // Update existing subscription
        await base44.entities.Subscription.update(subscription.id, {
          plan_name: selectedPlan.plan_id,
          price: selectedPlan.price_monthly,
          status: 'active',
          last_payment_date: new Date().toISOString(),
          last_payment_amount: selectedPlan.price_monthly,
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          payment_gateway: paymentMethod === 'solana' ? 'crypto' : paymentMethod,
          payment_failed_count: 0
        });

        // Update merchant
        await base44.entities.Merchant.update(merchant.id, {
          subscription_plan: selectedPlan.plan_id,
          status: 'active'
        });
      } else {
        // Create new subscription
        await base44.entities.Subscription.create({
          merchant_id: user.merchant_id,
          plan_name: selectedPlan.plan_id,
          price: selectedPlan.price_monthly,
          billing_cycle: 'monthly',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_payment_date: new Date().toISOString(),
          last_payment_amount: selectedPlan.price_monthly,
          payment_gateway: paymentMethod === 'solana' ? 'crypto' : paymentMethod
        });

        // Update merchant - only if merchant exists
        if (merchant && merchant.id) {
          await base44.entities.Merchant.update(merchant.id, {
            subscription_plan: selectedPlan.plan_id,
            status: 'active'
          });
        }
      }

      alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
      await loadData();
      setShowPaymentDialog(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again or contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      active: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Active' },
      trial: { icon: Clock, color: 'bg-blue-100 text-blue-800', label: 'Trial' },
      past_due: { icon: AlertCircle, color: 'bg-red-100 text-red-800', label: 'Past Due' },
      cancelled: { icon: X, color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    const config = configs[status] || configs.trial;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const PlanCard = ({ plan, isCurrentPlan }) => {
    const getBorderColor = () => {
      if (plan.is_featured) return 'border-purple-500';
      if (plan.price_monthly === 0) return 'border-gray-300';
      if (plan.price_monthly < 100) return 'border-blue-500';
      return 'border-orange-500';
    };

    return (
      <Card className={`relative ${getBorderColor()} border-2 ${plan.is_featured ? 'shadow-xl' : ''}`}>
        {plan.is_featured && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-600 text-white">
              <Zap className="w-3 h-3 mr-1" />
              Most Popular
            </Badge>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <div className="mt-2">
            <span className="text-4xl font-bold">${plan.price_monthly}</span>
            <span className="text-gray-500">/month</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {plan.features?.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {feature.included ? (
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {isCurrentPlan ? (
            <Button variant="outline" disabled className="w-full">
              Current Plan
            </Button>
          ) : (
            <Button
              onClick={() => handleUpgradePlan(plan)}
              className="w-full"
              variant={plan.is_featured ? 'default' : 'outline'}
            >
              {subscription && plan.price_monthly > subscription.price ? 'Upgrade' : 'Select Plan'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-500">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  // Check if user has merchant_id
  if (!user?.merchant_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg font-medium">No Merchant Account</p>
            <p className="text-sm text-gray-500 mt-2">
              You need to be associated with a merchant account to manage subscriptions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if merchant data is loaded
  if (!merchant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Merchant Data Not Found</p>
            <p className="text-sm text-gray-500 mt-2">
              Unable to load merchant information. Please contact support.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if plans are loaded
  if (availablePlans.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg font-medium">No Subscription Plans Available</p>
            <p className="text-sm text-gray-500 mt-2">
              Please contact your administrator to set up subscription plans.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGate permission="manage_subscriptions">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-pink-600" />
              Subscription & Billing
            </h1>
            <p className="text-gray-500 mt-1">Manage your ChainPay subscription</p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plans">Plans</TabsTrigger>
              <TabsTrigger value="billing">Billing History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold capitalize">{subscription.plan_name} Plan</h3>
                          <p className="text-gray-500">
                            ${subscription.price}/{subscription.billing_cycle === 'yearly' ? 'year' : 'month'}
                          </p>
                        </div>
                        {getStatusBadge(subscription.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Next Billing Date
                          </p>
                          <p className="font-semibold mt-1">
                            {subscription.next_billing_date
                              ? format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')
                              : 'N/A'}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Last Payment
                          </p>
                          <p className="font-semibold mt-1">
                            {subscription.last_payment_date
                              ? format(new Date(subscription.last_payment_date), 'MMM dd, yyyy')
                              : 'Never'}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            Payment Method
                          </p>
                          <p className="font-semibold mt-1 capitalize">
                            {subscription.payment_gateway || 'Not Set'}
                          </p>
                        </div>
                      </div>

                      {subscription.status === 'past_due' && (
                        <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-red-900 dark:text-red-100">
                                Payment Past Due
                              </p>
                              <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                                Your payment is overdue. Please update your payment method to avoid service interruption.
                              </p>
                              <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700">
                                Pay Now
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No active subscription</p>
                      <Button onClick={() => handleUpgradePlan(availablePlans[1] || availablePlans[0])}>
                        Choose a Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Monthly Spend</p>
                        <p className="text-2xl font-bold">
                          ${subscription?.price || 0}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Account Age</p>
                        <p className="text-2xl font-bold">
                          {merchant?.created_date
                            ? Math.floor((Date.now() - new Date(merchant.created_date).getTime()) / (1000 * 60 * 60 * 24))
                            : 0} days
                        </p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Payment Status</p>
                        <p className="text-2xl font-bold">
                          {subscription?.status === 'active' ? 'Current' : 'Overdue'}
                        </p>
                      </div>
                      <CheckCircle className={`w-8 h-8 ${subscription?.status === 'active' ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Plans Tab */}
            <TabsContent value="plans">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {availablePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrentPlan={subscription?.plan_name === plan.plan_id}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Billing History Tab */}
            <TabsContent value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No payment history available
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Invoice ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>
                              {format(new Date(payment.date), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="font-mono">{payment.invoice_id}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell className="capitalize">{payment.method}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Download
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Plan Change</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              You are about to {subscription && selectedPlan && selectedPlan.price_monthly > subscription.price ? 'upgrade' : 'change'} to the{' '}
              <strong>{selectedPlan?.name}</strong> plan for{' '}
              <strong>${selectedPlan?.price_monthly}/month</strong>.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              You will be charged immediately and your billing cycle will reset.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>
              Continue to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{selectedPlan?.name} Plan</span>
                <span className="text-2xl font-bold">${selectedPlan?.price_monthly}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex flex-col items-center py-6"
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="text-xs">Credit Card</span>
                </Button>
                <Button
                  variant={paymentMethod === 'solana' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('solana')}
                  className="flex flex-col items-center py-6"
                >
                  <Bitcoin className="w-6 h-6 mb-2" />
                  <span className="text-xs">Solana Pay</span>
                </Button>
                <Button
                  variant={paymentMethod === 'ach' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('ach')}
                  className="flex flex-col items-center py-6"
                >
                  <DollarSign className="w-6 h-6 mb-2" />
                  <span className="text-xs">Bank (ACH)</span>
                </Button>
              </div>
            </div>

            {paymentMethod === 'solana' && (
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900">
                <p className="font-semibold mb-2">Solana Pay Instructions:</p>
                <p>1. Scan the QR code with your Solana wallet</p>
                <p>2. Approve the transaction</p>
                <p>3. Your subscription will activate immediately</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={processing}>
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Complete Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PermissionGate>
  );
}
