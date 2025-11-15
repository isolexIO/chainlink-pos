import { useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TransactionStatusScreen({ success, order, settings, errorMessage }) {
  const returnDelay = settings?.customer_display?.return_to_idle_seconds || 8;

  useEffect(() => {
    console.log('TransactionStatus: Showing status screen:', success ? 'success' : 'error');
  }, [success]);

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      success 
        ? 'bg-gradient-to-br from-green-400 to-green-600' 
        : 'bg-gradient-to-br from-red-400 to-red-600'
    }`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center text-white"
      >
        {success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="w-32 h-32 mx-auto mb-8" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Payment Successful!</h1>
            <p className="text-2xl mb-6">Thank you for your purchase</p>
            {order && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
                <p className="text-xl mb-2">Order #{order.order_number}</p>
                <p className="text-3xl font-bold">${parseFloat(order.total).toFixed(2)}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <XCircle className="w-32 h-32 mx-auto mb-8" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Payment Failed</h1>
            <p className="text-2xl mb-6">{errorMessage || 'Please try again or use a different payment method'}</p>
            {order && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block">
                <p className="text-xl">Order #{order.order_number}</p>
              </div>
            )}
          </>
        )}

        <p className="text-sm mt-8 opacity-75">
          {success ? `Returning to main screen in ${returnDelay} seconds...` : 'Returning to payment options...'}
        </p>
      </motion.div>
    </div>
  );
}