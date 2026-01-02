import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WithdrawalRequest } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  IndianRupee,
  Search,
  Loader2,
  Copy,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

const AdminWithdrawals: React.FC = () => {
  const { user } = useAuth();
  const { withdrawalRequests, fetchWithdrawalRequests, processWithdrawal, isLoading } = useData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [fetchWithdrawalRequests]);

  const filteredRequests = withdrawalRequests.filter(req => {
    const matchesSearch = req.upiId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = withdrawalRequests.filter(r => r.status === 'PENDING').length;
  const approvedTotal = withdrawalRequests
    .filter(r => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleApprove = async (request: WithdrawalRequest) => {
    setProcessing(request.id);
    try {
      await processWithdrawal(request.id, true);
      toast.success('Withdrawal approved successfully');
    } catch (error) {
      toast.error('Failed to approve withdrawal');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setProcessing(selectedRequest.id);
    try {
      await processWithdrawal(selectedRequest.id, false, rejectionReason);
      toast.success('Withdrawal rejected');
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
    } catch (error) {
      toast.error('Failed to reject withdrawal');
    } finally {
      setProcessing(null);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Withdrawals</h1>
          <p className="text-muted-foreground">Process withdrawal requests via Razorpay Payouts</p>
        </div>
      </div>

      {/* Razorpay Payout Instructions */}
      <Alert className="border-warning/30 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertTitle className="text-warning">Manual Payout Required</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p className="text-sm">
            After approving a withdrawal, you must manually process the payout via Razorpay Dashboard:
          </p>
          <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
            <li>Copy the UPI ID from the request below</li>
            <li>Go to Razorpay Dashboard → Payouts → Create Payout</li>
            <li>Enter the amount and UPI ID, then confirm</li>
          </ol>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => window.open('https://dashboard.razorpay.com/app/payouts', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Razorpay Payouts
          </Button>
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{pendingCount}</div>
                <div className="text-xs text-muted-foreground">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">₹{approvedTotal}</div>
                <div className="text-xs text-muted-foreground">Total Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{withdrawalRequests.length}</div>
                <div className="text-xs text-muted-foreground">Total Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by UPI ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border ${
                  request.status === 'PENDING' 
                    ? 'bg-warning/5 border-warning/20' 
                    : 'bg-secondary/30 border-border/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">₹{request.amount}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    {/* User Details */}
                    {request.user && (
                      <div className="text-sm font-medium text-foreground">
                        {request.user.displayName || 'Unknown User'}
                        <span className="text-muted-foreground font-normal ml-2">
                          ({request.user.email})
                        </span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      UPI: <span className="font-mono">{request.upiId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(request.upiId)}
                        title="Copy UPI ID"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    {request.user && (
                      <div className="text-xs text-muted-foreground">
                        Balance: ₹{request.user.winningCredits} withdrawable
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Requested: {format(new Date(request.createdAt), 'MMM dd, yyyy • hh:mm a')}
                    </div>
                    {request.rejectionReason && (
                      <div className="text-xs text-destructive">
                        Reason: {request.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex gap-2 pl-16 sm:pl-0">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleApprove(request)}
                      disabled={processing === request.id}
                    >
                      {processing === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedRequest(request);
                        setRejectDialogOpen(true);
                      }}
                      disabled={processing === request.id}
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}

                {request.status !== 'PENDING' && request.processedAt && (
                  <div className="text-xs text-muted-foreground pl-16 sm:pl-0">
                    Processed: {format(new Date(request.processedAt), 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No withdrawal requests found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request.
              The user will see this reason.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 rounded-lg bg-secondary/50 mb-4">
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-xl font-bold">₹{selectedRequest?.amount}</div>
              <div className="text-sm text-muted-foreground mt-1">
                UPI: {selectedRequest?.upiId}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={processing === selectedRequest?.id}
            >
              {processing === selectedRequest?.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Reject Withdrawal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawals;
