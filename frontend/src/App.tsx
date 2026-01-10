import GameRoom from './components/GameRoom';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-green-950 to-gray-950 text-white w-full">
      <header className="text-center py-3">
        <div className="text-2xl mb-1 text-red-500">
          ♠ <span className="text-red-600">♥</span> <span className="text-gray-300">♣</span> <span className="text-red-600">♦</span>
        </div>
        <h1 className="text-3xl font-bold mb-1">KADI</h1>
        <p className="text-sm text-gray-400">The Ultimate Card Game</p>
      </header>
      <main className="w-full px-4 pb-4">
        <GameRoom />
      </main>
    </div>
  );
}

export default App;
