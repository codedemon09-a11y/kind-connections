import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import {
  Users,
  Gamepad2,
  CreditCard,
  Trophy,
  TrendingUp,
  ChevronRight,
  Clock,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { tournaments, allUsers, withdrawalRequests, fetchTournaments, fetchAllUsers, fetchWithdrawalRequests } = useData();

  useEffect(() => {
    fetchTournaments();
    fetchAllUsers();
    fetchWithdrawalRequests();
  }, [fetchTournaments, fetchAllUsers, fetchWithdrawalRequests]);

  const activeTournaments = tournaments.filter(t => t.status === 'UPCOMING' || t.status === 'LIVE');
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'PENDING');

  const stats = [
    {
      label: 'Total Users',
      value: allUsers.length,
      icon: Users,
      color: 'primary',
      href: '/admin/users',
    },
    {
      label: 'Active Tournaments',
      value: activeTournaments.length,
      icon: Gamepad2,
      color: 'success',
      href: '/admin/tournaments',
    },
    {
      label: 'Pending Withdrawals',
      value: pendingWithdrawals.length,
      icon: CreditCard,
      color: 'warning',
      href: '/admin/withdrawals',
    },
    {
      label: 'Total Tournaments',
      value: tournaments.length,
      icon: Trophy,
      color: 'primary',
      href: '/admin/tournaments',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your tournament platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:border-primary/30 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-${stat.color}/20 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}`} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-3xl font-display font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tournaments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Tournaments</CardTitle>
            <Link to="/admin/tournaments">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tournaments.slice(0, 5).map((tournament) => (
                <div
                  key={tournament.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      tournament.status === 'LIVE' ? 'bg-success animate-pulse' :
                      tournament.status === 'UPCOMING' ? 'bg-primary' :
                      'bg-muted'
                    }`} />
                    <div>
                      <div className="font-medium text-sm">{tournament.game} Solo</div>
                      <div className="text-xs text-muted-foreground">
                        ₹{tournament.entryFee} • {tournament.registeredCount || 0}/{tournament.maxPlayers}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                    {tournament.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Withdrawals</CardTitle>
            <Link to="/admin/withdrawals">
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingWithdrawals.length > 0 ? (
              <div className="space-y-3">
                {pendingWithdrawals.slice(0, 5).map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-warning" />
                      <div>
                        <div className="font-medium text-sm">₹{withdrawal.amount}</div>
                        <div className="text-xs text-muted-foreground">{withdrawal.upiId}</div>
                      </div>
                    </div>
                    <Link to="/admin/withdrawals">
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No pending withdrawals</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
