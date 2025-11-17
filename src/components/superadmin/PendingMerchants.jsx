import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Clock, Mail, Phone, MapPin, CheckCircle, XCircle, UserPlus, Loader2 } from 'lucide-react';

export default function PendingMerchants() {
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [pin, setPin] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [inviting, setInviting] = useState(false);
  const queryClient = useQueryClient();

  const { data: merchants = [], isLoading } = useQuery({
    queryKey: ['pending-merchants'],
    queryFn: async () => {
      const allMerchants = await base44.entities.Merchant.list();
      const allUsers = await base44.entities.User.list();
      const merchantIdsWithUsers = new Set(allUsers.map(u => u.merchant_id).filter(Boolean));
      
      return allMerchants.filter(m => !merchantIdsWithUsers.has(m.id));
    },
  });

  const generateCredentials = () => {
    const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    setPin(generatedPin);
    setTempPassword(generatedPassword);
  };

  const handleActivate = async () => {
    if (!selectedMerchant || !pin || !tempPassword) {
      alert('Please generate credentials first');
      return;
    }

    setInviting(true);
    try {
      const response = await base44.functions.invoke('sendEmail', {
        to: selectedMerchant.owner_email,
        subject: 'ChainLINK POS - Your Account is Ready!',
        html: `
          <h2>Great news, ${selectedMerchant.owner_name}!</h2>
          <p>Your ChainLINK POS account has been activated and is ready to use.</p>
          
          <h3>Your Login Credentials:</h3>
          <p><strong>Email:</strong> ${selectedMerchant.owner_email}</p>
          <p><strong>PIN:</strong> ${pin}</p>
          <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          
          <p>You can now log in at your POS system using your 6-digit PIN for quick access.</p>
          <p>Your 30-day free trial has started!</p>
          
          <p><a href="${window.location.origin}">Click here to log in</a></p>
        `,
        text: `Great news, ${selectedMerchant.owner_name}!\n\nYour ChainLINK POS account has been activated and is ready to use.\n\nYour Login Credentials:\nEmail: ${selectedMerchant.owner_email}\nPIN: ${pin}\nTemporary Password: ${tempPassword}\n\nYou can now log in at your POS system using your 6-digit PIN for quick access.\nYour 30-day free trial has started!\n\nClick here to log in: ${window.location.origin}`
      });

      console.log('Email response:', response);

      // Set up demo data if requested
      if (selectedMerchant.settings?.demo_data_requested) {
        try {
          await base44.functions.invoke('setupDemoMenu', {
            merchant_id: selectedMerchant.id
          });
        } catch (demoError) {
          console.warn('Demo setup failed:', demoError);
        }
      }

      alert(`Activation email sent to ${selectedMerchant.owner_email}\n\nProvide these credentials manually:\nPIN: ${pin}\nPassword: ${tempPassword}`);
      
      queryClient.invalidateQueries({ queryKey: ['pending-merchants'] });
      setSelectedMerchant(null);
      setPin('');
      setTempPassword('');
    } catch (error) {
      console.error('Failed to send activation email:', error);
      alert('Failed to send activation email: ' + (error.response?.data?.error || error.message));
    } finally {
      setInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Merchant Registrations</h2>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {merchants.length} Pending
        </Badge>
      </div>

      {merchants.length === 0 ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No pending merchant registrations</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {merchants.map((merchant) => (
            <Card key={merchant.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="dark:text-white">{merchant.business_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      Registered {new Date(merchant.created_date).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending Activation</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{merchant.owner_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300">{merchant.owner_email}</span>
                  </div>
                  {merchant.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{merchant.phone}</span>
                    </div>
                  )}
                  {merchant.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">{merchant.address}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Reject this merchant registration?')) {
                        await base44.entities.Merchant.update(merchant.id, { status: 'cancelled' });
                        queryClient.invalidateQueries({ queryKey: ['pending-merchants'] });
                      }
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedMerchant(merchant);
                      generateCredentials();
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Activate Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMerchant} onOpenChange={() => {
        setSelectedMerchant(null);
        setPin('');
        setTempPassword('');
      }}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Activate Merchant Account</DialogTitle>
          </DialogHeader>
          
          {selectedMerchant && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Activating: <strong>{selectedMerchant.business_name}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Admin will be invited to: <strong>{selectedMerchant.owner_email}</strong>
                </p>
              </div>

              <div className="space-y-3 bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Generated PIN (copy this)</Label>
                  <Input value={pin} readOnly className="font-mono text-lg font-bold mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 dark:text-gray-400">Generated Password (copy this)</Label>
                  <Input value={tempPassword} readOnly className="font-mono text-sm mt-1" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateCredentials}
                  className="w-full"
                >
                  Regenerate Credentials
                </Button>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>Important:</strong> Copy these credentials before closing. You'll need to manually create the admin user in the Users section using these credentials and merchant_id: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">{selectedMerchant.id}</code>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMerchant(null)}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={inviting}>
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Email...
                </>
              ) : (
                'Send Activation Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}