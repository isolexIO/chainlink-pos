import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ModifierDialog({ product, onAddToCart, onCancel }) {
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const toggleModifier = (modifier) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.name === modifier.name);
      if (exists) {
        return prev.filter((m) => m.name !== modifier.name);
      } else {
        return [...prev, modifier];
      }
    });
  };

  const handleAdd = () => {
    onAddToCart(product, selectedModifiers);
  };

  const calculateTotalPrice = () => {
    const modifierTotal = selectedModifiers.reduce(
      (sum, m) => sum + m.price_adjustment,
      0
    );
    return (product.price + modifierTotal).toFixed(2);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize {product.name}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="font-semibold">Base Price: ${product.price.toFixed(2)}</p>
          <div className="space-y-2">
            <h4 className="font-medium">Options:</h4>
            {(product.modifiers || []).map((modifier) => (
              <div
                key={modifier.name}
                className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedModifiers.find((m) => m.name === modifier.name)
                    ? 'bg-blue-50 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleModifier(modifier)}
              >
                <span>{modifier.name}</span>
                <span>
                  {modifier.price_adjustment >= 0 ? '+' : '-'}$
                  {Math.abs(modifier.price_adjustment).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 flex justify-between items-center text-lg font-bold">
            <span>Total Price:</span>
            <span>${calculateTotalPrice()}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add to Cart</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}