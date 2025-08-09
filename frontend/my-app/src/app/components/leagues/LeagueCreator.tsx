import React, { useState } from 'react';

interface LeagueCreatorProps {
  onCreateLeague: (name: string) => void;
  isLoading: boolean;
}

export default function LeagueCreator({ onCreateLeague, isLoading }: LeagueCreatorProps) {
  const [newLeague, setNewLeague] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeague.trim()) return;
    
    onCreateLeague(newLeague.trim());
    setNewLeague('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        value={newLeague}
        onChange={(e) => setNewLeague(e.target.value)}
        placeholder="Enter new league name"
        className="border px-3 py-1 rounded w-full"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !newLeague.trim()}
        className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}