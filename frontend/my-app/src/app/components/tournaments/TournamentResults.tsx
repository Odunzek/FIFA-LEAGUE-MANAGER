import React, { useMemo } from 'react';
import { Tournament } from '../../../lib/tournamentUtils';

interface TournamentResultsProps {
  tournament: Tournament;
}

interface MatchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  type: 'group' | 'knockout';
  groupName?: string;
  round?: string;
  leg?: 'first' | 'second';
  tieInfo?: string;
}

export default function TournamentResults({ tournament }: TournamentResultsProps) {
  
  // Combine all match results from groups and knockout
  const allResults = useMemo(() => {
    const results: MatchResult[] = [];

    // Add group stage results
    if (tournament.groups) {
      tournament.groups.forEach((group) => {
        group.matches
          .filter(match => match.played && match.homeScore !== undefined && match.awayScore !== undefined)
          .forEach((match) => {
            results.push({
              id: `group_${group.id}_${match.homeTeam}_${match.awayTeam}`,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              type: 'group',
              groupName: group.name
            });
          });
      });
    }

    // Add knockout stage results
    if (tournament.knockoutBracket) {
      tournament.knockoutBracket.forEach((tie) => {
        // First leg
        if (tie.firstLeg?.played && tie.firstLeg.homeScore !== undefined && tie.firstLeg.awayScore !== undefined) {
          results.push({
            id: `knockout_${tie.id}_first`,
            homeTeam: tie.firstLeg.homeTeam,
            awayTeam: tie.firstLeg.awayTeam,
            homeScore: tie.firstLeg.homeScore,
            awayScore: tie.firstLeg.awayScore,
            type: 'knockout',
            round: tie.round,
            leg: 'first',
            tieInfo: `${tie.team1} vs ${tie.team2}`
          });
        }

        // Second leg
        if (tie.secondLeg?.played && tie.secondLeg.homeScore !== undefined && tie.secondLeg.awayScore !== undefined) {
          results.push({
            id: `knockout_${tie.id}_second`,
            homeTeam: tie.secondLeg.homeTeam,
            awayTeam: tie.secondLeg.awayTeam,
            homeScore: tie.secondLeg.homeScore,
            awayScore: tie.secondLeg.awayScore,
            type: 'knockout',
            round: tie.round,
            leg: 'second',
            tieInfo: `${tie.team1} vs ${tie.team2}`
          });
        }
      });
    }

    return results;
  }, [tournament.groups, tournament.knockoutBracket]);

  // Group results by type
  const groupResults = allResults.filter(r => r.type === 'group');
  const knockoutResults = allResults.filter(r => r.type === 'knockout');

  if (allResults.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-gray-700 mb-2">No Results Yet</h3>
        <p className="text-gray-500">Match results will appear here once games are played.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-2xl font-bold text-gray-900">Match Results</h4>
        <div className="text-gray-600 font-medium">
          {allResults.length} matches completed
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <div className="text-blue-100 text-sm font-medium">Group Matches</div>
          <div className="text-3xl font-bold">{groupResults.length}</div>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
          <div className="text-orange-100 text-sm font-medium">Knockout Matches</div>
          <div className="text-3xl font-bold">{knockoutResults.length}</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <div className="text-green-100 text-sm font-medium">Total Goals</div>
          <div className="text-3xl font-bold">
            {allResults.reduce((total, match) => total + match.homeScore + match.awayScore, 0)}
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <div className="text-purple-100 text-sm font-medium">Avg Goals/Game</div>
          <div className="text-3xl font-bold">
            {allResults.length > 0 ? 
              (allResults.reduce((total, match) => total + match.homeScore + match.awayScore, 0) / allResults.length).toFixed(1)
              : '0.0'
            }
          </div>
        </div>
      </div>

      {/* Group Stage Results */}
      {groupResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h5 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <span>🏆</span>
            <span>Group Stage Results</span>
            <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
              {groupResults.length} matches
            </span>
          </h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groupResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}

      {/* Knockout Stage Results */}
      {knockoutResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h5 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <span>🥊</span>
            <span>Knockout Stage Results</span>
            <span className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full font-medium">
              {knockoutResults.length} matches
            </span>
          </h5>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {knockoutResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual result card component
function ResultCard({ result }: { result: MatchResult }) {
  const isHomeWin = result.homeScore > result.awayScore;
  const isAwayWin = result.awayScore > result.homeScore;
  const isDraw = result.homeScore === result.awayScore;

  // Define color schemes based on match type and round
  const getCardStyle = () => {
    if (result.type === 'group') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        groupBadge: 'bg-blue-500 text-white'
      };
    }
    
    // Knockout stage colors by round
    switch (result.round) {
      case 'round_16':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          roundBadge: 'bg-purple-500 text-white'
        };
      case 'quarter_final':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          roundBadge: 'bg-orange-500 text-white'
        };
      case 'semi_final':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          roundBadge: 'bg-red-500 text-white'
        };
      case 'final':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-300',
          roundBadge: 'bg-yellow-500 text-white'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          roundBadge: 'bg-gray-500 text-white'
        };
    }
  };

  const cardStyle = getCardStyle();

  return (
    <div className={`${cardStyle.bg} border ${cardStyle.border} rounded-lg p-4 hover:shadow-lg transition-all duration-200`}>
      {/* Match Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {result.type === 'group' && (
            <span className={`${cardStyle.groupBadge} text-xs font-semibold px-3 py-1 rounded-full`}>
              {result.groupName}
            </span>
          )}
          {result.type === 'knockout' && (
            <div className="flex items-center space-x-1">
              <span className={`${cardStyle.roundBadge} text-xs font-semibold px-3 py-1 rounded-full`}>
                {result.round?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className="bg-white border border-gray-300 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                {result.leg === 'first' ? '1st Leg' : '2nd Leg'}
              </span>
            </div>
          )}
        </div>
        
        {/* Result Type Badge */}
        <div className="text-xs font-medium">
          {isHomeWin && <span className="bg-green-500 text-white px-3 py-1 rounded-full">HOME WIN</span>}
          {isAwayWin && <span className="bg-blue-500 text-white px-3 py-1 rounded-full">AWAY WIN</span>}
          {isDraw && <span className="bg-amber-500 text-white px-3 py-1 rounded-full">DRAW</span>}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-center space-x-4">
        {/* Home Team */}
        <div className="flex-1 text-right">
          <div className={`font-semibold text-lg ${isHomeWin ? 'text-green-600' : 'text-gray-800'}`}>
            {result.homeTeam}
          </div>
          <div className="text-xs text-gray-500">HOME</div>
        </div>

        {/* Score Box */}
        <div className={`px-4 py-2 rounded-lg border-2 ${
          isDraw ? 'bg-amber-100 border-amber-300' :
          isHomeWin ? 'bg-green-100 border-green-300' :
          'bg-blue-100 border-blue-300'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`text-2xl font-bold ${
              isDraw ? 'text-amber-700' :
              isHomeWin ? 'text-green-700' : 'text-gray-700'
            }`}>
              {result.homeScore}
            </div>
            <div className="text-gray-400 font-bold text-xl">-</div>
            <div className={`text-2xl font-bold ${
              isDraw ? 'text-amber-700' :
              isAwayWin ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {result.awayScore}
            </div>
          </div>
        </div>

        {/* Away Team */}
        <div className="flex-1 text-left">
          <div className={`font-semibold text-lg ${isAwayWin ? 'text-blue-600' : 'text-gray-800'}`}>
            {result.awayTeam}
          </div>
          <div className="text-xs text-gray-500">AWAY</div>
        </div>
      </div>
    </div>
  );
}