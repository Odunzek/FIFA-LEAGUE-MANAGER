"use client";

import { useState } from "react";

interface MatchResultFormProps {
  teams: string[];
  onSubmit: (data: {
    team1: string;
    team2: string;
    score1: number;
    score2: number;
  }) => void;
}

export default function MatchResultForm({ teams, onSubmit }: MatchResultFormProps) {
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [score1, setScore1] = useState<number | "">("");
  const [score2, setScore2] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!team1 || !team2 || score1 === "" || score2 === "") {
      return;
    }

    if (team1 === team2) {
      return;
    }

    setIsSubmitting(true);

    // Simulate brief loading for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    onSubmit({
      team1,
      team2,
      score1: Number(score1),
      score2: Number(score2),
    });

    // Reset fields
    setTeam1("");
    setTeam2("");
    setScore1("");
    setScore2("");
    setIsSubmitting(false);
  };

  const isFormValid = team1 && team2 && team1 !== team2 && score1 !== "" && score2 !== "";
  const getResult = () => {
    if (score1 === "" || score2 === "") return null;
    if (score1 > score2) return { winner: team1, result: "wins" };
    if (score2 > score1) return { winner: team2, result: "wins" };
    return { winner: null, result: "draw" };
  };

  const result = getResult();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Team Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team 1 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Home Team
          </label>
          <select
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300"
            disabled={isSubmitting}
          >
            <option value="">Select home team</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team} disabled={team === team2}>
                {team}
              </option>
            ))}
          </select>
        </div>

        {/* Team 2 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            Away Team
          </label>
          <select
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300"
            disabled={isSubmitting}
          >
            <option value="">Select away team</option>
            {teams.map((team, idx) => (
              <option key={idx} value={team} disabled={team === team1}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* VS Indicator */}
      {team1 && team2 && (
        <div className="flex items-center justify-center py-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-xl px-6 py-3">
            <div className="flex items-center space-x-4 text-center">
              <span className="font-bold text-gray-800">{team1}</span>
              <span className="text-2xl font-bold text-purple-600">VS</span>
              <span className="font-bold text-gray-800">{team2}</span>
            </div>
          </div>
        </div>
      )}

      {/* Score Inputs */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            {team1 || "Home"} Score
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={score1}
            onChange={(e) => {
              const value = e.target.value;
              setScore1(value === "" ? "" : Number(value));
            }}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 text-center text-2xl font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300"
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">
            {team2 || "Away"} Score
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={score2}
            onChange={(e) => {
              const value = e.target.value;
              setScore2(value === "" ? "" : Number(value));
            }}
            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-gray-900 text-center text-2xl font-bold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300"
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Match Preview */}
      {team1 && team2 && team1 !== team2 && score1 !== "" && score2 !== "" && (
        <div className={`rounded-xl p-6 border-2 transition-all duration-300 ${
          result?.result === "draw" 
            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200" 
            : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        }`}>
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-800 mb-3">Match Result Preview</h4>
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-gray-900">{team1}</div>
                <div className={`text-3xl font-bold ${score1 > score2 ? 'text-green-600' : score1 === score2 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {score1}
                </div>
              </div>
              
              <div className="text-2xl font-bold text-gray-400">-</div>
              
              <div className="text-center">
                <div className="font-bold text-gray-900">{team2}</div>
                <div className={`text-3xl font-bold ${score2 > score1 ? 'text-green-600' : score1 === score2 ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {score2}
                </div>
              </div>
            </div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
              result?.result === "draw" 
                ? "bg-yellow-200 text-yellow-800" 
                : "bg-green-200 text-green-800"
            }`}>
              {result?.result === "draw" ? (
                <>
                  <span className="mr-2">🤝</span>
                  Draw
                </>
              ) : (
                <>
                  <span className="mr-2">🏆</span>
                  {result?.winner} {result?.result}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form Validation Messages */}
      {team1 === team2 && team1 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <span>❌</span>
            <span className="font-medium">A team cannot play against itself</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 transform ${
          !isFormValid || isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:scale-[1.02] shadow-lg hover:shadow-xl'
        }`}
      >
        <div className="flex items-center justify-center space-x-3">
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Recording Match...</span>
            </>
          ) : (
            <>
              <span className="text-xl">⚽</span>
              <span>Record Match Result</span>
            </>
          )}
        </div>
      </button>
    </form>
  );
}