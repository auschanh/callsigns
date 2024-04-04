const express = require("express");
const app = express();
const wordFile = require("./words/words.json");

const http = require("http");
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const cors = require("cors");
app.use(cors());

app.use(express.json());

const { csvJSON } = require("./words/convertCsv");

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/getMysteryWord", (req, res) => {
  const mysteryWord = getMysteryWord();
  res.status(200).send(mysteryWord);
});

app.post("/newJsonFile", (req, res) => {
  const newList = JSON.parse(csvJSON());
  const newListWord = newList[Math.floor(Math.random() * newList.length)].word;
  console.log(newListWord);
  res.status(200);
});

const getMysteryWord = () => {
  const randomWord = wordFile[Math.floor(Math.random() * wordFile.length)].Word;
  console.log(randomWord);
  return randomWord;
};

let roomLookup = [];

io.on("connection", (socket) => {
  // every connection has a unique socket id

  console.log(`User Connected: ${socket.id}`); // prints socket id of connection

  const getSocketInfo = () => {
    const activeUsers = [...io.sockets.sockets.values()].map((socketObj) => {
      return {
        username: socketObj.username,
        socketID: socketObj.id,
        rooms: socketObj.rooms,
      };
    });

    console.log(activeUsers);
  };

  const getPlayersInLobby = (roomName) => {
    const lobby = [...io.sockets.adapter.rooms].find((room) => {
      return room[0] === roomName;
    })[1];

    return usernameLookup([...lobby]);
  };

  const usernameLookup = (lobbyArray) => {
    return (usernames = lobbyArray.map((socketID) => {
      let foundSocket = [...io.sockets.sockets.values()].find((socketObj) => {
        return socketObj.id === socketID;
      });

      return {
        playerName: foundSocket.username,
        isReady: foundSocket.isReady,
      };
    }));
  };

  getSocketInfo();

  socket.on(
    "gameInfo",
    ({ username, roomName, numPlayers, aiPlayers }, isRoomCreated) => {
      socket.username = username;

      socket.isReady = true;

      if (!isRoomCreated) {
        const roomID = socket.id + Math.floor(Math.random() * 10);

        socket.join(roomID);

        socket.roomID = roomID;

        roomLookup.push({
          roomID: roomID,
          roomName: roomName,
          host: username,
          hostID: socket.id,
          numPlayers: numPlayers,
          aiPlayers: aiPlayers,
          isClosedRoom: false,
          isGameStarted: false,
        });

        socket.emit(
          "getRoomInfo",
          `http://localhost:3000/lobby/${socket.roomID}`,
          [{ playerName: socket.username, isReady: socket.isReady }],
          socket.roomID
        );
      } else {
        const findRoom = roomLookup.find(({ roomID }) => {
          return roomID === socket.roomID;
        });

        if (findRoom) {
          findRoom.host = username;
          findRoom.roomName = roomName;
          findRoom.numPlayers = numPlayers;
          findRoom.aiPlayers = aiPlayers;

          const roomList = getPlayersInLobby(socket.roomID);

          io.to(socket.roomID).emit(
            "updateRoomInfo",
            `http://localhost:3000/lobby/${socket.roomID}`,
            roomList,
            socket.roomID,
            findRoom
          );
        }
      }

      getSocketInfo();

      console.log(roomLookup);
    }
  );

  socket.on("closeRoom", (isClosedRoom) => {
    const findRoom = roomLookup.find(({ roomID }) => {
      return roomID === socket.roomID;
    });

    if (findRoom) {
      findRoom.isClosedRoom = isClosedRoom;

      socket.to(socket.roomID).emit("isRoomClosed", isClosedRoom);
    } else {
      console.log("unable to find room");
    }

    console.log(findRoom);
  });

  socket.on("roomCheck", (roomID) => {
    const findRoom = roomLookup.find((room) => {
      return room.roomID === roomID;
    });

    const lobby = [...io.sockets.adapter.rooms].find((room) => {
      return room[0] === roomID;
    });

    if (lobby) {
      const socketsInLobby = [...lobby[1]];

      if (
        findRoom &&
        (!findRoom.isClosedRoom || socketsInLobby.includes(socket.id))
      ) {
        const roomList = getPlayersInLobby(roomID);

        console.log("players in " + findRoom.roomName + ": ");

        console.log(roomList);

        socket.emit(
          "roomExists",
          roomList,
          `http://localhost:3000/lobby/${roomID}`,
          findRoom
        );
      } else {
        socket.emit("roomExists", ...[, , ,], findRoom?.isClosedRoom);
      }
    }
  });

  socket.on("joinRoom", (roomName, username) => {
    const findRoom = roomLookup.find(({ roomID }) => {
      return roomID === roomName;
    });

    const lobby = [
      ...[...io.sockets.adapter.rooms].find((room) => {
        return room[0] === roomName;
      })[1],
    ];

    if (lobby.includes(socket.id)) {
      console.log(
        socket.username + " is changing their username to " + username
      );

      socket.username = username;

      getSocketInfo();

      const roomList = getPlayersInLobby(roomName);

      io.to(roomName).emit("joinedLobby", roomList);
    } else if (findRoom && !findRoom.isClosedRoom) {
      socket.username = username;

      console.log(username + " is joining " + roomName);

      socket.join(roomName);

      socket.roomID = roomName;

      getSocketInfo();

      const roomList = getPlayersInLobby(roomName);

      if (
        roomList.some(({ playerName }) => {
          return playerName === username;
        })
      ) {
        socket.emit("getLobby", roomList, findRoom);

        socket.to(roomName).emit("joinedLobby", roomList);

        socket.to(findRoom.hostID).emit("sendSelectedPlayers");
      } else {
        socket.emit("getLobby");
      }
    } else {
      socket.emit("getLobby", ...[, ,], findRoom?.isClosedRoom);
    }
  });

  socket.on("sendIsReady", (roomID) => {
    socket.isReady = !socket.isReady;

    const roomList = getPlayersInLobby(roomID);

    io.to(roomID).emit("receiveIsReady", roomList);
  });

  socket.on("setSelectedPlayers", (selectedPlayers) => {
    socket.to(socket.roomID).emit("getSelectedPlayers", selectedPlayers);
  });

  socket.on("removePlayer", (player) => {
    const foundSocket = [...io.sockets.sockets.values()].find((socketObj) => {
      return socketObj.username === player;
    });

    console.log(`${player} has been removed from ${socket.roomID}`);

    socket.to(foundSocket.id).emit("exitLobby");

    foundSocket.leave(socket.roomID);

    console.log(getPlayersInLobby(socket.roomID));

    io.to(socket.roomID).emit("leftRoom", player);
  });

  socket.on("sendMessage", (roomName, messageData) => {
    socket.to(roomName).emit("receiveMessage", messageData);
  });

  socket.on("newUsername", (roomID, prevUsername, newUsername) => {
    socket.to(roomID).emit("getNewUsername", prevUsername, newUsername);
  });

  socket.on("saveMessageList", (messageList) => {
    socket.emit("receiveMessageList", messageList);
  });

  socket.on("startGame", (selectedPlayers) => {
    selectedPlayers.forEach((playerName, index) => {
      // looking through all sockets, find a way to confine it to a room
      const foundSocket = [...io.sockets.sockets.values()].find((socketObj) => {
        return socketObj.username === playerName;
      });

      // const socketsInLobby = io.sockets.adapter.rooms.get(roomName);

      // console.log(socketsInLobby);

      console.log(foundSocket.id);

      socket
        .to(foundSocket.id)
        .emit("redirectGame", socket.roomID, playerName, selectedPlayers);
    });
    // set host info
    socket.emit(
      "redirectGame",
      socket.roomID,
      socket.username,
      selectedPlayers
    );
  });

  socket.on("disconnecting", () => {
    const leavingRooms = [...socket.rooms];

    console.log(leavingRooms);

    leavingRooms.forEach((room) => {
      // if you're the only one left in the room,
      if (io.sockets.adapter.rooms.get(room).size === 1) {
        // if you joined this room, deregister the room from roomLookup
        if (room !== socket.id) {
          roomLookup = roomLookup.filter(({ roomID }) => {
            return roomID !== room;
          });

          console.log("removed room from roomLookup");
        } else {
          console.log(
            "I was the last one here but this was my own room that no one joined"
          );
        }
      } else {
        // ---------------------------------------------------------
        socket.to(room).emit("leftRoom", socket.username);
        // ---------------------------------------------------------

        const findRoom = roomLookup.find(({ roomID }) => {
          return roomID === room;
        });

        // if you're the host
        if (findRoom && findRoom.hostID === socket.id) {
          const socketsInLobby = [
            ...[...io.sockets.adapter.rooms].find((room) => {
              return room[0] === socket.roomID;
            })[1],
          ];

          const newHostSocketID = socketsInLobby.find((playerSocket) => {
            return playerSocket !== socket.id;
          });

          const foundSocket = [...io.sockets.sockets.values()].find(
            (socketObj) => {
              return socketObj.id === newHostSocketID;
            }
          );

          findRoom.host = foundSocket.username;
          findRoom.hostID = foundSocket.id;

          if (!findRoom.isGameStarted) {
            socket.to(foundSocket.id).emit("newHost");
          }
        }
      }
    });
  });

  socket.on("disconnect", () => {
    console.log(roomLookup);

    console.log("User Disconnected: ", socket.id);
  });
});
