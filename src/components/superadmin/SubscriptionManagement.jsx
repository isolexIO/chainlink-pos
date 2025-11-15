import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Edit,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

export default function SubscriptionManagement({ onUpdate }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subs, merch] = await Promise.all([
        base44.entities.Subscription.list('-created_date'),
        base44.entities.Merchant.list()
      ]);
      setSubscriptions(subs);
      setMerchants(merch);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMerchantName = (merchantId) => {
    const merchant = merchants.find(m => m.id === merchantId);
    return merchant?.business_name || 'Unknown';
  };

  const handleUpdateSubscription = async (subId, updates) => {
    try {
      await base44.entities.Subscription.update(subId, updates);
      
      await base44.entities.SystemLog.create({
        log_type: 'super_admin_action',
        action: 'Subscription updated',
        description: `Subscription ${subId} was updated`,
        user_email: (await base44.auth.me()).email,
        user_role: 'super_admin',
        severity: 'info'
      });

      await loadData();
      if (onUpdate) onUpdate();
      setShowEdit(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription');
    }
  };

  const handleMarkAsPaid = async (subscription) => {
    try {
      await base44.entities.Subscription.update(subscription.id, {
        status: 'active',
        last_payment_date: new Date().toISOString(),
        last_payment_amount: subscription.price,
        payment_failed_count: 0,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      await base44.entities.Merchant.update(subscription.merchant_id, {
        status: 'active',
        subscription_next_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

      await loadData();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const merchant = merchants.find(m => m.id === sub.merchant_id);
    const matchesSearch = merchant?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const configs = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      trial: { color: 'bg-blue-100 text-blue-800', label: 'Trial' },
      past_due: { color: 'bg-red-100 text-red-800', label: 'Past Due' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };
    const config = configs[status] || configs.trial;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Subscriptions Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Next Billing</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading subscriptions...
                  </TableCell>
                </TableRow>
              ) : filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {getMerchantName(sub.merchant_id)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {sub.plan_name}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${sub.price?.toFixed(2) || '0.00'}/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                    </TableCell>
                    <TableCell>
                      {sub.next_billing_date 
                        ? new Date(sub.next_billing_date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {sub.last_payment_date
                        ? new Date(sub.last_payment_date).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSub(sub);
                            setShowEdit(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {sub.status === 'past_due' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsPaid(sub)}
                            title="Mark as Paid"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Subscription Dialog */}
      {selectedSub && (
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription - {getMerchantName(selectedSub.merchant_id)}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Plan</Label>
                <Select
                  value={selectedSub.plan_name}
                  onValueChange={(value) => setSelectedSub({...selectedSub, plan_name: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free - $0/mo</SelectItem>
                    <SelectItem value="basic">Basic - $49/mo</SelectItem>
                    <SelectItem value="pro">Pro - $99/mo</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $299/mo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Monthly Price ($)</Label>
                <Input
                  type="number"
                  value={selectedSub.price || 0}
                  onChange={(e) => setSelectedSub({...selectedSub, price: parseFloat(e.target.value)})}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={selectedSub.status}
                  onValueChange={(value) => setSelectedSub({...selectedSub, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Next Billing Date</Label>
                <Input
                  type="date"
                  value={selectedSub.next_billing_date ? selectedSub.next_billing_date.split('T')[0] : ''}
                  onChange={(e) => setSelectedSub({...selectedSub, next_billing_date: new Date(e.target.value).toISOString()})}
                />
              </div>

              <div>
                <Label>Notes</Label>
                <Input
                  value={selectedSub.notes || ''}
                  onChange={(e) => setSelectedSub({...selectedSub, notes: e.target.value})}
                  placeholder="Admin notes..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEdit(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateSubscription(selectedSub.id, selectedSub)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}