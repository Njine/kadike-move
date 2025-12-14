import React from "react";

const MatchSummary: React.FC = () => {
  return (
    <div className="p-4 bg-green-900 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Match Summary</h2>
      <div>Winner and token payout summary will be shown here.</div>
      {/* TODO: Render winner and payout details */}
    </div>
  );
};

export default MatchSummary;
