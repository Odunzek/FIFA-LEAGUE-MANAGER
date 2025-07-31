"use client";

import React, { useEffect, useState } from "react";
import AddTeamForm from "./AddTeamForm";
import MatchResultForm from "./MatchResultForm";
import Link from "next/link";

// Define the Team type
type Team = {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  color?: string;
};

// Props interface to receive the selected league name
interface LeagueTableProps {
  leagueName: string;
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-500 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    <div className="flex items-center space-x-3">
      <span className="text-xl">{type === 'success' ? '✅' : '❌'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">×</button>
    </div>
  </div>
);

// Enhanced loading skeleton
const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-xl overflow-hidden">
    <div className="bg-gradient-to-r from-gray-200 to-gray-300 px-6 py-4">
      <div className="h-6 bg-white bg-opacity-30 rounded w-48"></div>
    </div>
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
          <div className="flex-1 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-4 bg-gray-200 rounded"></div>
          <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function LeagueTable({ leagueName }: LeagueTableProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState<'table' | 'add-team' | 'add-match'>('table');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previousPositions, setPreviousPositions] = useState<{[key: string]: number}>({});

  // Team colors palette
  const teamColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
  ];

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load teams from localStorage when leagueName changes
  useEffect(() => {
    if (typeof window !== "undefined" && leagueName) {
      const key = `league_${leagueName}_teams`;
      const stored = localStorage.getItem(key);
      const loadedTeams = stored ? JSON.parse(stored) : [];
      
      // Store previous positions for animation
      const positions: {[key: string]: number} = {};
      loadedTeams.forEach((team: Team, index: number) => {
        positions[team.name] = index + 1;
      });
      setPreviousPositions(positions);
      
      setTeams(loadedTeams);
      setIsLoaded(true);
    } else {
      setIsLoaded(true);
    }
  }, [leagueName]);

  // Save teams to localStorage only AFTER initial load
  useEffect(() => {
    if (typeof window !== "undefined" && leagueName && isLoaded) {
      const key = `league_${leagueName}_teams`;
      localStorage.setItem(key, JSON.stringify(teams));
    }
  }, [teams, leagueName, isLoaded]);

  // Handle adding a new team
  const handleAddTeam = (newTeam: Team) => {
    const teamWithColor = {
      ...newTeam,
      color: teamColors[teams.length % teamColors.length]
    };
    setTeams((prev) => [...prev, teamWithColor]);
    setActiveTab('table');
    showToast(`${newTeam.name} added successfully!`, 'success');
  };

  // Handle match results (update scores and stats)
  const handleMatchSubmit = (data: {
    team1: string;
    team2: string;
    score1: number;
    score2: number;
  }) => {
    const { team1, team2, score1, score2 } = data;
    
    const updatedTeams = teams.map((team) => {
      if (team.name !== team1 && team.name !== team2) return team;

      const isTeam1 = team.name === team1;
      const goalsFor = isTeam1 ? score1 : score2;
      const goalsAgainst = isTeam1 ? score2 : score1;
      const isWin = goalsFor > goalsAgainst;
      const isDraw = goalsFor === goalsAgainst;

      return {
        ...team,
        played: team.played + 1,
        won: team.won + (isWin ? 1 : 0),
        drawn: team.drawn + (isDraw ? 1 : 0),
        lost: team.lost + (!isWin && !isDraw ? 1 : 0),
        gf: team.gf + goalsFor,
        ga: team.ga + goalsAgainst,
        points: team.points + (isWin ? 3 : isDraw ? 1 : 0),
      };
    });

    setTeams(updatedTeams);
    setActiveTab('table');

    // Save match result to match history
    if (typeof window !== "undefined") {
      const matchKey = `league_${leagueName}_history`;
      const history = localStorage.getItem(matchKey);
      const parsedHistory = history ? JSON.parse(history) : [];
      const newMatch = {
        team1,
        team2,
        score1,
        score2,
        date: new Date().toISOString(),
      };
      localStorage.setItem(matchKey, JSON.stringify([...parsedHistory, newMatch]));
    }

    const result = score1 === score2 ? 'Draw' : 
                  score1 > score2 ? `${team1} wins` : `${team2} wins`;
    showToast(`Match result recorded: ${result}`, 'success');
  };

  // Handle clearing/deleting the entire league
  const handleClearLeague = () => {
    if (typeof window !== "undefined" && leagueName) {
      const teamsKey = `league_${leagueName}_teams`;
      localStorage.removeItem(teamsKey);
      
      const historyKey = `league_${leagueName}_history`;
      localStorage.removeItem(historyKey);
      
      setTeams([]);
      setShowDeleteConfirm(false);
      setActiveTab('table');
      showToast('League data cleared successfully', 'success');
    }
  };

  const sortedTeams = teams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const goalDiffA = a.gf - a.ga;
    const goalDiffB = b.gf - b.ga;
    if (goalDiffB !== goalDiffA) return goalDiffB - goalDiffA;
    return b.gf - a.gf;
  });

  // Get position change indicator
  const getPositionChange = (teamName: string, currentPos: number) => {
    const prevPos = previousPositions[teamName];
    if (!prevPos || prevPos === currentPos) return null;
    
    if (prevPos > currentPos) {
      return <span className="text-green-500 text-xs ml-1">↗</span>;
    } else {
      return <span className="text-red-500 text-xs ml-1">↘</span>;
    }
  };

  // Calculate win percentage for progress bar
  const getWinPercentage = (team: Team) => {
    if (team.played === 0) return 0;
    return (team.won / team.played) * 100;
  };

  // Show loading state until data is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="w-24 h-1 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
          <TableSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center relative">
          <div className="relative">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
              {leagueName || "League"} Table
            </h1>
            <div className="absolute -top-2 -right-2">
              <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping"></div>
              <div className="absolute top-0 right-0 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"></div>
            </div>
          </div>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full mb-4"></div>
          
          {/* Clear League Button */}
          {teams.length > 0 && (
            <div className="absolute top-0 right-0">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Clear all teams and match history"
              >
                <span className="flex items-center space-x-2">
                  <span className="group-hover:rotate-12 transition-transform duration-300">🗑️</span>
                  <span>Clear League</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-2 flex space-x-2 border border-white/20">
            {[
              { id: 'table', label: 'League Table', icon: '🏆', color: 'blue' },
              { id: 'add-team', label: 'Add Team', icon: '➕', color: 'green' },
              { id: 'add-match', label: 'Add Match', icon: '⚽', color: 'purple' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg scale-105`
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Table Content */}
        {activeTab === 'table' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span className="text-3xl">🏆</span>
                  <span>Current Standings</span>
                </h2>
                {teams.length > 0 && (
                  <div className="text-white/80 text-sm">
                    {teams.length} Teams • {teams.reduce((sum, team) => sum + team.played, 0)} Matches Played
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    {['Pos', 'Team', 'P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Form', 'Pts'].map((header) => (
                      <th key={header} className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sortedTeams.map((team, index) => {
                    const goalDiff = team.gf - team.ga;
                    const position = index + 1;
                    const winPercentage = getWinPercentage(team);
                    
                    return (
                      <tr
                        key={team.name}
                        className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 transform hover:scale-[1.02] ${
                          position === 1 ? 'bg-gradient-to-r from-yellow-50 via-amber-50 to-yellow-100 border-l-4 border-yellow-400' :
                          position <= 4 ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-100 border-l-4 border-green-400' :
                          position >= sortedTeams.length - 4 && sortedTeams.length > 8 ? 'bg-gradient-to-r from-red-50 via-rose-50 to-red-100 border-l-4 border-red-400' : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* Position */}
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shadow-lg ${
                            position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                            position <= 4 ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' :
                            position >= sortedTeams.length - 4 && sortedTeams.length > 8 ? 'bg-gradient-to-r from-red-400 to-red-500 text-white' :
                            'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                          }`}>
                            {position}
                          </div>
                        </td>

                        {/* Team Name */}
                        <td className="px-6 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full shadow-md"
                              style={{ backgroundColor: team.color || '#3B82F6' }}
                            ></div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 flex items-center">
                                {team.name}
                                {getPositionChange(team.name, position)}
                              </div>
                              {team.played > 0 && (
                                <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                                  <div 
                                    className="h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${winPercentage}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm text-gray-700 font-medium">
                          {team.played}
                        </td>
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm font-bold text-green-600">
                          {team.won}
                        </td>
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm font-bold text-yellow-600">
                          {team.drawn}
                        </td>
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm font-bold text-red-600">
                          {team.lost}
                        </td>
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm text-gray-700 font-medium">
                          {team.gf}
                        </td>
                        <td className="px-3 py-6 whitespace-nowrap text-center text-sm text-gray-700 font-medium">
                          {team.ga}
                        </td>
                        <td className={`px-3 py-6 whitespace-nowrap text-center text-sm font-bold ${
                          goalDiff > 0 ? 'text-green-600' : goalDiff < 0 ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {goalDiff > 0 ? '+' : ''}{goalDiff}
                        </td>

                        {/* Form (Win Percentage) */}
                        <td className="px-3 py-6 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center">
                            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  winPercentage >= 70 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                                  winPercentage >= 40 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                                  'bg-gradient-to-r from-red-400 to-red-500'
                                }`}
                                style={{ width: `${winPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Points */}
                        <td className="px-6 py-6 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-md">
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {teams.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-6 py-16 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <div className="text-8xl mb-6 animate-bounce">⚽</div>
                          <p className="text-2xl font-bold text-gray-800 mb-2">No teams added yet</p>
                          <p className="text-gray-600 mb-6">Click "Add Team" to get started and build your league!</p>
                          <button
                            onClick={() => setActiveTab('add-team')}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                          >
                            Add Your First Team
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Footer */}
            {teams.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-6 text-xs text-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md"></div>
                      <span className="font-medium">Champion</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-md"></div>
                      <span className="font-medium">Top 5</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full shadow-md"></div>
                      <span className="font-medium">Bottom 5 (Relegation Zone)</span>
                    </div>
                  </div>
                  <Link
                    href="/match-history"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-bold transition-all duration-300 transform hover:scale-105"
                  >
                    <span>📊</span>
                    <span>View Match History</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Add Team Tab */}
        {activeTab === 'add-team' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span className="text-3xl">➕</span>
                  <span>Add New Team</span>
                </h2>
              </div>
              <div className="p-8">
                <AddTeamForm onAddTeam={handleAddTeam} />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Add Match Tab */}
        {activeTab === 'add-match' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20">
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <span className="text-3xl">⚽</span>
                  <span>Add Match Result</span>
                </h2>
              </div>
              <div className="p-8">
                {teams.length >= 2 ? (
                  <MatchResultForm teams={teams.map((t) => t.name)} onSubmit={handleMatchSubmit} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-6">⚽</div>
                    <p className="text-xl text-gray-700 font-semibold mb-2">Need More Teams</p>
                    <p className="text-gray-600 mb-8">You need at least 2 teams to record a match result.</p>
                    <button
                      onClick={() => setActiveTab('add-team')}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                    >
                      Add Teams First
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <span className="text-3xl animate-pulse">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Clear League Data?
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                This will permanently delete all teams, match results, and history for <strong>"{leagueName}"</strong>. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearLeague}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Clear League
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}