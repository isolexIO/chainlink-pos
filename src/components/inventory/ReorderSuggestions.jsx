import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Package } from 'lucide-react';

export default function ReorderSuggestions({ inventory, onReorder }) {
  const calculateReorderSuggestion = (item) => {
    const daysOfStock = item.quantity / (item.average_daily_usage || 1);
    const leadTimeDays = 7; // Assume 7 days lead time
    const safetyStock = (item.average_daily_usage || 1) * 3; // 3 days safety stock
    
    if (daysOfStock < leadTimeDays) {
      const suggestedOrder = Math.ceil((item.average_daily_usage || 1) * (leadTimeDays + 3) - item.quantity);
      return {
        urgent: daysOfStock < 3,
        suggested: suggestedOrder,
        daysLeft: Math.floor(daysOfStock),
        reason: daysOfStock < 3 ? 'Critical - order immediately' : 'Low stock - reorder soon'
      };
    }
    return null;
  };

  const suggestions = inventory
    .map(item => ({
      ...item,
      suggestion: calculateReorderSuggestion(item)
    }))
    .filter(item => item.suggestion !== null)
    .sort((a, b) => {
      if (a.suggestion.urgent && !b.suggestion.urgent) return -1;
      if (!a.suggestion.urgent && b.suggestion.urgent) return 1;
      return a.suggestion.daysLeft - b.suggestion.daysLeft;
    });

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">All Stock Levels Good</p>
          <p className="text-sm text-gray-500 mt-2">No reorder recommendations at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          Reorder Suggestions ({suggestions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border ${
                item.suggestion.urgent
                  ? 'border-red-200 bg-red-50 dark:bg-red-900/20'
                  : 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle
                      className={`w-5 h-5 ${
                        item.suggestion.urgent ? 'text-red-600' : 'text-yellow-600'
                      }`}
                    />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    {item.suggestion.urgent && (
                      <Badge variant="destructive">Urgent</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Current Stock:</span>
                      <span className="ml-2 font-medium">{item.quantity} {item.unit_of_measure}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Days Left:</span>
                      <span className="ml-2 font-medium">{item.suggestion.daysLeft} days</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Suggested Order:</span>
                      <span className="ml-2 font-medium text-green-600">
                        {item.suggestion.suggested} {item.unit_of_measure}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <span className="ml-2 font-medium">
                        ${(item.cost_per_unit * item.suggestion.suggested).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.suggestion.reason}
                  </p>
                  
                  {item.supplier_name && (
                    <p className="text-xs text-gray-500 mt-2">
                      Supplier: {item.supplier_name}
                      {item.supplier_contact && ` - ${item.supplier_contact}`}
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    size="sm"
                    className={item.suggestion.urgent ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => onReorder(item, item.suggestion.suggested)}
                  >
                    Order Now
                  </Button>
                  {item.supplier_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.supplier_url, '_blank')}
                    >
                      Supplier Site
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}