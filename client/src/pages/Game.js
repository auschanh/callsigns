import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { getSvgPath } from "figma-squircle";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import WordGenerator from "../components/WordGenerator";
import CardStack from "../components/CardStack";
import Slider from "../components/Slider";
import GameMenu from "../components/GameMenu";
// import Step from "../components/Step"
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Switch } from "../components/ui/switch";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { User, Users, Copy, Check, LockKeyhole } from "lucide-react";

const Game = function (props) {
	
	const [socket, setSocket] = useSocketContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame]] = useGameInfoContext();

	const [sessionUrl, setSessionUrl] = useState();

	const [inLobby, setInLobby] = useLobbyContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	// const [divScreen, setDivScreen] = useState(100);

	const [intro1, setIntro1] = useState(false);

	const [intro2, setIntro2] = useState(false);
	
	const [intro3, setIntro3] = useState(false);

	const [enterHint, setEnterHint] = useState(false);

	const [hint, setHint] = useState(["", false]);

    const hintInputRef = useRef(null);

    const hintValidationRef = useRef(null);

	const [currentIndex, setCurrentIndex] = useState(0);

	const navigate = useNavigate();

	const { roomID } = useParams();

	// for host only
	const sendSelected = async () => {

		try {

			await socket.emit("setSelectedPlayers", selectedPlayers);

		} catch (error) {

			throw error;

		}

	};

	// useEffect(() => {

	// 	if (document.querySelector(".backgroundScreen")) {

	// 		setDivScreen(window.getComputedStyle(document.querySelector(".backgroundScreen"), null));

	// 	}

	// }, [document.querySelector(".backgroundScreen")], window);

	useEffect(() => {

		setTimeout(() => {

			setIntro1(true);

		}, 500);

		setTimeout(() => {

			setIntro2(true);

		}, 1000);

		setTimeout(() => {

			setIntro3(true);

		}, 2000);

		setTimeout(() => {

			setEnterHint(true);

		}, 3000);

	}, []);

	useEffect(() => {

		if (roomDetails === undefined) {

            console.log("checking room");

            (async () => {

                try {
    
                    await socket.emit("roomCheck", roomID);
    
                } catch (error) {
    
                    throw error;
    
                }
    
            })();

        }

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

			if (othersInLobby && playerName !== undefined) {

                setInGame(

					selectedPlayers.filter((player) => { return othersInLobby.find(({ playerName }) => { return playerName === player }) })
					
				);

                setRoomDetails(roomDetails);

				setIsClosedRoom(roomDetails.isClosedRoom);

				setInLobby(othersInLobby);

				setSessionUrl(sessionUrl);

            } else {

				// setRoomDetails(false);

				console.log(isClosedRoom);

				setIsClosedRoom(isClosedRoom);

            	setIsAlertOpen(true);

            }

        });

		// for host only
		socket.on("sendSelectedPlayers", () => {

			sendSelected();

		});

		socket.on("isRoomClosed", (isClosedRoom) => {

            setIsClosedRoom(isClosedRoom);

        });

        return () => {

            socket.removeAllListeners("roomExists");
			socket.removeAllListeners("sendSelectedPlayers");
			socket.removeAllListeners("isRoomClosed");
            
        }

    }, [socket, roomDetails, roomID, selectedPlayers, sendSelected, playerName]);

	const handleChange = (event) => {

        setHint([event.target.value, hint[1]]);

    }

	const handleSubmit = (event) => {

        event.preventDefault();

        if (hint[1]) {

            return;

        }

        if (hint[0].toLowerCase() === callsign.toLowerCase()) {

			hintInputRef.current.parentNode.parentNode.classList.add("pt-2");
            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot be the mystery word!"
            
        } else {

			hintInputRef.current.parentNode.parentNode.classList.remove("pt-2");
            hintInputRef.current.classList.remove("border-2");
            hintInputRef.current.classList.remove("border-red-500");
            hintInputRef.current.classList.add("border-slate-200");
            hintValidationRef.current.innerText = "";
            
            setHint([hint[0], true]);

        }
    }

	const _handleNext = (currentIndex) => {
		setCurrentIndex(currentIndex + 1);
	};

	const _handleComplete = () => {};

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
	};

	const _handleIndexChange = (index) => {
		setCurrentIndex(index);
	};

	const cards = [
		{
			title: "Round Start",
			color: "#52B2CF",
			phase: "Round Start"
		},
		{
			title: "Card 2",
			color: "#E5A36F",
			phase: "Generate CallSign Phase"
		},
		{
			title: "Card 3",
			color: "#9CADCE",
			phase: "Agents Hint Phase"
		},
		{
			title: "Card 4",
			color: "#D4AFB9",
			phase: "Eliminate Hints Phase"
		},
		{
			title: "Card 5",
			color: "#008080",
			phase: "Guess CallSign Phase"
		},
		{
			title: "Round End",
			color: "#FF0000",
			phase: "Round End"
		}
	];

	return (

		<>

			<div className="bg-black overflow-hidden flex">

				<div className="fixed w-1/5 h-screen mt-10 z-[9999]">
					<Slider onChange={_handleIndexChange} currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
				</div>

				<div className="flex-1">

					<CardStack cards={cards} 
						currentIndex={currentIndex} 
						handleNext={handleNext}
					/>

				</div>

			</div>

			{roomDetails && (

				<div className="h-screen w-screen flex flex-row flex-none bg-slate-800">

					<GameMenu roomDetails={roomDetails} isClosedRoomState={[isClosedRoom, setIsClosedRoom]} sessionUrl={sessionUrl} />

					<div className="flex flex-col flex-none h-screen w-screen rounded-xl items-center pt-20 justify-center">

						<div className="absolute top-[4%] flex flex-row gap-8">

							<div className="flex flex-col items-center">
								<Label className="text-xs text-slate-300">Callsign</Label>
								<div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
									<p className="text-sm text-center">{callsign}</p>
								</div>
							</div>

							<div className="flex flex-col items-center">
								<Label className="text-xs text-slate-300">Stranded Agent</Label>
								<div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
									<p className="text-sm text-center">{roomDetails.guesser}</p>
								</div>
							</div>

						</div>
					
						<div 
							className="backgroundScreen h-[80vh] w-[65vw] bg-black rounded-3xl text-green-600 font-mono p-16 overflow-hidden"
							// style={{
							// 	clipPath: `path('${getSvgPath({
							// 		width: divScreen["width"]?.slice(0, -2),
							// 		height: divScreen["height"]?.slice(0, -2),
							// 		cornerRadius: 100, // defaults to 0
							// 		cornerSmoothing: 0.8, // cornerSmoothing goes from 0 to 1
							// 	})}')`
							// }}
						>

							<div className={`transition-all ease-in-out duration-500 ${enterHint ? "invisible opacity-5" : ""}`}>

								{!enterHint && (

									<>

										{intro1 && (

											<>
												<p>{`% Secure link established: ${roomID} ...`}</p>
												<p>{`% [REDACTED]`}</p>
												<p>{`% [REDACTED]`}</p>
											</>

										)}

										{intro2 && (

											<>
												<p>{`% Connecting to remote terminal: ${roomDetails.guesser} ...`}</p>
												<p>{`% [REDACTED]`}</p>
												<p>{`% [REDACTED]`}</p>
											</>

										)}

										{intro3 && (

											<p>{`% Begin transmission:`}</p>

										)}

									</>

								)}

							</div>

							<div className={`h-full w-full transition-all ease-in-out duration-500 ${enterHint ? "" : "invisible opacity-5"}`}>

								{enterHint && (

									<div className="h-full w-full flex flex-row flex-none items-center justify-center text-black">

										<div className="bg-slate-200 border border-solid border-slate-400 p-8 rounded-lg">

											<form name="exampleForm"
												onSubmit={handleSubmit} 
												className="flex flex-col items-center w-full font-sans"
											>

												<Label htmlFor="example" className="mb-2">Enter a one-word hint:</Label>

												<div className="flex flex-row w-full justify-center items-end">

													<Input
														className="flex h-10 w-64 border border-solid border-slate-400"
														type="text" 
														id="example"
														name="hint" 
														value={hint[0]}
														onChange={handleChange}
														disabled={hint[1]}
														ref={hintInputRef}
													/>

													<Button 
														className="ml-2 w-24" 
														variant={hint[1] ? "green" : "default"} 
														type="submit"
													>
														{hint[1] ? "Submitted" : "Submit"}
													</Button>

												</div>

												<p className="mt-4 text-xs text-red-500" ref={hintValidationRef}></p>

											</form>

										</div>

									</div>

								)}

							</div>
						
						</div>

					</div>

				</div>

			) || (

				<div className="h-screen w-screen flex flex-col justify-center items-center bg-slate-700"></div>

			)}

			<AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
				<AlertDialogContent className="gap-0">

					<AlertDialogHeader className="space-y-2">
						<AlertDialogTitle className="mb-8">Welcome to Just One!</AlertDialogTitle>
					</AlertDialogHeader>
					
					{(isClosedRoom === null) && (

						<div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
							<p>Oops! It looks like this room doesn't exist.</p>
							<p>Please double check the link you were sent.</p>
						</div>

					) || (isClosedRoom) && (

						<div className="flex flex-col flex-none h-[20vh] pt-12 items-center text-slate-700">
							<p>This is a closed room.</p>
							<p>Please contact the host to join this room.</p>
						</div>

					) || (!isClosedRoom) && (

						<div className="flex flex-col flex-none h-[20vh] pt-10 items-center text-slate-700">
							<p>This game is already in progress.</p>
							<p>Join the lobby and get ready for the next round!</p>
							<Button className="mt-auto mb-2" onClick={() => {navigate(`/lobby/${roomID}`)}} variant="default">Join Lobby</Button>
						</div>

					)}

				</AlertDialogContent>
			</AlertDialog>

		</>

	);
};

export default Game;
