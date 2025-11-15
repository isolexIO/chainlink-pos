import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Package, AlertCircle, CheckCircle } from 'lucide-react';

const ProductNotFoundDialog = ({ isOpen, onClose, barcode, onCreateProduct }) => {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    sku: barcode || '',
    barcode: barcode || '',
    price: 0,
    department: 'all',
    description: '',
    image_url: '',
    stock_quantity: 0,
    low_stock_alert: 10,
    is_active: true,
    pos_mode: ['restaurant', 'retail', 'quick_service']
  });
  const [lookupError, setLookupError] = useState('');
  const [lookupSuccess, setLookupSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !barcode) return;

    // Reset state
    setLookupError('');
    setLookupSuccess(false);
    setProductData({
      name: '',
      sku: barcode,
      barcode: barcode,
      price: 0,
      department: 'all',
      description: '',
      image_url: '',
      stock_quantity: 0,
      low_stock_alert: 10,
      is_active: true,
      pos_mode: ['restaurant', 'retail', 'quick_service']
    });

    lookupProductInfo(barcode);
  }, [isOpen, barcode]);

  const lookupProductInfo = async (barcode) => {
    setLoading(true);
    setLookupError('');
    
    try {
      console.log('Looking up barcode:', barcode);

      // Try Open Food Facts API first
      const offResponse = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const offData = await offResponse.json();
      
      if (offData.status === 1 && offData.product) {
        const product = offData.product;
        console.log('Found product in Open Food Facts:', product);
        
        setProductData(prev => ({
          ...prev,
          name: product.product_name || product.product_name_en || '',
          description: product.generic_name || product.generic_name_en || '',
          image_url: product.image_url || '',
          department: getCategoryFromProduct(product),
          price: 0 // Price must be entered manually
        }));
        setLookupSuccess(true);
        setLoading(false);
        return;
      }

      // Try UPC Database as fallback
      console.log('Trying UPC Database...');
      const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      const upcData = await upcResponse.json();
      
      if (upcData.code === 'OK' && upcData.items && upcData.items.length > 0) {
        const item = upcData.items[0];
        console.log('Found product in UPC Database:', item);
        
        setProductData(prev => ({
          ...prev,
          name: item.title || '',
          description: item.description || '',
          image_url: item.images && item.images.length > 0 ? item.images[0] : '',
          department: getCategoryFromUPC(item.category),
          price: 0 // Price must be entered manually
        }));
        setLookupSuccess(true);
        setLoading(false);
        return;
      }

      // No results found
      setLookupError('Product not found in online databases. Please enter details manually.');
      setLoading(false);
      
    } catch (error) {
      console.error('Product lookup error:', error);
      setLookupError('Unable to connect to product databases. Please enter details manually.');
      setLoading(false);
    }
  };

  const getCategoryFromProduct = (product) => {
    const categories = product.categories_tags || [];
    if (categories.some(cat => cat.includes('beverages'))) return 'beverage';
    if (categories.some(cat => cat.includes('snacks'))) return 'food';
    if (categories.some(cat => cat.includes('dairy'))) return 'food';
    return 'food';
  };

  const getCategoryFromUPC = (category) => {
    if (!category) return 'all';
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('grocery')) return 'food';
    if (cat.includes('beverage') || cat.includes('drink')) return 'beverage';
    if (cat.includes('health') || cat.includes('beauty')) return 'retail';
    return 'all';
  };

  const handleInputChange = (field, value) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    if (!productData.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (productData.price <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }
    onCreateProduct(productData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Not Found - Barcode: {barcode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Searching product databases...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Checking Open Food Facts and UPC Database
                  </p>
                </div>
              </div>
            </div>
          )}

          {lookupSuccess && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Product information found!
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                    Review the details below, add a price, and save to add to cart.
                  </p>
                </div>
              </div>
            </div>
          )}

          {lookupError && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {lookupError}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={productData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="price">Price * (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                value={productData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="mt-1"
                autoFocus={lookupSuccess}
              />
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={productData.department} onValueChange={(value) => handleInputChange('department', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All / General</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="beverage">Beverage</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Product description (optional)"
                className="h-20 mt-1"
              />
            </div>

            {productData.image_url && (
              <div className="md:col-span-2">
                <Label>Product Image</Label>
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={productData.image_url} 
                    alt="Product" 
                    className="w-32 h-32 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      handleInputChange('image_url', '');
                    }}
                  />
                  <div className="flex-1">
                    <Input
                      value={productData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      placeholder="Or enter image URL"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="stock">Initial Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={productData.stock_quantity}
                onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lowStock">Low Stock Alert</Label>
              <Input
                id="lowStock"
                type="number"
                min="0"
                value={productData.low_stock_alert}
                onChange={(e) => handleInputChange('low_stock_alert', parseInt(e.target.value) || 10)}
                placeholder="10"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <Switch
                id="active"
                checked={productData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="active">Product is Active (available for sale)</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={loading || !productData.name.trim() || productData.price <= 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Save & Add to Cart
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductNotFoundDialog;