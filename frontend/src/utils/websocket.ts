// src/utils/websocket.ts

let socket: WebSocket | null = null;

export function connectWebSocket(url: string, onMessage: (data: any) => void) {
  socket = new WebSocket(url);
  socket.onopen = () => {
    console.log("WebSocket connected");
  };
  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("WebSocket message error:", e);
    }
  };
  socket.onclose = () => {
    console.log("WebSocket disconnected");
  };
  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

export function sendWebSocketMessage(message: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

export function closeWebSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
