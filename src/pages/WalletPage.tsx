import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  History,
  IndianRupee,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { transactions, withdrawalRequests, fetchTransactions, requestWithdrawal, isLoading } = useData();
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchTransactions(user.id);
    }
  }, [isAuthenticated, user, fetchTransactions, navigate]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 30) {
      toast.error('Minimum withdrawal amount is ₹30');
      return;
    }

    if (amount > (user?.winningCredits || 0)) {
      toast.error('Insufficient winning credits');
      return;
    }

    if (!upiId || !upiId.includes('@')) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    setIsWithdrawing(true);
    try {
      await requestWithdrawal(user!.id, amount, upiId);
      toast.success('Withdrawal request submitted! Admin will process within 24-48 hours.');
      setWithdrawDialogOpen(false);
      setWithdrawAmount('');
      setUpiId('');
    } catch (error) {
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PRIZE':
        return <Trophy className="w-4 h-4 text-success" />;
      case 'ENTRY_FEE':
        return <ArrowUpRight className="w-4 h-4 text-destructive" />;
      case 'WITHDRAWAL':
        return <ArrowDownLeft className="w-4 h-4 text-warning" />;
      case 'REFUND':
        return <ArrowDownLeft className="w-4 h-4 text-primary" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-8 md:py-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">My Wallet</h1>
                <p className="text-muted-foreground text-sm">Manage your balance and withdrawals</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Balance Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Balance */}
                <Card className="border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-primary" />
                      </div>
                      <Badge variant="outline">Total Balance</Badge>
                    </div>
                    <div className="text-3xl font-display font-bold">
                      ₹{user.walletBalance + user.winningCredits}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available for use
                    </p>
                  </CardContent>
                </Card>

                {/* Winning Credits */}
                <Card className="border-success/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-success" />
                      </div>
                      <Badge variant="success">Withdrawable</Badge>
                    </div>
                    <div className="text-3xl font-display font-bold text-success">
                      ₹{user.winningCredits}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      From tournament winnings
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Withdraw Button */}
              <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto" disabled={user.winningCredits < 30}>
                    <ArrowDownLeft className="w-4 h-4" />
                    Withdraw to UPI
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Minimum withdrawal: ₹30. Processed within 24-48 hours.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                      <div className="text-sm text-muted-foreground">Available to withdraw</div>
                      <div className="text-2xl font-bold text-success">₹{user.winningCredits}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        min={30}
                        max={user.winningCredits}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input
                        id="upi"
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setWithdrawDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                      {isWithdrawing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Submit Request'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.length > 0 ? (
                    <div className="space-y-4">
                      {transactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              {getTransactionIcon(txn.type)}
                            </div>
                            <div>
                              <div className="font-medium">{txn.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(txn.createdAt), 'MMM dd, yyyy • hh:mm a')}
                              </div>
                            </div>
                          </div>
                          <div className={`font-display font-bold ${txn.amount > 0 ? 'text-success' : 'text-destructive'}`}>
                            {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Requests Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Withdrawal Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {withdrawalRequests.length > 0 ? (
                    <div className="space-y-4">
                      {withdrawalRequests.map((req) => (
                        <div key={req.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">₹{req.amount}</span>
                            {getStatusBadge(req.status)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            UPI: {req.upiId}
                          </div>
                          {req.rejectionReason && (
                            <div className="text-xs text-destructive">
                              Reason: {req.rejectionReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No withdrawal requests
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletPage;
