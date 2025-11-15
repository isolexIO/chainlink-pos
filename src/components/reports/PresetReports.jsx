import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, TrendingUp, Users, Package, DollarSign, Clock, ShoppingCart } from 'lucide-react';
import jsPDF from 'jspdf';

const PRESET_REPORTS = [
  {
    id: 'daily_sales',
    name: 'Daily Sales Summary',
    icon: TrendingUp,
    description: 'Complete overview of daily sales performance',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'hourly_sales',
    name: 'Hourly Sales Report',
    icon: Clock,
    description: 'Sales breakdown by hour of day',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'top_sellers',
    name: 'Top Selling Items',
    icon: Package,
    description: 'Best performing products by revenue',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'employee_summary',
    name: 'Employee Sales Summary',
    icon: Users,
    description: 'Sales performance by employee',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'payment_methods',
    name: 'Payment Method Analysis',
    icon: DollarSign,
    description: 'Revenue breakdown by payment type',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'customer_insights',
    name: 'Customer Insights',
    icon: Users,
    description: 'Customer behavior and trends',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'inventory_movement',
    name: 'Inventory Movement',
    icon: Package,
    description: 'Stock changes and trends',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'refunds_voids',
    name: 'Refunds & Voids',
    icon: ShoppingCart,
    description: 'Cancelled and refunded orders',
    color: 'from-red-500 to-red-600'
  }
];

export default function PresetReports({ orders, products, customers, employees, timeEntries, departments, dateRange }) {
  const [generating, setGenerating] = useState(null);

  const generateDailySales = () => {
    const salesByDay = {};
    orders.forEach(order => {
      const date = new Date(order.created_date).toLocaleDateString();
      if (!salesByDay[date]) {
        salesByDay[date] = { date, revenue: 0, orders: 0, items: 0 };
      }
      salesByDay[date].revenue += order.total || 0;
      salesByDay[date].orders += 1;
      salesByDay[date].items += order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Daily Sales Summary', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    const data = Object.values(salesByDay).sort((a, b) => new Date(a.date) - new Date(b.date));
    let y = 45;
    doc.setFontSize(10);
    data.forEach(day => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${day.date}: ${day.orders} orders, ${day.items} items, $${day.revenue.toFixed(2)}`, 14, y);
      y += 7;
    });

    doc.save(`daily_sales_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateHourlySales = () => {
    const salesByHour = {};
    for (let i = 0; i < 24; i++) {
      salesByHour[i] = { hour: i, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const hour = new Date(order.created_date).getHours();
      salesByHour[hour].revenue += order.total || 0;
      salesByHour[hour].orders += 1;
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Hourly Sales Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    doc.setFontSize(10);
    Object.values(salesByHour).forEach(hour => {
      doc.text(`${hour.hour}:00: ${hour.orders} orders, $${hour.revenue.toFixed(2)}`, 14, y);
      y += 7;
    });

    doc.save(`hourly_sales_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateTopSellers = () => {
    const productSales = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity || 0;
        productSales[item.product_id].revenue += item.item_total || 0;
      });
    });

    const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Top Selling Items', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    doc.setFontSize(10);
    sorted.slice(0, 30).forEach((product, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${index + 1}. ${product.name}: ${product.quantity} units, $${product.revenue.toFixed(2)}`, 14, y);
      y += 7;
    });

    doc.save(`top_sellers_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateEmployeeSummary = () => {
    const employeeSales = {};
    orders.forEach(order => {
      const emp = order.created_by || 'Unknown';
      if (!employeeSales[emp]) {
        employeeSales[emp] = { email: emp, orders: 0, revenue: 0 };
      }
      employeeSales[emp].orders += 1;
      employeeSales[emp].revenue += order.total || 0;
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Employee Sales Summary', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    doc.setFontSize(10);
    Object.values(employeeSales).sort((a, b) => b.revenue - a.revenue).forEach(emp => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const empName = employees.find(e => e.email === emp.email)?.full_name || emp.email;
      doc.text(`${empName}: ${emp.orders} orders, $${emp.revenue.toFixed(2)}`, 14, y);
      y += 7;
    });

    doc.save(`employee_summary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generatePaymentMethods = () => {
    const paymentBreakdown = {};
    orders.forEach(order => {
      const method = order.payment_method || 'unknown';
      if (!paymentBreakdown[method]) {
        paymentBreakdown[method] = { method, orders: 0, revenue: 0 };
      }
      paymentBreakdown[method].orders += 1;
      paymentBreakdown[method].revenue += order.total || 0;
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Payment Method Analysis', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    const total = Object.values(paymentBreakdown).reduce((sum, p) => sum + p.revenue, 0);
    
    let y = 45;
    doc.setFontSize(10);
    Object.values(paymentBreakdown).sort((a, b) => b.revenue - a.revenue).forEach(pm => {
      doc.text(`${pm.method}: ${pm.orders} orders, $${pm.revenue.toFixed(2)} (${((pm.revenue / total) * 100).toFixed(1)}%)`, 14, y);
      y += 7;
    });

    doc.save(`payment_methods_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateCustomerInsights = () => {
    const customerData = {};
    orders.forEach(order => {
      const custId = order.customer_id || 'guest';
      if (!customerData[custId]) {
        customerData[custId] = {
          name: order.customer_name || 'Guest',
          orders: 0,
          revenue: 0
        };
      }
      customerData[custId].orders += 1;
      customerData[custId].revenue += order.total || 0;
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Customer Insights', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    const sorted = Object.values(customerData).sort((a, b) => b.revenue - a.revenue).slice(0, 30);
    
    let y = 45;
    doc.setFontSize(10);
    sorted.forEach(cust => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${cust.name}: ${cust.orders} orders, $${cust.revenue.toFixed(2)}`, 14, y);
      y += 7;
    });

    doc.save(`customer_insights_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateInventoryMovement = () => {
    const inventory = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!inventory[item.product_id]) {
          inventory[item.product_id] = {
            name: item.product_name,
            sold: 0
          };
        }
        inventory[item.product_id].sold += item.quantity || 0;
      });
    });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Inventory Movement Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    doc.setFontSize(10);
    Object.values(inventory).sort((a, b) => b.sold - a.sold).forEach(item => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${item.name}: ${item.sold} units`, 14, y);
      y += 7;
    });

    doc.save(`inventory_movement_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateRefundsVoids = () => {
    const refunded = orders.filter(o => o.status === 'refunded' || o.status === 'cancelled');

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Refunds & Voids Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    let y = 45;
    doc.setFontSize(10);
    refunded.forEach(order => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${order.order_number}: ${order.customer_name || 'Guest'}, $${(order.total || 0).toFixed(2)}`, 14, y);
      y += 7;
    });

    const total = refunded.reduce((sum, o) => sum + (o.total || 0), 0);
    doc.text(`Total: $${total.toFixed(2)} (${refunded.length} orders)`, 14, y + 10);

    doc.save(`refunds_voids_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleGenerateReport = async (reportId) => {
    setGenerating(reportId);
    try {
      switch (reportId) {
        case 'daily_sales':
          generateDailySales();
          break;
        case 'hourly_sales':
          generateHourlySales();
          break;
        case 'top_sellers':
          generateTopSellers();
          break;
        case 'employee_summary':
          generateEmployeeSummary();
          break;
        case 'payment_methods':
          generatePaymentMethods();
          break;
        case 'customer_insights':
          generateCustomerInsights();
          break;
        case 'inventory_movement':
          generateInventoryMovement();
          break;
        case 'refunds_voids':
          generateRefundsVoids();
          break;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Common POS Reports</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pre-configured reports for quick insights into your business
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESET_REPORTS.map(report => {
          const Icon = report.icon;
          return (
            <Card 
              key={report.id}
              className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${report.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg dark:text-white">{report.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full"
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={generating === report.id}
                >
                  {generating === report.id ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}