const app = require('express')();
const http = require('http').createServer(app);

const io = require("socket.io")(8900, {
  cors: {
    origin: "*",
  },
});
io.setMaxListeners(20);

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  //when connect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // Listen for incoming messages from this client
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients except for the sender
    socket.broadcast.emit('message', message);
  });

  // Listen for disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    removeUser(socket.id);
    console.log(users);
    io.emit("getUsers", users);
  });
});

http.listen(8800, () => {
  console.log("listening on port 8800");
});