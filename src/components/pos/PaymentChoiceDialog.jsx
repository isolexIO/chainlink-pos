import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, CreditCard, Banknote, CheckCircle } from 'lucide-react';

export default function PaymentChoiceDialog({ 
  isOpen, 
  onClose, 
  onCashSelected, 
  onCustomerTerminalSelected, 
  order,
  cart = [],
  totals,
  settings,
  waitingForCustomer,
  customerSelectedMethod
}) {
  
  // Check if EBT is enabled and there are EBT-eligible items
  const isEbtEnabled = settings?.payment_gateways?.ebt?.enabled;
  const hasEbtItems = cart.some(item => item?.ebt_eligible);
  const ebtEligibleTotal = parseFloat(totals?.ebtEligibleTotal || 0);
  const showEbtOption = isEbtEnabled && hasEbtItems && ebtEligibleTotal > 0;

  console.log('PaymentChoiceDialog: Rendering', {
    isOpen,
    waitingForCustomer,
    customerSelectedMethod,
    orderId: order?.id
  });

  if (waitingForCustomer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Waiting for Customer</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-600" />
            <div>
              <p className="text-lg font-medium mb-2">
                {customerSelectedMethod 
                  ? `Customer selected: ${customerSelectedMethod}`
                  : 'Customer is selecting payment method...'}
              </p>
              <p className="text-sm text-gray-500">
                {customerSelectedMethod
                  ? 'Proceeding with payment...'
                  : 'Please wait while the customer makes their selection on the customer display.'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Payment Method</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          <p className="text-center text-gray-600 mb-4">
            How would you like to collect payment?
          </p>

          <div className="grid gap-3">
            {/* Cash Payment - Handled by POS */}
            <Button
              onClick={onCashSelected}
              variant="outline"
              className="h-20 flex items-center justify-start gap-4 hover:bg-green-50 hover:border-green-500"
            >
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-lg">Cash</div>
                <div className="text-sm text-gray-500">Process cash payment at POS</div>
              </div>
            </Button>

            {/* EBT Payment - Handled by POS (manual entry mode) */}
            {showEbtOption && (
              <Button
                onClick={onCashSelected}
                variant="outline"
                className="h-20 flex items-center justify-start gap-4 hover:bg-green-50 hover:border-green-500"
              >
                <Banknote className="w-8 h-8 text-green-600" />
                <div className="text-left">
                  <div className="font-semibold text-lg">EBT/SNAP</div>
                  <div className="text-sm text-gray-500">
                    Eligible: ${ebtEligibleTotal.toFixed(2)}
                  </div>
                </div>
              </Button>
            )}

            {/* Customer Terminal - Interactive flow */}
            <Button
              onClick={onCustomerTerminalSelected}
              variant="outline"
              className="h-20 flex items-center justify-start gap-4 hover:bg-blue-50 hover:border-blue-500"
            >
              <CreditCard className="w-8 h-8 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-lg">Customer Terminal</div>
                <div className="text-sm text-gray-500">
                  Send to customer display for card/crypto payment
                </div>
              </div>
            </Button>
          </div>

          {showEbtOption && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <strong>EBT/SNAP eligible items detected</strong>
                  <p className="mt-1">
                    ${ebtEligibleTotal.toFixed(2)} can be paid with EBT benefits. 
                    {ebtEligibleTotal < parseFloat(totals?.cashTotal || 0) && 
                      ` Remaining balance can be paid with cash or card.`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}