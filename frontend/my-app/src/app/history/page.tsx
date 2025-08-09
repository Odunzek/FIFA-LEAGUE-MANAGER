"use client";

import { useEffect, useState } from "react";

// Match history type
type Match = {
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  date: string;
};

export default function MatchHistoryPage() {
  const [leagueName, setLeagueName] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Get the currently active league from localStorage
    const current = localStorage.getItem("currentLeagueName");
    if (current) {
      setLeagueName(current);

      // Build the league-specific key
      const key = `league_${current}_history`;

      // Load match history for the current league
      const history = localStorage.getItem(key);
      if (history) setMatches(JSON.parse(history));
    }
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">
        📜 Match History – {leagueName || "No League Selected"}
      </h1>

      {/* No match case */}
      {matches.length === 0 ? (
        <p className="text-center text-black">No matches recorded for this league.</p>
      ) : (
        <ul className="space-y-3">
          {matches.map((match, index) => (
            <li
              key={index}
              className="bg-white border p-4 rounded shadow flex justify-between items-center"
            >
              <div className="text-black">
                <strong>{match.team1}</strong> {match.score1} - {match.score2} {" "}
                <strong>{match.team2}</strong>
              </div>
              <div className="text-sm text-black">
                {new Date(match.date).toLocaleDateString()} {" "}
                {new Date(match.date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
