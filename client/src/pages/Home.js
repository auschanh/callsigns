import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import DialogPlay from '../components/DialogPlay.js';
import DialogHTP from '../components/DialogHTP';
import { useSocketContext } from '../contexts/SocketContext';

const Home = function () {

	const location = useLocation();

	const [socket, setSocket] = useSocketContext();

	const [playOpen, setPlayOpen] = useState(false);

	const [htpOpen, setHTPOpen] = useState(false);

	useEffect(() => {

		socket.on("connectToRoom", (message) => {

			console.log(message);

		});

		return () => { socket.removeAllListeners("connectToRoom"); }

	}, [socket]);

	const htpToPlay = () => {

		setHTPOpen(false);

		setPlayOpen(true);

	}

	return (

		<div className="h-screen w-screen bg-blue-950 flex flex-col items-center">
			<h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">
				Just One
			</h1>

			<div className="flex flex-row w-full justify-center gap-12">

				<DialogPlay tailwindStyles={"w-32 bg-green-600 text-white hover:bg-green-600/80 active:bg-green-500"} variant={"secondary"} triggerName={"Play"} isOpen={[playOpen, setPlayOpen]} />

				<DialogHTP tailwindStyles={"w-32 bg-red-600 text-white hover:bg-red-600/80 active:bg-red-500"} variant={"secondary"} isHTPOpen={[htpOpen, setHTPOpen]} htpToPlay={htpToPlay} />

			</div>

		</div>

	);
}

export default Home;