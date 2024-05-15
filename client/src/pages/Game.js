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
import { useMessageContext } from "../contexts/MessageContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { MessageSquare } from "lucide-react";
import { stemmer } from "stemmer";
import pluralize from "pluralize";

function Game() {
	
	const [socket, setSocket] = useSocketContext();

	const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();

	const [sessionUrl, setSessionUrl] = useState();

	const [inLobby, setInLobby] = useLobbyContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	const [enterHint, setEnterHint] = useState(false);

	const [hint, setHint] = useState(["", false]);

	const [submissions, setSubmissions] = useState();

	const [results, setResults] = useState([]);

	const [isVoted, setIsVoted] = useState();

	const [voteList, setVoteList] = useState(isVoted?.filter(player => player.voted === true));

	const [currentIndex, setCurrentIndex] = useState(0);

	const [currentRound, setCurrentRound] = useState(0);

	// state for words
	const [guess, setGuess] = useState("callsign");

	const [clicked, setClicked] = useState(false);

	const [correctGuess, setCorrectGuess] = useState(null);

	const [errMsg, setErrMsg] = useState(false);

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

				setResults(

					playing.map((player) => {
	
						return ({

							playerName: player,
							hint: "",
							count: 0,
							toRemove: false,
							beenRemoved: false,
							visible: true
						
						});
			
					})
	
				);

				setIsVoted(

					playing.map((player) => {

						return ({

							playerName: player,
							voted: false

						});

					})

				);

                setRoomDetails(roomDetails);

				setGuesser(roomDetails.guesser);

				setIsGameStarted(roomDetails.isGameStarted);

				setIsClosedRoom(roomDetails.isClosedRoom);

				setInLobby(othersInLobby);

				setSessionUrl(sessionUrl);

				if (playerName === roomDetails.host) {

					(async () => {

						try {
			
							await socket.emit("announceGameStart", playing, roomDetails);
			
						} catch (error) {
			
							throw error;
			
						}
			
					})();

				}

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

			setResults(

				results.map((result) => {

					if (result.playerName === playerName) {

						return ({...result, hint: hint});

					} else {

						return result;

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

	// consolidate into just inGame
	useEffect(() => {

		setSubmissions(

			submissions?.filter((submission) => { return inGame.includes(submission.playerName)})

		);

		setResults(

			results?.filter((player) => {

				if (player.hint !== "") {

					return player;

				} else {

					return inGame.includes(player.playerName);

				}

			})

		);

		setIsVoted(

			isVoted?.filter((player) => { return inGame.includes(player.playerName) })

		);

	}, [inGame]);

	useEffect(() => {

		if (submissions?.every((submission) => { return submission.hint !== ""})) {

			setCurrentIndex(1);

		}

	}, [submissions]);

	useEffect(() => {

		if (isVoted?.every((player) => { return player.voted === true })) {

			setResults(

				results.map((result) => {

					if (result.count >= (Math.floor(isVoted.length / 2) + 1)) {

						return {...result, visible: false};

					} else {

						return result;

					}

				})

			);

			setCurrentIndex(2);

		}

	}, [isVoted]);

	useEffect(() => {
		if(currentIndex === 0){
			setCurrentRound(currentRound+1);
		}
	}, [currentIndex])

	const validateWord = (w) => {
		return !/^[a-z]+$/.test(w) // only one word, lowercase and no special chars
	}

	const stemmerWord = (w) => {
		return stemmer(w);
	}

	const singularizeWord = (w) => {
		return pluralize.singular(w);
	}

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
	};

	const cards = [

		{
			title: "Hint Selection",

			phase: 
				<p>
					<span>{`Come up with a one-word hint to help `}</span>
					<span className="font-semibold">{roomDetails?.guesser}</span>
					<span>{` guess their callsign`}</span>
				</p>,

			content:  

				<SubmitHint 
				enterHintState={[enterHint, setEnterHint]} 
				roomDetails={roomDetails} 
				hintState={[hint, setHint]} 
				submissionsState={[submissions, setSubmissions]} 
				validateWord={validateWord}
				stemmerWord={stemmerWord}
				singularizeWord={singularizeWord}
				/>
				
		},
		{
			title: "Hint Elimination",
			phase: "Decide which hints are too similar or illegal",
			content: 

				<SelectHint 
				resultsState={[results, setResults]} 
				submissions={submissions}
				roomDetails={roomDetails} 
				playerName={playerName} 
				isVoted={isVoted}
				/>

		},
		{
			title: "Hint Transmission",
			
			phase: 
				<p>
					<span>{`Reveal all approved hints to `}</span>
					<span className="font-semibold">{roomDetails?.guesser}</span>
				</p>,		

			content: 
			
				<RevealHint 
				resultsState={[results, setResults]} 
				roomDetails={roomDetails}
				handleNext={handleNext} 
				currentIndexState={currentIndex}
				guessState={[guess, setGuess]}
				guessCorrectState={[correctGuess, setCorrectGuess]}
				validateWord={validateWord}
				stemmerWord={stemmerWord}
				singularizeWord={singularizeWord} 
				/>


		}
	];

	return (

		<>

			{roomDetails && (

				<div className="relative h-screen w-screen flex flex-col flex-none items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%">

					<div className="absolute left-5 z-[50]">
						<Slider currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
						<div className="text-white mt-6">
							Round {currentRound}/4
						</div>
					</div>

					<GameMenu roomDetails={roomDetails} isClosedRoomState={[isClosedRoom, setIsClosedRoom]} sessionUrl={sessionUrl} />
					
					<Popover open={chatExpanded} onOpenChange={setChatExpanded}>

						<PopoverTrigger asChild>
							<div className="absolute top-0 right-0 mt-6 mr-20">
								<div className="relative">
									<Button className="p-0 aspect-square mb-1" variant="outline"><MessageSquare size={14} /></Button>
									<div className={`absolute -top-1 -right-1 aspect-square w-2.5 rounded-full bg-cyan-500 transition-all duration-500 ${newMessage ? "" : "invisible opacity-5"}`} />
								</div>
							</div>
						</PopoverTrigger>

						<PopoverContent className="w-96 h-[80vh] overflow-auto mr-20 p-4">

							<Chat username={playerName} roomName={roomDetails.roomName} roomID={roomID} />

						</PopoverContent>

       				</Popover>

					<div className="absolute top-[4%] flex flex-row gap-8">

						<div className="flex flex-col items-center">
							<Label className="text-xs text-slate-300">Callsign</Label>
							<div className="flex mt-1 py-1 px-4 w-48 justify-center rounded-md bg-amber-400 hover:bg-amber-400/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								<p className="text-sm text-center">{callsign}</p>
							</div>
						</div>

						<div className="flex flex-col items-center">
							<Label className="text-xs text-slate-300">Stranded Agent</Label>
							<div className="flex mt-1 py-1 px-4 w-48 justify-center rounded-md bg-green-500 hover:bg-green-500/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								<p className="text-sm text-center">

									{roomDetails.guesser.length > 20 && (

										`${roomDetails.guesser.substring(0, 20)}...`

									) || (

										roomDetails.guesser

									)}

								</p>
							</div>
						</div>

					</div>

					<div>

						<div className={`pointer-events-none absolute z-40 mt-[5vh] h-[75vh] w-[65vw] rounded-3xl border border-solid shadow-[inset_0rem_0rem_2rem_0.1rem_#12873b] border-green-800 transition-[opacity,_visibility] ease-in-out duration-1000 ${enterHint ? "invisible opacity-5" : ""}`} />
						<div className={`pointer-events-none absolute z-40 mt-[5vh] h-[75vh] w-[65vw] rounded-3xl border border-solid shadow-[inset_0rem_0rem_2rem_0.1rem_#7d7669] border-stone-500 transition-[opacity,_visibility] ease-in-out duration-1000 ${enterHint ? "" : "invisible opacity-5"}`} />
						
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

						<div className="flex flex-col flex-none h-[20vh] pt-[6%] items-center text-slate-700">
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
