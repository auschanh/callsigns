import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import { getSvgPath } from "figma-squircle";
import WordGenerator from "../components/WordGenerator";
import CardStack from "../components/CardStack";
import Slider from "../components/Slider";
import GameMenu from "../components/GameMenu";
import Chat from "../components/Chat";
import SubmitHint from "../components/SubmitHint";
import SelectHint from "../components/SelectHint";
import RevealHint from "../components/RevealHint";
// import Step from "../components/Step"
import { AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "../components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
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

	const [newMessage, setNewMessage] = useState(false);

	const [enterHint, setEnterHint] = useState(false);

	const [hint, setHint] = useState(["", false]);

	const [submissions, setSubmissions] = useState();

	const [results, setResults] = useState([]);

	const [isVoted, setIsVoted] = useState();

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

				const playing = selectedPlayers.filter((player) => { return othersInLobby.find(({ playerName }) => { return playerName === player }) });

                setInGame(playing);

				setSubmissions(

					playing.map((player) => {
		
						return ({
			
							playerName: player,
							hint: ""
			
						});
			
					})

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

		socket.on("receiveHint", (playerName, hint) => {

			setSubmissions(

				submissions.map((submission) => {

					if (submission.playerName === playerName) {

						return ({...submission, hint: hint});

					} else {

						return submission;

					}

				})

			);

		});

		socket.on("receiveVote", (playerName, externalResults, voted) => {

			setResults(

				results.map((result) => {

					const externalRecord = externalResults.find((record) => { return record.playerName === result.playerName });

					return {...result, count: externalRecord.count }

				})

			);

			setIsVoted(

				isVoted.map((player) => {

					return player.playerName === playerName ? {...player, voted: voted} : player;

				})

			);

			console.log("just voted");
			
		});

        return () => {

            socket.removeAllListeners("roomExists");
			socket.removeAllListeners("sendSelectedPlayers");
			socket.removeAllListeners("isRoomClosed");
			socket.removeAllListeners("receiveHint");
			socket.removeAllListeners("receiveVote");
            
        }

    }, [socket, roomDetails, roomID, selectedPlayers, sendSelected, playerName, submissions, results, isVoted]);

	useEffect(() => {

        if (isChatOpen) {

            setNewMessage(false);

        }

    }, [isChatOpen]);

	useEffect(() => {

		setSubmissions(

			submissions?.filter((submission) => { return inGame.includes(submission.playerName)})

		);

		setIsVoted(

			inGame?.map((player) => {

				return ({

					playerName: player,
					voted: false

				});

			})

		);

	}, [inGame]);

	useEffect(() => {

		if (submissions?.every((submission) => { return submission.hint !== ""})) {

			setResults(

				submissions.map((submission) => {

					return {...submission, count: 0, toRemove: false, beenRemoved: false, visible: true};
		
				})

			);

			handleNext();

		}

	}, [submissions]);

	useEffect(() => {

		if (isVoted !== undefined) {

			if (isVoted.every((player) => { return player.voted === true })) {

				handleNext();
	
			}

		}

	}, [isVoted]);

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
			// #FFF5DB
			phase: "Round Start",
			content:  

				<SubmitHint enterHintState={[enterHint, setEnterHint]} roomDetails={roomDetails} hintState={[hint, setHint]} submissionsState={[submissions, setSubmissions]} />
				
		},
		{
			title: "Card 2",
			phase: "Generate CallSign Phase",
			content: 

				<SelectHint resultsState={[results, setResults]} roomDetails={roomDetails} playerName={playerName} />

		},
		{
			title: "Card 3",
			phase: "Agents Hint Phase",
			content: 
			
				<RevealHint resultsState={[results, setResults]} />


		}
	];

	return (

		<>

			{roomDetails && (

				<div className="relative h-screen w-screen flex flex-col flex-none items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%">

					<div className="absolute left-5 z-[50]">
						<Slider onChange={_handleIndexChange} currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
					</div>

					<GameMenu roomDetails={roomDetails} isClosedRoomState={[isClosedRoom, setIsClosedRoom]} sessionUrl={sessionUrl} />
					
					<Popover open={isChatOpen} onOpenChange={setIsChatOpen}>

						<PopoverTrigger asChild>
							<div className="absolute top-0 right-0 mt-6 mr-20">
								<div className="relative">
									<Button className="p-0 aspect-square mb-1" variant="outline"><MessageSquare size={14} /></Button>
									<div className={`absolute -top-1 -right-1 aspect-square w-2.5 rounded-full bg-cyan-500 transition-all duration-500 ${newMessage ? "" : "invisible opacity-5"}`} />
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
							<div className="flex mt-1 p-1 w-48 justify-center rounded-md bg-amber-400 hover:bg-amber-400/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								<p className="text-sm text-center">{callsign}</p>
							</div>
						</div>

						<div className="flex flex-col items-center">
							<Label className="text-xs text-slate-300">Stranded Agent</Label>
							<div className="flex mt-1 p-1 w-48 justify-center rounded-md bg-green-500 hover:bg-green-500/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								<p className="text-sm text-center">{roomDetails.guesser}</p>
							</div>
						</div>

					</div>

					<div>

						<div className={`pointer-events-none absolute z-50 mt-[5vh] h-[75vh] w-[65vw] rounded-3xl border border-solid shadow-[inset_0rem_0rem_2rem_0.1rem_#12873b] border-green-800 transition-[opacity,_visibility] ease-in-out duration-1000 ${enterHint ? "invisible opacity-5" : ""}`} />
						<div className={`pointer-events-none absolute z-50 mt-[5vh] h-[75vh] w-[65vw] rounded-3xl border border-solid shadow-[inset_0rem_0rem_2rem_0.1rem_#7d7669] border-stone-500 transition-[opacity,_visibility] ease-in-out duration-1000 ${enterHint ? "" : "invisible opacity-5"}`} />
						
						<CardStack cards={cards} 
							currentIndex={currentIndex} 
							handleNext={handleNext}
						/>

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
