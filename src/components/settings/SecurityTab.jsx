import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SecurityTab({ settings, onSave }) {
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    pin_lockout_attempts: 3,
    pin_lockout_duration: 30,
    session_timeout_minutes: 30,
    require_pin_change: false,
    pin_change_interval_days: 90,
    audit_logging_enabled: true,
    pci_dss_mode: false,
    ip_whitelist_enabled: false,
    ip_whitelist: [],
    failed_login_notification: true,
    ...settings?.security
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    loadRecentAuditLogs();
  }, []);

  const loadRecentAuditLogs = async () => {
    setLoadingLogs(true);
    try {
      const user = await base44.auth.me();
      const logs = await base44.entities.AuditLog.filter(
        { merchant_id: user.merchant_id },
        '-created_date',
        10
      );
      setAuditLogs(logs);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleSave = () => {
    onSave({ security: securitySettings });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.info;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Security</TabsTrigger>
          <TabsTrigger value="pci">PCI-DSS Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        {/* General Security Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Authentication Security
              </CardTitle>
              <CardDescription>
                Configure login and session security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all users</p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, two_factor_enabled: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lockoutAttempts">PIN Lockout Attempts</Label>
                  <Input
                    id="lockoutAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.pin_lockout_attempts}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        pin_lockout_attempts: parseInt(e.target.value)
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Failed attempts before lockout
                  </p>
                </div>

                <div>
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockoutDuration"
                    type="number"
                    min="15"
                    max="120"
                    value={securitySettings.pin_lockout_duration}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        pin_lockout_duration: parseInt(e.target.value)
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    How long user is locked out
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  min="5"
                  max="480"
                  value={securitySettings.session_timeout_minutes}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      session_timeout_minutes: parseInt(e.target.value)
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Auto-logout after inactivity
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Periodic PIN Changes</Label>
                  <p className="text-sm text-gray-500">Force users to update PINs regularly</p>
                </div>
                <Switch
                  checked={securitySettings.require_pin_change}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, require_pin_change: checked })
                  }
                />
              </div>

              {securitySettings.require_pin_change && (
                <div>
                  <Label htmlFor="pinChangeInterval">PIN Change Interval (days)</Label>
                  <Input
                    id="pinChangeInterval"
                    type="number"
                    min="30"
                    max="365"
                    value={securitySettings.pin_change_interval_days}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        pin_change_interval_days: parseInt(e.target.value)
                      })
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Failed Login Notifications</Label>
                  <p className="text-sm text-gray-500">Email alerts for failed login attempts</p>
                </div>
                <Switch
                  checked={securitySettings.failed_login_notification}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, failed_login_notification: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Network Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>IP Whitelist</Label>
                  <p className="text-sm text-gray-500">Restrict access to specific IP addresses</p>
                </div>
                <Switch
                  checked={securitySettings.ip_whitelist_enabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, ip_whitelist_enabled: checked })
                  }
                />
              </div>

              {securitySettings.ip_whitelist_enabled && (
                <div>
                  <Label>Allowed IP Addresses</Label>
                  <textarea
                    className="w-full h-24 p-2 border rounded-md"
                    placeholder="Enter one IP address per line&#10;e.g., 192.168.1.100&#10;10.0.0.50"
                    value={securitySettings.ip_whitelist.join('\n')}
                    onChange={(e) =>
                      setSecuritySettings({
                        ...securitySettings,
                        ip_whitelist: e.target.value.split('\n').filter(ip => ip.trim())
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="w-4 h-4 mr-2" />
              Save Security Settings
            </Button>
          </div>
        </TabsContent>

        {/* PCI-DSS Compliance Tab */}
        <TabsContent value="pci" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                PCI-DSS Compliance Mode
              </CardTitle>
              <CardDescription>
                Enable additional security controls for PCI-DSS compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div>
                  <Label className="text-base">Enable PCI-DSS Mode</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Activates enhanced security controls and logging
                  </p>
                </div>
                <Switch
                  checked={securitySettings.pci_dss_mode}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, pci_dss_mode: checked })
                  }
                />
              </div>

              {securitySettings.pci_dss_mode && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">✓ Active Security Controls:</h4>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Enhanced audit logging for all transactions</li>
                      <li>• Automatic session timeout after 15 minutes</li>
                      <li>• Masked card data display (last 4 digits only)</li>
                      <li>• Encrypted data transmission (TLS 1.2+)</li>
                      <li>• No card data stored in database</li>
                      <li>• Quarterly vulnerability scans required</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
                    <h4 className="font-medium text-yellow-900 mb-2">⚠️ Compliance Requirements:</h4>
                    <ul className="space-y-1 text-sm text-yellow-800">
                      <li>• Annual PCI-DSS assessment required</li>
                      <li>• Use only PCI-compliant payment terminals</li>
                      <li>• Regular security training for all staff</li>
                      <li>• Maintain firewall and antivirus protection</li>
                      <li>• Physical security for card processing areas</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enhanced Audit Logging</Label>
                  <p className="text-sm text-gray-500">Log all payment-related activities</p>
                </div>
                <Switch
                  checked={securitySettings.audit_logging_enabled}
                  onCheckedChange={(checked) =>
                    setSecuritySettings({ ...securitySettings, audit_logging_enabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Recent Audit Logs
                  </CardTitle>
                  <CardDescription>
                    View security-related activities and events
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={loadRecentAuditLogs} disabled={loadingLogs}>
                  {loadingLogs ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No audit logs available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-4 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                          <span className="font-medium">{log.action_type}</span>
                          {log.pci_relevant && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              PCI
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.created_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {log.actor_email}
                        </span>
                        {log.ip_address && (
                          <span>{log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}