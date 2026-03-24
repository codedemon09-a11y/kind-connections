import React, { useEffect, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  Users,
  IndianRupee,
  Trophy,
  Gamepad2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';

const AdminAnalytics: React.FC = () => {
  const { tournaments, allUsers, withdrawalRequests, fetchTournaments, fetchAllUsers } = useData();

  useEffect(() => {
    fetchTournaments();
    fetchAllUsers();
  }, [fetchTournaments, fetchAllUsers]);

  const stats = useMemo(() => {
    const totalRevenue = tournaments.reduce((sum, t) => sum + (t.entryFee * (t.registeredCount || 0)), 0);
    const totalPrizePaid = withdrawalRequests
      .filter(w => w.status === 'APPROVED')
      .reduce((sum, w) => sum + w.amount, 0);
    const totalWalletBalance = allUsers.reduce((sum, u) => sum + u.walletBalance, 0);
    const totalWinningCredits = allUsers.reduce((sum, u) => sum + u.winningCredits, 0);
    const totalRegistrations = tournaments.reduce((sum, t) => sum + (t.registeredCount || 0), 0);
    const completedTournaments = tournaments.filter(t => t.status === 'COMPLETED').length;
    const liveTournaments = tournaments.filter(t => t.status === 'LIVE').length;
    const upcomingTournaments = tournaments.filter(t => t.status === 'UPCOMING').length;

    const gameStats: Record<string, { count: number; players: number; revenue: number }> = {};
    tournaments.forEach(t => {
      if (!gameStats[t.game]) gameStats[t.game] = { count: 0, players: 0, revenue: 0 };
      gameStats[t.game].count++;
      gameStats[t.game].players += t.registeredCount || 0;
      gameStats[t.game].revenue += t.entryFee * (t.registeredCount || 0);
    });

    const modeStats: Record<string, number> = {};
    tournaments.forEach(t => {
      const mode = t.teamMode || 'SOLO';
      modeStats[mode] = (modeStats[mode] || 0) + 1;
    });

    return {
      totalRevenue, totalPrizePaid, totalWalletBalance, totalWinningCredits,
      totalRegistrations, completedTournaments, liveTournaments, upcomingTournaments,
      gameStats, modeStats, profitMargin: totalRevenue - totalPrizePaid,
    };
  }, [tournaments, allUsers, withdrawalRequests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground">Platform performance & revenue insights</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs">Revenue</Badge>
            </div>
            <div className="text-2xl font-display font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total entry fees collected</p>
          </CardContent>
        </Card>

        <Card className="border-success/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <Badge variant="success" className="text-xs">Profit</Badge>
            </div>
            <div className={`text-2xl font-display font-bold ${stats.profitMargin >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{stats.profitMargin.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Revenue - Payouts</p>
          </CardContent>
        </Card>

        <Card className="border-warning/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-warning" />
              </div>
              <Badge variant="warning" className="text-xs">Payouts</Badge>
            </div>
            <div className="text-2xl font-display font-bold">₹{stats.totalPrizePaid.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total withdrawals approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </div>
              <Badge variant="outline" className="text-xs">Platform</Badge>
            </div>
            <div className="text-2xl font-display font-bold">₹{(stats.totalWalletBalance + stats.totalWinningCredits).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total user balances</p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament & User Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{allUsers.length}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-success" />
              <div>
                <div className="text-xl font-bold">{stats.totalRegistrations}</div>
                <div className="text-xs text-muted-foreground">Total Registrations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-5 h-5 text-warning" />
              <div>
                <div className="text-xl font-bold">{stats.liveTournaments}</div>
                <div className="text-xs text-muted-foreground">Live Tournaments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.completedTournaments}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Revenue by Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.gameStats).map(([game, data]) => {
                const maxRevenue = Math.max(...Object.values(stats.gameStats).map(d => d.revenue), 1);
                return (
                  <div key={game} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{game}</span>
                      <span className="text-muted-foreground">₹{data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{data.count} tournaments</span>
                      <span>{data.players} players</span>
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.gameStats).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No tournament data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Mode Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.modeStats).map(([mode, count]) => {
                const total = tournaments.length || 1;
                return (
                  <div key={mode} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{mode}</span>
                      <span className="text-muted-foreground">{count} ({Math.round((count / total) * 100)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                        style={{ width: `${(count / total) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(stats.modeStats).length === 0 && (
                <p className="text-center text-muted-foreground py-4">No mode data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
