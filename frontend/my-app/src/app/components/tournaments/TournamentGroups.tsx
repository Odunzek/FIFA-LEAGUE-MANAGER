import React, { useState } from 'react';
import { Tournament, TournamentGroup, GroupMatch } from '../../../lib/tournamentUtils';

interface TournamentGroupsProps {
  tournament: Tournament;
  isLoading: boolean;
  isAuthenticated: boolean;
  onRecordMatch: (groupId: string, homeTeam: string, awayTeam: string) => void;
}

export default function TournamentGroups({
  tournament,
  isLoading,
  isAuthenticated,
  onRecordMatch
}: TournamentGroupsProps) {

  if (!tournament.groups || tournament.groups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Groups Generated</h3>
        <p className="text-gray-500">Groups will appear here once generated from the Overview tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-gray-800">Group Stage ({tournament.groups.length} Groups)</h4>
        <div className="text-sm text-gray-600">
          {tournament.groups.reduce((total, group) => 
            total + group.matches.filter(m => m.played).length, 0
          )} / {tournament.groups.reduce((total, group) => 
            total + group.matches.length, 0
          )} matches played
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tournament.groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            onRecordMatch={onRecordMatch}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for each group
function GroupCard({
  group,
  isLoading,
  isAuthenticated,
  onRecordMatch
}: {
  group: TournamentGroup;
  isLoading: boolean;
  isAuthenticated: boolean;
  onRecordMatch: (groupId: string, homeTeam: string, awayTeam: string) => void;
}) {
  
  // Calculate group completion percentage
  const playedMatches = group.matches.filter(m => m.played).length;
  const totalMatches = group.matches.length;
  const completionPercentage = totalMatches > 0 ? (playedMatches / totalMatches) * 100 : 0;
  
  // Sort standings for display
  const sortedStandings = [...group.standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      {/* Group Header */}
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-lg font-bold text-gray-800">{group.name}</h5>
        <div className="text-right">
          <div className="text-sm text-blue-600 font-medium">
            {playedMatches}/{totalMatches} matches
          </div>
          <div className="w-16 bg-blue-200 rounded-full h-1.5 mt-1">
            <div 
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Group Standings */}
      <div className="space-y-2 mb-6">
        <h6 className="text-sm font-semibold text-gray-700 mb-2">Standings</h6>
        {sortedStandings.map((standing, index) => (
          <div key={standing.teamName} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index < 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <span className="font-medium text-gray-900">{standing.teamName}</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <span className="font-bold text-gray-900 min-w-[30px]">{standing.points}pts</span>
              <span className="text-gray-600">{standing.played}P</span>
              <span className="text-green-600">{standing.won}W</span>
              <span className="text-yellow-600">{standing.drawn}D</span>
              <span className="text-red-600">{standing.lost}L</span>
              <span className="text-gray-600">{standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Group Matches */}
      <div className="space-y-2">
        <h6 className="text-sm font-semibold text-gray-700 mb-2">Matches</h6>
        {group.matches.map((match, matchIndex) => (
          <MatchRow
            key={`${match.homeTeam}-${match.awayTeam}-${matchIndex}`}
            match={match}
            groupId={group.id}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            onRecordMatch={onRecordMatch}
          />
        ))}
      </div>
    </div>
  );
}

// Separate component for each match row
function MatchRow({
  match,
  groupId,
  isLoading,
  isAuthenticated,
  onRecordMatch
}: {
  match: GroupMatch;
  groupId: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  onRecordMatch: (groupId: string, homeTeam: string, awayTeam: string) => void;
}) {
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
      match.played 
        ? 'bg-green-50 border border-green-200' 
        : 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100'
    }`}>
      <div className="flex items-center space-x-3 flex-1">
        <span className="font-medium text-gray-900 min-w-[80px]">{match.homeTeam}</span>
        <span className="text-gray-500 text-sm">vs</span>
        <span className="font-medium text-gray-900 min-w-[80px]">{match.awayTeam}</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {match.played ? (
          <div className="flex items-center space-x-2">
            <span className="font-bold text-green-700 text-lg">
              {match.homeScore} - {match.awayScore}
            </span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              ✓ Final
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 text-sm font-medium">Not played</span>
            {isAuthenticated && (
              <button
                onClick={() => onRecordMatch(groupId, match.homeTeam, match.awayTeam)}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Record
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}