import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  FileText
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
          content: '1. Complete merchant onboarding\n2. Set up your business profile in Settings\n3. Add products to your catalog\n4. Configure payment methods\n5. Create employee accounts\n6. Test a transaction',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
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
          title: 'Processing Orders',
          content: 'STEP 1: Access the POS\n• From System Menu, click the "POS" tile\n• The POS interface will load with departments on the left\n\nSTEP 2: Select Products\n• Click a department to filter products (e.g., "Food", "Drinks")\n• Click product cards to add them to the cart\n• Or use the barcode scanner to scan items\n\nSTEP 3: Adjust Order\n• In the cart on the right, adjust quantities with +/- buttons\n• Remove items by clicking the trash icon\n• Add modifiers by clicking "Add Modifier" on items\n\nSTEP 4: Apply Discounts (Optional)\n• Click "Apply Discount" button\n• Enter percentage or dollar amount\n• Discount applies to subtotal\n\nSTEP 5: Select Customer (Optional)\n• Click "Select Customer" button\n• Search by name, phone, or email\n• Select customer to apply loyalty points\n\nSTEP 6: Proceed to Payment\n• Review total amount (note dual pricing if enabled)\n• Click "Pay" button to open payment modal\n• Choose payment method and complete transaction',
          image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'
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
          title: 'Adding Products',
          content: 'STEP 1: Open Products Page\n• From System Menu, click "Products"\n• You\'ll see your existing product catalog\n\nSTEP 2: Create New Product\n• Click the "+ Add Product" button in the top right\n• A product form will appear\n\nSTEP 3: Fill Basic Information\n• Enter Product Name (required)\n• Enter SKU (optional but recommended)\n• Enter Price (required - base price before tax)\n• Select Department from dropdown\n• Add Description (optional - shows on online menu)\n\nSTEP 4: Upload Product Image\n• Click "Upload Image" button\n• Select image file from your computer\n• Recommended size: 800x800px\n• Supported formats: JPG, PNG\n\nSTEP 5: Configure Options\n• Toggle "EBT Eligible" if item qualifies for food assistance\n• Toggle "Age Restricted" for alcohol/tobacco items\n• Set minimum age if age restricted\n• Toggle "Tippable" if tips should be allowed\n\nSTEP 6: Set Inventory (Optional)\n• Enter current stock quantity\n• Set low stock alert threshold\n• System will alert you when stock is low\n\nSTEP 7: Add Modifiers (Optional)\n• Click "Add Modifier Group"\n• Create options like sizes, toppings, extras\n• Set price adjustments for each modifier\n\nSTEP 8: Save Product\n• Click "Save Product" button\n• Product is now available on POS',
          image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&q=80'
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
          title: 'Payment Gateway Setup',
          content: 'STEP 1: Access Settings\n• Click Settings from System Menu\n• Navigate to "Payment Gateways" tab\n\nSTEP 2: Choose Your Gateway\n• Stripe: Best for most businesses, easy setup\n• Square: All-in-one with hardware\n• PayPal: Good for online payments\n• Authorize.net: Enterprise-level processing\n\nSTEP 3: Get API Credentials\n• Sign up for an account with your chosen gateway\n• Navigate to their API/Developer section\n• Copy your API keys (usually publishable key and secret key)\n\nSTEP 4: Configure in ChainLINK\n• Paste API keys into the corresponding fields\n• Select "Live Mode" or "Test Mode"\n• For Stripe: Enter Publishable Key and Secret Key\n• For Square: Enter Access Token and Location ID\n• For PayPal: Enter Client ID and Client Secret\n\nSTEP 5: Test Connection\n• Click "Test Connection" button\n• System will verify your credentials\n• Green checkmark = successful connection\n• Red X = check your keys and try again\n\nSTEP 6: Enable Gateway\n• Toggle the "Enabled" switch to ON\n• Click "Save Settings" at the bottom\n• Gateway is now active for processing payments\n\nIMPORTANT: Always test with a small transaction before going live!',
          image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80'
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
          title: 'Online Menu Setup',
          content: 'STEP 1: Enable Online Ordering\n• Go to Settings → Online Ordering tab\n• Toggle "Enable Online Ordering" to ON\n\nSTEP 2: Configure Fulfillment Options\n• Enable "Pickup" if you want customers to pick up orders\n• Enable "Delivery" if you offer delivery service\n• Set delivery radius in miles\n• Set delivery fee amount\n\nSTEP 3: Set Operating Hours\n• Enter your business hours for each day\n• Set special holiday hours if needed\n• Orders only accepted during these times\n\nSTEP 4: Configure Order Settings\n• Set minimum order amount (e.g., $10 minimum)\n• Set estimated prep time (e.g., 20-30 minutes)\n• Enable/disable cash payments on pickup\n\nSTEP 5: Customize Appearance\n• Upload your logo\n• Set brand colors\n• Add welcome message\n• Add special instructions text\n\nSTEP 6: Get Your Menu URL\n• Copy your unique online menu URL\n• Format: yourbusiness.chainlinkpos.com/menu\n• Or use custom domain (see Custom Domain section)\n\nSTEP 7: Share Your Menu\n• Add link to your website\n• Share on social media\n• Print QR code on menus/receipts\n• Add to Google My Business\n\nSTEP 8: Test It Out\n• Open your menu URL in a browser\n• Place a test order\n• Verify it appears in Online Orders section\n• Make adjustments as needed',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80'
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
                          <div className="space-y-4">
                            {item.image && (
                              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  className="w-full h-auto"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <div className="text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">
                              {item.content}
                            </div>
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