
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // New import for Button component













// Removed all lucide-react icons as they are not used in the new metrics section
// import { TrendingUp, DollarSign, ShoppingCart, Users } from "lucide-react"; 

export default function SalesReport({ merchantId, dateRange }) {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    orderCount: 0,
    averageOrder: 0,
    totalSurcharges: 0,
    totalTips: 0,
    paymentMethods: {},
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);

  // Mock function to simulate fetching sales data
  const loadSalesData = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock data based on merchantId and dateRange
    const mockSales = (Math.random() * 5000 + 1000); // 1000-6000
    const mockOrders = Math.floor(Math.random() * 100 + 20); // 20-120
    const mockSurcharges = Math.random() * 50 + 10; // 10-60
    const mockTips = Math.random() * 100 + 20; // 20-120

    const newSalesData = {
      totalSales: mockSales,
      orderCount: mockOrders,
      averageOrder: mockSales / mockOrders,
      totalSurcharges: mockSurcharges,
      totalTips: mockTips,
      paymentMethods: {
        credit_card: { count: Math.floor(mockOrders * 0.7), total: mockSales * 0.8 },
        cash: { count: Math.floor(mockOrders * 0.2), total: mockSales * 0.15 },
        mobile_pay: { count: Math.floor(mockOrders * 0.1), total: mockSales * 0.05 },
      },
      topProducts: [
        { name: "Product A", quantity: Math.floor(mockOrders * 1.5), revenue: mockSales * 0.35 },
        { name: "Product B", quantity: Math.floor(mockOrders * 1.2), revenue: mockSales * 0.25 },
        { name: "Product C", quantity: Math.floor(mockOrders * 0.8), revenue: mockSales * 0.15 },
        { name: "Product D", quantity: Math.floor(mockOrders * 0.5), revenue: mockSales * 0.10 },
      ],
    };

    setSalesData(newSalesData);
    setLoading(false);
  };

  useEffect(() => {
    if (merchantId && dateRange) {
      loadSalesData();
    }
  }, [merchantId, dateRange]); // Re-fetch when merchantId or dateRange changes

  const exportReport = (format) => {
    // In a real application, this would trigger an API call to generate and download the report
    console.log(`Exporting sales report for merchant ${merchantId} from ${dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'start'} to ${dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'end'} in ${format} format.`);
    alert(`Exporting ${format} report... (Check console for details)`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-lg text-gray-600">Loading sales data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.totalSales.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {salesData.orderCount} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesData.averageOrder.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Card Surcharges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${salesData.totalSurcharges.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ChainLINK Dual Pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tips Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${salesData.totalTips.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(salesData.paymentMethods).length > 0 ? (
              Object.entries(salesData.paymentMethods).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Placeholder for a dynamic color dot */}
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> 
                    <span className="font-medium capitalize">{method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{data.count} orders</span>
                    <span className="font-bold">${data.total.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No payment method data available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {salesData.topProducts.length > 0 ? (
              salesData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">{product.quantity} sold</span>
                    <span className="font-bold">${product.revenue.toFixed(2)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No top selling products data available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => exportReport('pdf')}
        >
          Export PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => exportReport('csv')}
        >
          Export CSV
        </Button>
      </div>
    </div>
  );
}
