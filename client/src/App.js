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

	console.log(styles);

	return (

		<div className="App">

			<SocketContext.Provider value={[socket, setSocket]}>

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
