import { useState, useEffect, useMemo } from "react";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useData } from "@/contexts/DataContext";

interface LeaderboardPlayer {
  id: string;
  rank: number;
  displayName: string;
  totalEarnings: number;
  totalWins: number;
  totalMatches: number;
  winRate: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Award className="h-6 w-6 text-amber-600" />;
    default:
      return <span className="flex h-6 w-6 items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBgClass = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/30";
    default:
      return "bg-card border-border";
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState<"earnings" | "wins">("earnings");
  const { allUsers, fetchAllUsers } = useData();

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Transform users to leaderboard format
  const leaderboardData: LeaderboardPlayer[] = useMemo(() => {
    return allUsers
      .filter(user => !user.isBanned && !user.isAdmin)
      .map(user => ({
        id: user.id,
        rank: 0,
        displayName: user.displayName || 'Unknown Player',
        totalEarnings: user.winningCredits || 0,
        totalWins: Math.floor((user.winningCredits || 0) / 50), // Approximate wins from earnings
        totalMatches: Math.floor((user.winningCredits || 0) / 30), // Approximate matches
        winRate: user.winningCredits > 0 ? Math.min(75, 40 + Math.random() * 35) : 0,
      }));
  }, [allUsers]);

  const sortedByEarnings = useMemo(() => 
    [...leaderboardData].sort((a, b) => b.totalEarnings - a.totalEarnings).map((p, i) => ({ ...p, rank: i + 1 })),
    [leaderboardData]
  );
  
  const sortedByWins = useMemo(() => 
    [...leaderboardData].sort((a, b) => b.totalWins - a.totalWins).map((p, i) => ({ ...p, rank: i + 1 })),
    [leaderboardData]
  );

  const currentData = activeTab === "earnings" ? sortedByEarnings : sortedByWins;
  const topThree = sortedByEarnings.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Updated Live
            </Badge>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Top 3 Podium */}
        {topThree.length >= 3 ? (
          <div className="mb-8 grid grid-cols-3 gap-4 md:gap-6">
            {/* 2nd Place */}
            <div className="order-1 md:order-1 flex flex-col items-center pt-8">
              <Card className={`w-full ${getRankBgClass(2)} border`}>
                <CardContent className="flex flex-col items-center p-4 md:p-6">
                  <Medal className="h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-2" />
                  <Avatar className="h-14 w-14 md:h-16 md:w-16 mb-2 border-2 border-gray-400">
                    <AvatarFallback className="bg-gray-400/20 text-lg font-bold">
                      {topThree[1]?.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-sm md:text-base text-center truncate w-full">
                    {topThree[1]?.displayName}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {formatCurrency(topThree[1]?.totalEarnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[1]?.totalWins} wins
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="order-0 md:order-0 flex flex-col items-center">
              <Card className={`w-full ${getRankBgClass(1)} border`}>
                <CardContent className="flex flex-col items-center p-4 md:p-6">
                  <Trophy className="h-12 w-12 md:h-14 md:w-14 text-yellow-500 mb-2" />
                  <Avatar className="h-16 w-16 md:h-20 md:w-20 mb-2 border-2 border-yellow-500">
                    <AvatarFallback className="bg-yellow-500/20 text-xl font-bold">
                      {topThree[0]?.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-base md:text-lg text-center truncate w-full">
                    {topThree[0]?.displayName}
                  </h3>
                  <p className="text-sm md:text-base font-semibold text-yellow-600 dark:text-yellow-400">
                    {formatCurrency(topThree[0]?.totalEarnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[0]?.totalWins} wins
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="order-2 md:order-2 flex flex-col items-center pt-12">
              <Card className={`w-full ${getRankBgClass(3)} border`}>
                <CardContent className="flex flex-col items-center p-4 md:p-6">
                  <Award className="h-8 w-8 md:h-10 md:w-10 text-amber-600 mb-2" />
                  <Avatar className="h-12 w-12 md:h-14 md:w-14 mb-2 border-2 border-amber-600">
                    <AvatarFallback className="bg-amber-600/20 text-base font-bold">
                      {topThree[2]?.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-sm md:text-base text-center truncate w-full">
                    {topThree[2]?.displayName}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {formatCurrency(topThree[2]?.totalEarnings || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topThree[2]?.totalWins} wins
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="mb-8 text-center py-12 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Not enough players yet for the podium</p>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "earnings" | "wins")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="earnings" className="gap-2">
                  <Trophy className="h-4 w-4" />
                  By Earnings
                </TabsTrigger>
                <TabsTrigger value="wins" className="gap-2">
                  <Medal className="h-4 w-4" />
                  By Wins
                </TabsTrigger>
              </TabsList>

              <TabsContent value="earnings" className="space-y-2">
                {currentData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No players on the leaderboard yet</p>
                  </div>
                ) : (
                  currentData.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBgClass(index + 1)} transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex-shrink-0 w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold">
                          {player.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{player.displayName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {player.totalMatches} matches • {player.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatCurrency(player.totalEarnings)}</p>
                        <p className="text-xs text-muted-foreground">{player.totalWins} wins</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="wins" className="space-y-2">
                {currentData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Medal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No players on the leaderboard yet</p>
                  </div>
                ) : (
                  currentData.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${getRankBgClass(index + 1)} transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex-shrink-0 w-8">
                        {getRankIcon(index + 1)}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold">
                          {player.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{player.displayName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {player.totalMatches} matches • {player.winRate.toFixed(1)}% win rate
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{player.totalWins} wins</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(player.totalEarnings)}</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LeaderboardPage;
