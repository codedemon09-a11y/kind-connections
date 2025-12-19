import React, { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tournament, GameType, TournamentStatus, PrizeTier, calculateTotalPrizePool } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Plus,
  Gamepad2,
  Users,
  Trophy,
  Key,
  Ban,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const AdminTournaments: React.FC = () => {
  const { user } = useAuth();
  const { notifyRoomRelease } = useNotifications();
  const { 
    tournaments, 
    fetchTournaments, 
    createTournament, 
    updateTournamentRoom, 
    updateTournamentStatus,
    isLoading 
  } = useData();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form states
  const [newTournament, setNewTournament] = useState({
    game: 'BGMI' as GameType,
    entryFee: 25,
    maxPlayers: 100,
    winnerCount: 80,
    matchDateTime: '',
    rules: 'Standard rules apply. Mobile devices only. No emulators or hacks allowed.',
  });
  const [prizeTiers, setPrizeTiers] = useState<PrizeTier[]>([
    { rankStart: 1, rankEnd: 5, prizeAmount: 50 },
    { rankStart: 6, rankEnd: 20, prizeAmount: 30 },
    { rankStart: 21, rankEnd: 40, prizeAmount: 20 },
    { rankStart: 41, rankEnd: 80, prizeAmount: 10 },
  ]);
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const handleCreateTournament = async () => {
    if (!newTournament.matchDateTime) {
      toast.error('Please select match date and time');
      return;
    }

    if (prizeTiers.length === 0) {
      toast.error('Please add at least one prize tier');
      return;
    }

    try {
      await createTournament({
        game: newTournament.game,
        entryFee: newTournament.entryFee,
        maxPlayers: newTournament.maxPlayers,
        winnerCount: newTournament.winnerCount,
        prizeTiers: prizeTiers,
        matchDateTime: new Date(newTournament.matchDateTime),
        status: 'UPCOMING',
        roomId: null,
        roomPassword: null,
        roomReleased: false,
        rules: newTournament.rules,
        createdBy: user!.id,
      });
      toast.success('Tournament created successfully!');
      setCreateDialogOpen(false);
      setNewTournament({
        game: 'BGMI',
        entryFee: 25,
        maxPlayers: 100,
        winnerCount: 80,
        matchDateTime: '',
        rules: 'Standard rules apply. Mobile devices only. No emulators or hacks allowed.',
      });
      setPrizeTiers([
        { rankStart: 1, rankEnd: 5, prizeAmount: 50 },
        { rankStart: 6, rankEnd: 20, prizeAmount: 30 },
        { rankStart: 21, rankEnd: 40, prizeAmount: 20 },
        { rankStart: 41, rankEnd: 80, prizeAmount: 10 },
      ]);
    } catch (error) {
      toast.error('Failed to create tournament');
    }
  };

  const handleReleaseRoom = async () => {
    if (!selectedTournament || !roomId || !roomPassword) {
      toast.error('Please enter Room ID and Password');
      return;
    }

    try {
      await updateTournamentRoom(selectedTournament.id, roomId, roomPassword);
      
      // Trigger push notification for room release
      notifyRoomRelease(
        `${selectedTournament.game} Tournament`,
        roomId
      );
      
      toast.success('Room details released! Players have been notified.');
      setRoomDialogOpen(false);
      setRoomId('');
      setRoomPassword('');
      setSelectedTournament(null);
    } catch (error) {
      toast.error('Failed to release room details');
    }
  };

  const handleStatusChange = async (tournamentId: string, status: TournamentStatus) => {
    try {
      await updateTournamentStatus(tournamentId, status);
      toast.success(`Tournament status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: TournamentStatus) => {
    switch (status) {
      case 'UPCOMING': return 'upcoming';
      case 'LIVE': return 'live';
      case 'COMPLETED': return 'completed';
      case 'CANCELLED': return 'cancelled';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Tournaments</h1>
          <p className="text-muted-foreground">Create and manage tournaments</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4" />
              Create Tournament
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tournament</DialogTitle>
              <DialogDescription>
                Set up a new solo tournament for players to join.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Game</Label>
                <Select
                  value={newTournament.game}
                  onValueChange={(value: GameType) => setNewTournament(prev => ({ ...prev, game: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BGMI">BGMI</SelectItem>
                    <SelectItem value="FREE_FIRE">Free Fire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Fee (₹)</Label>
                  <Input
                    type="number"
                    value={newTournament.entryFee}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                    min={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Players</Label>
                  <Input
                    type="number"
                    value={newTournament.maxPlayers}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, maxPlayers: parseInt(e.target.value) || 0 }))}
                    min={10}
                    max={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Winners Count</Label>
                <Input
                  type="number"
                  value={newTournament.winnerCount}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, winnerCount: parseInt(e.target.value) || 0 }))}
                  min={1}
                  max={newTournament.maxPlayers}
                />
                <p className="text-xs text-muted-foreground">
                  {newTournament.winnerCount} out of {newTournament.maxPlayers} players will win prizes
                </p>
              </div>

              <div className="space-y-2">
                <Label>Match Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={newTournament.matchDateTime}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, matchDateTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Prize Tiers</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {prizeTiers.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
                      <span className="text-xs text-muted-foreground w-20">
                        Rank {tier.rankStart}-{tier.rankEnd}
                      </span>
                      <Input
                        type="number"
                        value={tier.prizeAmount}
                        onChange={(e) => {
                          const updated = [...prizeTiers];
                          updated[index].prizeAmount = parseInt(e.target.value) || 0;
                          setPrizeTiers(updated);
                        }}
                        className="h-8 w-24"
                        min={0}
                      />
                      <span className="text-xs text-muted-foreground">₹</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => setPrizeTiers(prizeTiers.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const lastEnd = prizeTiers.length > 0 ? prizeTiers[prizeTiers.length - 1].rankEnd : 0;
                    setPrizeTiers([...prizeTiers, { rankStart: lastEnd + 1, rankEnd: lastEnd + 10, prizeAmount: 10 }]);
                  }}
                >
                  <Plus className="w-3 h-3" /> Add Tier
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Rules</Label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-border/50 bg-secondary/50 px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  value={newTournament.rules}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, rules: e.target.value }))}
                />
              </div>

              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <div className="font-medium text-primary mb-1">Prize Pool Preview</div>
                <div className="text-muted-foreground">
                  Total Prize Pool: <span className="text-primary font-bold">₹{calculateTotalPrizePool(prizeTiers)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTournament}>
                Create Tournament
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tournaments List */}
      <div className="space-y-4">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <Collapsible
              open={expandedId === tournament.id}
              onOpenChange={(open) => setExpandedId(open ? tournament.id : null)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {tournament.game} Solo Tournament
                          <Badge variant={getStatusColor(tournament.status) as any}>
                            {tournament.status}
                          </Badge>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(tournament.matchDateTime), 'MMM dd, yyyy • hh:mm a')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="font-bold">₹{tournament.entryFee}</div>
                        <div className="text-xs text-muted-foreground">
                          {tournament.registeredCount || 0}/{tournament.maxPlayers} players
                        </div>
                      </div>
                      {expandedId === tournament.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="font-bold">{tournament.registeredCount || 0}</div>
                      <div className="text-xs text-muted-foreground">Registered</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-primary" />
                      <div className="font-bold text-primary">₹{calculateTotalPrizePool(tournament.prizeTiers)}</div>
                      <div className="text-xs text-muted-foreground">Prize Pool</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <Key className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="font-bold">{tournament.roomReleased ? 'Yes' : 'No'}</div>
                      <div className="text-xs text-muted-foreground">Room Released</div>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 text-center">
                      <Ban className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="font-bold">0</div>
                      <div className="text-xs text-muted-foreground">Disqualified</div>
                    </div>
                  </div>

                  {/* Room Details */}
                  {tournament.roomReleased && (
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-success" />
                        <span className="font-medium text-success">Room Details</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Room ID:</span>{' '}
                          <span className="font-mono font-bold">{tournament.roomId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Password:</span>{' '}
                          <span className="font-mono font-bold">{tournament.roomPassword}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {tournament.status === 'UPCOMING' && !tournament.roomReleased && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedTournament(tournament);
                          setRoomDialogOpen(true);
                        }}
                      >
                        <Key className="w-4 h-4" />
                        Release Room
                      </Button>
                    )}
                    
                    {tournament.status === 'UPCOMING' && (
                      <Button
                        variant="success"
                        onClick={() => handleStatusChange(tournament.id, 'LIVE')}
                      >
                        Start Match
                      </Button>
                    )}
                    
                    {tournament.status === 'LIVE' && (
                      <Button
                        onClick={() => handleStatusChange(tournament.id, 'COMPLETED')}
                      >
                        Complete Match
                      </Button>
                    )}
                    
                    {tournament.status === 'UPCOMING' && (
                      <Button
                        variant="destructive"
                        onClick={() => handleStatusChange(tournament.id, 'CANCELLED')}
                      >
                        Cancel Tournament
                      </Button>
                    )}

                    <Button variant="outline">
                      <Eye className="w-4 h-4" />
                      View Players
                    </Button>

                    {tournament.status === 'COMPLETED' && (
                      <Button variant="outline">
                        <Trophy className="w-4 h-4" />
                        Add Results
                      </Button>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Release Room Dialog */}
      <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Room Details</DialogTitle>
            <DialogDescription>
              Enter the room credentials. Players will be able to see these immediately.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Room ID</Label>
              <Input
                placeholder="Enter Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Room Password</Label>
              <Input
                placeholder="Enter Room Password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoomDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseRoom}>
              Release to Players
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTournaments;
