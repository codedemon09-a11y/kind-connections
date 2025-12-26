import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Loader2, KeyRound, Sparkles, CheckCircle } from 'lucide-react';

interface ForgotPasswordDialogProps {
  trigger?: React.ReactNode;
}

const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ trigger }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      const errorMessage = 
        error.code === 'auth/user-not-found' 
          ? 'No account found with this email'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setEmail('');
      setIsSuccess(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-sm text-primary hover:text-primary/80 transition-colors hover:underline">
            Forgot password?
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md gaming-card border-primary/30 animate-scale-in">
        <DialogHeader className="text-center pb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-neon-cyan/30 flex items-center justify-center mx-auto mb-4 border border-primary/30 animate-pulse-glow">
            {isSuccess ? (
              <CheckCircle className="w-7 h-7 text-success" />
            ) : (
              <KeyRound className="w-7 h-7 text-primary" />
            )}
          </div>
          <DialogTitle className="text-xl font-display text-gradient">
            {isSuccess ? 'Check Your Email' : 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isSuccess 
              ? 'We\'ve sent you a password reset link. Check your inbox!'
              : 'Enter your email and we\'ll send you a reset link'}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center p-6 rounded-xl bg-success/10 border border-success/30">
              <Mail className="w-10 h-10 text-success mx-auto mb-3 animate-bounce-slow" />
              <p className="text-sm text-muted-foreground">
                A password reset link has been sent to:
              </p>
              <p className="font-semibold text-foreground mt-1">{email}</p>
            </div>
            <Button 
              onClick={handleClose} 
              className="w-full gap-2 glow-primary hover:glow-primary-intense"
            >
              <Sparkles className="w-4 h-4" />
              Back to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                Email Address
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="player@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 gap-2 glow-primary hover:glow-primary-intense" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Link
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
