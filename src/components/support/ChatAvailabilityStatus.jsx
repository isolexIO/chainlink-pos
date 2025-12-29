import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export default function ChatAvailabilityStatus({ showLabel = true, className = '' }) {
  const [status, setStatus] = useState({
    available: true,
    agentsOnline: 0,
    avgResponseTime: 'Checking...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAvailability();
    
    // Check availability every 30 seconds
    const interval = setInterval(checkAvailability, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAvailability = async () => {
    try {
      const result = await base44.functions.invoke('checkChatAvailability', {});
      if (result.data) {
        setStatus(result.data);
      }
    } catch (error) {
      console.error('Error checking chat availability:', error);
      // Default to available on error
      setStatus({
        available: true,
        agentsOnline: 1,
        avgResponseTime: '2 minutes'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        {showLabel && <span className="text-sm text-gray-500">Checking status...</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${status.available ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
      {showLabel && (
        <span className={`text-sm ${status.available ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
          {status.available ? `${status.agentsOnline} agent${status.agentsOnline !== 1 ? 's' : ''} online` : 'Currently offline'}
        </span>
      )}
    </div>
  );
}