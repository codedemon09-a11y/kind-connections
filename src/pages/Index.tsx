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
  Award,
  Sword,
  Crown,
  Flame,
  Star,
  Sparkles,
  Rocket
} from 'lucide-react';

// Import images
import heroBanner from '@/assets/hero-banner.jpg';
import bgmiGame from '@/assets/bgmi-game.jpg';
import freefireGame from '@/assets/freefire-game.jpg';
import trophyImage from '@/assets/trophy.jpg';

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
        <section className="relative overflow-hidden hero-gradient min-h-[90vh] flex items-center">
          {/* Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={heroBanner} 
              alt="Esports Tournament Arena" 
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 cyber-lines opacity-20" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-[10%] w-96 h-96 bg-primary/40 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-10 right-[10%] w-[500px] h-[500px] bg-accent/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/20 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container relative py-20 md:py-32 lg:py-40 z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/15 border border-primary/40 backdrop-blur-md animate-pulse-glow">
                <Rocket className="w-4 h-4 text-primary animate-bounce-slow" />
                <span className="text-sm font-semibold text-primary">India's #1 Esports Platform</span>
                <Sparkles className="w-4 h-4 text-accent animate-electric" />
              </div>
              
              {/* Main Title */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-bold tracking-tight leading-none">
                <span className="block text-foreground animate-neon-flicker">COMPETE.</span>
                <span className="block text-gradient py-3 animate-electric">WIN.</span>
                <span className="block text-foreground">DOMINATE.</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join skill-based <span className="text-neon-orange font-bold animate-electric">BGMI</span> & <span className="text-primary font-bold animate-electric">Free Fire</span> tournaments. 
                Play solo, prove your skills, and win <span className="text-success font-bold">real prizes</span>.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link to="/tournaments">
                  <Button size="xl" className="w-full sm:w-auto gap-3 text-lg font-bold animate-pulse-glow hover:glow-primary-intense transition-all duration-500 group">
                    <Sword className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    Enter the Arena
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/login">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto gap-2 text-lg border-2 border-primary/60 hover:bg-primary/20 hover:border-primary transition-all duration-300 hover:glow-primary">
                      <Crown className="w-5 h-5" />
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-8 pt-10">
                <div className="flex items-center gap-3 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/30">
                  <div className="w-3 h-3 rounded-full bg-success animate-pulse shadow-lg shadow-success/50" />
                  <span className="text-sm font-medium">500+ Live Matches</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/30">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" style={{ animationDelay: '0.5s' }} />
                  <span className="text-sm font-medium">10K+ Players</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground bg-secondary/50 px-4 py-2 rounded-full backdrop-blur-sm border border-border/30">
                  <div className="w-3 h-3 rounded-full bg-warning animate-pulse shadow-lg shadow-warning/50" style={{ animationDelay: '1s' }} />
                  <span className="text-sm font-medium">₹5L+ Distributed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="container relative">
            <div className="text-center mb-16 animate-slide-up">
              <Badge variant="outline" className="mb-4 px-4 py-2">
                <Star className="w-4 h-4 mr-2 text-warning" />
                Why Choose Us
              </Badge>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Built for <span className="text-gradient">Champions</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Experience fair play, instant payouts, and the most competitive esports environment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Trophy,
                  title: 'Transparent Prizes',
                  description: '₹16 per player goes directly to prize pool. No hidden fees, guaranteed payouts.',
                  color: 'primary',
                  delay: 0
                },
                {
                  icon: Shield,
                  title: 'Anti-Cheat System',
                  description: 'Strict rules against emulators, hacks, and teaming. Fair play guaranteed.',
                  color: 'neon-cyan',
                  delay: 100
                },
                {
                  icon: Zap,
                  title: 'Instant Room IDs',
                  description: 'Get room credentials instantly on the platform. No WhatsApp groups needed.',
                  color: 'neon-pink',
                  delay: 200
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative p-8 rounded-2xl gaming-card border border-border/50 hover:border-primary/50 transition-all duration-500 animate-slide-up border-glow"
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-${feature.color}/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:glow-primary transition-all duration-500`}>
                    <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Tournaments */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background">
          <div className="absolute inset-0 cyber-lines opacity-10" />
          <div className="container relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
              <div className="animate-slide-up">
                <Badge variant="upcoming" className="mb-3">
                  <Flame className="w-3 h-3 mr-1" />
                  Hot Matches
                </Badge>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                  Upcoming <span className="text-gradient">Battles</span>
                </h2>
                <p className="text-muted-foreground">Join now before slots fill up</p>
              </div>
              <Link to="/tournaments" className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <Button variant="outline" className="gap-2 group border-primary/30 hover:bg-primary/10 hover:border-primary/50">
                  View All
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
            
            {upcomingTournaments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {upcomingTournaments.map((tournament, index) => (
                  <div key={tournament.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <TournamentCard 
                      tournament={tournament}
                      isRegistered={userRegistrations.some(r => r.tournamentId === tournament.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 gaming-card rounded-2xl border border-border/50">
                <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming tournaments. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* Supported Games */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="container relative">
            <div className="text-center mb-16 animate-slide-up">
              <Badge variant="outline" className="mb-4 px-4 py-2 animate-electric">
                <Gamepad2 className="w-4 h-4 mr-2 text-primary" />
                Supported Games
              </Badge>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Choose Your <span className="text-gradient">Battlefield</span>
              </h2>
              <p className="text-muted-foreground">Solo tournaments only • Mobile devices required</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* BGMI Card */}
              <div className="group relative rounded-2xl overflow-hidden border border-amber-500/30 hover:border-amber-500/60 transition-all duration-500 animate-slide-up border-glow">
                <div className="absolute inset-0">
                  <img 
                    src={bgmiGame} 
                    alt="BGMI Tournament" 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="relative p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/40 to-orange-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg shadow-amber-500/30 animate-float">
                    <Target className="w-10 h-10 text-amber-400" />
                  </div>
                  <h3 className="font-display font-bold text-3xl text-amber-400 mb-2">BGMI</h3>
                  <p className="text-muted-foreground mb-6">Battlegrounds Mobile India</p>
                  <Badge className="text-base px-5 py-2 bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30">Solo Mode</Badge>
                </div>
              </div>
              
              {/* Free Fire Card */}
              <div className="group relative rounded-2xl overflow-hidden border border-orange-500/30 hover:border-orange-500/60 transition-all duration-500 animate-slide-up border-glow" style={{ animationDelay: '100ms' }}>
                <div className="absolute inset-0">
                  <img 
                    src={freefireGame} 
                    alt="Free Fire Tournament" 
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                </div>
                <div className="relative p-10 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/40 to-red-500/30 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-lg shadow-orange-500/30 animate-float" style={{ animationDelay: '0.5s' }}>
                    <Flame className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="font-display font-bold text-3xl text-orange-400 mb-2">Free Fire</h3>
                  <p className="text-muted-foreground mb-6">Garena Free Fire</p>
                  <Badge className="text-base px-5 py-2 bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30">Solo Mode</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-pink/5 to-neon-cyan/5" />
          <div className="container relative">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '500+', label: 'Tournaments', icon: Trophy, color: 'primary' },
                { value: '10K+', label: 'Players', icon: Users, color: 'neon-cyan' },
                { value: '₹5L+', label: 'Distributed', icon: Zap, color: 'success' },
                { value: '99%', label: 'Fair Play', icon: Shield, color: 'warning' }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-2xl gaming-card border border-border/50 hover:border-primary/30 transition-all duration-300 animate-slide-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <stat.icon className={`w-8 h-8 text-${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <div className={`text-3xl md:text-4xl font-display font-bold text-${stat.color} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 cyber-lines opacity-10" />
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center space-y-8 animate-slide-up">
              <h2 className="text-3xl md:text-5xl font-display font-bold">
                Ready to <span className="text-gradient">Dominate</span>?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of players competing for glory and real prizes.
              </p>
              <Link to={isAuthenticated ? "/tournaments" : "/login"}>
                <Button size="xl" className="gap-3 text-lg animate-pulse-glow hover:glow-primary-intense">
                  <Flame className="w-5 h-5" />
                  {isAuthenticated ? "Find Matches" : "Start Playing Now"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;