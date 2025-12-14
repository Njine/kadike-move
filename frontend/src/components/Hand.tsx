import React from "react";

const Hand: React.FC = () => {
  return (
    <div className="p-4 bg-blue-900 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Your Hand</h2>
      <div>Only the current player's hand is shown here.</div>
      {/* TODO: Render player's hand cards */}
    </div>
  );
};

export default Hand;
