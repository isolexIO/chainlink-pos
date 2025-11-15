
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  CreditCard,
  Printer,
  QrCode
} from 'lucide-react';

export default function DevicesTab({ hardware: devices, onUpdateHardware: onUpdateDevices }) {
  const [testingDevice, setTestingDevice] = useState(null);

  const addDevice = (type) => {
    const newDevice = {
      id: `${type}_${Date.now()}`,
      name: `New ${type}`,
      type: type === 'card_reader' ? 'verifone' : type === 'printer' ? 'receipt' : 'usb',
      connection_type: 'usb',
      is_connected: false,
      ip_address: '',
      port: type === 'printer' ? 9100 : 8080
    };

    const category = type === 'card_reader' ? 'card_readers' : type === 'printer' ? 'printers' : 'barcode_scanners';
    
    onUpdateDevices({
      ...devices,
      [category]: [...(devices[category] || []), newDevice]
    });
  };

  const removeDevice = (category, deviceId) => {
    onUpdateDevices({
      ...devices,
      [category]: devices[category].filter(d => d.id !== deviceId)
    });
  };

  const updateDevice = (category, deviceId, updates) => {
    onUpdateDevices({
      ...devices,
      [category]: devices[category].map(d => 
        d.id === deviceId ? { ...d, ...updates } : d
      )
    });
  };

  const testConnection = async (category, device) => {
    setTestingDevice(device.id);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update device status
    updateDevice(category, device.id, {
      is_connected: true,
      last_tested: new Date().toISOString()
    });
    
    setTestingDevice(null);
  };

  const DeviceCard = ({ device, category, icon: Icon, color }) => (
    <Card key={device.id} className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <Input
              value={device.name}
              onChange={(e) => updateDevice(category, device.id, { name: e.target.value })}
              className="font-semibold border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            {device.is_connected ? (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircle className="w-3 h-3 mr-1" /> Disconnected
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeDevice(category, device.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Device Type</Label>
            <Select
              value={device.type}
              onValueChange={(value) => updateDevice(category, device.id, { type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {category === 'card_readers' && (
                  <>
                    <SelectItem value="verifone">Verifone</SelectItem>
                    <SelectItem value="clover">Clover</SelectItem>
                    <SelectItem value="pax">Pax</SelectItem>
                    <SelectItem value="ellipal">ELLIPAL</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </>
                )}
                {category === 'printers' && (
                  <>
                    <SelectItem value="receipt">Receipt Printer</SelectItem>
                    <SelectItem value="kitchen">Kitchen Printer</SelectItem>
                    <SelectItem value="bar">Bar Printer</SelectItem>
                  </>
                )}
                {category === 'barcode_scanners' && (
                  <>
                    <SelectItem value="usb">USB Scanner</SelectItem>
                    <SelectItem value="bluetooth">Bluetooth Scanner</SelectItem>
                    <SelectItem value="camera">Camera Scanner</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Connection Type</Label>
            <Select
              value={device.connection_type}
              onValueChange={(value) => updateDevice(category, device.id, { connection_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usb">USB</SelectItem>
                <SelectItem value="bluetooth">Bluetooth</SelectItem>
                <SelectItem value="ethernet">Ethernet</SelectItem>
                <SelectItem value="wifi">WiFi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {['ethernet', 'wifi'].includes(device.connection_type) && (
            <>
              <div>
                <Label>IP Address</Label>
                <Input
                  value={device.ip_address || ''}
                  onChange={(e) => updateDevice(category, device.id, { ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                />
              </div>
              <div>
                <Label>Port</Label>
                <Input
                  type="number"
                  value={device.port || ''}
                  onChange={(e) => updateDevice(category, device.id, { port: parseInt(e.target.value) })}
                  placeholder="9100"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => testConnection(category, device)}
            disabled={testingDevice === device.id}
            className="flex-1"
          >
            {testingDevice === device.id ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Testing...</>
            ) : (
              'Test Connection'
            )}
          </Button>
          {device.is_connected && (
            <Button
              variant="outline"
              onClick={() => updateDevice(category, device.id, { is_connected: false })}
            >
              Disconnect
            </Button>
          )}
        </div>

        {device.last_tested && (
          <p className="text-xs text-muted-foreground">
            Last tested: {new Date(device.last_tested).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Card Readers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            Card Readers
          </h3>
          <Button onClick={() => addDevice('card_reader')} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Card Reader
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {(devices.card_readers || []).map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              category="card_readers"
              icon={CreditCard}
              color="text-blue-600"
            />
          ))}
          {(!devices.card_readers || devices.card_readers.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No card readers configured. Click "Add Card Reader" to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Printers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Printer className="w-5 h-5 text-purple-600" />
            Printers
          </h3>
          <Button onClick={() => addDevice('printer')} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Printer
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {(devices.printers || []).map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              category="printers"
              icon={Printer}
              color="text-purple-600"
            />
          ))}
          {(!devices.printers || devices.printers.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No printers configured. Click "Add Printer" to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Separator />

      {/* Barcode Scanners */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5 text-green-600" />
            Barcode Scanners
          </h3>
          <Button onClick={() => addDevice('barcode_scanner')} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Scanner
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {(devices.barcode_scanners || []).map(device => (
            <DeviceCard
              key={device.id}
              device={device}
              category="barcode_scanners"
              icon={QrCode}
              color="text-green-600"
            />
          ))}
          {(!devices.barcode_scanners || devices.barcode_scanners.length === 0) && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No barcode scanners configured. Click "Add Scanner" to get started.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
