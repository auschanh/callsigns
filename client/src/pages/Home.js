import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import DialogPlay from '../components/DialogPlay.js';
import DialogHTP from '../components/DialogHTP';

const Home = function () {

	const location = useLocation();

	const [playOpen, setPlayOpen] = useState(false);

	return (

		<div className="h-screen w-screen bg-blue-950 flex flex-col items-center">
			<h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">
				Just One
			</h1>

			<div className="flex flex-row w-full justify-center gap-12">

				<DialogPlay tailwindStyles={"w-32 bg-green-600 text-white hover:bg-green-600/80"} variant={"secondary"} triggerName={"Play"} isOpen={[playOpen, setPlayOpen]} />

				<DialogHTP tailwindStyles={"w-32 bg-red-600 text-white hover:bg-red-600/80"} variant={"secondary"} isPlayOpen={[playOpen, setPlayOpen]} />

			</div>

		</div>

	);
}

export default Home;