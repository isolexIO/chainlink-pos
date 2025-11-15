import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function TimeTrackingReport({ employees, timeEntries, dateRange, loading }) {
  const getEmployeeTimeMetrics = () => {
    return employees.map(employee => {
      const employeeEntries = timeEntries.filter(entry => entry.user_id === employee.id);
      
      const totalHours = employeeEntries.reduce((sum, entry) => {
        if (entry.hours_worked) return sum + entry.hours_worked;
        if (entry.clock_in && entry.clock_out) {
          const hours = (new Date(entry.clock_out) - new Date(entry.clock_in)) / (1000 * 60 * 60);
          return sum + hours;
        }
        return sum;
      }, 0);

      const estimatedPay = totalHours * (employee.hourly_rate || 0);
      const shifts = employeeEntries.length;
      const avgShiftLength = shifts > 0 ? totalHours / shifts : 0;

      return {
        id: employee.id,
        name: employee.full_name,
        email: employee.email,
        hourlyRate: employee.hourly_rate || 0,
        totalHours: totalHours,
        estimatedPay: estimatedPay,
        shifts: shifts,
        avgShiftLength: avgShiftLength
      };
    }).sort((a, b) => b.totalHours - a.totalHours);
  };

  const getDailyHoursWorked = () => {
    const hoursByDate = {};
    timeEntries.forEach(entry => {
      const date = new Date(entry.clock_in).toLocaleDateString();
      const hours = entry.hours_worked || 
        (entry.clock_in && entry.clock_out ? 
          (new Date(entry.clock_out) - new Date(entry.clock_in)) / (1000 * 60 * 60) : 0);
      
      if (!hoursByDate[date]) {
        hoursByDate[date] = { date, hours: 0 };
      }
      hoursByDate[date].hours += hours;
    });
    return Object.values(hoursByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const exportToCSV = (metrics) => {
    const headers = ["Employee", "Hours Worked", "Hourly Rate", "Estimated Pay", "Shifts", "Avg Shift Length"];
    const rows = metrics.map(emp => [
      emp.name,
      emp.totalHours.toFixed(2),
      `$${emp.hourlyRate.toFixed(2)}`,
      `$${emp.estimatedPay.toFixed(2)}`,
      emp.shifts,
      `${emp.avgShiftLength.toFixed(2)}h`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `time_tracking_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = (metrics) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Time Tracking Report', 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 14, 30);
    
    doc.autoTable({
      startY: 40,
      head: [['Employee', 'Hours', 'Rate', 'Pay', 'Shifts']],
      body: metrics.map(emp => [
        emp.name,
        emp.totalHours.toFixed(2),
        `$${emp.hourlyRate.toFixed(2)}`,
        `$${emp.estimatedPay.toFixed(2)}`,
        emp.shifts.toString()
      ])
    });

    doc.save(`time_tracking_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading time tracking data...</p>
        </div>
      </div>
    );
  }

  const metrics = getEmployeeTimeMetrics();
  const dailyHours = getDailyHoursWorked();
  const totalHours = metrics.reduce((sum, emp) => sum + emp.totalHours, 0);
  const totalPay = metrics.reduce((sum, emp) => sum + emp.estimatedPay, 0);

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
            <CardTitle className="text-sm font-medium dark:text-gray-200">Total Hours</CardTitle>
            <Clock className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Estimated Payroll</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">${totalPay.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-200">Total Shifts</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{timeEntries.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Hours Trend */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Daily Hours Worked</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="hours" stroke="#8884d8" name="Total Hours" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hours by Employee Chart */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Hours by Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={metrics.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalHours" fill="#8884d8" name="Hours Worked" />
              <Bar dataKey="estimatedPay" fill="#82ca9d" name="Estimated Pay ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Detailed Time Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left p-3 dark:text-gray-200">Employee</th>
                  <th className="text-right p-3 dark:text-gray-200">Hours</th>
                  <th className="text-right p-3 dark:text-gray-200">Rate</th>
                  <th className="text-right p-3 dark:text-gray-200">Estimated Pay</th>
                  <th className="text-right p-3 dark:text-gray-200">Shifts</th>
                  <th className="text-right p-3 dark:text-gray-200">Avg Shift</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map(emp => (
                  <tr key={emp.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="p-3 dark:text-white">{emp.name}</td>
                    <td className="text-right p-3 dark:text-white">{emp.totalHours.toFixed(2)}h</td>
                    <td className="text-right p-3 dark:text-white">${emp.hourlyRate.toFixed(2)}/h</td>
                    <td className="text-right p-3 text-green-600 dark:text-green-400">${emp.estimatedPay.toFixed(2)}</td>
                    <td className="text-right p-3 dark:text-white">{emp.shifts}</td>
                    <td className="text-right p-3 dark:text-white">{emp.avgShiftLength.toFixed(2)}h</td>
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