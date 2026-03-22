import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Calendar, Trophy, Gamepad2, IndianRupee,
  Target, Copy, Gift, Users, Share2,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { userRegistrations, transactions, matchResults, fetchUserRegistrations, fetchTransactions, fetchMatchHistory } = useData();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user) {
      fetchUserRegistrations(user.id);
      fetchTransactions(user.id);
      fetchMatchHistory(user.id);
    }
  }, [isAuthenticated, isLoading, user, fetchUserRegistrations, fetchTransactions, fetchMatchHistory, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16"><Card><CardContent className="p-6 text-muted-foreground">Loading profile…</CardContent></Card></main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const totalMatches = userRegistrations.length;
  const totalWins = transactions.filter(t => t.type === 'PRIZE').length;
  const totalEarnings = transactions.filter(t => t.type === 'PRIZE').reduce((sum, t) => sum + t.amount, 0);
  const totalKills = matchResults.filter(r => r.userId === user.id).reduce((sum, r) => sum + r.kills, 0);
  const avgKills = totalMatches > 0 ? (totalKills / totalMatches).toFixed(1) : '0';
  const bestPosition = matchResults.filter(r => r.userId === user.id).reduce((best, r) => Math.min(best, r.position), Infinity);

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('Referral code copied!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-6 md:py-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <User className="w-7 h-7 md:w-8 md:h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold">{user.displayName}</h1>
                <p className="text-muted-foreground text-sm">Member since {format(new Date(user.createdAt), 'MMMM yyyy')}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <Gamepad2 className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                  <div className="text-xl md:text-2xl font-display font-bold">{totalMatches}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Matches</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1.5 text-success" />
                  <div className="text-xl md:text-2xl font-display font-bold text-success">{totalWins}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Wins</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1.5 text-warning" />
                  <div className="text-xl md:text-2xl font-display font-bold">{totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0}%</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Win Rate</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <IndianRupee className="w-5 h-5 mx-auto mb-1.5 text-primary" />
                  <div className="text-xl md:text-2xl font-display font-bold">₹{totalEarnings}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Earnings</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1.5 text-destructive" />
                  <div className="text-xl md:text-2xl font-display font-bold">{totalKills}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Total Kills</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 md:p-4 text-center">
                  <Trophy className="w-5 h-5 mx-auto mb-1.5 text-warning" />
                  <div className="text-xl md:text-2xl font-display font-bold">{bestPosition === Infinity ? '-' : `#${bestPosition}`}</div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">Best Rank</p>
                </CardContent></Card>
              </div>

              {/* Referral Section */}
              <Card className="border-primary/20">
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Gift className="w-5 h-5 text-primary" />Refer & Earn</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Share your referral code with friends. When they sign up, you both earn rewards!</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border/50 font-mono font-bold text-lg text-primary tracking-wider">
                      {user.referralCode || 'N/A'}
                    </div>
                    <Button variant="outline" size="icon" onClick={copyReferralCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'Join BattleArena!', text: `Use my referral code ${user.referralCode} to sign up on BattleArena!`, url: window.location.origin });
                      } else { copyReferralCode(); }
                    }}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{user.referralCount || 0} friends referred</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Winnings */}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5" />Recent Winnings</CardTitle></CardHeader>
                <CardContent>
                  {transactions.filter(t => t.type === 'PRIZE').length > 0 ? (
                    <div className="space-y-3">
                      {transactions.filter(t => t.type === 'PRIZE').slice(0, 5).map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
                          <div>
                            <div className="font-medium text-sm">{txn.description}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(txn.createdAt), 'MMM dd, yyyy')}</div>
                          </div>
                          <div className="font-display font-bold text-success">+₹{txn.amount}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No winnings yet</p><p className="text-sm">Join tournaments to start earning!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader><CardTitle className="text-lg">Account Info</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Email</div><div className="text-sm font-medium break-all">{user.email}</div></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Phone</div><div className="text-sm font-medium">{user.phone || 'Not set'}</div></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div><div className="text-xs text-muted-foreground">Member Since</div><div className="text-sm font-medium">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</div></div>
                  </div>
                  {user.isBanned && <Badge variant="destructive" className="w-full justify-center">Account Banned</Badge>}
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

export default ProfilePage;
