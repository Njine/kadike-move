import Lobby from './components/Lobby';
import MatchBoard from './components/MatchBoard';
import Hand from './components/Hand';
import MatchSummary from './components/MatchSummary';

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 gap-6">
      <h1 className="text-3xl font-bold mb-4">Kadike Move Multiplayer</h1>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        <Lobby />
        <MatchBoard />
      </div>
      <Hand />
      <MatchSummary />
    </div>
  );
}

export default App;
