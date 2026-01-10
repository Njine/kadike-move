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
      <div className="bg-gray-800/50 backdrop-blur p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-center">Waiting Room</h2>
        <div className="text-center">
          <p className="text-xl mb-6">Waiting for players to join...</p>
          <div className="bg-gray-900/50 p-6 rounded-xl mb-4 border border-gray-600">
            <p className="text-sm text-gray-400 mb-2">Match ID:</p>
            <p className="text-lg font-mono bg-gray-950 p-3 rounded-lg text-blue-400">{matchId}</p>
          </div>
          <p className="text-sm text-gray-400">Share this ID with other players</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur p-8 rounded-2xl shadow-2xl max-w-md mx-auto border border-gray-700">
      <h2 className="text-3xl font-bold mb-8 text-center">Enter the Game</h2>
      
      <div className="mb-8">
        <label htmlFor="playerName" className="block text-sm font-medium mb-2 text-gray-300">
          Your Name
        </label>
        <input 
          id="playerName"
          name="playerName"
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="mb-6 p-6 bg-gray-900/30 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Create New Match</h3>
        <label htmlFor="numPlayers" className="block text-sm font-medium mb-2 text-gray-300">
          Number of Players
        </label>
        <select 
          id="numPlayers"
          name="numPlayers"
          value={numPlayers} 
          onChange={(e) => setNumPlayers(Number(e.target.value))}
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>
        <button 
          onClick={handleCreateMatch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          START GAME
        </button>
      </div>

      <div className="p-6 bg-gray-900/30 rounded-xl border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Join Existing Match</h3>
        <label htmlFor="joinMatchId" className="block text-sm font-medium mb-2 text-gray-300">
          Match ID
        </label>
        <input 
          id="joinMatchId"
          name="joinMatchId"
          type="text" 
          value={joinMatchId}
          onChange={(e) => setJoinMatchId(e.target.value)}
          placeholder="Enter match ID"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <button 
          onClick={handleJoinMatch}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          Join Match
        </button>
      </div>
      
      <p className="text-center text-sm text-gray-400 mt-6">
        Match suit or rank to play • First to empty hand wins
      </p>
    </div>
  );
};

export default Lobby;
