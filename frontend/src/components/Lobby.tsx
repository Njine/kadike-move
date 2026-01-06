import React, { useState } from 'react';

interface LobbyProps {
  onCreateMatch: (playerIds: string[]) => void;
  onJoinMatch: (matchId: string, playerId: string) => void;
  isWaiting: boolean;
  matchId?: string;
}

const Lobby: React.FC<LobbyProps> = ({ onCreateMatch, onJoinMatch, isWaiting, matchId }) => {
  const [playerName, setPlayerName] = useState('');
  const [joinMatchId, setJoinMatchId] = useState('');
  const [numPlayers, setNumPlayers] = useState(2);

  const handleCreateMatch = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    
    // Trim and use the exact name to avoid mismatches
    const creatorName = playerName.trim();
    
    // Generate player IDs based on number of players
    const playerIds = Array.from({ length: numPlayers }, (_, i) => 
      i === 0 ? creatorName : `Player${i + 1}`
    );
    
    onCreateMatch(playerIds);
  };

  const handleJoinMatch = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!joinMatchId.trim()) {
      alert('Please enter match ID');
      return;
    }
    
    onJoinMatch(joinMatchId, playerName);
  };

  if (isWaiting) {
    return (
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Lobby</h2>
        <div className="text-center">
          <p className="text-xl mb-4">Waiting for players to join...</p>
          <div className="bg-gray-700 p-4 rounded mb-4">
            <p className="text-sm text-gray-400 mb-2">Match ID:</p>
            <p className="text-lg font-mono bg-gray-900 p-2 rounded">{matchId}</p>
          </div>
          <p className="text-sm text-gray-400">Share this ID with other players</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Lobby</h2>
      
      <div className="mb-6">
        <label htmlFor="playerName" className="block text-sm font-medium mb-2">
          Your Name:
        </label>
        <input 
          id="playerName"
          name="playerName"
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6 p-4 bg-gray-700 rounded">
        <h3 className="text-xl font-semibold mb-4">Create New Match</h3>
        <label htmlFor="numPlayers" className="block text-sm font-medium mb-2">
          Number of Players:
        </label>
        <select 
          id="numPlayers"
          name="numPlayers"
          value={numPlayers} 
          onChange={(e) => setNumPlayers(Number(e.target.value))}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>
        <button 
          onClick={handleCreateMatch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Create Match
        </button>
      </div>

      <div className="p-4 bg-gray-700 rounded">
        <h3 className="text-xl font-semibold mb-4">Join Existing Match</h3>
        <label htmlFor="joinMatchId" className="block text-sm font-medium mb-2">
          Match ID:
        </label>
        <input 
          id="joinMatchId"
          name="joinMatchId"
          type="text" 
          value={joinMatchId}
          onChange={(e) => setJoinMatchId(e.target.value)}
          placeholder="Enter match ID"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button 
          onClick={handleJoinMatch}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Join Match
        </button>
      </div>
    </div>
  );
};

export default Lobby;
