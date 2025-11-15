import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Award, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LoyaltyWidget({ phone, onRewardSelected, selectedReward, merchant }) {
  const [customer, setCustomer] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [showRewardsDialog, setShowRewardsDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (phone && merchant?.id) {
      loadCustomerData();
    }
  }, [phone, merchant]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      
      // Find or create customer by phone
      const customers = await base44.entities.Customer.filter({ 
        merchant_id: merchant.id,
        phone: phone 
      });
      
      let customerData;
      if (customers.length > 0) {
        customerData = customers[0];
      } else {
        // Create new customer with welcome bonus
        const loyaltySettings = merchant.settings?.loyalty_program || {};
        customerData = await base44.entities.Customer.create({
          merchant_id: merchant.id,
          name: 'Guest Customer',
          phone: phone,
          loyalty_points: loyaltySettings.welcome_bonus || 0
        });
      }
      
      setCustomer(customerData);
      
      // Load available rewards
      const rewardsList = await base44.entities.Reward.filter({
        merchant_id: merchant.id,
        is_active: true
      });
      
      setRewards(rewardsList);
    } catch (error) {
      console.error('Error loading customer loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableRewards = rewards.filter(r => 
    r.points_required <= (customer?.loyalty_points || 0)
  );

  if (!customer || !merchant?.settings?.loyalty_program?.enabled) {
    return null;
  }

  return (
    <>
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your Points Balance</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{customer.loyalty_points || 0}</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowRewardsDialog(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={availableRewards.length === 0}
            >
              <Gift className="w-4 h-4 mr-2" />
              Rewards ({availableRewards.length})
            </Button>
          </div>
          
          {selectedReward && (
            <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">Reward Applied</p>
                  <p className="text-sm dark:text-white">{selectedReward.name}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRewardSelected(null)}>
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRewardsDialog} onOpenChange={setShowRewardsDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Gift className="w-5 h-5" />
              Available Rewards
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {availableRewards.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No rewards available yet</p>
                <p className="text-sm">Keep earning points to unlock rewards!</p>
              </div>
            ) : (
              availableRewards.map(reward => (
                <Card 
                  key={reward.id} 
                  className={`cursor-pointer transition-all ${
                    selectedReward?.id === reward.id 
                      ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'hover:border-purple-300 dark:border-gray-700 dark:bg-gray-900'
                  }`}
                  onClick={() => {
                    onRewardSelected(reward);
                    setShowRewardsDialog(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold dark:text-white">{reward.name}</h4>
                      <Badge className="dark:bg-purple-900/50 dark:text-purple-200">{reward.points_required} pts</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{reward.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {reward.reward_type === 'percentage_discount' && `${reward.discount_value}% off`}
                        {reward.reward_type === 'fixed_discount' && `$${reward.discount_value} off`}
                        {reward.reward_type === 'free_item' && 'Free item'}
                      </span>
                      {selectedReward?.id === reward.id && (
                        <Badge className="bg-green-500 dark:bg-green-600">Selected</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}