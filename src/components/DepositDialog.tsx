import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { initiateRazorpayPayment, isRazorpayAvailable } from '@/components/RazorpayPayment';
import { Loader2, IndianRupee, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

const DepositDialog: React.FC<DepositDialogProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { depositFunds } = useData();
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount < 10) {
      toast.error('Minimum deposit is ₹10');
      return;
    }
    if (depositAmount > 50000) {
      toast.error('Maximum deposit is ₹50,000');
      return;
    }
    if (!user) return;

    if (!isRazorpayAvailable()) {
      // Fallback: direct wallet credit for testing
      setIsProcessing(true);
      try {
        await depositFunds(user.id, depositAmount, `test_${Date.now()}`);
        toast.success(`₹${depositAmount} added to wallet!`);
        onOpenChange(false);
        setAmount('');
      } catch {
        toast.error('Deposit failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    initiateRazorpayPayment({
      amount: depositAmount,
      tournamentId: 'DEPOSIT',
      userId: user.id,
      userEmail: user.email,
      userPhone: user.phone || '',
      userDisplayName: user.displayName,
      tournamentName: 'Wallet Deposit',
      onSuccess: async (paymentId) => {
        try {
          await depositFunds(user.id, depositAmount, paymentId);
          toast.success(`₹${depositAmount} added to wallet!`);
          onOpenChange(false);
          setAmount('');
        } catch {
          toast.error('Failed to credit wallet');
        } finally {
          setIsProcessing(false);
        }
      },
      onFailure: (error) => {
        toast.error(error);
        setIsProcessing(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Add Funds
          </DialogTitle>
          <DialogDescription>
            Deposit money to your wallet for tournament entries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Quick Amount Buttons */}
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {QUICK_AMOUNTS.map((qa) => (
                <Button
                  key={qa}
                  variant={amount === String(qa) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAmount(String(qa))}
                  className="text-xs"
                >
                  ₹{qa}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (₹)</Label>
            <Input
              id="deposit-amount"
              type="number"
              placeholder="Enter amount (min ₹10)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={10}
              max={50000}
            />
          </div>

          {/* Current Balance */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-bold">₹{(user?.walletBalance || 0) + (user?.winningCredits || 0)}</span>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">After Deposit</span>
                <span className="font-bold text-success">
                  ₹{(user?.walletBalance || 0) + (user?.winningCredits || 0) + parseFloat(amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeposit} disabled={isProcessing || !amount}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Deposit ₹{amount || '0'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DepositDialog;
