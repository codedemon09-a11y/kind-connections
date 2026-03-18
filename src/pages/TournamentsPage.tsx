import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TournamentCard from '@/components/TournamentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { TournamentStatus, GameType, TeamMode } from '@/types';
import { Search, Gamepad2 } from 'lucide-react';

const TournamentsPage: React.FC = () => {
  const { tournaments, userRegistrations, fetchTournaments, isLoading } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const searchQuery = searchParams.get('search') || '';
  const gameFilter = (searchParams.get('game') as GameType | 'ALL') || 'ALL';
  const statusFilter = (searchParams.get('status') as TournamentStatus | 'ALL') || 'ALL';
  const modeFilter = (searchParams.get('mode') as TeamMode | 'ALL') || 'ALL';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'ALL' || value === '') newParams.delete(key);
    else newParams.set(key, value);
    setSearchParams(newParams);
  };

  useEffect(() => { fetchTournaments(); }, [fetchTournaments]);

  const filteredTournaments = tournaments.filter((tournament) => {
    const matchesSearch = tournament.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = gameFilter === 'ALL' || tournament.game === gameFilter;
    const matchesStatus = statusFilter === 'ALL' || tournament.status === statusFilter;
    const matchesMode = modeFilter === 'ALL' || (tournament.teamMode || 'SOLO') === modeFilter;
    return matchesSearch && matchesGame && matchesStatus && matchesMode;
  });

  const gameOptions: { value: GameType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Games' },
    { value: 'BGMI', label: 'BGMI' },
    { value: 'FREE_FIRE', label: 'Free Fire' },
    { value: 'COD_MOBILE', label: 'COD Mobile' },
  ];

  const statusOptions: { value: TournamentStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Status' },
    { value: 'UPCOMING', label: 'Upcoming' },
    { value: 'LIVE', label: 'Live' },
    { value: 'COMPLETED', label: 'Completed' },
  ];

  const modeOptions: { value: TeamMode | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Modes' },
    { value: 'SOLO', label: 'Solo' },
    { value: 'DUO', label: 'Duo' },
    { value: 'SQUAD', label: 'Squad' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border/50 bg-card/50">
          <div className="container py-6 md:py-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">All Tournaments</h1>
                <p className="text-muted-foreground text-sm">Find and join Solo, Duo & Squad tournaments</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border/50 bg-background sticky top-16 z-40">
          <div className="container py-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tournaments..." value={searchQuery} onChange={(e) => updateFilter('search', e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                {gameOptions.map((option) => (
                  <Button key={option.value} variant={gameFilter === option.value ? 'default' : 'outline'} size="sm" onClick={() => updateFilter('game', option.value)} className="whitespace-nowrap">
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex gap-2 overflow-x-auto">
                {modeOptions.map((option) => (
                  <Badge key={option.value} variant={modeFilter === option.value ? 'default' : 'outline'} className="cursor-pointer hover:bg-primary/20 transition-colors whitespace-nowrap" onClick={() => updateFilter('mode', option.value)}>
                    {option.label}
                  </Badge>
                ))}
              </div>
              <div className="w-px h-6 bg-border hidden sm:block" />
              <div className="flex gap-2 overflow-x-auto">
                {statusOptions.map((option) => (
                  <Badge key={option.value} variant={statusFilter === option.value ? 'default' : 'outline'} className="cursor-pointer hover:bg-primary/20 transition-colors whitespace-nowrap" onClick={() => updateFilter('status', option.value)}>
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 md:py-8">
          <div className="container">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4].map((i) => (<div key={i} className="h-80 rounded-xl bg-card animate-pulse" />))}
              </div>
            ) : filteredTournaments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} isRegistered={userRegistrations.some((r) => r.tournamentId === tournament.id)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">No tournaments found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TournamentsPage;
