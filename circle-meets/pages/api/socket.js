// pages/api/socket.js
import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already attached");
    return res.end();
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`User Connected : ${socket.id}`);
  });

  return res.end();
};

export default SocketHandler;
