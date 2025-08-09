import React, { useState } from 'react';
import { GroupMember } from '../../../lib/membershipUtils';

interface LeagueTeam {
  id: string;
  name: string;
  psnId: string;
}

interface TeamManagerProps {
  leagueName: string;
  teams: LeagueTeam[];
  availableMembers: GroupMember[];
  onAddTeam: (memberId: string) => void;
  onRemoveTeam: (teamId: string) => void;
  isLoading: boolean;
}

export default function TeamManager({ 
  leagueName, 
  teams, 
  availableMembers, 
  onAddTeam, 
  onRemoveTeam,
  isLoading 
}: TeamManagerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const handleAddTeam = () => {
    if (!selectedMemberId) return;
    
    onAddTeam(selectedMemberId);
    setSelectedMemberId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">League Teams ({teams.length})</h3>
        <p className="text-sm text-gray-600 mt-1">Managing teams for "{leagueName}"</p>
      </div>
      
      {/* Add Team Section - Tournament Style */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-bold text-gray-800 mb-4">➕ Add New Team</h4>
        <div className="flex gap-3">
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
            disabled={isLoading || availableMembers.length === 0}
          >
            <option value="">
              {availableMembers.length === 0 
                ? "No available members - add members in Players tab" 
                : "Select a member..."}
            </option>
            {availableMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} {member.psnId && member.psnId !== member.name ? `(${member.psnId})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddTeam}
            disabled={isLoading || !selectedMemberId}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isLoading ? 'Adding...' : 'Add Member'}
          </button>
        </div>
        {availableMembers.length === 0 && (
          <p className="text-sm text-orange-600 mt-3 font-medium">
            💡 Tip: Go to the Players tab to add members first, then come back here to add them to the league.
          </p>
        )}
      </div>

      {/* Teams List */}
      {teams.length > 0 ? (
        <div className="space-y-3">
          {teams.map((team, index) => (
            <div 
              key={team.id} 
              className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Team Number */}
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>
                  
                  {/* Team Info */}
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{team.name}</div>
                    {team.psnId && team.psnId !== team.name && (
                      <div className="text-sm text-gray-600">PSN: {team.psnId}</div>
                    )}
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => onRemoveTeam(team.id)}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300 font-medium text-sm disabled:opacity-50"
                  title="Remove from league"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-6xl mb-4">👥</div>
          <h4 className="text-xl font-bold text-gray-800 mb-2">No Teams Added</h4>
          <p className="text-gray-600">Add teams to get started with your league.</p>
        </div>
      )}

      {/* Match Recording Section */}
      {teams.length >= 2 && (
        <div className="border-t pt-6 mt-6">
          <h4 className="font-bold text-gray-800 mb-4">⚽ Quick Match Recording</h4>
          <div className="bg-green-50 p-6 rounded-xl border border-green-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100">
                <option>Select Home Team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              
              <div className="flex items-center justify-center gap-2">
                <input 
                  type="number" 
                  min="0" 
                  className="w-16 text-center text-xl font-bold border-2 border-gray-200 px-2 py-3 rounded-lg" 
                  placeholder="0" 
                />
                <span className="text-xl font-bold text-gray-600">-</span>
                <input 
                  type="number" 
                  min="0" 
                  className="w-16 text-center text-xl font-bold border-2 border-gray-200 px-2 py-3 rounded-lg" 
                  placeholder="0" 
                />
              </div>
              
              <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100">
                <option>Select Away Team...</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              Record Match Result
            </button>
          </div>
        </div>
      )}
    </div>
  );
}