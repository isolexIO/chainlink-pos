import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign } from 'lucide-react';

export default function TipScreen({ order, onTipSelected }) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tipPercentages = [15, 18, 20, 25];
  const subtotal = order?.subtotal || 0;

  const calculateTip = (percentage) => {
    return (subtotal * (percentage / 100)).toFixed(2);
  };

  const handleTipSelection = async (tipAmount) => {
    try {
      setSubmitting(true);
      console.log('TipScreen: Submitting tip:', tipAmount);

      // Update order with tip and move to payment method selection
      await base44.entities.Order.update(order.id, {
        tip_amount: parseFloat(tipAmount),
        total: parseFloat(order.total) + parseFloat(tipAmount),
        status: 'ready_for_payment' // Move to payment method selection
      });

      console.log('TipScreen: Tip saved, moving to payment selection');
      
      if (onTipSelected) {
        onTipSelected(parseFloat(tipAmount));
      }
    } catch (error) {
      console.error('TipScreen: Error saving tip:', error);
      alert('Error saving tip. Please try again.');
      setSubmitting(false);
    }
  };

  const handleCustomTipSubmit = () => {
    const amount = parseFloat(customTip);
    if (!isNaN(amount) && amount >= 0) {
      handleTipSelection(amount);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Add a Tip?</h1>
          <p className="text-xl text-gray-600">
            Your service provider would appreciate it
          </p>
          <div className="mt-4 text-3xl font-bold text-blue-600">
            Subtotal: ${subtotal.toFixed(2)}
          </div>
        </div>

        {/* Preset tip buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {tipPercentages.map((percentage) => {
            const tipAmount = calculateTip(percentage);
            return (
              <Button
                key={percentage}
                onClick={() => handleTipSelection(tipAmount)}
                disabled={submitting}
                className="h-24 text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50"
              >
                <div className="flex flex-col items-center">
                  <span>{percentage}%</span>
                  <span className="text-lg">${tipAmount}</span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Custom tip */}
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2 text-lg">
            Custom Tip Amount
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="0.00"
                disabled={submitting}
                className="pl-12 text-xl h-16"
              />
            </div>
            <Button
              onClick={handleCustomTipSubmit}
              disabled={!customTip || submitting}
              className="h-16 px-8 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              Add Tip
            </Button>
          </div>
        </div>

        {/* No tip option */}
        <Button
          onClick={() => handleTipSelection(0)}
          disabled={submitting}
          variant="outline"
          className="w-full h-16 text-xl font-semibold border-2 disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'No Tip'}
        </Button>
      </div>
    </div>
  );
}