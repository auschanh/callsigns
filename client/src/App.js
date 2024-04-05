import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, Redirect, useLocation, useNavigate } from "react-router-dom";
import "./css/styles.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
import JoinRoom from "./pages/JoinRoom";
import NewHost from "./pages/NewHost";
import SocketContext from "./contexts/SocketContext";
import GameInfoContext from "./contexts/GameInfoContext";
import styles from "./css/tailwindStylesLiterals";

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const [socket, setSocket] = useState(mainSocket);

	const [playerName, setPlayerName] = useState();

	const [selectedPlayers, setSelectedPlayers] = useState();

	const [roomID, setRoomID] = useState();

	const navigate = useNavigate();

	useEffect(() => {

		socket.on("redirectGame", (roomID, playerName, selectedPlayers) => {

			setPlayerName(playerName);

			setSelectedPlayers(selectedPlayers);

			setRoomID(roomID);

			navigate(`/game/${roomID}`);

		});

		return () => {

			socket.removeAllListeners("redirectGame");

		}

	}, [socket]);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

				<GameInfoContext.Provider value={[playerName, selectedPlayers, roomID]}>

					<Routes>

						<Route exact path="/" element={<Home />} />

						<Route exact path="lobby/:roomID" element={<JoinRoom />} />

						<Route exact path="game/:roomID" element={<Game />} />

						<Route exact path="newhost/:roomID" element={<NewHost />} />

						<Route path="*" element={<Navigate replace to="/" />} />

					</Routes>

				</GameInfoContext.Provider>

			</SocketContext.Provider>

		</div>

	);

}

export default App;
