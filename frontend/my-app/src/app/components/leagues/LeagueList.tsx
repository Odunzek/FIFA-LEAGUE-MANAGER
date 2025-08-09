import React from 'react';

interface LeagueListProps {
  leagues: string[];
  currentLeague: string;
  onSwitchLeague: (name: string) => void;
  onDeleteRequest: (name: string) => void;
}

export default function LeagueList({ 
  leagues, 
  currentLeague, 
  onSwitchLeague, 
  onDeleteRequest 
}: LeagueListProps) {
  if (leagues.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No leagues created yet. Create your first league above!</p>
    );
  }

  return (
    <ul className="space-y-2">
      {leagues.map((league) => (
        <li key={league} className="flex items-center justify-between bg-gray-50 p-2 rounded">
          <button
            onClick={() => onSwitchLeague(league)}
            className={`px-3 py-1 rounded flex-1 text-left transition-colors ${
              currentLeague === league
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            {league}
            {currentLeague === league && <span className="ml-2 text-xs">(current)</span>}
          </button>
          <button
            onClick={() => onDeleteRequest(league)}
            className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
            title="Delete league permanently"
          >
            🗑️
          </button>
        </li>
      ))}
    </ul>
  );
}