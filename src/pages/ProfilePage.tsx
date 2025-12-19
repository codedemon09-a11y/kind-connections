import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Trophy,
  Gamepad2,
  IndianRupee,
  Target,
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { userRegistrations, transactions, fetchUserRegistrations, fetchTransactions } = useData();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchUserRegistrations(user.id);
      fetchTransactions(user.id);
    }
  }, [isAuthenticated, user, fetchUserRegistrations, fetchTransactions, navigate]);

  if (!user) {
    return null;
  }

  // Calculate stats
  const totalMatches = userRegistrations.length;
  const totalWins = transactions.filter(t => t.type === 'PRIZE').length;
  const totalEarnings = transactions
    .filter(t => t.type === 'PRIZE')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-8 md:py-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">{user.displayName}</h1>
                <p className="text-muted-foreground text-sm">Member since {format(new Date(user.createdAt), 'MMMM yyyy')}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Stats Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Total Matches */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <Gamepad2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-display font-bold">{totalMatches}</div>
                    <p className="text-xs text-muted-foreground">Total Matches</p>
                  </CardContent>
                </Card>

                {/* Total Wins */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-2xl font-display font-bold text-success">{totalWins}</div>
                    <p className="text-xs text-muted-foreground">Wins</p>
                  </CardContent>
                </Card>

                {/* Win Rate */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center mx-auto mb-2">
                      <Target className="w-5 h-5 text-warning" />
                    </div>
                    <div className="text-2xl font-display font-bold">
                      {totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                  </CardContent>
                </Card>

                {/* Total Earnings */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-2">
                      <IndianRupee className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-display font-bold">₹{totalEarnings}</div>
                    <p className="text-xs text-muted-foreground">Total Earnings</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Recent Winnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {transactions.filter(t => t.type === 'PRIZE').length > 0 ? (
                    <div className="space-y-3">
                      {transactions
                        .filter(t => t.type === 'PRIZE')
                        .slice(0, 5)
                        .map((txn) => (
                          <div
                            key={txn.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                          >
                            <div>
                              <div className="font-medium">{txn.description}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(txn.createdAt), 'MMM dd, yyyy')}
                              </div>
                            </div>
                            <div className="font-display font-bold text-success">
                              +₹{txn.amount}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No winnings yet</p>
                      <p className="text-sm">Join tournaments to start earning!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Info Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="text-sm font-medium">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Phone</div>
                      <div className="text-sm font-medium">{user.phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Member Since</div>
                      <div className="text-sm font-medium">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  {user.isBanned && (
                    <Badge variant="destructive" className="w-full justify-center">
                      Account Banned
                    </Badge>
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

export default ProfilePage;