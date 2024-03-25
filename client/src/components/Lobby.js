import React, { useEffect, useState } from "react";
import { DialogFooter } from "./ui/dialog";
import { Button } from "../components/ui/button";
import { Link } from 'react-router-dom';
import { Badge } from "../components/ui/badge";
import { useSocketContext } from "../contexts/SocketContext";
import { Copy, Check, ChevronLeft } from "lucide-react";

const Lobby = function ({ gameInfo, sessionUrl, inLobby, previousSlide }) {

	const [socket, setSocket] = useSocketContext();

	const [totaPlayers, setTotalPlayers] = useState(0);

	const [playersInLobby, setPlayersInLobby] = useState(inLobby);

	const [copied, setCopied] = useState(false);

	const username = gameInfo.username;

	const roomName = gameInfo.roomName;

	useEffect(() => {

        (async () => {

            try {

                await socket.emit("listLobby", setPlayersInLobby);

            } catch (error) {

                throw error;

            }

        })();

        socket.on("joinedLobby", (players) => {

            console.log(players);

			setPlayersInLobby(players);

        });

        return () => {

            socket.removeAllListeners("joinedLobby");

        }

    }, [socket, username, roomName, inLobby]);

	const handleCopy = async () => {

		try {

			if ("clipboard" in navigator) {

				await navigator.clipboard.writeText(sessionUrl);
				
			} else {

				document.execCommand("copy", true, sessionUrl);

			}

			setCopied(true);

			setTimeout(() => {

				setCopied(false);

			}, 1000);

		} catch (error) {

			throw error;

		}

	}

	return (

		<>

			<div className="flex flex-col bg-slate-200 border-slate-400 rounded-md">

				<div>

					<Button className="px-0 pl-2 pr-4 mb-8" onClick={previousSlide}>
						<ChevronLeft size={24} />
						<p>Edit</p>
					</Button>

					{/* <div className="justify-center text-center">

						<div className="flex flex-col w-full items-center mb-8">

							<div className="flex p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
								<p className="flex text-xl text-center">{gameInfo.roomName}</p>
							</div>

						</div>

					</div>

					<div className="block">

						<p>
							<span className="font-bold">Username: </span> {gameInfo.username}
						</p>

						<p>
							<span className="font-bold">Room Name: </span> {gameInfo.roomName}
						</p>

						<p>
							<span className="font-bold">Number of Players: </span> {gameInfo.numPlayers}
						</p>

						<p>
							<span className="font-bold">AI Players: </span> {gameInfo.aiPlayers}
						</p>

					</div> */}

				</div>

				<div className="mt-4 flex gap-x-1">

					{playersInLobby && playersInLobby.map((player, index) => {

						return (

							<Badge key={index}>{player}</Badge>

						);

					})}

				</div>

				{sessionUrl && (

					<>
						<div>{sessionUrl}</div>
						<Button className="transition-colors ease-out duration-500" onClick={handleCopy} variant={copied ? "green" : "default"}>{ (!copied && <Copy size={12} />) || <Check size={14} /> }</Button>
					</>

				)}

				{/* <div className="border border-black mt-2 max-h-full flex-1 h-auto max-w-screen"></div> */}


			</div>

			{/* <DialogFooter>

				<Link to="game">
					<Button className="mt-4">Start Game</Button>
				</Link>

			</DialogFooter> */}

		</>

	);
};

export default Lobby;
