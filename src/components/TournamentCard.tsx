import React from 'react';
import { Link } from 'react-router-dom';
import { Tournament, calculateTotalPrizePool } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Trophy, 
  Clock, 
  IndianRupee,
  ChevronRight,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: Tournament;
  isRegistered?: boolean;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, isRegistered }) => {
  const totalPrizePool = calculateTotalPrizePool(tournament.prizeTiers);

  const spotsLeft = tournament.maxPlayers - (tournament.registeredCount || 0);
  const fillPercentage = ((tournament.registeredCount || 0) / tournament.maxPlayers) * 100;
  const isAlmostFull = spotsLeft <= 10;

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'UPCOMING':
        return (
          <Badge variant="upcoming" className="gap-1">
            <Flame className="w-3 h-3" />
            Upcoming
          </Badge>
        );
      case 'LIVE':
        return (
          <Badge variant="live" className="gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live
          </Badge>
        );
      case 'COMPLETED':
        return <Badge variant="completed">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">Cancelled</Badge>;
    }
  };

  const getGameBadge = () => {
    return tournament.game === 'BGMI' 
      ? <Badge variant="bgmi">{tournament.game}</Badge>
      : <Badge variant="freefire">Free Fire</Badge>;
  };

  return (
    <Card className="group overflow-hidden gaming-card border-border/50 hover:border-primary/50 transition-all duration-500 border-glow">
      <CardContent className="p-0">
        {/* Header with game and status */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getGameBadge()}
            {getStatusBadge()}
          </div>
          {isRegistered && (
            <Badge variant="success" className="text-xs gap-1">
              <Sparkles className="w-3 h-3" />
              Joined
            </Badge>
          )}
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
              {tournament.game} Solo Tournament
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary/70" />
              {format(new Date(tournament.matchDateTime), 'MMM dd, yyyy • hh:mm a')}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 group-hover:border-border transition-colors duration-300">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <IndianRupee className="w-3 h-3" />
                Entry Fee
              </div>
              <div className="font-display font-bold text-xl text-foreground">
                ₹{tournament.entryFee}
              </div>
            </div>
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-primary/10 to-neon-pink/10 border border-primary/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-primary/20 rounded-full blur-xl" />
              <div className="relative">
                <div className="flex items-center gap-2 text-primary text-xs mb-1">
                  <Trophy className="w-3 h-3" />
                  Prize Pool
                </div>
                <div className="font-display font-bold text-xl text-primary">
                  ₹{totalPrizePool}
                </div>
              </div>
            </div>
          </div>

          {/* Player Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{tournament.registeredCount || 0} / {tournament.maxPlayers} Players</span>
              </div>
              <span className={`font-medium flex items-center gap-1 ${isAlmostFull ? 'text-warning' : 'text-muted-foreground'}`}>
                {isAlmostFull && <Flame className="w-3 h-3" />}
                {spotsLeft} left
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary via-neon-pink to-primary transition-all duration-700 ease-out"
                style={{ 
                  width: `${fillPercentage}%`,
                  boxShadow: fillPercentage > 50 ? '0 0 10px hsl(var(--primary) / 0.5)' : 'none'
                }}
              />
            </div>
          </div>

          {/* Action Button */}
          <Link to={`/tournaments/${tournament.id}`}>
            <Button 
              className={`w-full gap-2 group/btn transition-all duration-300 ${
                tournament.status === 'UPCOMING' && !isRegistered 
                  ? 'glow-primary hover:glow-primary-intense' 
                  : ''
              }`}
              variant={tournament.status === 'UPCOMING' ? 'default' : 'outline'}
              disabled={tournament.status === 'CANCELLED'}
            >
              {tournament.status === 'UPCOMING' ? (
                isRegistered ? (
                  <>
                    View Details
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Join Now
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </>
                )
              ) : (
                <>
                  View Details
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;