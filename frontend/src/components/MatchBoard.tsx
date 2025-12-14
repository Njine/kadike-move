import React from "react";

const MatchBoard: React.FC = () => {
  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-2">Match Board</h2>
      <div className="mb-2">Table cards will be displayed here.</div>
      <div>Turn indicator will be shown here.</div>
      {/* TODO: Render table cards and turn indicator */}
    </div>
  );
};

export default MatchBoard;
