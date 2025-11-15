import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  RefreshCw, 
  Truck,
  ShoppingBag,
  AlertCircle
} from 'lucide-react';

export default function MarketplaceTab({ integrations, onUpdateIntegrations }) {
  const [syncing, setSyncing] = useState(null);

  const updateIntegration = (integrationName, updates) => {
    onUpdateIntegrations({
      ...integrations,
      [integrationName]: {
        ...integrations[integrationName],
        ...updates
      }
    });
  };

  const syncNow = async (integrationName) => {
    setSyncing(integrationName);
    
    // Simulate menu sync
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    updateIntegration(integrationName, {
      last_synced: new Date().toISOString()
    });
    
    setSyncing(null);
  };

  const IntegrationCard = ({ name, title, description, icon: Icon, color, fields }) => {
    const integration = integrations[name] || { enabled: false };
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className={`w-6 h-6 ${color}`} />
              <div>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </div>
            {integration.enabled && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" /> Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <Label htmlFor={`${name}-enabled`}>Enable {title}</Label>
            <Switch
              id={`${name}-enabled`}
              checked={integration.enabled}
              onCheckedChange={(checked) => updateIntegration(name, { enabled: checked })}
            />
          </div>

          {integration.enabled && (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium">Automatic Order Import</p>
                    <p className="text-xs">Orders will be imported to your POS automatically</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor={`${name}-auto-accept`}>Auto-Accept Orders</Label>
                  <p className="text-xs text-muted-foreground">Automatically accept incoming orders</p>
                </div>
                <Switch
                  id={`${name}-auto-accept`}
                  checked={integration.auto_accept}
                  onCheckedChange={(checked) => updateIntegration(name, { auto_accept: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                {fields.map(field => (
                  <div key={field.key}>
                    <Label>{field.label}</Label>
                    <Input
                      type={field.type || 'text'}
                      value={integration[field.key] || ''}
                      onChange={(e) => updateIntegration(name, { [field.key]: e.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => syncNow(name)}
                  disabled={syncing === name}
                  variant="outline"
                >
                  {syncing === name ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Syncing...</>
                  ) : (
                    'Sync Menu Now'
                  )}
                </Button>
                <Button
                  onClick={() => updateIntegration(name, { enabled: false })}
                  variant="destructive"
                >
                  Disconnect
                </Button>
              </div>

              {integration.last_synced && (
                <p className="text-xs text-muted-foreground text-center">
                  Last synced: {new Date(integration.last_synced).toLocaleString()}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">Integration Notice</p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Connecting to delivery marketplaces will sync your menu and automatically import orders to your POS system.
              Make sure your products are properly configured before enabling.
            </p>
          </div>
        </div>
      </div>

      <IntegrationCard
        name="doordash"
        title="DoorDash"
        description="Nation's leading delivery service"
        icon={Truck}
        color="text-red-600"
        fields={[
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter DoorDash API key' },
          { key: 'store_id', label: 'Store ID', placeholder: 'Your DoorDash store ID' }
        ]}
      />

      <IntegrationCard
        name="grubhub"
        title="Grubhub"
        description="Connect with millions of diners"
        icon={ShoppingBag}
        color="text-orange-600"
        fields={[
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter Grubhub API key' },
          { key: 'restaurant_id', label: 'Restaurant ID', placeholder: 'Your Grubhub restaurant ID' }
        ]}
      />

      <IntegrationCard
        name="uber_eats"
        title="Uber Eats"
        description="Reach customers through Uber Eats"
        icon={Truck}
        color="text-green-600"
        fields={[
          { key: 'client_id', label: 'Client ID', placeholder: 'Uber Eats client ID' },
          { key: 'client_secret', label: 'Client Secret', type: 'password', placeholder: 'Client secret' },
          { key: 'store_id', label: 'Store ID', placeholder: 'Your Uber Eats store ID' }
        ]}
      />

      <IntegrationCard
        name="takeout7"
        title="Takeout7"
        description="Local delivery and takeout platform"
        icon={ShoppingBag}
        color="text-purple-600"
        fields={[
          { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'Enter Takeout7 API key' },
          { key: 'store_id', label: 'Store ID', placeholder: 'Your Takeout7 store ID' }
        ]}
      />
    </div>
  );
}