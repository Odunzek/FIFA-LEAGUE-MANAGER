"use client";

import { useState, useEffect } from "react";

export default function LeagueManager() {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [newLeague, setNewLeague] = useState("");
  const [currentLeague, setCurrentLeague] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Load leagues and current league on first render
  useEffect(() => {
    const storedLeagues = JSON.parse(localStorage.getItem("leagueList") || "[]");
    const activeLeague = localStorage.getItem("currentLeagueName") || "";

    setLeagues(storedLeagues);
    setCurrentLeague(activeLeague);
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
    const teamsKey = `league_${leagueName}_teams`;
    const historyKey = `league_${leagueName}_history`;
    localStorage.removeItem(teamsKey);
    localStorage.removeItem(historyKey);
    
    // Update leagues list in localStorage
    localStorage.setItem("leagueList", JSON.stringify(updatedLeagues));
    
    // If we deleted the current league, switch to another or clear
    if (currentLeague === leagueName) {
      const newCurrent = updatedLeagues.length > 0 ? updatedLeagues[0] : "";
      localStorage.setItem("currentLeagueName", newCurrent);
      setCurrentLeague(newCurrent);
      window.location.reload(); // reload to show updated state
    }
    
    setShowDeleteConfirm(null);
  };

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
  );
}