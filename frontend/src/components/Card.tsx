import React from "react";

interface CardProps {
  value: string;
  suit: string;
}

const Card: React.FC<CardProps> = ({ value, suit }) => {
  return (
    <div className="inline-block m-1 p-2 border rounded bg-white text-black shadow">
      <span className="font-bold">{value}</span> <span>{suit}</span>
    </div>
  );
};

export default Card;
