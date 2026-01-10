import GameRoom from './components/GameRoom';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="text-center py-8">
        <div className="text-4xl mb-2 text-red-500">
          ♠ <span className="text-red-600">♥</span> <span className="text-gray-300">♣</span> <span className="text-red-600">♦</span>
        </div>
        <h1 className="text-5xl font-bold mb-2">KADI</h1>
        <p className="text-gray-400">The Ultimate Card Game</p>
      </header>
      <main className="flex flex-col items-center px-4 pb-8">
        <GameRoom />
      </main>
    </div>
  );
}

export default App;
