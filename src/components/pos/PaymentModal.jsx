
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Coins, CreditCard as CreditCardIcon, Banknote, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function PaymentModal({
  isOpen,
  onClose,
  totals,
  onProcessPayment,
  onStartInteractivePayment,
  settings,
  cart,
  order,
}) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [cashReceived, setCashReceived] = useState("");
  const [change, setChange] = useState(0);
  
  // EBT-specific state
  const [ebtAmount, setEbtAmount] = useState("");
  const [ebtApprovalCode, setEbtApprovalCode] = useState("");
  const [ebtLast4, setEbtLast4] = useState("");
  const [otherPaymentMethod, setOtherPaymentMethod] = useState(null);

  // Manual confirmation state (for non-integrated terminals)
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionNotes, setTransactionNotes] = useState("");
  const [manualApprovalCode, setManualApprovalCode] = useState("");
  const [manualLast4, setManualLast4] = useState("");

  const isDualPricingActive = settings?.pricing_and_surcharge?.enable_dual_pricing;
  const isEbtEnabled = settings?.payment_gateways?.ebt?.enabled;
  const isEbtManual = settings?.payment_gateways?.ebt?.manual_entry_mode;
  const isNonIntegratedEnabled = settings?.payment_gateways?.non_integrated?.enabled;
  const isCardManual = settings?.payment_gateways?.stripe?.manual_entry_mode;
  
  const finalTipAmount = order?.tip_amount || 0;
  const finalCardTotal = parseFloat(totals.cardTotal) + finalTipAmount;
  const finalCashTotal = parseFloat(totals.cashTotal) + finalTipAmount;
  const ebtEligibleTotal = parseFloat(totals.ebtEligibleTotal || 0);
  const hasEbtItems = ebtEligibleTotal > 0;

  useEffect(() => {
    if (cashReceived) {
      const received = parseFloat(cashReceived);
      if (!isNaN(received)) {
        const newChange = received - finalCashTotal;
        setChange(newChange > 0 ? newChange : 0);
      }
    } else {
      setChange(0);
    }
  }, [cashReceived, finalCashTotal]);
  
  useEffect(() => {
    if (isOpen) {
      // Check if we should auto-select EBT
      if (window.posShowEbtPayment && isEbtEnabled && hasEbtItems) {
        setSelectedMethod('ebt');
        delete window.posShowEbtPayment;
      } else if (order?.status === 'payment_in_progress' && order?.payment_method === 'card') {
        setSelectedMethod('card_processing');
      } else {
        setSelectedMethod(null);
      }
      setCashReceived("");
      setChange(0);
      setEbtAmount("");
      setEbtApprovalCode("");
      setEbtLast4("");
      setOtherPaymentMethod(null);
      setIsProcessing(false);
      setTransactionNotes("");
      setManualApprovalCode("");
      setManualLast4("");
    }
  }, [isOpen, order, isEbtEnabled, hasEbtItems]);

  const handlePayment = (method) => {
    const paymentData = {
      method: method,
      tipAmount: finalTipAmount,
      total: method === 'cash' ? finalCashTotal : finalCardTotal,
    };

    if (method === 'cash') {
      paymentData.cashReceived = parseFloat(cashReceived);
      paymentData.change = change;
    } else if (method === 'ebt') {
      const ebtPaid = parseFloat(ebtAmount);
      const remaining = finalCashTotal - ebtPaid;
      
      paymentData.ebtAmount = ebtPaid;
      paymentData.details = {
        ebt_approval_code: ebtApprovalCode,
        ebt_card_last_4: ebtLast4,
        ebt_eligible_amount: ebtEligibleTotal,
        manual_entry: isEbtManual
      };

      if (remaining > 0) {
        paymentData.method = 'split';
        paymentData.otherAmount = remaining;
        paymentData.otherMethod = otherPaymentMethod;
        paymentData.details.split_payment = {
          ebt: ebtPaid,
          [otherPaymentMethod]: remaining
        };
      }
    } else if (method === 'card' && (selectedMethod === 'card_manual' || selectedMethod === 'non_integrated')) {
      paymentData.details = {
        approval_code: manualApprovalCode,
        card_last_4: manualLast4,
        manual_entry: true,
        transaction_notes: transactionNotes,
        gateway: selectedMethod === 'non_integrated' ? 'non_integrated' : 'stripe'
      };
    }

    onProcessPayment(paymentData);
  };

  const handleManualConfirmation = async (success) => {
    if (success) {
      handlePayment(selectedMethod === 'card_manual' || selectedMethod === 'non_integrated' ? 'card' : selectedMethod);
    } else {
      // Payment failed
      alert('Payment was declined. Please try another payment method.');
      setSelectedMethod(null);
      setIsProcessing(false);
    }
  };

  const renderInitialSelection = () => (
    <>
      <DialogHeader>
        <DialogTitle>Select Payment Method</DialogTitle>
        <DialogDescription>
          {isDualPricingActive ? (
            <div className="mt-2 text-center space-y-2">
              <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-300">Cash Total: ${totals.cashTotal}</div>
              </div>
              <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-300">Card Total: ${totals.cardTotal}</div>
              </div>
            </div>
          ) : (
             <div className="mt-2 text-center text-2xl font-bold">
               Total: ${totals.cardTotal}
             </div>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-4 py-6">
        <Button
          variant="outline"
          className="h-24 flex-col gap-2"
          onClick={() => setSelectedMethod("cash")}
        >
          <Coins className="w-8 h-8" />
          <span>Cash</span>
        </Button>
        
        {isEbtEnabled && hasEbtItems && (
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 border-green-500 hover:bg-green-50"
            onClick={() => setSelectedMethod("ebt")}
          >
            <Banknote className="w-8 h-8 text-green-600" />
            <span>EBT/SNAP</span>
            <span className="text-xs text-green-600">Eligible: ${ebtEligibleTotal.toFixed(2)}</span>
          </Button>
        )}
        
        {isNonIntegratedEnabled ? (
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => setSelectedMethod('non_integrated')}
          >
            <CreditCardIcon className="w-8 h-8" />
            <span>Customer Terminal</span>
            <span className="text-xs text-gray-500">External Device</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => {
              if (isCardManual) {
                setSelectedMethod('card_manual');
              } else {
                onStartInteractivePayment();
              }
            }}
          >
            <CreditCardIcon className="w-8 h-8" />
            <span>Customer Terminal</span>
            {isCardManual && <span className="text-xs text-gray-500">Manual Entry</span>}
          </Button>
        )}
      </div>
    </>
  );

  const renderCardManualEntry = () => (
    <>
      <DialogHeader>
        <DialogTitle>Process Card Payment</DialogTitle>
        <DialogDescription>
          Amount to charge: <span className="font-bold text-xl">${finalCardTotal.toFixed(2)}</span>
        </DialogDescription>
      </DialogHeader>
      {!isProcessing ? (
        <div className="py-6 space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Instructions:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Process ${finalCardTotal.toFixed(2)} on your card terminal</li>
              <li>Enter the approval code below</li>
              <li>Confirm payment success or failure</li>
            </ol>
          </div>

          {(selectedMethod === 'card_manual' || (isNonIntegratedEnabled && settings?.payment_gateways?.non_integrated?.require_approval_code)) && (
            <div className="space-y-2">
              <label htmlFor="approval-code" className="text-sm font-medium">Approval Code *</label>
              <Input
                id="approval-code"
                type="text"
                value={manualApprovalCode}
                onChange={(e) => setManualApprovalCode(e.target.value)}
                placeholder="Enter approval code from terminal"
                autoFocus
              />
            </div>
          )}

          {(selectedMethod === 'card_manual' || (isNonIntegratedEnabled && settings?.payment_gateways?.non_integrated?.require_last_4)) && (
            <div className="space-y-2">
              <label htmlFor="card-last4" className="text-sm font-medium">Card Last 4 Digits *</label>
              <Input
                id="card-last4"
                type="text"
                maxLength="4"
                value={manualLast4}
                onChange={(e) => setManualLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
              />
            </div>
          )}

          {(selectedMethod === 'card_manual' || (isNonIntegratedEnabled && settings?.payment_gateways?.non_integrated?.allow_notes)) && (
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Transaction Notes (Optional)</label>
              <Textarea
                id="notes"
                value={transactionNotes}
                onChange={(e) => setTransactionNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={2}
              />
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setSelectedMethod(null)}>
              Back
            </Button>
            <Button
              onClick={() => setIsProcessing(true)}
              disabled={
                ((selectedMethod === 'card_manual' || (isNonIntegratedEnabled && settings?.payment_gateways?.non_integrated?.require_approval_code)) && !manualApprovalCode) ||
                ((selectedMethod === 'card_manual' || (isNonIntegratedEnabled && settings?.payment_gateways?.non_integrated?.require_last_4)) && (!manualLast4 || manualLast4.length !== 4))
              }
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-8 space-y-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
            <h3 className="text-xl font-bold mb-2">Confirm Payment Status</h3>
            <p className="text-gray-600">
              Did the payment of <span className="font-bold">${finalCardTotal.toFixed(2)}</span> process successfully on your card terminal?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 border-red-500 hover:bg-red-50"
              onClick={() => handleManualConfirmation(false)}
            >
              <XCircle className="w-8 h-8 text-red-600" />
              <span className="text-red-600">Payment Failed</span>
            </Button>

            <Button
              className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => handleManualConfirmation(true)}
            >
              <CheckCircle className="w-8 h-8" />
              <span>Payment Successful</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const renderCardProcessing = () => (
    <>
      <DialogHeader>
        <DialogTitle>Process Card Payment</DialogTitle>
        <DialogDescription>
          The customer has chosen to pay by card. The total is <span className="font-bold text-xl">${finalCardTotal.toFixed(2)}</span> (including a ${finalTipAmount.toFixed(2)} tip).
        </DialogDescription>
      </DialogHeader>
      <div className="py-6 space-y-4">
        {isCardManual || isNonIntegratedEnabled ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Instructions:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Process ${finalCardTotal.toFixed(2)} on your card terminal</li>
              <li>Wait for approval from the terminal</li>
              <li>Click the button below to confirm payment received</li>
            </ol>
          </div>
        ) : (
          <p className="text-center">Please use the connected card reader to complete the transaction.</p>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            if (isCardManual || isNonIntegratedEnabled) {
              setSelectedMethod(isNonIntegratedEnabled ? 'non_integrated' : 'card_manual');
            } else {
              handlePayment("card");
            }
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <CreditCardIcon className="w-4 h-4 mr-2" />
          Confirm Payment Received
        </Button>
      </div>
    </>
  );

  const renderCashPayment = () => (
    <>
      <DialogHeader>
        <DialogTitle>Cash Payment</DialogTitle>
        <DialogDescription>
          Total amount due:
          <span className="font-bold text-2xl ml-2">${finalCashTotal.toFixed(2)}</span>
        </DialogDescription>
      </DialogHeader>
      <div className="py-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="cash-received" className="text-sm font-medium">Cash Received</label>
          <Input
            id="cash-received"
            type="number"
            step="0.01"
            value={cashReceived}
            onChange={(e) => setCashReceived(e.target.value)}
            placeholder="e.g., 100.00"
            autoFocus
          />
        </div>
        {change > 0 && (
          <div className="text-center text-lg">
            Change Due: <span className="font-bold text-2xl text-green-600">${change.toFixed(2)}</span>
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => setSelectedMethod(null)}>Back</Button>
        <Button
          onClick={() => handlePayment("cash")}
          disabled={!cashReceived || parseFloat(cashReceived) < finalCashTotal}
        >
          Finalize Payment
        </Button>
      </div>
    </>
  );

  const renderEBTPayment = () => {
    const maxEbtAmount = Math.min(ebtEligibleTotal, finalCashTotal);
    const currentEbtAmount = parseFloat(ebtAmount) || 0;
    const remainingAmount = finalCashTotal - currentEbtAmount;
    const needsSplitPayment = remainingAmount > 0 && currentEbtAmount > 0;

    if (isEbtManual && !isProcessing) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>EBT/SNAP Payment</DialogTitle>
            <DialogDescription>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <strong>Total Due:</strong> ${finalCashTotal.toFixed(2)}
                </div>
                <div className="text-sm text-green-600">
                  <strong>EBT Eligible:</strong> ${ebtEligibleTotal.toFixed(2)}
                </div>
                <div className="text-sm text-orange-600">
                  <strong>Max EBT Amount:</strong> ${maxEbtAmount.toFixed(2)}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800 mb-2">
                Instructions:
              </p>
              <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside">
                <li>Process EBT payment on your EBT terminal</li>
                <li>Enter the approval code and card details below</li>
                <li>Confirm payment success</li>
              </ol>
            </div>

            <div className="space-y-1">
              <label htmlFor="ebt-amount" className="text-sm font-medium">EBT Amount *</label>
              <Input
                id="ebt-amount"
                type="number"
                step="0.01"
                max={maxEbtAmount}
                value={ebtAmount}
                onChange={(e) => setEbtAmount(e.target.value)}
                placeholder={`Max: ${maxEbtAmount.toFixed(2)}`}
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ebt-approval" className="text-sm font-medium">Approval Code *</label>
              <Input
                id="ebt-approval"
                type="text"
                value={ebtApprovalCode}
                onChange={(e) => setEbtApprovalCode(e.target.value)}
                placeholder="Enter approval code from EBT terminal"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="ebt-last4" className="text-sm font-medium">Card Last 4 Digits *</label>
              <Input
                id="ebt-last4"
                type="text"
                maxLength="4"
                value={ebtLast4}
                onChange={(e) => setEbtLast4(e.target.value.replace(/\D/g, ''))}
                placeholder="0000"
              />
            </div>

            {needsSplitPayment && (
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Split Payment Required
                </p>
                <p className="text-sm text-yellow-700 mb-3">
                  Remaining balance: <strong>${remainingAmount.toFixed(2)}</strong>
                </p>
                <label className="text-sm font-medium">Pay remaining with:</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={otherPaymentMethod === 'cash' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOtherPaymentMethod('cash')}
                  >
                    Cash
                  </Button>
                  <Button
                    type="button"
                    variant={otherPaymentMethod === 'card' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOtherPaymentMethod('card')}
                  >
                    Card
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setSelectedMethod(null)}>Back</Button>
            <Button
              onClick={() => setIsProcessing(true)}
              disabled={
                !ebtAmount || 
                parseFloat(ebtAmount) <= 0 || 
                parseFloat(ebtAmount) > maxEbtAmount ||
                !ebtApprovalCode ||
                !ebtLast4 ||
                ebtLast4.length !== 4 ||
                (needsSplitPayment && !otherPaymentMethod)
              }
            >
              Continue
            </Button>
          </div>
        </>
      );
    }

    if (isEbtManual && isProcessing) {
      return (
        <>
          <DialogHeader>
            <DialogTitle>Confirm EBT Payment</DialogTitle>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2">Confirm Payment Status</h3>
              <p className="text-gray-600">
                Did the EBT payment of <span className="font-bold">${currentEbtAmount.toFixed(2)}</span> process successfully?
              </p>
              {needsSplitPayment && (
                <p className="text-sm text-gray-500 mt-2">
                  Remaining ${remainingAmount.toFixed(2)} will be collected after confirmation
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2 border-red-500 hover:bg-red-50"
                onClick={() => handleManualConfirmation(false)}
              >
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-red-600">Payment Failed</span>
              </Button>

              <Button
                className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                onClick={() => handleManualConfirmation(true)}
              >
                <CheckCircle className="w-8 h-8" />
                <span>Payment Successful</span>
              </Button>
            </div>
          </div>
        </>
      );
    }

    // Integrated EBT flow (not currently implemented, but structure is here)
    return null;
  };

  const renderContent = () => {
    switch (selectedMethod) {
        case 'cash':
            return renderCashPayment();
        case 'ebt':
            return renderEBTPayment();
        case 'card_manual':
        case 'non_integrated':
            return renderCardManualEntry();
        case 'card_processing':
            return renderCardProcessing();
        default:
            return renderInitialSelection();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
