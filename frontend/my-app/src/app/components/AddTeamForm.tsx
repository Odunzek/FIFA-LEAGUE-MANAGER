"use client";

import { useState } from "react";

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

type Props = {
  onAddTeam: (team: Team) => void;
};

export default function AddTeamForm({ onAddTeam }: Props) {
  const [teamName, setTeamName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validateTeamName = (name: string) => {
    if (!name.trim()) return "Team name is required";
    if (name.trim().length < 2) return "Team name must be at least 2 characters";
    if (name.trim().length > 30) return "Team name must be less than 30 characters";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateTeamName(teamName);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const newTeam: Team = {
      name: teamName.trim(),
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      points: 0,
    };

    onAddTeam(newTeam);
    setTeamName("");
    setIsSubmitting(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeamName(value);
    
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Team Name
        </label>
        <div className="relative">
          <input
            type="text"
            value={teamName}
            onChange={handleInputChange}
            placeholder="Enter team name (e.g., Arsenal FC)"
            className={`w-full px-4 py-4 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none ${
              error 
                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-gray-300'
            }`}
            disabled={isSubmitting}
            maxLength={30}
          />
          
          {/* Character counter */}
          <div className="absolute top-4 right-4 text-xs text-gray-400">
            {teamName.length}/30
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mt-2 flex items-center space-x-2 text-red-600">
            <span className="text-sm">❌</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        {/* Success indicator */}
        {teamName.length >= 2 && !error && (
          <div className="mt-2 flex items-center space-x-2 text-green-600">
            <span className="text-sm">✅</span>
            <span className="text-sm font-medium">Looks good!</span>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !teamName.trim() || !!error}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform ${
          isSubmitting || !teamName.trim() || !!error
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="flex items-center justify-center space-x-3">
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding Team...</span>
            </>
          ) : (
            <>
              <span className="text-xl">⚽</span>
              <span>Add Team to League</span>
            </>
          )}
        </div>
      </button>

      {/* Team preview */}
      {teamName.trim() && !error && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <h4 className="text-sm font-bold text-gray-700 mb-2">Team Preview</h4>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-md"></div>
            <div>
              <div className="font-bold text-gray-900">{teamName.trim()}</div>
              <div className="text-xs text-gray-500">Starting with 0 points</div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}