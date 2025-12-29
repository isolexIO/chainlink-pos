import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Search,
  CreditCard,
  Package,
  Users,
  Settings,
  BarChart3,
  Globe,
  Smartphone,
  HelpCircle,
  ShoppingBag,
  Shield,
  Zap,
  Monitor,
  TrendingUp,
  FileText,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createPageUrl } from '@/utils';

export default function UserManual() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      icon: Zap,
      title: 'Getting Started',
      color: 'text-blue-600',
      content: [
        {
          title: 'Welcome to ChainLINK POS',
          content: 'ChainLINK POS is a blockchain-powered point of sale system designed for modern businesses. This guide will help you get started and master all features.'
        },
        {
          title: 'First Time Setup',
          content: 'Follow these steps to get your POS system up and running:\n\n[SCREENSHOT: System Menu showing all main navigation options]\n\nStep 1: Complete Merchant Onboarding\n• Click "Get Started" on the home page\n• Fill in your business information (name, address, tax ID)\n• Accept terms of service\n• Verify your email address\n\n[SCREENSHOT: Merchant onboarding form with business details]\n\nStep 2: Configure Business Settings\n• Navigate to Settings from the System Menu\n• Go to General tab\n• Set your business name, timezone, and currency\n• Configure tax rates for your location\n• Upload your business logo (optional)\n\n[SCREENSHOT: Settings page General tab with business configuration]\n\nStep 3: Add Your First Products\n• Click "Products" from System Menu\n• Click "Add Product" button\n• Enter product details:\n  - Name: Required\n  - Price: Required\n  - SKU: For inventory tracking\n  - Department: Organize your catalog\n  - Image: Optional but recommended\n• Save your product\n• Repeat for all products you sell\n\n[SCREENSHOT: Product creation form with all fields]\n\nStep 4: Set Up Payment Methods\n• Go to Settings → Payment Gateways\n• Choose your payment processor (Stripe, Square, etc.)\n• Enter your API credentials\n• Click "Test Connection"\n• Enable the gateway once verified\n\n[SCREENSHOT: Payment Gateways configuration showing Stripe setup]\n\nStep 5: Create Employee Accounts\n• Navigate to Employees from System Menu\n• Click "Add Employee"\n• Enter employee details and assign a 4-digit PIN\n• Set role and permissions\n• Employee can now log in with their PIN\n\n[SCREENSHOT: Employee creation form with PIN and role assignment]\n\nStep 6: Process Your First Test Transaction\n• Go to POS from System Menu\n• Add a product to cart\n• Click "Pay"\n• Select payment method\n• Complete the transaction\n• Verify receipt prints correctly\n\n[SCREENSHOT: POS screen with product in cart and Pay button]'
        },
        {
          title: 'Logging In',
          content: 'Employees can log in using:\n• PIN Login - Quick 4-digit PIN access\n• Email Login - Full merchant account access\n• Wallet Login - Blockchain wallet authentication'
        },
        {
          title: 'System Menu Navigation',
          content: 'Access all features from the System Menu. Key sections include:\n• POS - Process orders\n• Products - Manage inventory\n• Customers - Customer database\n• Orders - Order history\n• Reports - Analytics dashboard\n• Settings - System configuration'
        }
      ]
    },
    {
      id: 'pos-operations',
      icon: CreditCard,
      title: 'POS Operations',
      color: 'text-green-600',
      content: [
        {
          title: 'Processing Orders - Complete Walkthrough',
          content: 'Step-by-Step Guide to Processing an Order:\n\nStep 1: Access the POS\n• From System Menu, click "Point of Sale"\n• You\'ll see departments on the left, products in the center, and cart on the right\n\nStep 2: Select Products\nOption A - Browse by Department:\n  • Click on a department (e.g., "Food", "Drinks")\n  • Products in that category will display\n  • Click on a product to add it to cart\n\nOption B - Use Search:\n  • Type product name in search bar at top\n  • Click on product from results\n\nOption C - Scan Barcode:\n  • Click barcode icon or press scanner button\n  • Scan product barcode\n  • Product automatically adds to cart\n\n[SCREENSHOT: POS with products displayed and cart with items]\n\nStep 3: Modify Cart Items\n• Click "+" or "-" to adjust quantity\n• Click "X" to remove an item\n• Click on item to add modifiers (toppings, size, etc.)\n\nStep 4: Apply Discounts (Optional)\n• Click "Discount" button in cart\n• Enter discount amount or percentage\n• Discount applies to entire order\n\nStep 5: Select Customer (Optional)\n• Click "Select Customer" button\n• Search by name, phone, or email\n• Customer info displays at top of cart\n• Loyalty points automatically calculated\n\nStep 6: Review Totals\n• Check subtotal, tax, and total\n• Verify all items are correct\n• Note if dual pricing is enabled (cash vs card price)\n\nStep 7: Proceed to Payment\n• Click "Pay" button (bottom right)\n• Payment method screen appears\n• Select payment type (Cash, Card, EBT, Crypto)\n\n[SCREENSHOT: Payment method selection modal]\n\nStep 8: Complete Payment\nFor Cash:\n  • Enter amount received\n  • Change due displays automatically\n  • Click "Complete Payment"\n  • Give customer their change\n\nFor Card:\n  • Customer inserts/taps card on terminal\n  • Wait for approval\n  • Click "Confirm" when successful\n\nFor EBT:\n  • System calculates EBT-eligible items\n  • Customer swipes EBT card\n  • Enter approval code\n  • Complete any remaining balance with other payment\n\nStep 9: Print Receipt\n• Receipt prints automatically\n• Email option available if customer email on file\n• Order appears in Order History\n\nStep 10: Start Next Order\n• Cart clears automatically\n• Ready for next customer'
        },
        {
          title: 'Payment Methods',
          content: 'ChainLINK supports multiple payment types:\n• Cash - Manual cash transactions\n• Card - Credit/Debit via payment gateway\n• EBT/SNAP - For eligible food items\n• Solana Pay - Cryptocurrency payments\n• Split Payment - Combine multiple methods'
        },
        {
          title: 'Dual Pricing',
          content: 'When enabled, display both cash and non-cash prices:\n• Cash Price - Lower price for cash/EBT payments\n• Non-Cash Price - Includes surcharge for card payments\nConfigure in Settings → Pricing & Surcharge'
        },
        {
          title: 'Age Verification',
          content: 'For age-restricted items (alcohol, tobacco):\n1. System prompts for verification when item added\n2. Scan ID or manually verify age\n3. Record verification in order history\n4. Cannot proceed without verification'
        },
        {
          title: 'Open Items',
          content: 'Create custom items on-the-fly:\n1. Click "Open Item" button\n2. Enter item name and price\n3. Select if EBT eligible or age restricted\n4. Add to cart'
        },
        {
          title: 'Modifiers',
          content: 'Add modifiers to products:\n• Toppings, sizes, options\n• Price adjustments (add/remove)\n• Configure in product settings'
        },
        {
          title: 'Kitchen Display Integration',
          content: 'Send orders to kitchen:\n• Click "Send to Kitchen"\n• Order appears on Kitchen Display\n• Kitchen staff can mark items as prepared\n• Real-time order status updates'
        }
      ]
    },
    {
      id: 'products-inventory',
      icon: Package,
      title: 'Products & Inventory',
      color: 'text-purple-600',
      content: [
        {
          title: 'Adding Products - Detailed Guide',
          content: 'Complete Product Setup Instructions:\n\nStep 1: Navigate to Products\n• Click "Products" from System Menu\n• You\'ll see your product catalog\n• Click "Add Product" button (top right)\n\nStep 2: Basic Information\n• Product Name: Enter clear, descriptive name\n  Example: "Cheeseburger" or "Large Pepperoni Pizza"\n• SKU (Stock Keeping Unit): Optional identifier\n  Example: "BURGER-001" or "PIZZA-LG-PEP"\n• Price: Enter base price in dollars\n  Example: 12.99\n\nStep 3: Select Department\n• Click Department dropdown\n• Choose appropriate category\n• If department doesn\'t exist, create one first in Departments page\n• This helps organize your menu\n\nStep 4: Add Description (Optional but Recommended)\n• Write customer-facing description\n• Include key features or ingredients\n  Example: "Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce"\n• Appears on online menu and customer display\n\nStep 5: Upload Product Image (Highly Recommended)\n• Click "Upload Image" button\n• Select image file (JPG or PNG)\n• Recommended size: 800x800 pixels\n• Square images work best\n• Image displays on POS and online menu\n\n[SCREENSHOT: Product form with image upload area]\n\nStep 6: Configure Inventory (Optional)\n• Enable "Track Inventory" toggle\n• Set Current Stock Quantity\n  Example: 50 units\n• Set Low Stock Alert threshold\n  Example: 10 units\n• System will alert you when stock is low\n\nStep 7: Set Product Attributes\n• Department: Already selected in Step 3\n• Tax Rate: Uses default or custom rate\n• Is Active: Toggle to show/hide on POS\n\nStep 8: Configure Special Settings\nEBT Eligible:\n  • Toggle ON if item can be purchased with food stamps\n  • Only applies to eligible food items\n  • Check SNAP guidelines for your state\n\nAge Restricted:\n  • Toggle ON for alcohol, tobacco, vape products\n  • Set minimum age (18, 19, or 21)\n  • Select restriction type\n  • System will require ID verification\n\nTippable:\n  • Toggle ON to allow tips for this item\n  • Usually ON for food/service items\n  • Toggle OFF for retail products\n\nStep 9: Add Modifiers (Optional)\n• Click "Add Modifier Group"\n• Create groups like "Toppings", "Size", "Extras"\n• For each modifier:\n  - Name: "Extra Cheese", "Large", etc.\n  - Price Adjustment: +2.00, +0.00, etc.\n  - Type: Add, Remove, or Substitute\n• Save modifier group\n\nStep 10: Set POS Modes (Optional)\n• Select which POS modes show this product:\n  - Restaurant\n  - Retail\n  - Quick Service\n  - Food Truck\n• Leave all checked to show everywhere\n\nStep 11: Review and Save\n• Double-check all information\n• Click "Save Product" button\n• Product now appears in catalog\n• Immediately available on POS\n\nStep 12: Verify Product\n• Go to POS screen\n• Navigate to product\'s department\n• Verify product appears correctly\n• Test adding to cart\n• Verify price and modifiers work\n\nQuick Tips:\n✓ Use clear, customer-friendly names\n✓ Always add images for better UX\n✓ Group similar items in departments\n✓ Use consistent SKU format\n✓ Test each product after creating'
        },
        {
          title: 'Product Lookup (Barcode Scanner)',
          content: 'Scan product barcodes to:\n• Find existing products\n• Automatically retrieve product info from databases\n• Create new products with pre-filled data\nSupports UPC, EAN, and other standard formats'
        },
        {
          title: 'Departments',
          content: 'Organize products by department:\n• Create custom departments\n• Assign colors and icons\n• Set display order\n• Filter products by department on POS\nManage in Departments page or Settings → Departments'
        },
        {
          title: 'Inventory Management',
          content: 'Track stock levels:\n• Set current quantity and reorder threshold\n• Receive low stock alerts\n• Manual restock entries\n• View inventory history\n• Export inventory reports'
        },
        {
          title: 'Bulk Actions',
          content: 'Manage multiple products:\n• Bulk assign to departments\n• Bulk price updates\n• Mass enable/disable\n• CSV import/export'
        },
        {
          title: 'Product Images',
          content: 'Add visual appeal:\n• Upload product photos\n• Images display on POS and online menu\n• Supports JPG, PNG formats\n• Recommended size: 800x800px'
        }
      ]
    },
    {
      id: 'customers',
      icon: Users,
      title: 'Customer Management',
      color: 'text-pink-600',
      content: [
        {
          title: 'Customer Database',
          content: 'Store customer information:\n• Name, email, phone\n• Purchase history\n• Loyalty points\n• Preferred payment method\n• Custom notes'
        },
        {
          title: 'Loyalty Program',
          content: 'Reward repeat customers:\n• Earn points per dollar spent\n• Redeem points for discounts\n• Configure point values\n• Track redemption history\n• Automatic point calculation'
        },
        {
          title: 'Customer Lookup',
          content: 'Find customers quickly:\n• Search by name, email, or phone\n• View customer profile\n• See purchase history\n• Apply loyalty discounts'
        },
        {
          title: 'Customer Display',
          content: 'Show order details to customers:\n• Real-time cart updates\n• Pricing and totals\n• Payment method selection\n• Tip screen (if enabled)\n• Accessible via dedicated display URL'
        }
      ]
    },
    {
      id: 'payments',
      icon: CreditCard,
      title: 'Payment Processing',
      color: 'text-indigo-600',
      content: [
        {
          title: 'Payment Gateway Setup - Complete Guide',
          content: 'Detailed Instructions for Each Payment Gateway:\n\n━━━ STRIPE SETUP ━━━\n\nStep 1: Create Stripe Account\n• Go to stripe.com\n• Click "Sign Up"\n• Complete business verification\n• Provide bank account for payouts\n\nStep 2: Get API Keys\n• Log into Stripe Dashboard\n• Click "Developers" in left menu\n• Click "API Keys"\n• Copy "Secret key" (starts with sk_live_ or sk_test_)\n• Keep this secure - never share publicly\n\nStep 3: Configure in ChainLINK\n• Go to Settings → Payment Gateways\n• Find "Stripe" section\n• Toggle "Enable Stripe" to ON\n• Paste your Secret Key in "API Key" field\n• Select "Test Mode" if using test keys\n• Click "Test Connection"\n• Wait for "Connection Successful" message\n• Click "Save Settings"\n\n[SCREENSHOT: Stripe configuration in Payment Gateways with API key field]\n\nStep 4: Verify Stripe Integration\n• Go to POS\n• Add a product to cart\n• Click Pay → Card\n• Use Stripe test card: 4242 4242 4242 4242\n• Verify payment processes successfully\n• Check Stripe Dashboard for transaction\n\n━━━ SQUARE SETUP ━━━\n\nStep 1: Create Square Account\n• Go to squareup.com\n• Sign up for account\n• Complete business profile\n• Connect bank account\n\nStep 2: Generate Access Token\n• Log into Square Dashboard\n• Go to "Apps" → "Manage Apps"\n• Click "Create an Application"\n• Note your Application ID\n• Generate Access Token\n• Copy Personal Access Token\n\nStep 3: Get Location ID\n• In Square Dashboard\n• Go to "Locations"\n• Note your Location ID\n• You\'ll need this for ChainLINK\n\nStep 4: Configure in ChainLINK\n• Settings → Payment Gateways\n• Find "Square" section\n• Enable Square toggle\n• Enter Access Token\n• Enter Location ID\n• Select Test/Live mode\n• Test Connection\n• Save Settings\n\n━━━ PAYPAL SETUP ━━━\n\nStep 1: Create PayPal Business Account\n• Go to paypal.com/business\n• Sign up for Business Account\n• Complete verification\n• Link bank account\n\nStep 2: Create API App\n• Log into PayPal Developer Portal\n• Go to developer.paypal.com\n• Click "My Apps & Credentials"\n• Create new app\n• Copy Client ID and Secret\n\nStep 3: Configure in ChainLINK\n• Settings → Payment Gateways\n• Enable PayPal\n• Enter Client ID\n• Enter Client Secret\n• Select Sandbox/Live\n• Test Connection\n• Save\n\n━━━ TROUBLESHOOTING ━━━\n\nConnection Failed:\n✓ Verify API keys are correct\n✓ Check for extra spaces\n✓ Ensure using correct mode (test vs live)\n✓ Verify account is in good standing\n✓ Check internet connection\n\nPayments Declining:\n✓ Verify sufficient funds in test account\n✓ Check if cards are enabled in gateway\n✓ Review gateway dashboard for issues\n✓ Contact gateway support if persistent\n\nPayout Issues:\n✓ Verify bank account connected\n✓ Complete identity verification\n✓ Wait for initial payout delay (7-14 days)\n✓ Check payout schedule settings'
        },
        {
          title: 'Card Payments',
          content: 'Process card transactions:\n1. Select "Card" payment method\n2. Customer inserts/taps card on terminal\n3. System processes payment\n4. Receipt printed/emailed\n5. Transaction recorded in order history'
        },
        {
          title: 'EBT/SNAP Payments',
          content: 'Accept food assistance:\n• Only EBT-eligible items included\n• Separate transaction for non-eligible items\n• Record EBT approval codes\n• Compliance with SNAP regulations\nMark products as EBT eligible in product settings'
        },
        {
          title: 'Cryptocurrency Payments',
          content: 'Accept crypto via Solana Pay:\n• Enable in Settings → Solana Pay\n• Set wallet address\n• Choose accepted tokens (USDC, custom)\n• QR code generation\n• Automatic conversion from USD\n• Transaction verification on blockchain'
        },
        {
          title: 'Split Payments',
          content: 'Accept multiple payment methods:\n• Combine cash + card\n• EBT + card for non-eligible items\n• Automatic amount splitting\n• Record all payment details'
        },
        {
          title: 'Tips',
          content: 'Enable tipping:\n• Configure in Settings → General\n• Set default tip percentages\n• Customer selects tip amount\n• Tips recorded separately\n• Tip reports available'
        },
        {
          title: 'Refunds',
          content: 'Process refunds:\n1. Find order in Order History\n2. Click "Refund"\n3. Select full or partial\n4. Enter reason (optional)\n5. Process refund through gateway\n6. Customer receives confirmation'
        }
      ]
    },
    {
      id: 'reports',
      icon: BarChart3,
      title: 'Reports & Analytics',
      color: 'text-orange-600',
      content: [
        {
          title: 'Sales Reports',
          content: 'Track revenue:\n• Daily, weekly, monthly summaries\n• Sales by product\n• Sales by category\n• Sales by payment method\n• Comparison charts\n• Export to CSV/PDF'
        },
        {
          title: 'Employee Performance',
          content: 'Monitor staff metrics:\n• Orders processed per employee\n• Revenue generated\n• Average transaction value\n• Time tracking\n• Performance rankings'
        },
        {
          title: 'Inventory Reports',
          content: 'Track stock:\n• Current inventory levels\n• Low stock alerts\n• Inventory movement\n• Reorder suggestions\n• Waste tracking'
        },
        {
          title: 'Custom Reports',
          content: 'Build custom reports:\n• Select date ranges\n• Filter by criteria\n• Choose metrics\n• Schedule automated reports\n• Email delivery'
        },
        {
          title: 'Tax Reports',
          content: 'Tax compliance:\n• Sales tax collected\n• Tax by jurisdiction\n• Tax-exempt transactions\n• Export for accountant'
        }
      ]
    },
    {
      id: 'online-ordering',
      icon: Globe,
      title: 'Online Ordering',
      color: 'text-teal-600',
      content: [
        {
          title: 'Online Menu Setup - Complete Walkthrough',
          content: 'Set Up Your Online Ordering Website:\n\nPART 1: ENABLE ONLINE ORDERING\n\nStep 1: Access Settings\n• Click Settings from System Menu\n• Navigate to "Online Ordering" tab\n• You\'ll see online ordering configuration\n\nStep 2: Enable Online Ordering\n• Toggle "Enable Online Ordering" to ON\n• System automatically creates your online menu\n• Products sync immediately\n\nStep 3: Configure Basic Settings\n• Business Name: Displays on online menu\n• Welcome Message: Greeting for customers\n  Example: "Welcome to Joe\'s Pizza! Order online for pickup or delivery"\n• Minimum Order Amount: Optional, set minimum $ required\n  Example: $15.00\n\nPART 2: PICKUP CONFIGURATION\n\nStep 4: Enable Pickup\n• Toggle "Allow Pickup" to ON\n• Set Preparation Time: How long orders take\n  Example: 20 minutes\n• Configure Pickup Instructions:\n  "Enter through front door and ask for your name"\n\nStep 5: Set Operating Hours\n• Click "Set Pickup Hours"\n• For each day of week:\n  - Toggle day ON/OFF\n  - Set opening time (e.g., 11:00 AM)\n  - Set closing time (e.g., 9:00 PM)\n  - Add break times if needed\n• Save hours\n\nPART 3: DELIVERY CONFIGURATION\n\nStep 6: Enable Delivery (Optional)\n• Toggle "Allow Delivery" to ON\n• Set Delivery Fee: Flat fee per order\n  Example: $3.99\n• Set Delivery Radius: Miles from your location\n  Example: 10 miles\n• Minimum Delivery Order: Optional\n  Example: $25.00\n\nStep 7: Delivery Time Settings\n• Estimated Delivery Time: Minutes for delivery\n  Example: 45 minutes\n• Set Delivery Hours (same as pickup)\n• Configure delivery zones if needed\n\nPART 4: PAYMENT OPTIONS\n\nStep 8: Online Payment Configuration\n• Enable Credit Card Payments:\n  - Requires payment gateway setup\n  - Cards processed before order submitted\n  - Most secure option\n\nStep 9: Cash on Pickup/Delivery\n• Toggle "Allow Cash Payment" to ON\n• Customer pays when they receive order\n• Good for customers without cards\n• Set "Require Phone Verification" if desired\n\nPART 5: MENU CUSTOMIZATION\n\nStep 10: Review Product Sync\n• All active products automatically appear\n• Products show in their departments\n• Prices display correctly\n• Images appear if uploaded\n\nStep 11: Customize Product Display\n• Go to Products page\n• Products with images look better online\n• Add descriptions for online customers\n• Set products inactive to hide from online menu\n\nStep 12: Add Special Instructions Field\n• Toggle "Allow Special Instructions"\n• Customers can add notes to orders\n  Example: "No onions please"\n• These display in order details\n\nPART 6: BRANDING\n\nStep 13: Upload Logo\n• Settings → General → Upload Logo\n• Logo appears on online menu\n• Recommended: 400x400px PNG\n\nStep 14: Choose Colors (Optional)\n• Primary Color: Main brand color\n• Secondary Color: Accent color\n• Menu automatically uses your colors\n\nPART 7: GO LIVE\n\nStep 15: Get Your Menu URL\n• Settings → Online Ordering\n• Your menu URL displays at top\n  Example: https://chainlinkpos.com/menu/your-business-name\n• Click "Copy URL" button\n\n[SCREENSHOT: Online Ordering settings with menu URL displayed]\n\nStep 16: Test Your Online Menu\n• Open your menu URL in new tab\n• Browse products\n• Add items to cart\n• Place a test order\n• Verify order appears in "Online Orders"\n\nStep 17: Share Your Menu\n• Add link to your website\n• Share on social media\n• Print QR code for in-store\n• Include in email signatures\n• Add to Google Business Profile\n\nPART 8: MANAGING ORDERS\n\nStep 18: Monitor Incoming Orders\n• Go to "Online Orders" from System Menu\n• New orders appear in real-time\n• Notification sound plays (if enabled)\n• Email notification sent to you\n\nStep 19: Accept/Reject Orders\n• Click on new order\n• Review order details\n• Click "Accept" if you can fulfill\n• Or "Reject" with reason\n• Customer notified immediately\n\nStep 20: Update Order Status\n• Mark orders as:\n  - Received (auto)\n  - Accepted\n  - Preparing\n  - Ready for Pickup\n  - Out for Delivery\n  - Completed\n• Customer sees status updates\n\nPRO TIPS:\n✓ Upload quality product images\n✓ Write appetizing descriptions\n✓ Set realistic prep times\n✓ Test ordering weekly\n✓ Monitor customer feedback\n✓ Update hours for holidays\n✓ Promote your online menu\n✓ Consider delivery partnerships'
        },
        {
          title: 'Managing Online Orders',
          content: 'Process web orders:\n• Receive notifications\n• Review order details\n• Accept or reject orders\n• Set estimated ready time\n• Mark as completed\n• Customer receives updates'
        },
        {
          title: 'Delivery & Pickup',
          content: 'Configure fulfillment:\n• Enable pickup, delivery, or both\n• Set delivery radius and fees\n• Minimum order amounts\n• Estimated prep times\n• Integration with delivery services'
        },
        {
          title: 'Marketplace Integrations',
          content: 'Connect to delivery platforms:\n• DoorDash\n• Grubhub\n• Uber Eats\n• Takeout7\nOrders sync automatically to POS'
        }
      ]
    },
    {
      id: 'employees',
      icon: Users,
      title: 'Employee Management',
      color: 'text-red-600',
      content: [
        {
          title: 'Adding Employees',
          content: '1. Go to Employees from System Menu\n2. Click "Add Employee"\n3. Enter details:\n   • Full name, email\n   • 4-digit PIN for quick login\n   • Role and permissions\n4. Save employee\n5. Employee can now log in'
        },
        {
          title: 'Roles & Permissions',
          content: 'Available roles:\n• Merchant Admin - Full access\n• Manager - Most features\n• Cashier - POS and basic features\n• Custom - Granular permissions\n\nPermissions include:\n• Process orders\n• Manage inventory\n• View reports\n• Manage customers\n• Admin settings'
        },
        {
          title: 'Time Tracking',
          content: 'Track employee hours:\n• Clock in/out with PIN\n• View time entries\n• Edit hours (admin only)\n• Export timesheet reports\n• Integration with payroll'
        },
        {
          title: 'Performance Tracking',
          content: 'Monitor employee metrics:\n• Orders processed\n• Revenue generated\n• Average ticket size\n• Customer ratings\n• Performance reviews'
        }
      ]
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Settings & Configuration',
      color: 'text-gray-600',
      content: [
        {
          title: 'General Settings',
          content: 'Basic configuration:\n• Business name and info\n• Tax rates\n• Receipt settings\n• Timezone and currency\n• Operating hours'
        },
        {
          title: 'Payment Gateways',
          content: 'Configure payment processors:\n• Add API credentials\n• Test connections\n• Set default gateway\n• Enable/disable methods\n• Configure surcharges'
        },
        {
          title: 'Pricing & Surcharge',
          content: 'Dual pricing configuration:\n• Enable dual pricing\n• Set surcharge percentage\n• Choose region (US/CA/Other)\n• Pricing mode (surcharge/cash discount)\n• Flat fee options'
        },
        {
          title: 'Customer Display',
          content: 'Configure customer-facing display:\n• Enable/disable\n• Branding options\n• Show pricing\n• Payment instructions\n• Get display URL'
        },
        {
          title: 'Kitchen Display',
          content: 'Configure kitchen screen:\n• Enable auto-print\n• Group by station\n• Order notifications\n• Display settings'
        },
        {
          title: 'Security',
          content: 'Secure your system:\n• Password policies\n• Two-factor authentication\n• Session timeouts\n• Audit logs\n• IP restrictions'
        },
        {
          title: 'Custom Domains',
          content: 'Use your own domain:\n• Add custom domain\n• Verify ownership\n• SSL certificate setup\n• DNS configuration\n• Apply to POS or online menu'
        }
      ]
    },
    {
      id: 'hardware',
      icon: Monitor,
      title: 'Hardware Setup',
      color: 'text-cyan-600',
      content: [
        {
          title: 'Card Readers',
          content: 'Connect payment terminals:\n• Supported: Verifone, Clover, PAX, Square\n• Connection types: USB, Ethernet, WiFi\n• Configure in Settings → Devices\n• Enter IP address/port\n• Test connection\n• Process test transaction'
        },
        {
          title: 'Receipt Printers',
          content: 'Set up receipt printing:\n• Thermal printers recommended\n• USB or network connection\n• Configure paper size\n• Set print settings\n• Auto-print options\n• Kitchen printer for orders'
        },
        {
          title: 'Barcode Scanners',
          content: 'Connect barcode scanners:\n• USB scanners (plug & play)\n• Bluetooth scanners\n• Camera-based scanning\n• Configure scan settings\n• Test scanning'
        },
        {
          title: 'Cash Drawers',
          content: 'Setup cash management:\n• Connect to receipt printer\n• Manual or auto-open\n• Cash tracking\n• Opening/closing counts\n• Variance reports'
        },
        {
          title: 'Customer Display',
          content: 'Setup secondary display:\n• Use tablet or monitor\n• Open customer display URL\n• Full-screen mode\n• Auto-refresh enabled\n• Branded experience'
        },
        {
          title: 'Kitchen Display',
          content: 'Setup kitchen screen:\n• Use tablet or monitor\n• Open kitchen display URL\n• Large, readable orders\n• Mark items complete\n• Audio notifications'
        }
      ]
    },
    {
      id: 'integrations',
      icon: Zap,
      title: 'Integrations',
      color: 'text-yellow-600',
      content: [
        {
          title: 'Marketplace Overview',
          content: 'Access integrations:\n1. Go to Marketplace from System Menu\n2. Browse available integrations\n3. Click "Connect" on desired app\n4. Enter API credentials\n5. Configure settings\n6. Test connection'
        },
        {
          title: 'Payment Gateways',
          content: 'Available gateways:\n• Stripe - Most popular, easy setup\n• Square - All-in-one solution\n• PayPal - Online payments\n• Authorize.net - Enterprise\n• Shift4 - EMV compliance'
        },
        {
          title: 'Delivery Services',
          content: 'Integrate delivery platforms:\n• DoorDash - Wide coverage\n• Grubhub - Restaurant focused\n• Uber Eats - Fast delivery\n• Takeout7 - Regional service\nAuto-sync menu and orders'
        },
        {
          title: 'Accounting Software',
          content: 'Sync financial data:\n• QuickBooks integration\n• Xero accounting\n• Automatic transaction export\n• Invoice syncing\n• Tax reporting'
        },
        {
          title: 'Email Marketing',
          content: 'Customer communication:\n• Mailchimp integration\n• Customer list sync\n• Automated campaigns\n• Receipt emails\n• Promotional emails'
        }
      ]
    },
    {
      id: 'ai-tools',
      icon: Zap,
      title: 'AI Tools',
      color: 'text-violet-600',
      content: [
        {
          title: 'AI Website Generator',
          content: 'Create a professional website:\n1. Access from System Menu\n2. Enter business information:\n   • Business name and industry\n   • Description and features\n   • Color preferences\n   • Target audience\n3. Click "Generate Website"\n4. Preview generated site\n5. Download HTML file\n6. Upload to your hosting'
        },
        {
          title: 'Smart Product Lookup',
          content: 'Automatic product info:\n• Scan barcode\n• System searches product databases\n• Retrieves name, description, images\n• Pre-fills product form\n• Manual adjustments available\n• Save to catalog'
        }
      ]
    },
    {
      id: 'troubleshooting',
      icon: HelpCircle,
      title: 'Troubleshooting',
      color: 'text-rose-600',
      content: [
        {
          title: 'Common Issues',
          content: 'Quick fixes:\n\nCannot log in:\n• Check PIN is correct (4 digits)\n• Clear browser cache\n• Contact admin to reset PIN\n\nCard reader not working:\n• Check power and connections\n• Verify IP address in settings\n• Test connection\n• Reboot reader\n\nProducts not showing:\n• Verify product is active\n• Check department filter\n• Refresh page\n• Clear cache\n\nPayment declined:\n• Check card details\n• Verify internet connection\n• Check gateway status\n• Try different card'
        },
        {
          title: 'Performance Issues',
          content: 'System running slow:\n• Close unused browser tabs\n• Clear browser cache\n• Check internet speed\n• Restart device\n• Contact support if persistent'
        },
        {
          title: 'Printing Issues',
          content: 'Receipt not printing:\n• Check printer power\n• Verify paper loaded\n• Check USB/network connection\n• Test print from settings\n• Replace paper roll\n• Restart printer'
        },
        {
          title: 'Sync Issues',
          content: 'Data not syncing:\n• Check internet connection\n• Verify account status\n• Force refresh\n• Log out and back in\n• Contact support'
        },
        {
          title: 'Getting Help',
          content: 'Support channels:\n• Live Chat - Instant help\n• Support Tickets - Track issues\n• Phone: 419-729-3889 (Call/Text)\n• Email: support@isolex.io\n• User manual (this guide)\n• Video tutorials (coming soon)'
        }
      ]
    },
    {
      id: 'faq',
      icon: HelpCircle,
      title: 'FAQ',
      color: 'text-blue-500',
      content: [
        {
          title: 'How do I reset an employee PIN?',
          content: 'Go to Employees → Select employee → Edit → Enter new 4-digit PIN → Save'
        },
        {
          title: 'Can I accept both card and crypto payments?',
          content: 'Yes! Enable multiple payment methods in Settings → Payment Gateways and Settings → Solana Pay. Customers choose their preferred method at checkout.'
        },
        {
          title: 'How do refunds work?',
          content: 'Go to Orders → Find transaction → Click "Refund" → Select full or partial → Process refund. The refund is processed through your payment gateway.'
        },
        {
          title: 'What if my card reader isn\'t connecting?',
          content: 'Check: 1) Device is powered on, 2) Cables are secure, 3) IP address is correct in Settings → Devices. Test connection. If issues persist, create a support ticket.'
        },
        {
          title: 'How do I add a custom domain?',
          content: 'Settings → Custom Domains → Add Domain → Follow DNS setup instructions → Verify domain → SSL certificate auto-provisioned'
        },
        {
          title: 'Can I track employee hours?',
          content: 'Yes! Employees clock in/out with PIN. View time entries in Employees → Time Tracking. Export timesheet reports for payroll.'
        },
        {
          title: 'How do I set up online ordering?',
          content: 'Settings → Online Ordering → Enable → Configure delivery/pickup options → Share menu URL. Orders appear in Online Orders.'
        },
        {
          title: 'What\'s the difference between Super Admin and Merchant Admin?',
          content: 'Super Admin: Platform team members with access to all merchants.\nMerchant Admin: Your business owner/manager with full access to your merchant account only.'
        },
        {
          title: 'How do I export sales data?',
          content: 'Reports → Sales Reports → Select date range → Click "Export" → Choose format (CSV/PDF) → Download'
        },
        {
          title: 'Can I use multiple locations?',
          content: 'Yes! Each location can have its own products, inventory, and settings. Contact support to set up multi-location.'
        },
        {
          title: 'How secure is ChainLINK POS?',
          content: 'ChainLINK uses bank-level encryption, PCI-DSS compliant payment processing, secure blockchain transactions, and regular security audits.'
        },
        {
          title: 'What devices are compatible?',
          content: 'ChainLINK works on:\n• Desktop computers (Windows, Mac, Linux)\n• Tablets (iPad, Android)\n• Smartphones\n• Any device with a modern web browser'
        }
      ]
    }
  ];

  const filteredSections = sections.map(section => ({
    ...section,
    content: section.content.filter(item =>
      searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.content.length > 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search user manual..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-6 text-lg"
        />
      </div>

      {/* Manual Content */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="flex flex-col md:flex-row gap-6">
        {/* Vertical Tab List */}
        <div className="md:w-64 flex-shrink-0">
          <ScrollArea className="h-auto md:h-[calc(100vh-300px)]">
            <TabsList className="flex flex-col h-auto space-y-1 bg-transparent">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="w-full justify-start gap-3 px-4 py-3 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/20"
                  >
                    <Icon className={`w-5 h-5 ${section.color}`} />
                    <span className="text-left">{section.title}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </ScrollArea>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">

          {filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <TabsContent key={section.id} value={section.id} className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${section.color.replace('text-', '')}-400 to-${section.color.replace('text-', '')}-600 flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {section.content.length === 0 && searchTerm !== '' ? (
                      <p className="text-gray-500 text-center py-8">
                        No results found for "{searchTerm}"
                      </p>
                    ) : (
                      section.content.map((item, index) => (
                        <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            {item.title}
                          </h3>
                          <div className="text-gray-600 dark:text-gray-400 space-y-4">
                            {item.content.split('\n\n').map((paragraph, pIndex) => {
                              // Check if paragraph contains a page reference
                              if (paragraph.includes('→')) {
                                const parts = paragraph.split('→');
                                return (
                                  <div key={pIndex} className="whitespace-pre-line leading-relaxed">
                                    {parts.map((part, partIndex) => {
                                      if (partIndex === parts.length - 1) return <span key={partIndex}>{part}</span>;

                                      // Extract page name from format like "Settings → Payment Gateways"
                                      const pageName = part.trim().split(' ').pop();
                                      const pageUrls = {
                                        'Settings': 'Settings',
                                        'Products': 'Products',
                                        'Employees': 'Users',
                                        'POS': 'POS',
                                        'Customers': 'Customers',
                                        'Orders': 'Orders',
                                        'Reports': 'Reports',
                                        'Departments': 'Departments',
                                        'Inventory': 'Inventory',
                                        'Marketplace': 'Marketplace'
                                      };

                                      return (
                                        <span key={partIndex}>
                                          {part.substring(0, part.lastIndexOf(' '))}
                                          {' '}
                                          <a
                                            href={createPageUrl(pageUrls[pageName] || 'SystemMenu')}
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-flex items-center gap-1"
                                            target="_blank"
                                          >
                                            {pageName}
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                          {' →'}
                                        </span>
                                      );
                                    })}
                                  </div>
                                );
                              }

                              // Check if this is a screenshot placeholder
                              if (paragraph.includes('[SCREENSHOT:')) {
                                const screenshotMatch = paragraph.match(/\[SCREENSHOT: (.*?)\]/);
                                if (screenshotMatch) {
                                  return (
                                    <div key={pIndex} className="my-4 p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/10">
                                      <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                                        <ImageIcon className="w-5 h-5" />
                                        <div>
                                          <p className="font-medium">Screenshot: {screenshotMatch[1]}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Visual guide showing {screenshotMatch[1]}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              }

                              return (
                                <p key={pIndex} className="whitespace-pre-line leading-relaxed">
                                  {paragraph}
                                </p>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>

      {/* Help Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Still need help?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Our support team is available 24/7 to assist you.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-600 text-white">Live Chat Available</Badge>
                <Badge variant="outline">419-729-3889</Badge>
                <Badge variant="outline">support@isolex.io</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}