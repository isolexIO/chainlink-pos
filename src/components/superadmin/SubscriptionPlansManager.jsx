import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Package,
  Plus,
  Edit,
  Trash2,
  Star,
  RefreshCw
} from 'lucide-react';

export default function SubscriptionPlansManager() {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const planList = await base44.entities.SubscriptionPlan.list('sort_order');
      setPlans(planList);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (planData) => {
    try {
      if (selectedPlan) {
        await base44.entities.SubscriptionPlan.update(selectedPlan.id, planData);
      } else {
        await base44.entities.SubscriptionPlan.create(planData);
      }
      
      await base44.entities.SystemLog.create({
        log_type: 'super_admin_action',
        action: selectedPlan ? 'Plan updated' : 'Plan created',
        description: `Subscription plan ${planData.name} was ${selectedPlan ? 'updated' : 'created'}`,
        user_email: (await base44.auth.me()).email,
        user_role: 'super_admin',
        severity: 'info'
      });

      await loadPlans();
      setShowForm(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan');
    }
  };

  const handleDelete = async (plan) => {
    if (!confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    try {
      await base44.entities.SubscriptionPlan.delete(plan.id);
      
      await base44.entities.SystemLog.create({
        log_type: 'super_admin_action',
        action: 'Plan deleted',
        description: `Subscription plan ${plan.name} was deleted`,
        user_email: (await base44.auth.me()).email,
        user_role: 'super_admin',
        severity: 'warning'
      });

      await loadPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan');
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await base44.entities.SubscriptionPlan.update(plan.id, {
        is_active: !plan.is_active
      });
      await loadPlans();
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Subscription Plans Management
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPlans}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => { setSelectedPlan(null); setShowForm(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading plans...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map(plan => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {plan.name}
                          {plan.is_featured && <Star className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <div className="text-sm text-gray-500">{plan.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${plan.price_monthly}/mo</div>
                    {plan.price_yearly && (
                      <div className="text-sm text-gray-500">${plan.price_yearly}/yr</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>
                        {plan.limits?.pos_terminals === -1 ? 'Unlimited' : plan.limits?.pos_terminals || 0} Terminals
                      </div>
                      <div>
                        {plan.limits?.monthly_orders === -1 ? 'Unlimited' : plan.limits?.monthly_orders || 0} Orders/mo
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => handleToggleActive(plan)}
                    />
                    <span className="ml-2 text-sm">
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => { setSelectedPlan(plan); setShowForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => handleDelete(plan)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {showForm && (
        <PlanFormDialog
          plan={selectedPlan}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setSelectedPlan(null); }}
        />
      )}
    </Card>
  );
}

function PlanFormDialog({ plan, onSave, onClose }) {
  const [formData, setFormData] = useState({
    plan_id: '',
    name: '',
    description: '',
    price_monthly: 0,
    price_yearly: 0,
    features: [
      { text: '', included: true }
    ],
    limits: {
      pos_terminals: 1,
      monthly_orders: 100,
      users: 5,
      locations: 1
    },
    stripe_price_id_monthly: '',
    stripe_price_id_yearly: '',
    is_active: true,
    is_featured: false,
    sort_order: 0,
    ...plan
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { text: '', included: true }]
    });
  };

  const updateFeature = (index, field, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Plan ID *</Label>
              <Input
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                placeholder="e.g., 'pro', 'enterprise'"
                required
              />
            </div>

            <div>
              <Label>Plan Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly Price ($) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price_monthly}
                onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label>Yearly Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.price_yearly}
                onChange={(e) => setFormData({ ...formData, price_yearly: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-lg font-semibold mb-4 block">Plan Limits</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>POS Terminals (-1 = unlimited)</Label>
                <Input
                  type="number"
                  value={formData.limits.pos_terminals}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, pos_terminals: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label>Monthly Orders (-1 = unlimited)</Label>
                <Input
                  type="number"
                  value={formData.limits.monthly_orders}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, monthly_orders: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label>Max Users (-1 = unlimited)</Label>
                <Input
                  type="number"
                  value={formData.limits.users}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, users: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>

              <div>
                <Label>Max Locations (-1 = unlimited)</Label>
                <Input
                  type="number"
                  value={formData.limits.locations}
                  onChange={(e) => setFormData({
                    ...formData,
                    limits: { ...formData.limits, locations: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">Features</Label>
              <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                <Plus className="w-4 h-4 mr-2" /> Add Feature
              </Button>
            </div>
            
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Switch
                    checked={feature.included}
                    onCheckedChange={(checked) => updateFeature(index, 'included', checked)}
                  />
                  <Input
                    value={feature.text}
                    onChange={(e) => updateFeature(index, 'text', e.target.value)}
                    placeholder="Feature description"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-lg font-semibold mb-4 block">Stripe Integration</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Stripe Price ID (Monthly)</Label>
                <Input
                  value={formData.stripe_price_id_monthly}
                  onChange={(e) => setFormData({ ...formData, stripe_price_id_monthly: e.target.value })}
                  placeholder="price_xxxxx"
                />
              </div>

              <div>
                <Label>Stripe Price ID (Yearly)</Label>
                <Input
                  value={formData.stripe_price_id_yearly}
                  onChange={(e) => setFormData({ ...formData, stripe_price_id_yearly: e.target.value })}
                  placeholder="price_xxxxx"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Active Plan</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Featured Plan (Recommended Badge)</Label>
              <Switch
                checked={formData.is_featured}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
            </div>

            <div>
              <Label>Sort Order (lower numbers appear first)</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}