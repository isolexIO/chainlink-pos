import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Store, 
  DollarSign, 
  BarChart3,
  Users,
  Settings,
  Package,
  Crown,
  LogOut,
  Home
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';

import DealerManagement from '../components/rootadmin/DealerManagement';
import CommissionManagement from '../components/rootadmin/CommissionManagement';
import BillingOverview from '../components/rootadmin/BillingOverview';
import PlatformAnalytics from '../components/rootadmin/PlatformAnalytics';
import MerchantManagement from '../components/superadmin/MerchantManagement';
import SubscriptionManagement from '../components/superadmin/SubscriptionManagement';
import DeviceShopManagement from '../components/superadmin/DeviceShopManagement';
import SystemLogs from '../components/superadmin/SystemLogs';
import GlobalReports from '../components/superadmin/GlobalReports';
import SubscriptionPlansManager from '../components/superadmin/SubscriptionPlansManager';
import PaymentSettingsManager from '../components/superadmin/PaymentSettingsManager';
import AdvertisementManager from '../components/superadmin/AdvertisementManager';
import LandingPageEditor from '../components/superadmin/LandingPageEditor';
import NotificationManager from '../components/superadmin/NotificationManager';

export default function RootAdminPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pinLoggedInUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('pinLoggedInUser');
      base44.auth.logout(createPageUrl('Home'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Crown className="w-8 h-8 text-yellow-500 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Root Admin Dashboard</h1>
                {user && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Logged in as: {user.email} ({user.role})
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = createPageUrl('Home')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-9 gap-2">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="dealers">
              <Building2 className="w-4 h-4 mr-2" />
              Dealers
            </TabsTrigger>
            <TabsTrigger value="merchants">
              <Store className="w-4 h-4 mr-2" />
              Merchants
            </TabsTrigger>
            <TabsTrigger value="commissions">
              <DollarSign className="w-4 h-4 mr-2" />
              Commissions
            </TabsTrigger>
            <TabsTrigger value="billing">
              <DollarSign className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="subscriptions">
              <Package className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="device-shop">
              <Package className="w-4 h-4 mr-2" />
              Device Shop
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="logs">
              <Users className="w-4 h-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PlatformAnalytics />
          </TabsContent>

          <TabsContent value="dealers">
            <DealerManagement />
          </TabsContent>

          <TabsContent value="merchants">
            <MerchantManagement />
          </TabsContent>

          <TabsContent value="commissions">
            <CommissionManagement />
          </TabsContent>

          <TabsContent value="billing">
            <BillingOverview />
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="space-y-6">
              <SubscriptionPlansManager />
              <SubscriptionManagement />
            </div>
          </TabsContent>

          <TabsContent value="device-shop">
            <DeviceShopManagement />
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6">
              <PaymentSettingsManager />
              <AdvertisementManager />
              <LandingPageEditor />
              <NotificationManager />
            </div>
          </TabsContent>

          <TabsContent value="logs">
            <div className="space-y-6">
              <SystemLogs />
              <GlobalReports />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}