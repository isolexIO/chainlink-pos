import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Scan, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AgeVerificationDialog({ 
  isOpen, 
  onClose, 
  onVerify, 
  requiredAge, 
  restrictedItems,
  settings 
}) {
  const [verificationMethod, setVerificationMethod] = useState(null);
  const [idNumber, setIdNumber] = useState('');
  const [idLast4, setIdLast4] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [verifiedAge, setVerifiedAge] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const requireIdScan = settings?.age_verification?.require_id_scan;
  const logVerifications = settings?.age_verification?.log_verifications !== false;

  const calculateAge = (birthDateStr) => {
    const birth = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleManualVerification = () => {
    setError('');
    
    if (!birthDate) {
      setError('Please enter date of birth');
      return;
    }

    const age = calculateAge(birthDate);
    setVerifiedAge(age);

    if (age < requiredAge) {
      setError(`Customer must be at least ${requiredAge} years old. Calculated age: ${age}`);
      return;
    }

    if (!idLast4 || idLast4.length !== 4) {
      setError('Please enter last 4 digits of ID');
      return;
    }

    completeVerification('manual_entry', age);
  };

  const handleVisualCheck = () => {
    setError('');
    
    if (!verifiedAge || verifiedAge < requiredAge) {
      setError(`Customer must appear to be at least ${requiredAge} years old`);
      return;
    }

    completeVerification('visual_check', verifiedAge);
  };

  const handleIdScan = async () => {
    setIsProcessing(true);
    setError('');

    try {
      // TODO: Integrate with ID scanning hardware/service
      // For now, prompt for manual entry
      setError('ID scanner not configured. Please use manual verification.');
      setVerificationMethod('manual_entry');
    } catch (err) {
      setError('ID scan failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeVerification = async (method, age) => {
    setIsProcessing(true);

    try {
      // Get current user (cashier) info
      let verifierUser = { id: 'unknown', full_name: 'Unknown Cashier', email: 'unknown' };
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      if (pinUserJSON) {
        verifierUser = JSON.parse(pinUserJSON);
      }

      const verificationData = {
        verified: true,
        verification_method: method,
        verified_age: age,
        verified_by_user_id: verifierUser.id,
        verified_by_user_name: verifierUser.full_name,
        verified_at: new Date().toISOString(),
        id_last_4: method === 'manual_entry' ? idLast4 : null,
        birth_date: method === 'manual_entry' ? birthDate : null
      };

      // Log verification if enabled
      if (logVerifications) {
        try {
          await base44.functions.invoke('createAuditLog', {
            action_type: 'age_verification',
            severity: 'info',
            actor_id: verifierUser.id,
            actor_email: verifierUser.email,
            actor_role: verifierUser.role || 'cashier',
            description: `Age verification completed for ${requiredAge}+ restricted items`,
            metadata: {
              method: method,
              verified_age: age,
              required_age: requiredAge,
              items: restrictedItems.map(i => i.name),
              id_last_4: idLast4 || null
            },
            pci_relevant: false
          });
        } catch (logError) {
          console.error('Failed to log age verification:', logError);
          // Don't fail verification if logging fails
        }
      }

      onVerify(verificationData);
      resetForm();
    } catch (err) {
      setError('Verification failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setVerificationMethod(null);
    setIdNumber('');
    setIdLast4('');
    setBirthDate('');
    setVerifiedAge(null);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            Age Verification Required
          </DialogTitle>
          <DialogDescription>
            This transaction contains age-restricted items requiring verification.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Restricted Items List */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="font-medium text-sm mb-2">Restricted Items:</p>
            <ul className="space-y-1">
              {restrictedItems.map((item, idx) => (
                <li key={idx} className="text-sm flex items-center justify-between">
                  <span>{item.name}</span>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    {item.minimum_age || 21}+
                  </Badge>
                </li>
              ))}
            </ul>
            <p className="text-sm font-bold mt-2 text-orange-800">
              Minimum Age Required: {requiredAge}
            </p>
          </div>

          {/* Verification Method Selection */}
          {!verificationMethod && (
            <div className="space-y-3">
              <Label>Select Verification Method:</Label>
              
              {requireIdScan ? (
                <Button
                  onClick={() => {
                    setVerificationMethod('id_scan');
                    handleIdScan();
                  }}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-700"
                  disabled={isProcessing}
                >
                  <Scan className="w-6 h-6 mr-2" />
                  Scan ID
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setVerificationMethod('manual_entry')}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700"
                    variant="outline"
                  >
                    <User className="w-6 h-6 mr-2" />
                    Manual ID Entry
                  </Button>

                  <Button
                    onClick={() => setVerificationMethod('visual_check')}
                    className="w-full h-16"
                    variant="outline"
                  >
                    <CheckCircle className="w-6 h-6 mr-2" />
                    Visual Verification
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Manual Entry Form */}
          {verificationMethod === 'manual_entry' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="birthDate">Date of Birth *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="idLast4">Last 4 Digits of ID *</Label>
                <Input
                  id="idLast4"
                  type="text"
                  maxLength="4"
                  value={idLast4}
                  onChange={(e) => setIdLast4(e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                />
                <p className="text-xs text-gray-500 mt-1">For audit trail purposes only</p>
              </div>

              {birthDate && (
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm">
                    Calculated Age: <span className="font-bold">{calculateAge(birthDate)}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Visual Check Form */}
          {verificationMethod === 'visual_check' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
                <p className="text-sm font-medium text-yellow-900 mb-2">
                  ⚠️ Visual Verification Guidelines:
                </p>
                <ul className="text-xs text-yellow-800 space-y-1 list-disc list-inside">
                  <li>Customer must appear to be over {requiredAge} years old</li>
                  <li>If uncertain, request photo ID</li>
                  <li>You are responsible for this verification</li>
                </ul>
              </div>

              <div>
                <Label htmlFor="estimatedAge">Estimated Age *</Label>
                <Input
                  id="estimatedAge"
                  type="number"
                  min={requiredAge}
                  value={verifiedAge || ''}
                  onChange={(e) => setVerifiedAge(parseInt(e.target.value))}
                  placeholder={`At least ${requiredAge}`}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          
          {verificationMethod === 'manual_entry' && (
            <Button
              onClick={handleManualVerification}
              disabled={isProcessing || !birthDate || !idLast4}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Verifying...' : 'Verify Age'}
            </Button>
          )}

          {verificationMethod === 'visual_check' && (
            <Button
              onClick={handleVisualCheck}
              disabled={isProcessing || !verifiedAge || verifiedAge < requiredAge}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? 'Verifying...' : 'Confirm Verification'}
            </Button>
          )}

          {verificationMethod && (
            <Button
              variant="ghost"
              onClick={() => {
                setVerificationMethod(null);
                setError('');
              }}
              disabled={isProcessing}
            >
              Back
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}