import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Store, Zap, ShoppingBag, BarChart, Book, Loader2 } from "lucide-react";
import IntegrationCard from "../components/marketplace/IntegrationCard";
import PermissionGate from '../components/PermissionGate';
import { base44 } from '@/api/base44Client';

const integrationDefinitions = [
  {
    name: "Stripe",
    category: "Payments",
    description: "Accept credit card payments from anyone, anywhere.",
    logo: "/integrations/stripe.svg",
    icon: Zap
  },
  {
    name: "Authorize.net",
    category: "Payments",
    description: "Leading payment gateway for secure transactions.",
    logo: "/integrations/authorize.svg",
    icon: Zap
  },
  {
    name: "Shift4",
    category: "Payments",
    description: "Seamlessly integrated payment processing solutions.",
    logo: "/integrations/shift4.svg",
    icon: Zap
  },
  {
    name: "DoorDash",
    category: "Delivery",
    description: "Integrate with the nation's leading delivery service.",
    logo: "/integrations/doordash.svg",
    icon: ShoppingBag
  },
  {
    name: "Grubhub",
    category: "Delivery",
    description: "Connect with millions of diners.",
    logo: "/integrations/grubhub.svg",
    icon: ShoppingBag
  },
  {
    name: "Uber Eats",
    category: "Delivery",
    description: "Reach customers through Uber Eats.",
    logo: "/integrations/ubereats.svg",
    icon: ShoppingBag
  },
  {
    name: "QuickBooks",
    category: "Accounting",
    description: "Automatically sync your sales data with QuickBooks Online.",
    logo: "/integrations/quickbooks.svg",
    icon: Book
  },
  {
    name: "Mailchimp",
    category: "Marketing",
    description: "Sync customer data and automate email marketing campaigns.",
    logo: "/integrations/mailchimp.svg",
    icon: BarChart
  }
];


export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let currentUser = null;
      
      if (pinUserJSON) {
        currentUser = JSON.parse(pinUserJSON);
      } else {
        currentUser = await base44.auth.me();
      }
      
      if (!currentUser?.merchant_id) {
        setIntegrations(integrationDefinitions.map(def => ({ ...def, status: "Not Installed" })));
        return;
      }
      
      const merchants = await base44.entities.Merchant.filter({ id: currentUser.merchant_id });
      if (!merchants || merchants.length === 0) {
        setIntegrations(integrationDefinitions.map(def => ({ ...def, status: "Not Installed" })));
        return;
      }
      
      const merchant = merchants[0];
      const marketplaceIntegrations = merchant.settings?.marketplace_integrations || {};
      
      const integrationsWithStatus = integrationDefinitions.map(def => {
        const integrationKey = def.name.toLowerCase().replace(/\s+/g, '_').replace(/\./g, '');
        const integration = marketplaceIntegrations[integrationKey];
        
        return {
          ...def,
          status: integration?.enabled ? "Installed" : "Not Installed"
        };
      });
      
      setIntegrations(integrationsWithStatus);
    } catch (error) {
      console.error('Error loading integrations:', error);
      setIntegrations(integrationDefinitions.map(def => ({ ...def, status: "Not Installed" })));
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", "Payments", "Delivery", "Accounting", "Marketing"];

  const filteredIntegrations = integrations.filter(
    (app) =>
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "All" || app.category === category)
  );

  if (loading) {
    return (
      <PermissionGate permission="access_marketplace">
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading integrations...</p>
          </div>
        </div>
      </PermissionGate>
    );
  }

  return (
    <PermissionGate permission="access_marketplace">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Store className="w-8 h-8 text-green-600" />
                App Marketplace
              </h1>
              <p className="text-gray-500 mt-1">
                Extend your POS capabilities with third-party integrations
              </p>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    onClick={() => setCategory(cat)}
                    className="shrink-0"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((app, index) => (
                  <IntegrationCard key={index} app={app} onUpdate={loadIntegrations} />
              ))}
          </div>
        </div>
      </div>
    </PermissionGate>
  );
}