import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TournamentCard from '@/components/TournamentCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { 
  Gamepad2, 
  Trophy, 
  Shield, 
  Users,
  ChevronRight,
  Zap,
  Target,
  Award
} from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { tournaments, userRegistrations, fetchTournaments } = useData();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const upcomingTournaments = tournaments.filter(t => t.status === 'UPCOMING').slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden hero-gradient">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          </div>
          
          <div className="container relative py-20 md:py-32">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <Badge variant="outline" className="px-4 py-2 text-sm border-primary/30 text-primary">
                <Zap className="w-4 h-4 mr-2" />
                India's Trusted Esports Platform
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight">
                <span className="text-foreground">Compete.</span>{' '}
                <span className="text-gradient">Win.</span>{' '}
                <span className="text-foreground">Dominate.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Join skill-based BGMI & Free Fire tournaments. Play solo, prove your skills, and win real prizes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/tournaments">
                  <Button size="xl" className="w-full sm:w-auto animate-pulse-glow">
                    <Gamepad2 className="w-5 h-5" />
                    Browse Tournaments
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/login">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 border-t border-border/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Why Choose <span className="text-gradient">BattleArena</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Built by gamers, for gamers. Experience fair play and transparent prize distribution.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:glow-primary transition-all duration-300">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Transparent Prize Pools</h3>
                <p className="text-sm text-muted-foreground">
                  ₹16 per player goes directly to prize pool. No hidden charges, what you see is what winners get.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:glow-primary transition-all duration-300">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Anti-Cheat Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Strict rules against emulators, hacks, and teaming. Fair play is our priority.
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:glow-primary transition-all duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Instant Room Details</h3>
                <p className="text-sm text-muted-foreground">
                  Get room ID and password directly on the platform. No WhatsApp groups, no spam.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments */}
        <section className="py-16 md:py-24 bg-secondary/20 border-t border-border/50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
                  Upcoming Tournaments
                </h2>
                <p className="text-muted-foreground">Join now before slots fill up</p>
              </div>
              <Link to="/tournaments">
                <Button variant="outline" className="hidden sm:flex">
                  View All
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard 
                  key={tournament.id} 
                  tournament={tournament}
                  isRegistered={userRegistrations.some(r => r.tournamentId === tournament.id)}
                />
              ))}
            </div>
            
            <Link to="/tournaments" className="sm:hidden mt-6 block">
              <Button variant="outline" className="w-full">
                View All Tournaments
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Supported Games */}
        <section className="py-16 md:py-24 border-t border-border/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Supported Games
              </h2>
              <p className="text-muted-foreground">Solo tournaments only • Mobile devices required</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-8 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center group hover:border-amber-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="font-display font-bold text-xl text-amber-400 mb-2">BGMI</h3>
                <p className="text-sm text-muted-foreground">Battlegrounds Mobile India</p>
                <Badge variant="bgmi" className="mt-4">Solo Mode</Badge>
              </div>
              
              <div className="p-8 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 text-center group hover:border-orange-500/40 transition-all duration-300">
                <div className="w-16 h-16 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-orange-400" />
                </div>
                <h3 className="font-display font-bold text-xl text-orange-400 mb-2">Free Fire</h3>
                <p className="text-sm text-muted-foreground">Garena Free Fire</p>
                <Badge variant="freefire" className="mt-4">Solo Mode</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24 bg-primary/5 border-t border-border/50">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Tournaments Hosted</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Active Players</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">₹5L+</div>
                <div className="text-sm text-muted-foreground">Prize Distributed</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">99%</div>
                <div className="text-sm text-muted-foreground">Fair Play Rate</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
