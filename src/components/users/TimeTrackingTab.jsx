import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';

export default function TimeTrackingTab({ employees, timeEntries, onRefresh }) {
  const employeeTimeData = useMemo(() => {
    return employees.map(emp => {
      const empEntries = timeEntries.filter(t => t.user_id === emp.id);
      const totalHours = empEntries.reduce((sum, t) => sum + (t.hours_worked || 0), 0);
      const thisWeekEntries = empEntries.filter(t => {
        const entryDate = new Date(t.created_date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      });
      const thisWeekHours = thisWeekEntries.reduce((sum, t) => sum + (t.hours_worked || 0), 0);
      const currentEntry = empEntries.find(t => t.status === 'clocked_in');

      return {
        ...emp,
        totalHours,
        thisWeekHours,
        currentEntry,
        recentEntries: empEntries.slice(0, 5)
      };
    });
  }, [employees, timeEntries]);

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-6">
      {employeeTimeData.map(emp => (
        <Card key={emp.id} className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                  {emp.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <CardTitle className="text-lg dark:text-white">{emp.full_name}</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ${emp.hourly_rate || 0}/hr
                  </p>
                </div>
              </div>
              {emp.currentEntry && (
                <Badge className="bg-green-500 dark:bg-green-600">
                  <Clock className="w-3 h-3 mr-1" />
                  Currently Working
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">This Week</p>
                <p className="text-xl font-bold dark:text-white">{formatDuration(emp.thisWeekHours)}</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Hours</p>
                <p className="text-xl font-bold dark:text-white">{formatDuration(emp.totalHours)}</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Earnings</p>
                <p className="text-xl font-bold dark:text-white">
                  ${((emp.totalHours || 0) * (emp.hourly_rate || 0)).toFixed(0)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Recent Time Entries</p>
              {emp.recentEntries.length > 0 ? (
                emp.recentEntries.map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium dark:text-white">
                          {new Date(entry.clock_in).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.clock_in).toLocaleTimeString()} - 
                          {entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : 'Present'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={entry.status === 'clocked_in' ? 'default' : 'secondary'} className="dark:bg-gray-600">
                        {entry.status === 'clocked_in' ? 'Active' : formatDuration(entry.hours_worked || 0)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No time entries yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}