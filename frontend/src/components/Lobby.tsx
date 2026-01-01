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
    
    // Generate player IDs based on number of players
    const playerIds = Array.from({ length: numPlayers }, (_, i) => 
      i === 0 ? playerName : `Player${i + 1}`
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
      <div>
        <h2>Lobby</h2>
        <p>Waiting for players to join...</p>
        <p>Match ID: {matchId}</p>
        <p>Share this ID with other players</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Lobby</h2>
      
      <div>
        <label>
          Your Name:
          <input 
            type="text" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
          />
        </label>
      </div>

      <div>
        <h3>Create New Match</h3>
        <label>
          Number of Players:
          <select value={numPlayers} onChange={(e) => setNumPlayers(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </label>
        <button onClick={handleCreateMatch}>Create Match</button>
      </div>

      <div>
        <h3>Join Existing Match</h3>
        <label>
          Match ID:
          <input 
            type="text" 
            value={joinMatchId}
            onChange={(e) => setJoinMatchId(e.target.value)}
            placeholder="Enter match ID"
          />
        </label>
        <button onClick={handleJoinMatch}>Join Match</button>
      </div>
    </div>
  );
};

export default Lobby;
