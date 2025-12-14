#!/usr/bin/env node
// Simulate a full multiplayer game for testing backend logic
// Usage: node simulate_game.js

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
const NUM_PLAYERS = 3;
const STAKES = 10;

const players = Array.from({ length: NUM_PLAYERS }, (_, i) => ({
  id: `player${i + 1}`,
  name: `Player ${i + 1}`,
  tokens: 100,
  isConnected: true,
}));

const sockets = [];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  for (const player of players) {
    const socket = io(SERVER_URL);
    sockets.push(socket);
    socket.on('connect', () => {
      console.log(`${player.name} connected`);
    });
    socket.on('matchCreated', (match) => {
      console.log(`${player.name} received matchCreated:`, match.id);
    });
  }

  await delay(1000);
  // Player 1 creates a match
  sockets[0].emit('createMatch', { players, stakes: STAKES });

  await delay(2000);
  // Add more simulated moves/events as needed

  // Cleanup
  for (const socket of sockets) {
    socket.disconnect();
  }
}

main();
