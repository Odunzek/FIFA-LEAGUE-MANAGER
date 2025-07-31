"use client";

import { useEffect, useState } from "react";

interface LeagueSelectorProps {
  onLeagueSelect: (league: string) => void;
}

// Toast notification component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 backdrop-blur-sm ${
    type === 'success' ? 'bg-green-500/90 text-white' : 
    type === 'error' ? 'bg-red-500/90 text-white' : 
    'bg-blue-500/90 text-white'
  }`}>
    <div className="flex items-center space-x-3">
      <span className="text-xl">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200 font-bold">×</button>
    </div>
  </div>
);

export default function LeagueSelector({ onLeagueSelect }: LeagueSelectorProps) {
  const [leagues, setLeagues] = useState<string[]>([]);
  const [currentLeague, setCurrentLeague] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load data on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLeagues = JSON.parse(localStorage.getItem("leagueList") || "[]");
        const savedCurrent = localStorage.getItem("currentLeagueName") || "";
        
        setLeagues(Array.isArray(savedLeagues) ? savedLeagues : []);
        setCurrentLeague(savedCurrent);
        setIsLoaded(true);
        
        if (savedCurrent && onLeagueSelect) {
          onLeagueSelect(savedCurrent);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setLeagues([]);
        setCurrentLeague("");
        setIsLoaded(true);
      }
    }
  }, []);

  // Save leagues to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("leagueList", JSON.stringify(leagues));
    }
  }, [leagues, isLoaded]);

  // Save current league to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded && currentLeague) {
      localStorage.setItem("currentLeagueName", currentLeague);
    }
  }, [currentLeague, isLoaded]);

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateLeagueName = (name: string): string | null => {
    if (!name.trim()) return "League name cannot be empty";
    if (name.trim().length < 2) return "League name must be at least 2 characters";
    if (name.trim().length > 50) return "League name must be less than 50 characters";
    if (leagues.includes(name.trim())) return "League name already exists";
    return null;
  };

  const handleSelectExisting = (leagueName: string) => {
    setCurrentLeague(leagueName);
    setInputValue("");
    setIsCreatingNew(false);
    setError("");
    
    showToast(`Switched to ${leagueName}`, 'info');
    onLeagueSelect(leagueName);
  };

  const handleCreateNew = () => {
    const trimmedName = inputValue.trim();
    const validationError = validateLeagueName(trimmedName);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    const updatedLeagues = [...leagues, trimmedName];
    setLeagues(updatedLeagues);
    setCurrentLeague(trimmedName);
    setInputValue("");
    setIsCreatingNew(false);
    setError("");
    
    showToast(`${trimmedName} league created successfully!`, 'success');
    onLeagueSelect(trimmedName);
  };

  const handleDeleteLeague = (leagueName: string) => {
    if (typeof window !== "undefined") {
      const updatedLeagues = leagues.filter(name => name !== leagueName);
      setLeagues(updatedLeagues);
      
      localStorage.removeItem(`league_${leagueName}_teams`);
      localStorage.removeItem(`league_${leagueName}_history`);
      
      if (currentLeague === leagueName) {
        const newCurrent = updatedLeagues.length > 0 ? updatedLeagues[0] : "";
        setCurrentLeague(newCurrent);
        onLeagueSelect(newCurrent);
      }
    }
    
    setShowDeleteConfirm(null);
    showToast(`${leagueName} league deleted successfully`, 'success');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateNew();
    }
    if (e.key === 'Escape') {
      setIsCreatingNew(false);
      setInputValue("");
      setError("");
    }
  };

  // Show loading state while data loads
  if (!isLoaded) {
    return (
      <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⚽</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">League Manager</h2>
                <p className="text-white/80 text-sm">Select or create your football league</p>
              </div>
            </div>
            {currentLeague && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                <span className="text-white/80 text-sm font-medium">Current:</span>
                <span className="text-white font-bold ml-2">{currentLeague}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <span className="text-red-500 text-xl">❌</span>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Existing Leagues */}
          {leagues.length > 0 ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Your Leagues</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>📊</span>
                  <span>{leagues.length} league{leagues.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagues.map((league, index) => (
                  <div
                    key={league}
                    className={`group relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      currentLeague === league
                        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                        : 'border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-blue-300 hover:shadow-lg'
                    }`}
                    onClick={() => currentLeague !== league && handleSelectExisting(league)}
                  >
                    {/* League Card Content */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          currentLeague === league ? 'bg-green-400' : 'bg-blue-400'
                        }`}></div>
                        <span className={`font-bold text-lg ${
                          currentLeague === league ? 'text-green-800' : 'text-gray-800'
                        }`}>
                          {league}
                        </span>
                      </div>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(league);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300"
                        title="Delete league"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* League Status */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {currentLeague === league ? (
                          <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="font-medium text-green-700">Currently Active</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Click to switch</span>
                        )}
                      </div>
                      
                      {/* League Number Badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentLeague === league 
                          ? 'bg-green-400 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {currentLeague === league && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center mb-8 py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Leagues Yet</h3>
              <p className="text-gray-600 mb-6">Create your first league to get started!</p>
            </div>
          )}

          {/* Create New League Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">➕</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Create New League</h3>
                  <p className="text-gray-600 text-sm">Start managing a new football league</p>
                </div>
              </div>
              
              {!isCreatingNew && (
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold"
                >
                  New League
                </button>
              )}
            </div>

            {isCreatingNew && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter league name (e.g., Premier League 2024)"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300"
                      autoFocus
                      maxLength={50}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {inputValue.length >= 2 && !error ? '✅ Ready to create!' : 'Min 2 characters'}
                      </span>
                      <span className="text-gray-400">{inputValue.length}/50</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateNew}
                      disabled={!inputValue.trim() || !!error}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:cursor-not-allowed disabled:transform-none"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingNew(false);
                        setInputValue("");
                        setError("");
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* League Preview */}
                {inputValue.trim() && !error && (
                  <div className="bg-white border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">League Preview</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{leagues.length + 1}</span>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{inputValue.trim()}</div>
                        <div className="text-xs text-gray-500">Ready to add teams and matches</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
            <div className="p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full">
                <span className="text-3xl">🗑️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
                Delete League?
              </h3>
              <p className="text-gray-600 text-center mb-8 leading-relaxed">
                This will permanently delete <strong>"{showDeleteConfirm}"</strong> and all its teams, matches, and history. This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                  Keep League
                </button>
                <button
                  onClick={() => handleDeleteLeague(showDeleteConfirm)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}