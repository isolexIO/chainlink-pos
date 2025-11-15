
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; // Import Button component
import {
  BookOpen,
  Store,
  Package,
  HelpCircle,
  Wifi,
  ShoppingCart,
  Bitcoin
} from 'lucide-react';

export default function UserGuide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">ChainLINK POS User Guide</h2>
          <p className="text-gray-500">Everything you need to know about using ChainLINK POS</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start Guide</CardTitle>
          <CardDescription>
            Need immediate help? <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() => window.open('https://tawk.to/chat/66c9efd2ea492f34bc09af03/1i62d1jbm', '_blank')}
            >
              Chat with support
            </Button>
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="getting-started" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="pos">POS System</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Getting Started */}
        <TabsContent value="getting-started">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-600" />
                Getting Started with ChainLINK POS
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Welcome to ChainLINK POS</h3>
              <p>
                ChainLINK POS is a modern, blockchain-enabled point of sale system designed for restaurants, retail stores, and service businesses.
                <br /><br />
                Key Features:
                <br />• Traditional payment methods (Cash, Card, EBT)
                <br />• Cryptocurrency payments via Solana Pay
                <br />• Age verification for restricted products
                <br />• Kitchen display system
                <br />• Customer-facing display
                <br />• Inventory management
                <br />• Real-time reporting
              </p>

              <h3>First Time Setup</h3>
              <ol>
                <li>Complete merchant onboarding</li>
                <li>Configure your payment methods in <strong>Settings → Payment Gateways</strong></li>
                <li>Add your products via <strong>Products → Add Product</strong></li>
                <li>Set up departments for organization</li>
                <li>Create user accounts for your staff</li>
                <li>Configure your POS station settings</li>
              </ol>
              <p>Your POS is now ready to process transactions!</p>

              <h3>2. Adding Team Members</h3>
              <p>To add employees to your system:</p>
              <ul>
                <li>Go to <strong>System Menu → Users & Roles</strong></li>
                <li>Click <strong>Add User</strong></li>
                <li>Enter their name, email, and assign a 4-digit PIN</li>
                <li>Select their role (Cashier, Manager, Kitchen, etc.)</li>
                <li>Choose which permissions they should have</li>
              </ul>
              <p className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>💡 Tip:</strong> Each employee will use their PIN to clock in and access the POS system. They won't need to remember passwords!
              </p>

              <h3>3. Understanding User Roles</h3>
              <ul>
                <li><strong>Super Admin:</strong> Isolex team members with full platform access (you won't see this role unless you work for ChainLINK POS)</li>
                <li><strong>Merchant Admin:</strong> Business owners with full control over their merchant account</li>
                <li><strong>Manager:</strong> Can process orders, manage inventory, view reports, and manage employees</li>
                <li><strong>Cashier:</strong> Can process orders and accept payments</li>
                <li><strong>Kitchen:</strong> Can view orders sent to the kitchen display</li>
                <li><strong>Viewer:</strong> Read-only access to reports and data</li>
              </ul>

              <h3>4. Configuring Your POS Mode</h3>
              <p>ChainLINK POS supports different business types:</p>
              <ul>
                <li><strong>Restaurant:</strong> Table numbers, dine-in service, kitchen orders</li>
                <li><strong>Retail:</strong> Product scanning, inventory tracking</li>
                <li><strong>Quick Service:</strong> Fast checkout, order numbers</li>
                <li><strong>Food Truck:</strong> Mobile location tracking, simplified menu</li>
              </ul>
              <p>You can switch between modes in <strong>System Menu → Settings → Business</strong></p>

              <h3>5. Next Steps</h3>
              <ul>
                <li>Connect your payment devices (card readers, printers)</li>
                <li>Set up your product catalog</li>
                <li>Test a few orders to get familiar with the system</li>
                <li>Enable online ordering if you want customers to order from your website</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* POS System */}
        <TabsContent value="pos">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                Using the POS System
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Processing an Order</h3>
              <ol>
                <li><strong>Clock In:</strong> Enter your 4-digit PIN on the login screen</li>
                <li><strong>Add Items:</strong> Click products to add them to the cart, or scan barcodes if you have a scanner</li>
                <li><strong>Add Modifiers:</strong> Click the item in the cart to add customizations (extra cheese, no onions, etc.)</li>
                <li><strong>Apply Discounts:</strong> Enter a discount percentage if needed</li>
                <li><strong>Link Customer:</strong> Click the customer icon to link a loyalty customer (optional)</li>
                <li><strong>Checkout:</strong> Click <strong>Checkout</strong> to proceed to payment</li>
              </ol>

              <h3>Payment Methods</h3>
              <p>ChainLINK POS supports multiple payment options:</p>
              <ul>
                <li>
                  <strong>Cash:</strong> Select "Cash" and enter the amount tendered. The system will calculate change.
                </li>
                <li>
                  <strong>Credit/Debit Card:</strong> If you have a connected card reader, select "Card" and follow the prompts on the device.
                </li>
                <li>
                  <strong>Solana Pay:</strong> Select "Crypto" to generate a QR code for cryptocurrency payment using Solana blockchain.
                </li>
                <li>
                  <strong>Split Payment:</strong> Charge part of the order to one method and the rest to another.
                </li>
              </ul>

              <h3>Tipping</h3>
              <p>
                If tipping is enabled in your settings, customers can add a tip before completing payment.
                You can set suggested tip percentages (15%, 18%, 20%) or let them enter a custom amount.
              </p>

              <h3>Table Management (Restaurant Mode)</h3>
              <p>When in Restaurant mode:</p>
              <ul>
                <li>Enter a table number before taking orders</li>
                <li>Orders can be sent directly to the kitchen display or kitchen printer</li>
                <li>You can hold orders and come back to them later</li>
                <li>Split checks by item or evenly between guests</li>
              </ul>

              <h3>Barcode Scanning</h3>
              <p>If you have a barcode scanner configured:</p>
              <ul>
                <li><strong>Keyboard Scanner:</strong> Just scan any barcode, the item will be added automatically</li>
                <li><strong>Camera Scanner:</strong> Click the camera icon in the search bar and point at the barcode</li>
                <li>If a product doesn't exist, you'll be prompted to create it on the spot</li>
              </ul>

              <p className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <strong>⚠️ Important:</strong> Always verify the order total with the customer before completing payment!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-cyan-600" />
                Connecting Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Supported Devices</h3>
              <p>ChainLINK POS works with a wide range of hardware:</p>

              <h4>Card Readers</h4>
              <ul>
                <li><strong>Verifone:</strong> VX520, VX680, VX820</li>
                <li><strong>Clover:</strong> Clover Flex, Clover Mini, Clover Station</li>
                <li><strong>PAX:</strong> A920, S300, D210</li>
                <li><strong>Square:</strong> Square Terminal, Square Reader</li>
                <li><strong>ELLIPAL:</strong> Crypto payment terminals</li>
              </ul>

              <h4>Printers</h4>
              <ul>
                <li><strong>Receipt Printers:</strong> Epson TM-T88, Star TSP143, Bixolon SRP-350</li>
                <li><strong>Kitchen Printers:</strong> Epson TM-U220, Star SP700</li>
                <li><strong>Bar Printers:</strong> Any thermal printer compatible with ESC/POS</li>
              </ul>

              <h4>Barcode Scanners</h4>
              <ul>
                <li><strong>USB Scanners:</strong> Plug-and-play, works immediately</li>
                <li><strong>Bluetooth Scanners:</strong> Pair via Bluetooth settings</li>
                <li><strong>Camera Scanners:</strong> Use your device's camera (built-in)</li>
              </ul>

              <h4>Customer Displays</h4>
              <ul>
                <li><strong>Wired Displays:</strong> Connect via USB or serial port</li>
                <li><strong>Wireless Displays:</strong> Connect via WiFi or Bluetooth</li>
              </ul>

              <h3>How to Connect a Device</h3>
              <ol>
                <li>Go to <strong>System Menu → Devices</strong></li>
                <li>Select the device type (Card Reader, Printer, etc.)</li>
                <li>Click <strong>Add Device</strong></li>
                <li>Enter device details:
                  <ul>
                    <li><strong>Name:</strong> A friendly name (e.g., "Front Counter Card Reader")</li>
                    <li><strong>Type:</strong> Device model/brand</li>
                    <li><strong>Connection:</strong> USB, Bluetooth, Ethernet, or WiFi</li>
                    <li><strong>IP Address & Port:</strong> For network devices</li>
                  </ul>
                </li>
                <li>Click <strong>Test Connection</strong> to verify it works</li>
                <li>Save the device</li>
              </ol>

              <h3>Troubleshooting</h3>
              <p><strong>Card Reader Not Responding:</strong></p>
              <ul>
                <li>Check that the device is powered on</li>
                <li>Verify cables are securely connected</li>
                <li>For network devices, ping the IP address to confirm connectivity</li>
                <li>Restart the device and try testing again</li>
              </ul>

              <p><strong>Printer Not Printing:</strong></p>
              <ul>
                <li>Check paper is loaded correctly</li>
                <li>Verify the printer is online (not in sleep mode)</li>
                <li>For network printers, confirm the IP address is correct</li>
                <li>Try printing a test receipt from the printer's hardware button</li>
              </ul>

              <p><strong>Barcode Scanner Not Working:</strong></p>
              <ul>
                <li>USB scanners should work instantly – try a different USB port</li>
                <li>Camera scanners need browser permission – allow camera access when prompted</li>
                <li>Check that the scanner is not in sleep mode</li>
              </ul>

              <p className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>💡 Tip:</strong> If you're having trouble, create a support ticket at <strong>System Menu → Support</strong> and our team will help you!
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="w-5 h-5 text-purple-600" />
                Payment Methods & Solana Pay
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Setting Up Payment Gateways</h3>
              <p>Go to <strong>System Menu → Settings → Payments</strong> to configure:</p>

              <h4>Stripe</h4>
              <ul>
                <li>Sign up at <a href="https://stripe.com" target="_blank" rel="noopener">stripe.com</a></li>
                <li>Get your API keys from the Stripe dashboard</li>
                <li>Enter your keys in ChainLINK POS settings</li>
                <li>Use Test Mode for testing, Live Mode for real transactions</li>
              </ul>

              <h4>Square</h4>
              <ul>
                <li>Create a Square account at <a href="https://squareup.com" target="_blank" rel="noopener">squareup.com</a></li>
                <li>Generate an access token from the Square Developer Portal</li>
                <li>Enter your Location ID and Access Token in ChainLINK POS</li>
              </ul>

              <h4>PayPal</h4>
              <ul>
                <li>Get your Client ID and Secret from PayPal Developer</li>
                <li>Enter them in the ChainLINK POS PayPal settings</li>
                <li>Choose Sandbox for testing, Live for production</li>
              </ul>

              <h3>Solana Pay (Cryptocurrency)</h3>
              <p>Solana Pay lets you accept cryptocurrency payments instantly with near-zero fees.</p>

              <h4>Setup</h4>
              <ol>
                <li>Go to <strong>System Menu → Settings → Payments</strong></li>
                <li>Find the <strong>Crypto</strong> section</li>
                <li>Enter your Solana wallet address (get one from Phantom, Solflare, or another wallet)</li>
                <li>Choose network:
                  <ul>
                    <li><strong>Devnet:</strong> For testing with fake cryptocurrency</li>
                    <li><strong>Mainnet:</strong> For real transactions</li>
                  </ul>
                </li>
                <li>Enable Solana Pay and save</li>
              </ol>

              <h4>How Customers Pay with Solana</h4>
              <ol>
                <li>At checkout, select <strong>Crypto/Solana Pay</strong></li>
                <li>A QR code will appear on screen</li>
                <li>Customer opens their Solana wallet (Phantom, Solflare, etc.)</li>
                <li>Customer scans the QR code</li>
                <li>Customer approves the transaction in their wallet</li>
                <li>ChainLINK POS automatically verifies the payment</li>
                <li>Order is completed!</li>
              </ol>

              <p className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <strong>🚀 Why Solana?</strong> Solana transactions settle in 1-2 seconds with fees under $0.01, making it perfect for retail and food service.
              </p>

              <h3>Refunds</h3>
              <p>To process a refund:</p>
              <ol>
                <li>Go to <strong>System Menu → Orders</strong></li>
                <li>Find the order to refund</li>
                <li>Click <strong>View Details</strong></li>
                <li>Click <strong>Process Refund</strong></li>
                <li>Enter refund amount (partial or full)</li>
                <li>Enter refund reason</li>
                <li>Confirm refund</li>
              </ol>

              <p className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <strong>⚠️ Note:</strong> Depending on your settings, refunds may require manager approval or PIN verification.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-600" />
                Managing Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Adding Products</h3>
              <ol>
                <li>Go to <strong>System Menu → Products</strong></li>
                <li>Click <strong>Add Product</strong></li>
                <li>Fill in product details:
                  <ul>
                    <li><strong>Name:</strong> Product name</li>
                    <li><strong>Price:</strong> Base selling price</li>
                    <li><strong>Category:</strong> Food, Beverage, Retail, etc.</li>
                    <li><strong>SKU:</strong> Stock keeping unit (optional but recommended)</li>
                    <li><strong>Barcode:</strong> For scanning at POS</li>
                    <li><strong>Stock Quantity:</strong> Current inventory level</li>
                    <li><strong>Low Stock Alert:</strong> When to notify you (e.g., 10 units)</li>
                  </ul>
                </li>
                <li>Add modifiers if needed (extra toppings, sizes, etc.)</li>
                <li>Upload a product image</li>
                <li>Choose which POS modes this product appears in</li>
                <li>Click <strong>Save</strong></li>
              </ol>

              <h3>Product Modifiers</h3>
              <p>Modifiers let customers customize their orders:</p>
              <ul>
                <li><strong>Add:</strong> Extra cheese, bacon, etc. (increases price)</li>
                <li><strong>Remove:</strong> No onions, hold the mayo (no price change)</li>
                <li><strong>Substitute:</strong> Swap ingredients (might adjust price)</li>
              </ul>
              <p>Example: A burger might have modifiers like:</p>
              <ul>
                <li>Extra cheese (+$1.50)</li>
                <li>Add bacon (+$2.00)</li>
                <li>No pickles ($0.00)</li>
                <li>Gluten-free bun (+$1.00)</li>
              </ul>

              <h3>Stock Management</h3>
              <p>Track your inventory in real-time:</p>
              <ul>
                <li>Go to <strong>System Menu → Inventory</strong></li>
                <li>See current stock levels for all products</li>
                <li>Products turn red when below low stock threshold</li>
                <li>Click <strong>Restock</strong> to add inventory</li>
                <li>View stock history and usage reports</li>
              </ul>

              <h3>Low Stock Alerts</h3>
              <p>When a product runs low:</p>
              <ul>
                <li>You'll see a notification in the system</li>
                <li>The product appears in the Low Stock list</li>
                <li>Optionally, receive email alerts</li>
                <li>You can set the product to auto-hide from POS when out of stock</li>
              </ul>

              <h3>Bulk Import</h3>
              <p>To add many products at once:</p>
              <ol>
                <li>Download the CSV template from the Products page</li>
                <li>Fill in your products in Excel or Google Sheets</li>
                <li>Save as CSV</li>
                <li>Click <strong>Import Products</strong> and upload the file</li>
                <li>Review the preview and click <strong>Confirm Import</strong></li>
              </ol>

              <h3>Supplier Management</h3>
              <p>In <strong>System Menu → Inventory</strong>, you can:</p>
              <ul>
                <li>Track which suppliers provide each item</li>
                <li>Store supplier contact info and reorder links</li>
                <li>See last restock dates and quantities</li>
                <li>Generate reorder reports based on sales velocity</li>
              </ul>

              <p className="bg-green-50 p-3 rounded-lg border border-green-200">
                <strong>💡 Best Practice:</strong> Set low stock alerts to 1-2 weeks of expected sales so you never run out during busy periods.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-yellow-600" />
                Getting Help
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <h3>Support Tickets</h3>
              <p>If you need help, create a support ticket:</p>
              <ol>
                <li>Go to <strong>System Menu → Support</strong></li>
                <li>Click <strong>New Ticket</strong></li>
                <li>Choose a category:
                  <ul>
                    <li><strong>Billing & Subscriptions:</strong> Questions about your plan or payments</li>
                    <li><strong>Device Issues:</strong> Card readers, printers, scanners not working</li>
                    <li><strong>Technical Support:</strong> Software bugs or errors</li>
                    <li><strong>Account Management:</strong> User access, permissions, settings</li>
                    <li><strong>Marketplace Integration:</strong> DoorDash, Grubhub, Uber Eats setup</li>
                    <li><strong>Feature Request:</strong> Suggest new features</li>
                    <li><strong>Bug Report:</strong> Report something broken</li>
                  </ul>
                </li>
                <li>Set priority (Low, Medium, High, Urgent)</li>
                <li>Enter a subject and detailed description</li>
                <li>Attach screenshots if helpful</li>
                <li>Click <strong>Submit Ticket</strong></li>
              </ol>

              <h3>Response Times</h3>
              <ul>
                <li><strong>Urgent:</strong> 1-2 hours</li>
                <li><strong>High:</strong> 4-8 hours</li>
                <li><strong>Medium:</strong> 24 hours</li>
                <li><strong>Low:</strong> 2-3 business days</li>
              </ul>

              <h3>Viewing Your Tickets</h3>
              <ul>
                <li>All your tickets are listed in <strong>System Menu → Support → My Tickets</strong></li>
                <li>Click <strong>View</strong> to see the full conversation</li>
                <li>You can reply to add more information</li>
                <li>Super Admin support team will respond in the thread</li>
                <li>You'll get notified when there's a new response</li>
              </ul>

              <h3>FAQ</h3>

              <h4>How do I reset an employee's PIN?</h4>
              <p>Go to <strong>Users & Roles</strong>, click the employee, enter a new PIN, and save.</p>

              <h4>Can I accept both card and crypto payments?</h4>
              <p>Yes! Enable both in <strong>Settings → Payments</strong>. Customers choose at checkout.</p>

              <h4>What if my card reader stops working?</h4>
              <p>
                Check power and cables first. Test the connection in <strong>Devices</strong>.
                If still broken, create a support ticket.
              </p>

              <h4>How do I purchase hardware?</h4>
              <p>
                Go to <strong>System Menu → Device Shop</strong> to browse card readers, printers,
                and other equipment. Add to cart and checkout.
              </p>

              <h4>What's the difference between Merchant Admin and Super Admin?</h4>
              <ul>
                <li><strong>Merchant Admin:</strong> Full control over your business (you!)</li>
                <li><strong>Super Admin:</strong> ChainLINK POS/Isolex team members who support all merchants</li>
              </ul>

              <h3>Contact Information</h3>
              <ul>
                <li><strong>Email:</strong> support@chainlinkpos.com</li>
                <li><strong>Phone:</strong> 1-800-CHAINLINK</li>
                <li><strong>Live Chat:</strong> <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() => window.open('https://tawk.to/chat/66c9efd2ea492f34bc09af03/1i62d1jbm', '_blank')}
            >
              Available in the Support page during business hours
            </Button></li>
              </ul>

              <p className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <strong>💡 Tip:</strong> Before submitting a ticket, check this user guide and the FAQ section – your answer might already be here!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
