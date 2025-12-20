import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { getPrizeForRank } from '@/types';
import {
  Trophy,
  Gamepad2,
  Calendar,
  Medal,
  Target,
  IndianRupee,
  Clock,
  ChevronRight,
} from 'lucide-react';

const MatchHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { matchResults, tournaments, userRegistrations, fetchMatchHistory, fetchUserRegistrations } = useData();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchMatchHistory(user.id);
      fetchUserRegistrations(user.id);
    }
  }, [isAuthenticated, user, fetchMatchHistory, fetchUserRegistrations, navigate]);

  if (!user) {
    return null;
  }

  // Get user's match results with tournament info
  const userMatchResults = matchResults
    .filter(r => r.userId === user.id)
    .map(r => ({
      ...r,
      tournament: tournaments.find(t => t.id === r.tournamentId)
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Calculate stats
  const totalMatches = userRegistrations.length;
  const totalResultsIn = userMatchResults.length;
  const topFinishes = userMatchResults.filter(r => r.position <= 10).length;
  const totalEarnings = userMatchResults.reduce((sum, r) => sum + r.prizeAmount, 0);
  const totalKills = userMatchResults.reduce((sum, r) => sum + r.kills, 0);
  const avgKills = totalResultsIn > 0 ? (totalKills / totalResultsIn).toFixed(1) : '0';

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">🥇 1st</Badge>;
    if (position === 2) return <Badge className="bg-gray-400/20 text-gray-300 border-gray-400/30">🥈 2nd</Badge>;
    if (position === 3) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">🥉 3rd</Badge>;
    if (position <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return <Badge variant="outline">#{position}</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-8 md:py-12">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center border-2 border-primary/30">
                <Trophy className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Match History</h1>
                <p className="text-muted-foreground">Your tournament performance and results</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-4 text-center">
                <Gamepad2 className="w-6 h-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-display font-bold">{totalMatches}</div>
                <p className="text-xs text-muted-foreground">Matches Played</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-4 text-center">
                <Medal className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-display font-bold text-yellow-400">{topFinishes}</div>
                <p className="text-xs text-muted-foreground">Top 10 Finishes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-destructive" />
                <div className="text-2xl font-display font-bold">{totalKills}</div>
                <p className="text-xs text-muted-foreground">Total Kills</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-display font-bold">{avgKills}</div>
                <p className="text-xs text-muted-foreground">Avg. Kills/Match</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/80 col-span-2 sm:col-span-1">
              <CardContent className="p-4 text-center">
                <IndianRupee className="w-6 h-6 mx-auto mb-2 text-success" />
                <div className="text-2xl font-display font-bold text-success">₹{totalEarnings}</div>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Match History List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userMatchResults.length > 0 ? (
                <div className="space-y-4">
                  {userMatchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Gamepad2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{result.tournament?.game || 'Unknown'} Tournament</span>
                            {getPositionBadge(result.position)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(result.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {result.kills} kills
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {result.prizeAmount > 0 ? (
                          <div className="text-right">
                            <div className="font-display font-bold text-success text-lg">+₹{result.prizeAmount}</div>
                            <div className="text-xs text-muted-foreground">Prize Won</div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <div className="font-display font-bold text-muted-foreground">₹0</div>
                            <div className="text-xs text-muted-foreground">No Prize</div>
                          </div>
                        )}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">No match results yet</p>
                  <p className="text-sm">Results will appear here after tournaments are completed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MatchHistoryPage;