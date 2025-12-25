import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gamepad2, Mail, UserPlus, Lock, ArrowLeft, Loader2, Zap, Crown, Sparkles, Shield } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back, Champion! 🎮');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : error.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : 'Login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    try {
      await signup(email, password, displayName);
      toast.success('Account created! Welcome to the arena! 🏆');
      navigate('/');
    } catch (error: any) {
      const errorMessage = error.code === 'auth/email-already-in-use' 
        ? 'An account with this email already exists' 
        : error.code === 'auth/weak-password'
        ? 'Password is too weak'
        : 'Signup failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute inset-0 cyber-lines opacity-10 pointer-events-none" />
      <div className="absolute top-20 left-[20%] w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-[20%] w-72 h-72 bg-neon-pink/20 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* Header */}
      <header className="container py-6 relative z-10">
        <Link to="/" className="flex items-center gap-3 w-fit group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-neon-pink/30 flex items-center justify-center border border-primary/50 group-hover:glow-primary transition-all duration-500">
            <Gamepad2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="font-display font-bold text-xl text-gradient">
            BattleArena
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 container flex items-center justify-center py-10 relative z-10">
        <Card className="w-full max-w-md gaming-card border-primary/20 animate-scale-in">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-neon-pink/30 flex items-center justify-center mx-auto mb-4 border border-primary/30 animate-pulse-glow">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-display text-gradient">Join the Battle</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in or create an account to compete</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1">
                <TabsTrigger 
                  value="login" 
                  className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <Zap className="w-4 h-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              {/* Login */}
              <TabsContent value="login" className="animate-fade-in">
                <form onSubmit={handleEmailLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <Button type="submit" className="w-full gap-2 glow-primary hover:glow-primary-intense transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Entering Arena...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Enter Arena
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Signup */}
              <TabsContent value="signup" className="animate-fade-in">
                <form onSubmit={handleSignup} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Gamer Tag
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="ProPlayer123"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full gap-2 glow-primary hover:glow-primary-intense transition-all duration-300" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Back Link */}
      <div className="container py-6 relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;