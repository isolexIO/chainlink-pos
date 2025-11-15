import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, ShoppingCart, Award } from 'lucide-react';

export default function PerformanceTab({ employees, orders }) {
  const employeePerformance = useMemo(() => {
    return employees.map(emp => {
      const empOrders = orders.filter(o => o.created_by === emp.email || o.created_by === emp.id);
      const totalSales = empOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const avgOrderValue = empOrders.length > 0 ? totalSales / empOrders.length : 0;
      const commission = totalSales * ((emp.commission_rate || 0) / 100);

      return {
        ...emp,
        orderCount: empOrders.length,
        totalSales,
        avgOrderValue,
        commission
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [employees, orders]);

  return (
    <div className="grid grid-cols-1 gap-6">
      {employeePerformance.map(emp => (
        <Card key={emp.id} className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                  {emp.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white">{emp.full_name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{emp.role || 'Employee'}</p>
                </div>
              </div>
              <Badge className="dark:bg-purple-900/50 dark:text-purple-200">
                {emp.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Orders</span>
                </div>
                <p className="text-2xl font-bold dark:text-white">{emp.orderCount}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Sales</span>
                </div>
                <p className="text-2xl font-bold dark:text-white">${emp.totalSales.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Avg Order</span>
                </div>
                <p className="text-2xl font-bold dark:text-white">${emp.avgOrderValue.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">Commission</span>
                </div>
                <p className="text-2xl font-bold dark:text-white">${emp.commission.toFixed(0)}</p>
              </div>
            </div>
            {emp.performance_notes && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Manager Notes:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{emp.performance_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}