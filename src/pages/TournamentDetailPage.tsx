import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tournament, calculateTotalPrizePool, getPrizeForRank } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Trophy,
  Users,
  Clock,
  IndianRupee,
  Shield,
  AlertTriangle,
  Copy,
  CheckCircle,
  Lock,
  ArrowLeft,
  Gamepad2,
} from 'lucide-react';

const TournamentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { tournaments, userRegistrations, joinTournament } = useData();
  
  const [isJoining, setIsJoining] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const tournament = tournaments.find((t) => t.id === id);
  const registration = userRegistrations.find((r) => r.tournamentId === id);
  const isRegistered = !!registration;

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-display font-bold mb-4">Tournament Not Found</h1>
          <p className="text-muted-foreground mb-6">The tournament you're looking for doesn't exist.</p>
          <Link to="/tournaments">
            <Button>
              <ArrowLeft className="w-4 h-4" />
              Back to Tournaments
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const totalPrizePool = calculateTotalPrizePool(tournament.prizeTiers);

  const spotsLeft = tournament.maxPlayers - (tournament.registeredCount || 0);
  const fillPercentage = ((tournament.registeredCount || 0) / tournament.maxPlayers) * 100;

  const handleJoin = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to join tournaments');
      navigate('/login');
      return;
    }

    if (user?.isBanned) {
      toast.error('Your account is banned. Contact support.');
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinTournament(tournament.id, user!.id);
      toast.success(
        <div className="space-y-1">
          <div className="font-semibold">🎉 Payment Successful!</div>
          <div className="text-sm">Entry fee: ₹{tournament.entryFee} paid</div>
          <div className="text-sm">Your slot number: #{result.slotNumber}</div>
          <div className="text-xs text-muted-foreground">Transaction ID: {result.paymentId}</div>
        </div>,
        { duration: 5000 }
      );
    } catch (error) {
      toast.error('Failed to join tournament. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard!');
  };

  const rules = [
    'No emulators allowed (mobile only)',
    'No hacking / mod / third-party tools',
    'No teaming in solo matches',
    'Screenshot or screen recording may be required',
    'Admin decision is final',
    'Cheating results in disqualification, no refund, and account ban',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Back Link */}
        <div className="container py-4">
          <Link to="/tournaments" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Tournaments
          </Link>
        </div>

        {/* Tournament Header */}
        <section className="border-b border-border/50">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={tournament.game === 'BGMI' ? 'bgmi' : 'freefire'}>
                    {tournament.game}
                  </Badge>
                  <Badge variant={tournament.status.toLowerCase() as any}>
                    {tournament.status === 'LIVE' && '● '}{tournament.status}
                  </Badge>
                  {isRegistered && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Joined
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold">
                  {tournament.game} Solo Tournament
                </h1>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span className="text-lg">
                    {format(new Date(tournament.matchDateTime), 'EEEE, MMM dd, yyyy • hh:mm a')}
                  </span>
                </div>
              </div>

              {/* Join Button */}
              <div className="flex-shrink-0">
                {tournament.status === 'UPCOMING' && !isRegistered && (
                  <Button 
                    size="xl" 
                    onClick={handleJoin}
                    disabled={isJoining || spotsLeft <= 0}
                    className="w-full md:w-auto"
                  >
                    {isJoining ? (
                      'Processing...'
                    ) : spotsLeft <= 0 ? (
                      'Tournament Full'
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5" />
                        Pay ₹{tournament.entryFee} & Join
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Details (if released and registered) */}
              {isRegistered && tournament.roomReleased && (
                <Card className="border-success/30 bg-success/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-success">
                      <Gamepad2 className="w-5 h-5" />
                      Room Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Your slot number: <span className="font-bold text-foreground">#{registration?.slotNumber}</span>
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Room ID</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg">{tournament.roomId}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(tournament.roomId!, 'roomId')}
                          >
                            {copiedField === 'roomId' ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                        <div className="text-xs text-muted-foreground mb-1">Room Password</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-lg">{tournament.roomPassword}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyToClipboard(tournament.roomPassword!, 'password')}
                          >
                            {copiedField === 'password' ? (
                              <CheckCircle className="w-4 h-4 text-success" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Registered Successfully Card */}
              {isRegistered && (
                <Card className="border-success/30 bg-success/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-success">You're Registered!</h3>
                        <p className="text-sm text-muted-foreground">
                          Slot #{registration?.slotNumber} • Payment completed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Not Released Yet */}
              {isRegistered && !tournament.roomReleased && (
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Room details not released yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Room ID & Password will appear here before match time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rules */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Anti-Cheat Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Match Rules */}
              <Card>
                <CardHeader>
                  <CardTitle>Match Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{tournament.rules}</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Prize Pool Card */}
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Prize Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-6 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="text-4xl font-display font-bold text-primary">
                      ₹{totalPrizePool}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">Total Prize Pool</div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entry Fee</span>
                      <span className="font-medium">₹{tournament.entryFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Players</span>
                      <span className="font-medium">{tournament.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Winners</span>
                      <span className="font-medium">{tournament.winnerCount} players</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div className="text-xs text-muted-foreground font-medium uppercase">Prize Tiers</div>
                    {tournament.prizeTiers.map((tier, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 rounded bg-secondary/30">
                        <span className="text-muted-foreground">
                          Rank {tier.rankStart}-{tier.rankEnd}
                        </span>
                        <span className="font-medium text-success">₹{tier.prizeAmount}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Players Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Registered</span>
                    <span className="font-bold text-lg">
                      {tournament.registeredCount || 0} / {tournament.maxPlayers}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>
                    <div className={`text-sm text-right font-medium ${spotsLeft <= 10 ? 'text-warning' : 'text-muted-foreground'}`}>
                      {spotsLeft} spots remaining
                    </div>
                  </div>
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

export default TournamentDetailPage;
