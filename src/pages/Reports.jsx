
import { useState, useEffect } from "react";
import { Order } from "@/entities/Order";
import { Product } from "@/entities/Product";
import { Customer } from "@/entities/Customer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Download, RefreshCw } from "lucide-react";

import SalesReport from "../components/reports/SalesReport";
import PermissionGate from '../components/PermissionGate';

// Placeholder components for future implementation
const ProductReport = () => <Card><CardContent className="p-6">Product report section coming soon.</CardContent></Card>;
const CustomerReport = () => <Card><CardContent className="p-6">Customer report section coming soon.</CardContent></Card>;

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderList, productList, customerList] = await Promise.all([
        Order.list("-created_date"),
        Product.list(),
        Customer.list()
      ]);
      setOrders(orderList);
      setProducts(productList);
      setCustomers(customerList);
    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_date);
    // Ensure dateRange.to includes the entire day by setting time to end of day
    const endDate = new Date(dateRange.to);
    endDate.setHours(23, 59, 59, 999);

    return orderDate >= dateRange.from && orderDate <= endDate;
  });
  
  const exportToCSV = () => {
    const headers = ["Order #", "Date", "Customer", "Total", "Status", "Payment Method"];
    const rows = filteredOrders.map(order => [
      order.order_number,
      new Date(order.created_date).toLocaleString(),
      order.customer_name,
      order.total.toFixed(2),
      order.status,
      order.payment_method
    ].join(","));
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <PermissionGate permission="view_reports">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2"><BarChart3 className="w-8 h-8 text-red-500" /> Reports & Analytics</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Analyze your sales, products, and customer data</p>
            </div>
            <div className="flex gap-3">
              <DateRangePicker range={dateRange} onRangeChange={setDateRange} />
              <Button variant="outline" onClick={exportToCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
              <Button onClick={loadData}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
            </div>
          </div>

          <Tabs defaultValue="sales">
            <TabsList className="mb-6">
              <TabsTrigger value="sales">Sales Overview</TabsTrigger>
              <TabsTrigger value="products">Product Performance</TabsTrigger>
              <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sales">
              <SalesReport orders={filteredOrders} dateRange={dateRange} loading={loading} />
            </TabsContent>
            <TabsContent value="products">
              <ProductReport products={products} orders={filteredOrders} loading={loading} />
            </TabsContent>
            <TabsContent value="customers">
              <CustomerReport customers={customers} orders={filteredOrders} loading={loading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PermissionGate>
  );
}
