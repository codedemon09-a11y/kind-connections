import React, { useState } from 'react';
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
import { 
  Wallet, 
  Smartphone, 
  IndianRupee, 
  CheckCircle, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournament: Tournament;
  onPaymentSuccess: () => void;
}

type PaymentMethod = 'wallet' | 'upi';

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  tournament,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [error, setError] = useState<string | null>(null);

  const walletBalance = user?.walletBalance || 0;
  const entryFee = tournament.entryFee;
  const hasEnoughBalance = walletBalance >= entryFee;

  const handlePayment = async () => {
    setError(null);

    if (paymentMethod === 'wallet' && !hasEnoughBalance) {
      setError('Insufficient wallet balance. Please add funds or use UPI.');
      return;
    }

    if (paymentMethod === 'upi' && !upiId.trim()) {
      setError('Please enter your UPI ID');
      return;
    }

    if (paymentMethod === 'upi' && !upiId.includes('@')) {
      setError('Please enter a valid UPI ID (e.g., yourname@upi)');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPaymentStep('success');
    setIsProcessing(false);

    // Wait a moment to show success, then close and trigger join
    setTimeout(() => {
      onPaymentSuccess();
      // Reset dialog state
      setPaymentStep('select');
      setUpiId('');
    }, 1500);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false);
      setPaymentStep('select');
      setError(null);
      setUpiId('');
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

                  {/* UPI Option */}
                  <label
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="upi" id="upi" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-primary" />
                        <span className="font-medium">UPI Payment</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Pay using any UPI app
                      </div>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {/* UPI ID Input */}
              {paymentMethod === 'upi' && (
                <div className="space-y-2">
                  <Label htmlFor="upi-id">Enter UPI ID</Label>
                  <Input
                    id="upi-id"
                    placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handlePayment}
              >
                Pay ₹{entryFee}
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
                Please wait while we process your payment...
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
