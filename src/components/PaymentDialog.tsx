import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { Tournament, calculateTotalPrizePool } from '@/types';
import { razorpayConfig } from '@/lib/payment';
import { 
  Wallet, 
  CreditCard,
  IndianRupee, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament;
  onPaymentSuccess: (paymentId: string, orderId: string, method: string) => void;
}

type PaymentMethod = 'wallet' | 'razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  tournament,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [error, setError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const walletBalance = user?.walletBalance || 0;
  const entryFee = tournament.entryFee;
  const hasEnoughBalance = walletBalance >= entryFee;

  // Check if Razorpay is loaded
  useEffect(() => {
    const checkRazorpay = () => {
      if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
        setRazorpayLoaded(true);
      }
    };
    
    checkRazorpay();
    // Check again after a delay in case script loads late
    const timer = setTimeout(checkRazorpay, 1000);
    return () => clearTimeout(timer);
  }, [open]);

  const handleRazorpayPayment = () => {
    if (!razorpayLoaded) {
      setError('Payment gateway not loaded. Please refresh the page and try again.');
      return;
    }

    if (!user) {
      setError('Please login to make a payment.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    const options = {
      key: razorpayConfig.keyId,
      amount: entryFee * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'BattleArena',
      description: `Tournament Entry: ${tournament.game} Solo Tournament`,
      image: '/favicon.ico',
      prefill: {
        name: user.displayName || '',
        email: user.email || '',
        contact: user.phone || '',
      },
      notes: {
        tournamentId: tournament.id,
        oderId: user.id,
        purpose: 'Tournament Entry Fee',
      },
      theme: {
        color: '#00FFE5',
        backdrop_color: 'rgba(0, 0, 0, 0.8)',
      },
      handler: function (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) {
        // Payment successful
        console.log('Razorpay Payment Success:', response);
        
        setPaymentStep('success');
        setIsProcessing(false);

        // Wait a moment to show success, then trigger callback
        setTimeout(() => {
          onPaymentSuccess(
            response.razorpay_payment_id,
            response.razorpay_order_id || `order_${Date.now()}`,
            'razorpay'
          );
          // Reset dialog state
          setPaymentStep('select');
        }, 1500);
      },
      modal: {
        ondismiss: function () {
          console.log('Payment modal closed by user');
          setIsProcessing(false);
          setPaymentStep('select');
          setError('Payment cancelled. Please try again.');
        },
        confirm_close: true,
        escape: true,
        animation: true,
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      
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
        console.error('Razorpay Payment Failed:', response.error);
        setIsProcessing(false);
        setPaymentStep('select');
        setError(response.error.description || 'Payment failed. Please try again.');
      });
      
      razorpay.open();
    } catch (err) {
      console.error('Razorpay initialization error:', err);
      setIsProcessing(false);
      setPaymentStep('select');
      setError('Failed to initialize payment gateway. Please try again.');
    }
  };

  const handleWalletPayment = async () => {
    if (!hasEnoughBalance) {
      setError('Insufficient wallet balance. Please use Razorpay.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    setError(null);

    // Simulate wallet deduction
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPaymentStep('success');
    setIsProcessing(false);

    setTimeout(() => {
      onPaymentSuccess(
        `wallet_${Date.now()}`,
        `order_wallet_${Date.now()}`,
        'wallet'
      );
      setPaymentStep('select');
    }, 1500);
  };

  const handlePayment = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleWalletPayment();
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setPaymentStep('select');
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {paymentStep === 'select' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-primary" />
                Pay Entry Fee
              </DialogTitle>
              <DialogDescription>
                Complete payment to join {tournament.game} Tournament
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Amount Summary */}
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Entry Fee</span>
                  <span className="text-2xl font-bold text-primary">₹{entryFee}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Payment Method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'razorpay'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        <span className="font-medium">Razorpay</span>
                        <Shield className="w-4 h-4 text-success" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        UPI, Card, Net Banking, Wallet
                      </div>
                    </div>
                  </label>

                  {/* Wallet Option */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'wallet'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    } ${!hasEnoughBalance ? 'opacity-60' : ''}`}
                  >
                    <RadioGroupItem value="wallet" id="wallet" disabled={!hasEnoughBalance} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        <span className="font-medium">Wallet Balance</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Available: ₹{walletBalance}
                        {!hasEnoughBalance && (
                          <span className="text-destructive ml-2">(Insufficient)</span>
                        )}
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* Razorpay Loading Warning */}
              {paymentMethod === 'razorpay' && !razorpayLoaded && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  Loading payment gateway...
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Secure Payment Notice */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Secure payment powered by Razorpay. Your details are encrypted.</span>
              </div>

              {/* Pay Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
                disabled={isProcessing || (paymentMethod === 'razorpay' && !razorpayLoaded)}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{entryFee}</>
                )}
              </Button>
            </div>
          </>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Processing Payment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please complete the payment in the Razorpay window...
              </p>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-success">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                ₹{entryFee} paid • Joining tournament...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
