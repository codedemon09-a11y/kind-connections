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
  ChevronRight 
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

  const getStatusBadge = () => {
    switch (tournament.status) {
      case 'UPCOMING':
        return <Badge variant="upcoming">Upcoming</Badge>;
      case 'LIVE':
        return <Badge variant="live">● Live</Badge>;
      case 'COMPLETED':
        return <Badge variant="completed">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="cancelled">Cancelled</Badge>;
    }
  };

  const getGameBadge = () => {
    return tournament.game === 'BGMI' 
      ? <Badge variant="bgmi">BGMI</Badge>
      : <Badge variant="freefire">Free Fire</Badge>;
  };

  return (
    <Card className="group overflow-hidden hover:border-primary/50 transition-all duration-300">
      <CardContent className="p-0">
        {/* Header with game and status */}
        <div className="p-4 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getGameBadge()}
            {getStatusBadge()}
          </div>
          {isRegistered && (
            <Badge variant="success" className="text-xs">Joined</Badge>
          )}
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {tournament.game} Solo Tournament
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {format(new Date(tournament.matchDateTime), 'MMM dd, yyyy • hh:mm a')}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <IndianRupee className="w-3 h-3" />
                Entry Fee
              </div>
              <div className="font-display font-bold text-lg text-foreground">
                ₹{tournament.entryFee}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 text-primary text-xs mb-1">
                <Trophy className="w-3 h-3" />
                Prize Pool
              </div>
              <div className="font-display font-bold text-lg text-primary">
                ₹{totalPrizePool}
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
              <span className={`font-medium ${spotsLeft <= 10 ? 'text-warning' : 'text-muted-foreground'}`}>
                {spotsLeft} spots left
              </span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                style={{ width: `${fillPercentage}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <Link to={`/tournament/${tournament.id}`}>
            <Button 
              className="w-full group/btn" 
              variant={tournament.status === 'UPCOMING' ? 'default' : 'outline'}
              disabled={tournament.status === 'CANCELLED'}
            >
              {tournament.status === 'UPCOMING' ? (
                isRegistered ? 'View Details' : 'Join Now'
              ) : (
                'View Details'
              )}
              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentCard;
