import { razorpayConfig } from '@/lib/payment';

interface RazorpayPaymentProps {
  amount: number; // Amount in INR
  tournamentId: string;
  userId: string;
  userEmail: string;
  userPhone: string;
  userDisplayName: string;
  tournamentName: string;
  onSuccess: (paymentId: string, orderId: string) => void;
  onFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const initiateRazorpayPayment = ({
  amount,
  tournamentId,
  userId,
  userEmail,
  userPhone,
  userDisplayName,
  tournamentName,
  onSuccess,
  onFailure,
}: RazorpayPaymentProps) => {
  // Check if Razorpay script is loaded
  if (typeof window.Razorpay === 'undefined') {
    onFailure('Payment gateway not loaded. Please refresh the page.');
    return;
  }

  // Validate amount
  if (amount <= 0) {
    onFailure('Invalid payment amount');
    return;
  }

  const options = {
    key: razorpayConfig.keyId,
    amount: amount * 100, // Razorpay expects amount in paise (1 INR = 100 paise)
    currency: 'INR',
    name: 'BattleArena',
    description: `Tournament Entry: ${tournamentName}`,
    image: '/favicon.ico', // Your logo
    // order_id: 'ORDER_ID_FROM_BACKEND', // Required in production - get from backend
    prefill: {
      name: userDisplayName,
      email: userEmail,
      contact: userPhone,
    },
    notes: {
      tournamentId,
      userId,
      purpose: 'Tournament Entry Fee',
    },
    theme: {
      color: '#00FFE5', // Primary brand color
      backdrop_color: 'rgba(0, 0, 0, 0.8)',
    },
    handler: function (response: {
      razorpay_payment_id: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }) {
      // Payment successful
      console.log('Payment Success:', response);
      
      // In production, you should verify the signature on backend
      // const verified = await verifyPaymentOnBackend(response);
      
      onSuccess(
        response.razorpay_payment_id, 
        response.razorpay_order_id || `order_${Date.now()}`
      );
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal closed by user');
        onFailure('Payment cancelled by user');
      },
      confirm_close: true, // Ask for confirmation before closing
      escape: true, // Allow closing with ESC key
      animation: true,
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
  };

  try {
    const razorpay = new window.Razorpay(options);
    
    // Handle payment failures
    razorpay.on('payment.failed', function (response: {
      error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
          order_id?: string;
          payment_id?: string;
        };
      };
    }) {
      console.error('Payment Failed:', response.error);
      onFailure(response.error.description || 'Payment failed. Please try again.');
    });
    
    // Open Razorpay modal
    razorpay.open();
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    onFailure('Failed to initialize payment gateway. Please try again.');
  }
};

// Utility function to format amount for display
export const formatPaymentAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Check if Razorpay is available
export const isRazorpayAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
};

export default initiateRazorpayPayment;
