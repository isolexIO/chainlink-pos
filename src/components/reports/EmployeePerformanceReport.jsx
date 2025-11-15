import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, DollarSign, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function EmployeePerformanceReport({ employees, orders, dateRange, loading }) {
  const getEmployeeMetrics = () => {
    return employees.map(employee => {
      const employeeOrders = orders.filter(order => order.created_by === employee.email);
      const totalSales = employeeOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalOrders = employeeOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
      const commission = totalSales * ((employee.commission_rate || 0) / 100);

      return {
        id: employee.id,
        name: employee.full_name,
        email: employee.email,
        role: employee.role,
        totalSales,
        totalOrders,
        avgOrderValue,
        commission,
        hourlyRate: employee.hourly_rate || 0
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  };

  const getTopPerformers = (metrics) => {
    return metrics.slice(0, 5);
  };

  const getPerformanceRadarData = (metrics) => {
    const topFive = metrics.slice(0, 5);
    const maxSales = Math.max(...topFive.map(m => m.totalSales), 1);
    const maxOrders = Math.max(...topFive.map(m => m.totalOrders), 1);
    const maxAvg = Math.max(...topFive.map(m => m.avgOrderValue), 1);

    return topFive.map(emp => ({
      employee: emp.name.split(' ')[0],
      'Sales (%)': (emp.totalSales / maxSales) * 100,
      'Orders (%)': (emp.totalOrders / maxOrders) * 100,
      'Avg Order (%)': (emp.avgOrderValue / maxAvg) * 100
    }));
  };

  const exportToCSV = (metrics) => {
    const headers = ["Employee", "Role", "Total Sales", "Orders", "Avg Order", "Commission"];
    const rows = metrics.map(emp => [
      emp.name,
      emp.role || 'user',
      `$${emp.totalSales.toFixed(2)}`,
      emp.totalOrders,
      `$${emp.avgOrderValue.toFixed(2)}`,
      `$${emp.commission.toFixed(2)}`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_performance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (metrics) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Employee Performance Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Employee', 'Role', 'Sales', 'Orders', 'Avg Order', 'Commission']],
      body: metrics.map(emp => [
        emp.name,
        emp.role || 'user',
        `$${emp.totalSales.toFixed(2)}`,
        emp.totalOrders.toString(),
        `$${emp.avgOrderValue.toFixed(2)}`,
        `$${emp.commission.toFixed(2)}`
      ])
    });

    doc.save(`employee_performance_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading employee data...</p>
        </div>
      </div>
    );
  }

  const metrics = getEmployeeMetrics();
  const topPerformers = getTopPerformers(metrics);
  const radarData = getPerformanceRadarData(metrics);
  const totalCommission = metrics.reduce((sum, emp) => sum + emp.commission, 0);

  return (
    <div className="space-y-6">
      {/* Export Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => exportToCSV(metrics)} className="dark:border-gray-600 dark:text-white">
          <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
        <Button variant="outline" onClick={() => exportToPDF(metrics)} className="dark:border-gray-600 dark:text-white">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Total Commission</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">${totalCommission.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Active Employees</CardTitle>
            <Award className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{employees.filter(e => e.is_active).length}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Top Performer</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold dark:text-white">{topPerformers[0]?.name || 'N/A'}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ${topPerformers[0]?.totalSales.toFixed(0) || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Employee Chart */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Sales Performance by Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metrics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalSales" fill="#8884d8" name="Total Sales ($)" />
              <Bar dataKey="commission" fill="#82ca9d" name="Commission ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Radar */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Top 5 Employee Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="employee" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Sales" dataKey="Sales (%)" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Radar name="Orders" dataKey="Orders (%)" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              <Radar name="Avg Order" dataKey="Avg Order (%)" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Detailed Employee Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-3 dark:text-gray-200">Employee</th>
                  <th className="text-left p-3 dark:text-gray-200">Role</th>
                  <th className="text-right p-3 dark:text-gray-200">Orders</th>
                  <th className="text-right p-3 dark:text-gray-200">Total Sales</th>
                  <th className="text-right p-3 dark:text-gray-200">Avg Order</th>
                  <th className="text-right p-3 dark:text-gray-200">Commission</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(emp => (
                  <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-white">{emp.name}</td>
                    <td className="p-3 dark:text-gray-300">{emp.role || 'user'}</td>
                    <td className="text-right p-3 dark:text-white">{emp.totalOrders}</td>
                    <td className="text-right p-3 dark:text-white">${emp.totalSales.toFixed(2)}</td>
                    <td className="text-right p-3 dark:text-white">${emp.avgOrderValue.toFixed(2)}</td>
                    <td className="text-right p-3 text-green-600 dark:text-green-400">${emp.commission.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}