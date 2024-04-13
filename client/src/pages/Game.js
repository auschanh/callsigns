import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { getSvgPath } from "figma-squircle";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import WordGenerator from "../components/WordGenerator";
import CardStack from "../components/CardStack";
import Slider from "../components/Slider";
import GameMenu from "../components/GameMenu";
import Chat from "../components/Chat";
// import Step from "../components/Step"
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Switch } from "../components/ui/switch";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { MessageSquare } from "lucide-react";

const Game = function (props) {
	
	const [socket, setSocket] = useSocketContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting]] = useGameInfoContext();

	const [sessionUrl, setSessionUrl] = useState();

	const [inLobby, setInLobby] = useLobbyContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	const [isChatOpen, setIsChatOpen] = useState(false);

	const [newMessage, setNewMessage] = useState();

	// const [divScreen, setDivScreen] = useState(100);

	const [intro1, setIntro1] = useState(false);

	const [intro2, setIntro2] = useState(false);
	
	const [intro3, setIntro3] = useState(false);

	const [intro4, setIntro4] = useState(false);

	const [intro5, setIntro5] = useState(false);

	const [intro6, setIntro6] = useState(false);

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

			setIntro4(true);

		}, 3000);

		setTimeout(() => {

			setIntro5(true);

		}, 4000);

		setTimeout(() => {

			setIntro6(true);

		}, 5000);

		setTimeout(() => {

			setEnterHint(true);

		}, 6000);

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

				setRoomDetails(false);

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

	useEffect(() => {

        if (isChatOpen) {

            setNewMessage(false);

        }

    }, [isChatOpen]);

	const handleChange = (event) => {

        setHint([event.target.value, hint[1]]);

    }

	const handleSubmit = (event) => {

        event.preventDefault();

        if (hint[1]) {

            return;

        }

        if (hint[0].toLowerCase() === callsign.toLowerCase()) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot be the mystery word!"
            
        } else {

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
			color: "black",
			phase: "Round Start",
			content:  

				// <div className="backgroundScreen h-[80vh] w-[65vw] bg-black rounded-3xl text-green-600 font-mono p-16 overflow-hidden"
				// 	// style={{
				// 	// 	clipPath: `path('${getSvgPath({
				// 	// 		width: divScreen["width"]?.slice(0, -2),
				// 	// 		height: divScreen["height"]?.slice(0, -2),
				// 	// 		cornerRadius: 100, // defaults to 0
				// 	// 		cornerSmoothing: 0.8, // cornerSmoothing goes from 0 to 1
				// 	// 	})}')`
				// 	// }}
				// >

				<>

					<div className={`h-full flex flex-none flex-col text-green-600 font-mono transition-all ease-in-out duration-500 ${enterHint ? "invisible opacity-5" : "w-full"}`}>

						{!enterHint && (

							<>

								{intro1 && (

									<>
										<p>{`% Secure link established: ${roomDetails.roomName} ...`}</p>
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

									<>
										<p>{`% ...`}</p>
										<p>{`% ...`}</p>
										<p>{`% ...`}</p>
										<p>{`% Connection established`}</p>
										<p>{`% Begin transmission: `}<span>{intro4 && (<>.</>)}</span><span>{intro5 && (<>.</>)}</span><span>{intro6 && (<>.</>)}</span></p>
									</>

								)}

							</>

						)}

					</div>

					<div className={`h-full flex flex-none items-center justify-center transition-all ease-in-out duration-500 ${enterHint ? "w-full " : "invisible opacity-5"}`}>

						{enterHint && (

							<div className="w-[50%] bg-slate-200 border border-solid border-slate-400 p-8 rounded-lg text-black">

								<form
									name="exampleForm"
									onSubmit={handleSubmit} 
									className="flex flex-col items-center w-full font-sans pt-2"
								>

									<Label htmlFor="example" className="mb-3">Enter your one-word hint:</Label>

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

									<p className="mt-4 text-xs h-2 text-red-500" ref={hintValidationRef}></p>

								</form>

							</div>

						)}

					</div>

				</>
				
				// </div>
		},
		{
			title: "Card 2",
			color: "#E5A36F",
			phase: "Generate CallSign Phase",
			content: ""
		},
		{
			title: "Card 3",
			color: "#9CADCE",
			phase: "Agents Hint Phase",
			content: ""
		},
		{
			title: "Card 4",
			color: "#D4AFB9",
			phase: "Eliminate Hints Phase",
			content: ""
		},
		{
			title: "Card 5",
			color: "#008080",
			phase: "Guess CallSign Phase",
			content: ""
		},
		{
			title: "Round End",
			color: "#FF0000",
			phase: "Round End",
			content: ""
		}
	];

	return (

		<>

			{/* 

				<div className="flex-1">

					<CardStack cards={cards} 
						currentIndex={currentIndex} 
						handleNext={handleNext}
					/>

				</div>

			*/}

			{roomDetails && (

				<div className="relative h-screen w-screen flex flex-col flex-none items-center justify-center bg-slate-800 overflow-hidden">

					<div className="absolute left-5 z-[50]">
						<Slider onChange={_handleIndexChange} currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
					</div>

					<GameMenu roomDetails={roomDetails} isClosedRoomState={[isClosedRoom, setIsClosedRoom]} sessionUrl={sessionUrl} />
					
					<Popover open={isChatOpen} onOpenChange={setIsChatOpen}>

						<PopoverTrigger asChild>
							<div className="absolute top-0 right-0 mt-6 mr-20">
								<div className="relative">
									<Button className="p-0 aspect-square mb-1" variant="outline"><MessageSquare size={14} /></Button>
									<div className={`absolute -top-1 -right-1 aspect-square w-2.5 rounded-full bg-cyan-500 transition-all duration-500 ${isPlayerWaiting ? "" : "invisible opacity-5"}`} />
								</div>
							</div>
						</PopoverTrigger>

						<PopoverContent className="w-96 h-[80vh] overflow-auto mr-20 p-4">

							<Chat chatExpanded={isChatOpen} username={playerName} roomName={roomDetails.roomName} roomID={roomID} setNewMessage={setNewMessage} />

						</PopoverContent>

       				 </Popover>

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

					<CardStack cards={cards} 
						currentIndex={currentIndex} 
						handleNext={handleNext}
					/>

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
