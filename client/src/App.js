import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, Redirect, useLocation, useNavigate } from "react-router-dom";
import "./css/styles.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
import JoinRoom from "./pages/JoinRoom";
import NewHost from "./pages/NewHost";
import SocketContext from "./contexts/SocketContext";
import MessageContext from "./contexts/MessageContext";
import GameInfoContext from "./contexts/GameInfoContext";
import styles from "./css/tailwindStylesLiterals";

import axios from "axios";

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const [socket, setSocket] = useState(mainSocket);

	const [roomID, setRoomID] = useState();

	const [playerName, setPlayerName] = useState();

	const [selectedPlayers, setSelectedPlayers] = useState();

	const [callsign, setCallsign] = useState();

	const [generatedWords, setGeneratedWords] = useState(["Board", "Boil", "Bolt"]);

	const [messageList, setMessageList] = useState([]);

	const navigate = useNavigate();

	const generateWord = async () => {

		const url = "http://localhost:3001/getMysteryWord";

		try {

			const response = await axios.get(url);

			const retrievedWord = response.data;

			if (generatedWords.includes(retrievedWord)) {

				return generateWord();

			} else {

				return retrievedWord;

			}

		} catch (error) {

			throw error;

		}

	}

	useEffect(() => {

		socket.on("redirectGame", (roomID, playerName, selectedPlayers, callsign, isHost) => {

			(async () => {

				setRoomID(roomID);

				setPlayerName(playerName);

				setSelectedPlayers(selectedPlayers);

				if (isHost) {

					if (generatedWords.includes(callsign)) {

						const retrievedWord = await generateWord();

						try {

							await socket.emit("sendCallsign", retrievedWord, [...generatedWords, retrievedWord]);
			
						} catch (error) {
			
							throw error;
			
						}
	
					} else {

						try {

							await socket.emit("sendCallsign", callsign, [...generatedWords, callsign]);
			
						} catch (error) {
			
							throw error;
			
						}
	
					}

				}

				navigate(`/game/${roomID}`);

			})();

		});

		socket.on("receiveCallsign", (callsign, generatedWords) => {

			setCallsign(callsign);

			setGeneratedWords(generatedWords);

		});

		return () => {

			socket.removeAllListeners("redirectGame");
			socket.removeAllListeners("receiveCallsign");

		}

	}, [socket, generatedWords, generateWord, navigate]);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

				<MessageContext.Provider value={[messageList, setMessageList]}>

					<GameInfoContext.Provider value={[roomID, playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers]]}>

						<Routes>

							<Route exact path="/" element={<Home />} />

							<Route exact path="lobby/:roomID" element={<JoinRoom />} />

							<Route exact path="game/:roomID" element={<Game />} />

							<Route exact path="newhost/:roomID" element={<NewHost />} />

							<Route path="*" element={<Navigate replace to="/" />} />

						</Routes>

					</GameInfoContext.Provider>

				</MessageContext.Provider>

			</SocketContext.Provider>

		</div>

	);

}

export default App;
