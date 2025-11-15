import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Package } from 'lucide-react';

export default function OpenItemDialog({ isOpen, onClose, onAddItem }) {
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!itemName.trim() || !itemPrice || parseFloat(itemPrice) <= 0) {
      alert('Please enter both a valid name and price');
      return;
    }

    const openItem = {
      id: `open-${Date.now()}`,
      name: itemName.trim(),
      price: parseFloat(itemPrice),
      is_open_item: true,
      quantity: 1,
      modifiers: [],
      modifierTotal: 0,
      itemTotal: parseFloat(itemPrice)
    };

    onAddItem(openItem);
    
    // Reset form
    setItemName('');
    setItemPrice('');
    onClose();
  };

  const handleClose = () => {
    setItemName('');
    setItemPrice('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Open Item
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Custom Service, Misc Item"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="item-price">Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add to Cart
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}