import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ShoppingCart,
  Plus,
  Minus,
  Heart,
  Car,
  Store,
  UtensilsCrossed,
  CreditCard,
  Bitcoin,
  CheckCircle,
  QrCode,
  Loader2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModifierDialog from "../components/online-menu/ModifierDialog";
import ProductGrid from '../components/pos/ProductGrid';
import SolanaPayScreen from '../components/customer-display/SolanaPayScreen';

const ProductCard = ({ product, onAddToCart, onToggleFavorite, isFavorite }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group dark:bg-gray-900 dark:border-gray-700">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative cursor-pointer" onClick={() => onAddToCart(product)}>
        <img
          src={product.image_url || `https://via.placeholder.com/400x300/F0F0F0/AAAAAA?text=${product.name}`}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full"
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
        >
          <Heart className={`w-5 h-5 transition-all ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{product.name}</h3>
          <span className="font-bold text-lg text-green-600 dark:text-green-400">
            ${product.price.toFixed(2)}
          </span>
        </div>
        {product.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <Badge variant="secondary" className="capitalize dark:bg-gray-700 dark:text-gray-200">
            {product.category}
          </Badge>
          <Button
            onClick={() => onAddToCart(product)}
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OnlineMenuPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('details');
  const [showAccount, setShowAccount] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    fulfillment_type: "pickup",
    delivery_address: "",
    special_instructions: "",
    requested_time: ""
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [merchant, setMerchant] = useState(null);
  const [selectedProductForModifiers, setSelectedProductForModifiers] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showSolanaPayModal, setShowSolanaPayModal] = useState(false);

  const loadUserData = useCallback(async (user) => {
    try {
      const userOrders = await base44.entities.OnlineOrder.filter({ created_by: user.email }, "-created_date", 20);
      setPastOrders(userOrders);

      if (user.favorite_product_ids && user.favorite_product_ids.length > 0) {
        const favs = await base44.entities.Product.filter({ id: { "$in": user.favorite_product_ids } });
        setFavoriteProducts(favs);
      } else {
        setFavoriteProducts([]);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load products
      const productList = await base44.entities.Product.list();
      setProducts(productList.filter(p => p.is_active));

      // Try to get current user
      try {
        const userData = await base44.auth.me();
        setCurrentUser(userData);
        setCustomerInfo(prev => ({ 
          ...prev, 
          name: userData.full_name || '', 
          email: userData.email || '' 
        }));
        loadUserData(userData);
        
        // Load merchant settings for this user
        if (userData.merchant_id) {
          const merchants = await base44.entities.Merchant.filter({ id: userData.merchant_id });
          if (merchants && merchants.length > 0) {
            setMerchant(merchants[0]);
          }
        }
      } catch (authError) {
        console.log('No authenticated user - public browsing mode');
        // Try to load first active merchant for public browsing
        try {
          const merchants = await base44.entities.Merchant.filter({ status: 'active' });
          if (merchants && merchants.length > 0) {
            setMerchant(merchants[0]);
          }
        } catch (merchantError) {
          console.error('Could not load merchant:', merchantError);
        }
      }

    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setLoading(false);
    }
  }, [loadUserData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleToggleFavorite = useCallback(async (productId) => {
    if (!currentUser) {
      alert("Please log in to save favorites!");
      return;
    }

    const currentFavorites = currentUser.favorite_product_ids || [];
    let newFavorites;

    if (currentFavorites.includes(productId)) {
      newFavorites = currentFavorites.filter(id => id !== productId);
    } else {
      newFavorites = [...currentFavorites, productId];
    }

    try {
      await base44.auth.updateMe({ favorite_product_ids: newFavorites });
      const updatedUser = await base44.auth.me();
      setCurrentUser(updatedUser);
      loadUserData(updatedUser);
    } catch (error) {
      console.error("Error updating favorites", error);
    }
  }, [currentUser, loadUserData]);

  const addToCart = (product, modifiers = []) => {
    const existingItemIndex = cart.findIndex(
      item => item.id === product.id &&
      JSON.stringify(item.modifiers) === JSON.stringify(modifiers)
    );
    const modifierTotal = modifiers.reduce((sum, mod) => sum + (mod.price_adjustment || 0), 0);

    if (existingItemIndex > -1) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      newCart[existingItemIndex].item_total =
        (product.price + modifierTotal) *
        newCart[existingItemIndex].quantity;
      setCart(newCart);
    } else {
      setCart([...cart, {
        ...product,
        quantity: 1,
        modifiers,
        item_total: product.price + modifierTotal
      }]);
    }
    setSelectedProductForModifiers(null);
  };

  const updateCartQuantity = (index, quantity) => {
    if (quantity === 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }

    const newCart = [...cart];
    const item = newCart[index];
    const modifierTotal = item.modifiers?.reduce((sum, m) => sum + (m.price_adjustment || 0), 0) || 0;
    newCart[index].quantity = quantity;
    newCart[index].item_total = (item.price + modifierTotal) * quantity;
    setCart(newCart);
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.item_total, 0);
    const deliveryFee = customerInfo.fulfillment_type === "delivery" ? (merchant?.settings?.online_ordering?.delivery_fee || 4.99) : 0;
    const taxRate = merchant?.settings?.tax_rate || 0.08;
    const taxAmount = (subtotal + deliveryFee) * taxRate;
    const total = subtotal + deliveryFee + taxAmount;

    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const resetOrderState = useCallback(() => {
    setCart([]);
    setCustomerInfo({
      name: currentUser?.full_name || "",
      email: currentUser?.email || "",
      phone: "",
      fulfillment_type: "pickup",
      delivery_address: "",
      special_instructions: "",
      requested_time: ""
    });
    setShowCheckout(false);
    setCheckoutStep('details');
    setPaymentMethod('card');
    setCurrentOrder(null);
    setShowSolanaPayModal(false);
  }, [currentUser]);

  const processCardCryptoPayment = async (paymentDetails) => {
    setLoading(true);
    try {
      if (!currentOrder) {
        alert("Error: No order to process. Please restart checkout.");
        setCheckoutStep('details');
        return;
      }

      await base44.entities.OnlineOrder.update(currentOrder.id, {
        status: "confirmed",
        payment_status: "paid",
        payment_method: paymentDetails.method
      });

      setCheckoutStep('confirmation');
      setTimeout(resetOrderState, 5000);

      if (currentUser) {
        loadUserData(currentUser);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Error processing payment. Please try again.");
      setCheckoutStep('payment');
    } finally {
      setLoading(false);
    }
  };

  const initiateOrderProcess = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    if (customerInfo.fulfillment_type === 'delivery' && !customerInfo.delivery_address) {
      alert('Please enter a delivery address');
      return;
    }

    setLoading(true);

    try {
      const totals = calculateTotals();
      const orderNumber = `ON-${Date.now()}`;

      const orderData = {
        merchant_id: merchant?.id || 'unknown',
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || '',
        customer_phone: customerInfo.phone,
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          modifiers: item.modifiers || [],
          item_total: item.item_total
        })),
        subtotal: parseFloat(totals.subtotal),
        tax_amount: parseFloat(totals.taxAmount),
        delivery_fee: parseFloat(totals.deliveryFee),
        total: parseFloat(totals.total),
        fulfillment_type: customerInfo.fulfillment_type,
        delivery_address: customerInfo.fulfillment_type === 'delivery' ? customerInfo.delivery_address : null,
        special_instructions: customerInfo.special_instructions || null,
        requested_time: customerInfo.requested_time || null,
        status: "pending",
        payment_status: "unpaid",
        payment_method: paymentMethod
      };

      const createdOrder = await base44.entities.OnlineOrder.create(orderData);
      setCurrentOrder(createdOrder);

      if (paymentMethod === 'solana_pay') {
        setShowSolanaPayModal(true);
      } else if (paymentMethod === 'cash') {
        await base44.entities.OnlineOrder.update(createdOrder.id, {
          status: 'confirmed',
          payment_status: 'paid',
          payment_method: 'cash'
        });
        setCheckoutStep('confirmation');
        setTimeout(resetOrderState, 5000);
        if (currentUser) loadUserData(currentUser);
      } else {
        setCheckoutStep('payment');
      }

    } catch (error) {
      console.error('Error initiating order process:', error);
      alert('Failed to initiate order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSolanaPaymentComplete = async (signature) => {
    setLoading(true);
    try {
      if (!currentOrder) {
        alert('Payment confirmed, but no order found to update. Please contact support.');
        setShowSolanaPayModal(false);
        setCheckoutStep('details');
        return;
      }
      
      await base44.entities.OnlineOrder.update(currentOrder.id, {
        status: 'confirmed',
        payment_status: 'paid',
        payment_details: {
          signature: signature,
          confirmed_at: new Date().toISOString()
        }
      });

      setShowSolanaPayModal(false);
      setCheckoutStep('confirmation');
      setTimeout(resetOrderState, 5000);
      if (currentUser) loadUserData(currentUser);

    } catch (error) {
      console.error('Error updating order after Solana payment:', error);
      alert('Solana Payment confirmed, but failed to update order status. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => (products || []).filter(product =>
    selectedCategory === "all" || product.category === selectedCategory
  ), [products, selectedCategory]);

  const categories = useMemo(() => ["all", ...new Set((products || []).map(p => p?.category).filter(Boolean))], [products]);
  const totals = calculateTotals();

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-gray-300">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Ordering</h1>
              <p className="text-gray-500 dark:text-gray-400">Order ahead for pickup or delivery</p>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <Button variant="outline" onClick={() => setShowAccount(true)} className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                  My Account
                </Button>
              )}
              <Button
                onClick={() => setShowCart(true)}
                className="relative"
                disabled={cart.length === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 capitalize ${
                  selectedCategory === category 
                    ? 'dark:bg-blue-600 dark:text-white' 
                    : 'dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white dark:bg-gray-800'
                }`}
              >
                {category === "all" ? "All Items" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <ProductGrid
          products={filteredProducts}
          onAddToCart={(product, modifiersFromGrid) => {
            if (modifiersFromGrid && modifiersFromGrid.length > 0) {
              addToCart(product, modifiersFromGrid);
            } else {
              if (product.modifiers && product.modifiers.length > 0) {
                setSelectedProductForModifiers(product);
              } else {
                addToCart(product);
              }
            }
          }}
          posMode="quick_service"
          isMobile={false}
          showImages={true}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={(productId) => currentUser?.favorite_product_ids?.includes(productId)}
        />
      </div>

      {selectedProductForModifiers && (
        <ModifierDialog
          product={selectedProductForModifiers}
          onAddToCart={addToCart}
          onCancel={() => setSelectedProductForModifiers(null)}
        />
      )}

      {/* Cart Modal */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <ShoppingCart className="w-5 h-5" />
              Your Order ({cart.length} items)
            </DialogTitle>
          </DialogHeader>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)} each</p>
                      
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          + {item.modifiers.map(mod => `${mod.name} ($${mod.price_adjustment.toFixed(2)})`).join(", ")}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCartQuantity(index, item.quantity - 1)}
                        className="h-8 w-8 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateCartQuantity(index, item.quantity + 1)}
                        className="h-8 w-8 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="font-medium dark:text-white">${item.item_total.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4 dark:border-gray-700">
                <div className="space-y-2 text-sm dark:text-gray-200">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${totals.subtotal}</span>
                  </div>
                  {parseFloat(totals.deliveryFee) > 0 && (
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>${totals.deliveryFee}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${totals.taxAmount}</span>
                  </div>
                  <Separator className="dark:bg-gray-600" />
                  <div className="flex justify-between text-lg font-bold dark:text-white">
                    <span>Total:</span>
                    <span>${totals.total}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCart(false)} className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                  Continue Shopping
                </Button>
                <Button onClick={() => {setShowCart(false); setShowCheckout(true);}} className="flex-1">
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              {checkoutStep === 'details' && 'Order Details'}
              {checkoutStep === 'payment' && 'Complete Payment'}
              {checkoutStep === 'confirmation' && 'Order Confirmed!'}
            </DialogTitle>
            {checkoutStep === 'confirmation' && (
              <DialogDescription className="dark:text-gray-400">
                You will be redirected to the menu shortly.
              </DialogDescription>
            )}
          </DialogHeader>

          {checkoutStep === 'details' && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="dark:text-gray-200">Name *</Label>
                      <Input
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label className="dark:text-gray-200">Phone *</Label>
                      <Input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="dark:text-gray-200">Email (optional)</Label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Fulfillment Options */}
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Order Fulfillment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        customerInfo.fulfillment_type === "pickup" 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600" 
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                      }`}
                      onClick={() => setCustomerInfo({...customerInfo, fulfillment_type: "pickup"})}
                    >
                      <Store className="w-8 h-8 mx-auto mb-2 dark:text-white" />
                      <div className="font-medium dark:text-white">Pickup</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Free</div>
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        customerInfo.fulfillment_type === "delivery" 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600" 
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                      }`}
                      onClick={() => setCustomerInfo({...customerInfo, fulfillment_type: "delivery"})}
                    >
                      <Car className="w-8 h-8 mx-auto mb-2 dark:text-white" />
                      <div className="font-medium dark:text-white">Delivery</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">$4.99</div>
                    </button>
                    <button
                      type="button"
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        customerInfo.fulfillment_type === "dine_in" 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-600" 
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                      }`}
                      onClick={() => setCustomerInfo({...customerInfo, fulfillment_type: "dine_in"})}
                    >
                      <UtensilsCrossed className="w-8 h-8 mx-auto mb-2 dark:text-white" />
                      <div className="font-medium dark:text-white">Dine In</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Free</div>
                    </button>
                  </div>

                  {customerInfo.fulfillment_type === "delivery" && (
                    <div>
                      <Label className="dark:text-gray-200">Delivery Address *</Label>
                      <Textarea
                        value={customerInfo.delivery_address}
                        onChange={(e) => setCustomerInfo({...customerInfo, delivery_address: e.target.value})}
                        placeholder="Enter your complete delivery address"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        required
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="dark:text-gray-200">Preferred Time (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={customerInfo.requested_time}
                        onChange={(e) => setCustomerInfo({...customerInfo, requested_time: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-gray-200">Special Instructions (optional)</Label>
                    <Textarea
                      value={customerInfo.special_instructions}
                      onChange={(e) => setCustomerInfo({...customerInfo, special_instructions: e.target.value})}
                      placeholder="Any special requests or dietary restrictions"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Payment Method Selection */}
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="card" className="dark:text-white dark:hover:bg-gray-700">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2" /> Credit/Debit Card
                        </div>
                      </SelectItem>
                      {merchant?.settings?.online_ordering?.allow_cash_payment !== false && (
                        <SelectItem value="cash" className="dark:text-white dark:hover:bg-gray-700">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-2" /> Cash on {customerInfo.fulfillment_type === 'delivery' ? 'Delivery' : 'Pickup'}
                          </div>
                        </SelectItem>
                      )}
                      {merchant?.settings?.solana_pay?.enabled && merchant?.settings?.solana_pay?.display_in_customer_terminal !== false && (
                        <SelectItem value="solana_pay" className="dark:text-white dark:hover:bg-gray-700">
                          <div className="flex items-center">
                            <Bitcoin className="w-4 h-4 mr-2" /> Solana Pay (Crypto)
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="dark:bg-gray-900 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm mb-4 dark:text-gray-200">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${item.item_total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="dark:bg-gray-600" />
                  <div className="space-y-2 text-sm mt-4 dark:text-gray-200">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${totals.subtotal}</span>
                    </div>
                    {parseFloat(totals.deliveryFee) > 0 && (
                      <div className="flex justify-between">
                        <span>Delivery Fee:</span>
                        <span>${totals.deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>${totals.taxAmount}</span>
                    </div>
                    <Separator className="dark:bg-gray-600" />
                    <div className="flex justify-between text-lg font-bold dark:text-white">
                      <span>Total:</span>
                      <span>${totals.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                  Back to Menu
                </Button>
                <Button
                  onClick={initiateOrderProcess}
                  className="flex-1"
                  disabled={
                    !customerInfo.name ||
                    !customerInfo.phone ||
                    (customerInfo.fulfillment_type === "delivery" && !customerInfo.delivery_address) ||
                    loading
                  }
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          )}

          {checkoutStep === 'payment' && (
            <div>
              <Tabs defaultValue="card" className="w-full">
                <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                  <TabsTrigger value="card" className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-300">
                    <CreditCard className="w-4 h-4 mr-2"/>Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" disabled={!merchant?.settings?.blockchain} className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-500">
                    <Bitcoin className="w-4 h-4 mr-2"/>Crypto
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="card" className="pt-4">
                  <Card className="dark:bg-gray-900 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Pay with Credit Card</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="dark:text-gray-200">Card Number</Label>
                        <Input placeholder="•••• •••• •••• ••••" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="dark:text-gray-200">Expiry</Label>
                          <Input placeholder="MM / YY" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                        </div>
                        <div>
                          <Label className="dark:text-gray-200">CVC</Label>
                          <Input placeholder="•••" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => processCardCryptoPayment({ method: 'card' })} disabled={loading}>
                        Pay ${totals.total}
                      </Button>
                      <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">This is a simulated payment form.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="crypto" className="pt-4">
                  <Card className="dark:bg-gray-900 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Pay with Crypto</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Send payment to one of the addresses below.</p>
                      <p className="font-bold text-lg dark:text-white">Total: ${totals.total}</p>
                      {merchant?.settings?.blockchain ? (
                        <div className="space-y-4 mt-4 text-left">
                          {merchant.settings.blockchain.btc_address && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <p className="font-semibold dark:text-white">Bitcoin (BTC)</p>
                              <p className="text-xs break-all text-gray-700 dark:text-gray-300 mt-1">{merchant.settings.blockchain.btc_address}</p>
                            </div>
                          )}
                          {merchant.settings.blockchain.eth_address && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <p className="font-semibold dark:text-white">Ethereum (ETH)</p>
                              <p className="text-xs break-all text-gray-700 dark:text-gray-300 mt-1">{merchant.settings.blockchain.eth_address}</p>
                            </div>
                          )}
                          {merchant.settings.blockchain.sol_address && (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <p className="font-semibold dark:text-white">Solana (SOL)</p>
                              <p className="text-xs break-all text-gray-700 dark:text-gray-300 mt-1">{merchant.settings.blockchain.sol_address}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-red-500 dark:text-red-400 mt-4">Crypto payments not configured.</p>
                      )}
                      <Button className="w-full mt-6" onClick={() => processCardCryptoPayment({ method: 'crypto' })} disabled={loading}>
                        I Have Sent The Payment
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              <Button variant="link" onClick={() => setCheckoutStep('details')} className="w-full mt-4 dark:text-blue-400" disabled={loading}>
                Back to Details
              </Button>
            </div>
          )}

          {checkoutStep === 'confirmation' && (
            <div className="text-center py-10">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h3 className="text-xl font-semibold dark:text-white">Thank you for your order!</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Your order has been placed successfully.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Solana Pay Modal */}
      {showSolanaPayModal && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <SolanaPayScreen
              order={currentOrder}
              settings={merchant?.settings}
              onPaymentComplete={handleSolanaPaymentComplete}
            />
            <Button
              variant="outline"
              className="w-full mt-4 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              onClick={() => {
                setShowSolanaPayModal(false);
                setCurrentOrder(null);
                setCheckoutStep('details');
              }}
            >
              Cancel Payment
            </Button>
          </div>
        </div>
      )}

      {/* User Account Modal */}
      {currentUser && (
        <Dialog open={showAccount} onOpenChange={setShowAccount}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-white">My Account</DialogTitle>
              <DialogDescription className="dark:text-gray-400">
                View your order history, favorites, and profile information.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-4 border-b pb-4 mb-4 dark:border-gray-700">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-2xl font-bold">
                  {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-semibold dark:text-white">{currentUser.full_name}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                </div>
              </div>

              <Tabs defaultValue="history">
                <TabsList className="grid w-full grid-cols-2 dark:bg-gray-700">
                  <TabsTrigger value="history" className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-300">
                    Order History
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:text-white dark:data-[state=inactive]:text-gray-300">
                    My Favorites
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="history" className="mt-4">
                  <div className="space-y-4">
                    {pastOrders.length > 0 ? (
                      pastOrders.map(order => (
                        <Card key={order.id} className="dark:bg-gray-900 dark:border-gray-700">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div>
                              <p className="font-semibold dark:text-white">Order {order.order_number}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.created_date).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold dark:text-white">${order.total.toFixed(2)}</p>
                              <Badge variant="secondary" className="capitalize mt-1 dark:bg-gray-700 dark:text-gray-200">{order.status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">No past orders found.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="favorites" className="mt-4">
                  {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {favoriteProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAddToCart={(p) => {
                            if (p.modifiers && p.modifiers.length > 0) {
                              setSelectedProductForModifiers(p);
                            } else {
                              addToCart(p);
                            }
                          }}
                          onToggleFavorite={handleToggleFavorite}
                          isFavorite={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">You haven't favorited any items yet.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAccount(false)} className="dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}