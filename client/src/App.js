import React, { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './css/styles.css';
import Home from './pages/Home';
import Game from './pages/Game';
import HowToPlay from './pages/HowToPlay';
import Button from './components/Button';
import SocketContext from './contexts/SocketContext';
import styles from './css/tailwindStylesLiterals';

import io from "socket.io-client";

const mainSocket = io.connect("http://localhost:3001");

function App() {

	const navigate = useNavigate();
	const location = useLocation();

	const [socket, setSocket] = useState(mainSocket);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>
				<div className="mt-4 ml-4">
				<Link to="/">

					<Button btnClass={styles.redButton} btnID="red-btn" label="Home" />

					</Link>

					<Link to="game">

					<Button btnClass={styles.blueButton} btnID="blue-btn" label="Game" />

					</Link>

					<Link to="howToPlay">

					<Button btnClass={styles.greenButton} btnID="green-btn" label="How To Play" />

					</Link>
				</div>
				

				<Routes>
					<Route path="/" exact element={ <Home /> } />
					<Route path="game" exact element={ <Game /> } />
					<Route path="howToPlay" exact element={ <HowToPlay /> } />
				</Routes>

			</SocketContext.Provider>

		</div>

	);
}

export default App;
