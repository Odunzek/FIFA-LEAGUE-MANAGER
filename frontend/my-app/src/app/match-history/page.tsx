"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Match = {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
};

export default function MatchHistory() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentLeague, setCurrentLeague] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [filter, setFilter] = useState<"all" | "recent" | "team">("all");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [allTeams, setAllTeams] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const leagueName = localStorage.getItem("currentLeagueName") || "";
      setCurrentLeague(leagueName);

      if (leagueName) {
        // Load match history
        const historyKey = `league_${leagueName}_history`;
        const history = localStorage.getItem(historyKey);
        const parsedHistory = history ? JSON.parse(history) : [];
        
        // Sort by date (newest first)
        const sortedMatches = parsedHistory.sort((a: Match, b: Match) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setMatches(sortedMatches);

        // Get all unique teams
        const teams = new Set<string>();
        sortedMatches.forEach((match: Match) => {
          teams.add(match.team1);
          teams.add(match.team2);
        });
        setAllTeams(Array.from(teams).sort());
      }
      
      setIsLoaded(true);
    }
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getMatchResult = (match: Match) => {
    if (match.score1 > match.score2) {
      return { winner: match.team1, loser: match.team2, isDraw: false };
    } else if (match.score2 > match.score1) {
      return { winner: match.team2, loser: match.team1, isDraw: false };
    } else {
      return { winner: "", loser: "", isDraw: true };
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(match.date) >= oneWeekAgo;
    }
    if (filter === "team" && selectedTeam) {
      return match.team1 === selectedTeam || match.team2 === selectedTeam;
    }
    return true;
  });

  const getMatchStats = () => {
    const totalMatches = matches.length;
    const totalGoals = matches.reduce((sum, match) => sum + match.score1 + match.score2, 0);
    const draws = matches.filter(match => match.score1 === match.score2).length;
    const avgGoalsPerMatch = totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : "0";

    return { totalMatches, totalGoals, draws, avgGoalsPerMatch };
  };

  const stats = getMatchStats();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Match History
          </h1>
          {currentLeague && (
            <p className="text-lg text-gray-600 mb-4">
              {currentLeague} League
            </p>
          )}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:bg-gray-50 transition-colors duration-150"
          >
            ← Back to League Table
          </Link>
        </div>

        {matches.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-lg p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">⚽</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matches Yet</h2>
              <p className="text-gray-600 mb-6">
                Start playing matches to see the history here!
              </p>
              <Link
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-150"
              >
                Add First Match
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalMatches}</div>
                <div className="text-sm text-gray-600 font-medium">Total Matches</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalGoals}</div>
                <div className="text-sm text-gray-600 font-medium">Total Goals</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.draws}</div>
                <div className="text-sm text-gray-600 font-medium">Draws</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{stats.avgGoalsPerMatch}</div>
                <div className="text-sm text-gray-600 font-medium">Avg Goals/Match</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Matches</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                      filter === "all" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Matches
                  </button>
                  <button
                    onClick={() => setFilter("recent")}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                      filter === "recent" 
                        ? "bg-green-500 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Last 7 Days
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTeam}
                    onChange={(e) => {
                      setSelectedTeam(e.target.value);
                      setFilter(e.target.value ? "team" : "all");
                    }}
                    className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Filter by team</option>
                    {allTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredMatches.length} of {matches.length} matches
              </div>
            </div>

            {/* Match List */}
            <div className="space-y-4">
              {filteredMatches.map((match, index) => {
                const result = getMatchResult(match);
                return (
                  <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        {/* Match Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-center space-x-4 mb-4">
                            {/* Team 1 */}
                            <div className={`text-right flex-1 ${
                              result.winner === match.team1 ? "text-green-600 font-bold" : 
                              result.isDraw ? "text-yellow-600 font-semibold" : "text-gray-600"
                            }`}>
                              <div className="text-lg font-medium">{match.team1}</div>
                              {result.winner === match.team1 && (
                                <div className="text-xs text-green-500">WINNER</div>
                              )}
                            </div>

                            {/* Score */}
                            <div className="flex items-center space-x-3 px-6 py-3 bg-gray-50 rounded-lg">
                              <span className={`text-2xl font-bold ${
                                match.score1 > match.score2 ? "text-green-600" : 
                                match.score1 === match.score2 ? "text-yellow-600" : "text-gray-600"
                              }`}>
                                {match.score1}
                              </span>
                              <span className="text-gray-400 text-xl">-</span>
                              <span className={`text-2xl font-bold ${
                                match.score2 > match.score1 ? "text-green-600" : 
                                match.score1 === match.score2 ? "text-yellow-600" : "text-gray-600"
                              }`}>
                                {match.score2}
                              </span>
                            </div>

                            {/* Team 2 */}
                            <div className={`text-left flex-1 ${
                              result.winner === match.team2 ? "text-green-600 font-bold" : 
                              result.isDraw ? "text-yellow-600 font-semibold" : "text-gray-600"
                            }`}>
                              <div className="text-lg font-medium">{match.team2}</div>
                              {result.winner === match.team2 && (
                                <div className="text-xs text-green-500">WINNER</div>
                              )}
                            </div>
                          </div>

                          {/* Result Badge */}
                          <div className="flex justify-center mb-4">
                            {result.isDraw ? (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                🤝 Draw
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                🏆 {result.winner} wins
                              </span>
                            )}
                          </div>

                          {/* Date */}
                          <div className="text-center text-sm text-gray-500">
                            📅 {formatDate(match.date)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMatches.length === 0 && filter !== "all" && (
              <div className="text-center py-12">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No matches found</h3>
                  <p className="text-gray-600">Try adjusting your filters to see more results.</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}