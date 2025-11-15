import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Download
} from 'lucide-react';

export default function CommissionManagement() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0
  });

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      const commissionList = await base44.entities.DealerCommission.list('-created_date');
      setCommissions(commissionList);

      // Calculate stats
      const pending = commissionList
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.commission_amount, 0);
      const approved = commissionList
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.commission_amount, 0);
      const paid = commissionList
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.commission_amount, 0);

      setStats({
        totalPending: pending,
        totalApproved: approved,
        totalPaid: paid
      });
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCommission = async (commissionId) => {
    try {
      await base44.entities.DealerCommission.update(commissionId, {
        status: 'approved'
      });
      await loadCommissions();
    } catch (error) {
      console.error('Error approving commission:', error);
      alert('Failed to approve commission');
    }
  };

  const handleMarkAsPaid = async (commissionId) => {
    try {
      await base44.entities.DealerCommission.update(commissionId, {
        status: 'paid',
        paid_at: new Date().toISOString()
      });
      await loadCommissions();
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading commissions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">${stats.totalPending.toFixed(2)}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved (Unpaid)</p>
                <p className="text-2xl font-bold">${stats.totalApproved.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Paid Out</p>
                <p className="text-2xl font-bold">${stats.totalPaid.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commissions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Commissions</CardTitle>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{commission.merchant_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(commission.billing_period_start).toLocaleDateString()} -{' '}
                    {new Date(commission.billing_period_end).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {commission.commission_percent}% of ${commission.merchant_subscription_amount.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">${commission.commission_amount.toFixed(2)}</p>
                    {commission.paid_at && (
                      <p className="text-xs text-gray-500">
                        Paid: {new Date(commission.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <Badge className={
                    commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                    commission.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {commission.status}
                  </Badge>

                  <div className="flex gap-2">
                    {commission.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleApproveCommission(commission.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {commission.status === 'approved' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(commission.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark as Paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {commissions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No commissions yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}