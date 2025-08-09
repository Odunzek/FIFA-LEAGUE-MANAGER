"use client";

import { useState, useEffect } from "react";
<<<<<<< HEAD
import { 
  getGroupMembers, 
  GroupMember,
  subscribeToGroupMembers  // Use real-time subscription like Tournament Manager
} from "../../lib/membershipUtils";
import LeagueCreator from './leagues/LeagueCreator';
import LeagueList from './leagues/LeagueList';
import TeamManager from './leagues/TeamManager';
import DeleteConfirmModal from './leagues/DeleteConfirmModal';

interface LeagueTeam {
  id: string;
  name: string;
  psnId: string;
}

export default function LeagueManager() {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [currentLeague, setCurrentLeague] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [leagueTeams, setLeagueTeams] = useState<LeagueTeam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load leagues from localStorage
=======

export default function LeagueManager() {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [newLeague, setNewLeague] = useState("");
  const [currentLeague, setCurrentLeague] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load leagues and current league on first render
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe
  useEffect(() => {
    const storedLeagues = JSON.parse(localStorage.getItem("leagueList") || "[]");
    const activeLeague = localStorage.getItem("currentLeagueName") || "";

    setLeagues(storedLeagues);
    setCurrentLeague(activeLeague);
<<<<<<< HEAD
    setIsLoaded(true);
  }, []);

  // Subscribe to real-time member updates - EXACTLY LIKE TOURNAMENT MANAGER
  useEffect(() => {
    const loadData = async () => {
      // First load members immediately
      const loadedMembers = await getGroupMembers();
      setMembers(loadedMembers.filter(m => m.isActive));
    };

    loadData();
    
    // Then setup real-time listener for updates
    const unsubscribe = subscribeToGroupMembers((updatedMembers) => {
      // Only show active members
      const activeMembers = updatedMembers.filter(m => m.isActive);
      setMembers(activeMembers);
      console.log('League Manager - Members updated:', activeMembers.length);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Load league teams when current league changes
  useEffect(() => {
    if (currentLeague) {
      const teamsKey = `league_${currentLeague}_teams`;
      const storedTeams = JSON.parse(localStorage.getItem(teamsKey) || "[]");
      setLeagueTeams(storedTeams);
    } else {
      setLeagueTeams([]);
    }
  }, [currentLeague]);

  const handleCreateLeague = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || leagues.includes(trimmed)) {
      alert('Invalid league name or league already exists');
      return;
    }

    const updated = [...leagues, trimmed];
    setLeagues(updated);

    localStorage.setItem("leagueList", JSON.stringify(updated));
    localStorage.setItem("currentLeagueName", trimmed);
    setCurrentLeague(trimmed);
    window.location.reload();
  };

  const handleSwitchLeague = (name: string) => {
    localStorage.setItem("currentLeagueName", name);
    setCurrentLeague(name);
    window.location.reload();
  };

  const handleDeleteLeague = (leagueName: string) => {
    const updatedLeagues = leagues.filter(league => league !== leagueName);
    setLeagues(updatedLeagues);
    
=======
  }, []);

  // Handle new league creation
  const handleCreateLeague = () => {
    const trimmed = newLeague.trim();
    if (!trimmed || leagues.includes(trimmed)) return;

    const updated = [...leagues, trimmed];
    setLeagues(updated);
    setNewLeague("");

    // Save updated list and make new league active
    localStorage.setItem("leagueList", JSON.stringify(updated));
    localStorage.setItem("currentLeagueName", trimmed);
    setCurrentLeague(trimmed);
    window.location.reload(); // reload to show new league's data
  };

  // Handle switching to an existing league
  const handleSwitchLeague = (name: string) => {
    localStorage.setItem("currentLeagueName", name);
    setCurrentLeague(name);
    window.location.reload(); // reload to show selected league's data
  };

  // Handle deleting a league completely
  const handleDeleteLeague = (leagueName: string) => {
    // Remove from leagues list
    const updatedLeagues = leagues.filter(league => league !== leagueName);
    setLeagues(updatedLeagues);
    
    // Clear all data for this league
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe
    const teamsKey = `league_${leagueName}_teams`;
    const historyKey = `league_${leagueName}_history`;
    localStorage.removeItem(teamsKey);
    localStorage.removeItem(historyKey);
    
<<<<<<< HEAD
    localStorage.setItem("leagueList", JSON.stringify(updatedLeagues));
    
    if (currentLeague === leagueName) {
      if (updatedLeagues.length > 0) {
        const newCurrent = updatedLeagues[0];
        localStorage.setItem("currentLeagueName", newCurrent);
        setCurrentLeague(newCurrent);
      } else {
        localStorage.setItem("currentLeagueName", "");
        setCurrentLeague("");
      }
      window.location.reload();
=======
    // Update leagues list in localStorage
    localStorage.setItem("leagueList", JSON.stringify(updatedLeagues));
    
    // If we deleted the current league, switch to another or clear
    if (currentLeague === leagueName) {
      const newCurrent = updatedLeagues.length > 0 ? updatedLeagues[0] : "";
      localStorage.setItem("currentLeagueName", newCurrent);
      setCurrentLeague(newCurrent);
      window.location.reload(); // reload to show updated state
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe
    }
    
    setShowDeleteConfirm(null);
  };

<<<<<<< HEAD
  const handleAddTeam = (memberId: string) => {
    if (!currentLeague) {
      console.error('No current league selected');
      return;
    }

    // Find the selected member
    const selectedMember = members.find(m => m.id === memberId);
    if (!selectedMember) {
      console.error('Member not found:', memberId);
      alert('Selected member not found');
      return;
    }

    // Check if member is already in league (check by member ID, not team ID)
    if (leagueTeams.some(team => team.id === memberId || team.name === selectedMember.name)) {
      alert('Member is already in this league');
      return;
    }

    setIsLoading(true);

    try {
      const newTeam: LeagueTeam = {
        id: selectedMember.id || memberId,  // Use member ID as team ID
        name: selectedMember.name,
        psnId: selectedMember.psnId || selectedMember.name
      };

      const updatedTeams = [...leagueTeams, newTeam];
      setLeagueTeams(updatedTeams);

      const teamsKey = `league_${currentLeague}_teams`;
      localStorage.setItem(teamsKey, JSON.stringify(updatedTeams));

      console.log('Team added successfully:', newTeam);
      alert(`${selectedMember.name} added to league!`);

    } catch (error) {
      console.error('Error adding team:', error);
      alert('Failed to add team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeam = (teamId: string) => {
    if (!currentLeague) return;

    const updatedTeams = leagueTeams.filter(team => team.id !== teamId);
    setLeagueTeams(updatedTeams);

    const teamsKey = `league_${currentLeague}_teams`;
    localStorage.setItem(teamsKey, JSON.stringify(updatedTeams));
  };

  // Filter available members (not already in the league)
  // Check both by ID and by name to be safe
  const availableMembers = members.filter(member => {
    const alreadyInLeague = leagueTeams.some(team => 
      team.id === member.id || team.name === member.name
    );
    return !alreadyInLeague;
  });

  // Debug logging
  useEffect(() => {
    console.log('=== League Manager Debug ===');
    console.log('Total members from DB:', members.length);
    console.log('Members:', members.map(m => ({ id: m.id, name: m.name })));
    console.log('Teams in current league:', leagueTeams.length);
    console.log('League teams:', leagueTeams.map(t => ({ id: t.id, name: t.name })));
    console.log('Available members to add:', availableMembers.length);
    console.log('Available:', availableMembers.map(m => ({ id: m.id, name: m.name })));
  }, [members, leagueTeams, availableMembers]);

  if (!isLoaded) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6 text-black">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white p-4 rounded-lg shadow mb-6 text-black">
        <h2 className="text-lg font-bold mb-3">🎮 League Manager</h2>

        <LeagueCreator 
          onCreateLeague={handleCreateLeague}
          isLoading={isLoading}
        />

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Available Leagues:</h3>
          <LeagueList
            leagues={leagues}
            currentLeague={currentLeague}
            onSwitchLeague={handleSwitchLeague}
            onDeleteRequest={setShowDeleteConfirm}
          />
        </div>

        {currentLeague && (
          <>
            {/* Debug info - remove after testing */}
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <p className="font-bold text-yellow-800">📊 Debug Info:</p>
              <p>Total Members in System: {members.length}</p>
              <p>Teams in Current League: {leagueTeams.length}</p>
              <p>Available to Add: {availableMembers.length}</p>
              {members.length === 0 && (
                <p className="text-red-600 font-bold mt-2">
                  ⚠️ No members found! Add members in the Players tab first.
                </p>
              )}
            </div>
            
            <TeamManager
              leagueName={currentLeague}
              teams={leagueTeams}
              availableMembers={availableMembers}
              onAddTeam={handleAddTeam}
              onRemoveTeam={handleRemoveTeam}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      {showDeleteConfirm && (
        <DeleteConfirmModal
          leagueName={showDeleteConfirm}
          onConfirm={() => handleDeleteLeague(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}
    </div>
=======
  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow mb-6 text-black">
        <h2 className="text-lg font-bold mb-3">🎮 League Manager</h2>

        {/* Create New League */}
        <div className="flex gap-2 mb-4">
          <input
            value={newLeague}
            onChange={(e) => setNewLeague(e.target.value)}
            placeholder="Enter new league name"
            className="border px-3 py-1 rounded w-full"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateLeague()}
          />
          <button
            onClick={handleCreateLeague}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>

        {/* League Switcher */}
        <div>
          <h3 className="font-semibold mb-2">Available Leagues:</h3>
          {leagues.length > 0 ? (
            <ul className="space-y-2">
              {leagues.map((league) => (
                <li key={league} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <button
                    onClick={() => handleSwitchLeague(league)}
                    className={`px-3 py-1 rounded flex-1 text-left ${
                      currentLeague === league
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {league}
                    {currentLeague === league && <span className="ml-2 text-xs">(current)</span>}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(league)}
                    className="ml-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    title="Delete league permanently"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No leagues created yet. Create your first league above!</p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                Delete League?
              </h3>
              <p className="text-gray-600 text-center mb-6">
                This will permanently delete the league "{showDeleteConfirm}" and all its teams, matches, and history. This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded font-medium transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLeague(showDeleteConfirm)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-medium transition-colors duration-150"
                >
                  Delete League
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
>>>>>>> 04283011a3b48726eca886364dda426bcea2bffe
  );
}