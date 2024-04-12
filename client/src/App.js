import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, Redirect, useLocation, useNavigate, useParams } from "react-router-dom";
import "./css/styles.css";
import Home from "./pages/Home";
import Game from "./pages/Game";
import JoinRoom from "./pages/JoinRoom";
import NewHost from "./pages/NewHost";
import SocketContext from "./contexts/SocketContext";
import MessageContext from "./contexts/MessageContext";
import LobbyContext from "./contexts/LobbyContext";
import GameInfoContext from "./contexts/GameInfoContext";
import styles from "./css/tailwindStylesLiterals";

import axios from "axios";

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const [socket, setSocket] = useState(mainSocket);

	const [playerName, setPlayerName] = useState();

	const [selectedPlayers, setSelectedPlayers] = useState([]);

	const [callsign, setCallsign] = useState();

	const [generatedWords, setGeneratedWords] = useState(["Board", "Boil", "Bolt"]);

	const [messageList, setMessageList] = useState([]);

	const [inLobby, setInLobby] = useState([]);

	const [inGame, setInGame] = useState();

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

		socket.on("getRoomList", (roomList) => {

			setInLobby(roomList);

        });

		socket.on("leftRoom", (user) => {

			console.log(`${user} has left the lobby`);

            setInLobby(inLobby.filter(({playerName}) => { return playerName !== user }));

			setInGame(inGame?.filter((player) => { return player !== user }));

			setSelectedPlayers(selectedPlayers.filter((value) => { return value !== user }));

		});

		return () => {

			socket.removeAllListeners("redirectGame");
			socket.removeAllListeners("receiveCallsign");
			socket.removeAllListeners("getRoomList");
			socket.removeAllListeners("leftRoom");

		}

	}, [socket, generatedWords, generateWord, navigate, inLobby, inGame, selectedPlayers]);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

				<MessageContext.Provider value={[messageList, setMessageList]}>

					<LobbyContext.Provider value={[inLobby, setInLobby]}>

						<GameInfoContext.Provider value={[playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame]]}>

							<Routes>

								<Route exact path="/" element={<Home />} />

								<Route exact path="lobby/:roomID" element={<JoinRoom />} />

								<Route exact path="game/:roomID" element={<Game />} />

								<Route exact path="newhost/:roomID" element={<NewHost />} />

								<Route path="*" element={<Navigate replace to="/" />} />

							</Routes>

						</GameInfoContext.Provider>
					
					</LobbyContext.Provider>

				</MessageContext.Provider>

			</SocketContext.Provider>

		</div>

	);

}

export default App;
