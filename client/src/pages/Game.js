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
import { MessageSquare, TriangleAlert } from "lucide-react";
import { ReactComponent as HiddenIcon } from "../assets/noun-hidden-5642408.svg";
import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";
import { stemmer } from "stemmer";
import pluralize from "pluralize";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";


function Game() {
	
	const [socket, setSocket] = useSocketContext();

	const [[messageList, setMessageList], [chatExpanded, setChatExpanded], [newMessage, setNewMessage]] = useMessageContext();

	const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();

	const [sessionUrl, setSessionUrl] = useState();

	const [[inLobby, setInLobby], regPlayerCount] = useLobbyContext();

	const [isAlertOpen, setIsAlertOpen] = useState(false);

	const [roomDetails, setRoomDetails] = useState();

	const [isClosedRoom, setIsClosedRoom] = useState();

	const [enterHint, setEnterHint] = useState(false);

	const [hint, setHint] = useState(["", false]);

	const [submissions, setSubmissions] = useState();

	const [results, setResults] = useState([]);

	const [isVoted, setIsVoted] = useState();
	
	const [readyNextRound, setReadyNextRound] = useState([]);

	const [voteList, setVoteList] = useState(isVoted?.filter(player => player.voted === true));

	const [currentIndex, setCurrentIndex] = useState(0);

	const [currentRound, setCurrentRound] = useState(1);

	const [voted, setVoted] = useState(false);

	// state for words
	const [guess, setGuess] = useState("");

	const [clicked, setClicked] = useState(false);

	const [correctGuess, setCorrectGuess] = useState(false);

	const [remainingGuesses, setRemainingGuesses] = useState();

	const [startFade, setStartFade] = useState(false);

	const [timeLimitReached, setTimeLimitReached] = useState(false);

	const [showError, setShowError] = useState(false);

	const [submitted, setSubmitted] = useState(false);

	const [validate, setValidate] = useState(false);

	const [isLastRound, setIsLastRound] = useState(false);

    const [showEndGame, setShowEndGame] = useState(false);

	const [revealCallsign, setRevealCallsign] = useState([false, false, false]);

	const [prepRevCallsign, setPrepRevCallsign] = useState(false);

	const [scores, setScores] = useState([]);

	const [sortedScores, setSortedScores] = useState([]);

	const [tempScores, setTempScores] = useState([]);

	const [menuScore, setMenuScore] = useState(false);

	const [showScore, setShowScore] = useState(false);

	const [fadeBorder, setFadeBorder] = useState(false);

	const [hintArray, setHintArray] = useState([]);

	const [encryptedCallsign, setEncryptedCallsign] = useState();

	const [isLoadingNextRound, setIsLoadingNextRound] = useState(false);

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

	const handleNext = async () => {
		
		try {

			await socket.emit("setNextSlide", roomDetails.roomID);

		} catch (error) {

			throw error;

		}

	};

	const resetRound = (othersInLobby, roomDetails) => {

		if (othersInLobby && playerName !== undefined) {

			setHint(["", false]);

			setVoted(false);

			setGuess("");

			setMenuScore(false);

			setTempScores([]);

			setSubmissions(

				inGame.map((player) => {
	
					return ({
		
						playerName: player,
						hint: ""
		
					});
		
				})

			);

			setResults(

				inGame.map((player) => {

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

				inGame.map((player) => {

					return ({

						playerName: player,
						voted: false

					});

				})

			);

			setTimeout(() => {

				setCorrectGuess(false);

				setReadyNextRound(

					inGame.map((player) => {
		
						return ({
		
							playerName: player,
							readyNext: false
		
						});
		
					})
		
				);

			}, 1000);

			setRoomDetails(roomDetails);

			setRemainingGuesses(roomDetails.numGuesses);

			setIsClosedRoom(roomDetails.isClosedRoom);

			setInLobby(othersInLobby);

			if (currentRound === roomDetails.numRounds) {

				setScores( 

					inGame.map((player) => {

						return ({

							playerName: player,
							score: 0,
							correctGuesses: 0,
							goodHints: 0,
							badHints: 0

						});

					})

				);

				setSortedScores([]);

				setCurrentRound(0);

			}

		} else {

			setRoomDetails(false);

			console.log(isClosedRoom);

			setIsClosedRoom(isClosedRoom);

			setIsAlertOpen(true);

		}

	}

	const getId = (length) => {

        let result = '';

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        while (result.length < length) {

            result += characters.charAt(Math.floor(Math.random() * characters.length));

        }

        return result;

    }

	const triggerEndRound = () => {

		setStartFade(true);

		setTimeout(() => {

			setStartFade(false);

			setSubmitted(true);

		}, 1000);

		// host only, pick the next guesser
		if (playerName === roomDetails.host) {

			(async () => {

				try {

					const joinOrder = inLobby.map((player) => { return player.playerName });
	
					await socket.emit("selectNextGuesser", roomDetails.roomID, selectedPlayers, joinOrder);
	
				} catch (error) {
	
					throw error;
	
				}
	
			})();

		}

	}

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

	}, [roomDetails, roomID]);

	useEffect(() => {

        socket.on("roomExists", (othersInLobby, sessionUrl, roomDetails, inRoom, isClosedRoom) => {

			if (othersInLobby && playerName !== undefined) {

				setRoomDetails(roomDetails);

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

				setReadyNextRound(

					playing.map((player) => {
		
						return ({
		
							playerName: player,
							readyNext: false
		
						});
		
					})
		
				);

				const resetScores = playing.map((player) => {

					return ({

						playerName: player,
						score: 0,
						correctGuesses: 0,
						goodHints: 0,
						badHints: 0

					});

				});

				setScores(resetScores);

				setSortedScores(resetScores);

				setRemainingGuesses(roomDetails.numGuesses);

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

		socket.on("receiveSubmitGuess", (isCorrect) => {

			setEncryptedCallsign(getId(32));

            if (isCorrect) {

                setCorrectGuess(true);

				triggerEndRound();

            } else {

				if (remainingGuesses > 1) {

					setCorrectGuess(false);

				}

				if (remainingGuesses !== 11) {

					setRemainingGuesses(prev => prev - 1);

				}

            }

        });

		socket.on("receiveNextSlide" , () => {

			const newIndex = (currentIndex + 1) % cards.length;
			setCurrentIndex(newIndex);

			if (newIndex === 0) {
				setCurrentRound(currentRound => currentRound + 1);
			}

		});

		socket.on("receiveNextGuesser", (roomDetails) => {

			setRoomDetails(roomDetails);

		});

		// update toggle for all users
        socket.on("receiveToggle", (readyState) => {

            setReadyNextRound(readyState);

			if (readyState.every((player) => { return player.readyNext })) {

				setIsLoadingNextRound(true);

				setGuesser(roomDetails.guesser);

				setRevealCallsign([false, false, false]);

				if (playerName === roomDetails.host) {

					console.log("TRIGGER NEXT ROUND");
	
					(async () => {
	
						try {
			
							await socket.emit("generateNewCallsign");
			
						} catch (error) {
			
							throw error;
			
						}
			
					})();
	
				}

			}

        });

		socket.on("receiveNextRound", (othersInLobby, roomDetails) => {

			resetRound(othersInLobby, roomDetails);

			setStartFade(true);

			setFadeBorder(true);

			setTimeout(() => {

				setShowScore(false);

				setValidate(false);

				if (playerName === roomDetails.host) {

					handleNext();

				}

				setTimeout(() => {

					setStartFade(false);

					setFadeBorder(false);

					setIsLoadingNextRound(false);

				}, 1000);

			}, 1000);

		});

		socket.on("receiveHintArray", (duplicates) => {

			setHintArray(duplicates);

		});

        return () => {
			
            socket.removeAllListeners("roomExists");
			socket.removeAllListeners("sendSelectedPlayers");
			socket.removeAllListeners("isRoomClosed");
			socket.removeAllListeners("receiveHint");
			socket.removeAllListeners("receiveVote");
			socket.removeAllListeners("receiveSubmitGuess");
			socket.removeAllListeners("receiveNextSlide");
			socket.removeAllListeners("receiveNextGuesser");
			socket.removeAllListeners("receiveToggle");
			socket.removeAllListeners("receiveNextRound");
			socket.removeAllListeners("receiveHintArray");

        }

    }, [socket, roomDetails, selectedPlayers, sendSelected, playerName, submissions, results, isVoted, remainingGuesses, handleNext, resetRound, currentIndex]);

	// consolidate into just inGame
	// disconnect protection
	// remove disconnected players so we don't have to wait for their input
	useEffect(() => {

		// we don't want to wait for disconnected players to submit a hint
		// filter out submissions of disconnected players
		setSubmissions(

			submissions?.filter((submission) => { return inGame.includes(submission.playerName)})

		);

		// if a disconnected player has already submitted a hint, leave the hint
		setResults(
	
			results?.filter((player) => {

				if (player.hint !== "") {

					return player;

				} else {

					return inGame.includes(player.playerName);

				}

			})

		);

		// we don't want to wait for disconnected players to vote
		// filter out has-voted-status of disconnected players
		setIsVoted(

			isVoted?.filter((player) => {

				if (player.voted) {

					return player;

				} else {

					return inGame.includes(player.playerName);

				}

			})

		);

		// we don't want to wait for disconnected players to ready up for the next round
		const readyInGame = readyNextRound?.filter((player) => { return inGame.includes(player.playerName) });

		setReadyNextRound(readyInGame);

		if (!isLoadingNextRound && readyInGame.length >= 3 && readyInGame.every((player) => { return player.readyNext })) {

			setIsLoadingNextRound(true);

			setGuesser(roomDetails.guesser);

			setRevealCallsign([false, false, false]);

			if (playerName === roomDetails.host) {

				console.log("TRIGGER NEXT ROUND");

				(async () => {

					try {
		
						await socket.emit("generateNewCallsign");
		
					} catch (error) {
		
						throw error;
		
					}
		
				})();

			}

		}

		// remove disconnected players from score table
		setScores(

			scores?.filter((player) => { return inGame.includes(player.playerName) })

		);

		setSortedScores(

			sortedScores?.filter((player) => { return inGame.includes(player.playerName) })

		);

		// we don't want to wait for a disconnected guesser to guess on the last slide





	// live list of players currently in the game (not just in the lobby)
	}, [inGame]);

	useEffect(() => {

		const excludeGuesser = submissions?.filter((submission) => { return submission.playerName !== guesser });

		if (enterHint && playerName === roomDetails.host && excludeGuesser?.every((submission) => { return submission.hint !== "" })) {

			// every submitted a hint, create hint Array
			const tempHintArray = excludeGuesser.map((player, index) => {
				return player.hint
			});


			const duplicates = tempHintArray.filter((currHint, index) => {
				return tempHintArray.some((hint, i) => {
					return currHint === hint && index !== i 
				})
			});

			console.log(duplicates);

			socket.emit("sendHintArray", roomDetails.roomID, duplicates);

			if (currentIndex === 0) {

				console.log("HOST set current index: 1");

				handleNext();

			}

		}

	}, [submissions]);


	useEffect(() => {

		// removes guesser from pool, removes voted out hints, and calculates score
		const excludeGuesser = isVoted?.filter((player) => { return player.playerName !== guesser });

		if (enterHint && excludeGuesser?.every((player) => { return player.voted === true })) {

			const votedOutResults = results.map((result) => {

				if (result.count >= (Math.ceil(excludeGuesser.length / 2))) {

					return {...result, visible: false};

				} else {

					return result;

				}

			});

			setResults(votedOutResults);

			console.log(votedOutResults.map(result => {
				return result.visible === false ? result.playerName : null;
			}));

			const newScores = scores.map((player => {

				if(votedOutResults.map(result => {
					return result.visible === true ? result.playerName : null;}).includes(player.playerName)
					&& player.playerName !== guesser
				){
						console.log("voted out here")
						return {...player, score: player.score + 1, goodHints: player.goodHints + 1}

				} else if(player.playerName !== guesser) {

					return {...player, badHints: player.badHints + 1};

				} else {
					return player;
				}

			}))

			setScores(newScores);

			const sorted = [...newScores].sort((a,b) => b.score - a.score);
			setSortedScores(sorted);

			if (playerName === roomDetails.host) {

				if (currentIndex === 1) {

					console.log("HOST set current index: 2");
	
					handleNext();
	
				}

			}

		}

	}, [isVoted]);

	useEffect(() => {

		if (timeLimitReached && currentIndex % cards.length !== 2) {

			setTimeout(() => {

				setTimeLimitReached(undefined);

				if (playerName === roomDetails.host) {

					console.log("HOST will trigger new slide");

					handleNext();

				}

			}, 7000);

			setTimeout(() => {

				setTimeLimitReached(false);

			}, 7200);

		} else if (timeLimitReached && currentIndex % cards.length === 2) {

			setTimeLimitReached(false);

			setSubmitted(true);

		}

	}, [timeLimitReached]);


	useEffect(() => {

        if (remainingGuesses === 0) {

			triggerEndRound();

        }

    }, [remainingGuesses]);


	useEffect(() => {

        if (currentIndex === 1) {

            setPrepRevCallsign(true);

        }

    }, [currentIndex]);


	// useEffect(() => {

	// 	socket.on("receiveUpdateRound" , () => {

	// 		const newIndex = (currentIndex + 1) % cards.length;
	// 		setCurrentIndex(newIndex);

	// 		if (newIndex === 0) {
	// 			setCurrentRound(currentRound => currentRound + 1);

	// 		}
	// 	})

	// 	return () => socket.removeAllListeners("receiveUpdateRound");

	// }, [currentIndex, socket]);


	useEffect(() => {

		// runs when guesser guesses correctly
		socket.on("receiveUpdateScore" , () => {

			// calculate number of hints eliminated
			let numRemovedHints = 0;

			let removedHints = [];

			results.map(result => {

				if (result.visible === false) {

					removedHints.push(result.hint);

				}

			});

			numRemovedHints = removedHints.length;

			setTempScores(

				scores.map((player) => {

					if (player.playerName === guesser) {

						return {

							...player,
							score: player.score + numRemovedHints + 1,
							correctGuesses: player.correctGuesses + 1

						}

					} else {

						return player;

					}

				})

			);
			
		});

		// const sortedScores = [...scores].sort((a,b) => b.score - a.score);
		// setSortedScores(sortedScores);

		return () => socket.removeAllListeners("receiveUpdateScore");

	}, [socket, guesser, submitted, results, scores]);

	useEffect(() => {

		if (isLoadingNextRound === false) {

			const readyInGame = readyNextRound?.filter((player) => { return inGame.includes(player.playerName) });

			setReadyNextRound(readyInGame);

		}

	}, [isLoadingNextRound]);

	const validateWord = (w) => {
		return !/^[a-z]+$/.test(w) // only one word, lowercase and no special chars
	}

	const stemmerWord = (w) => {
		return stemmer(w);
	}

	const singularizeWord = (w) => {
		return pluralize.singular(w);
	}

	const generateScoreTable = (cellColour, agentColour) => {
		let table = <Table className={`text-${cellColour} w-full h-full`}>
			<TableHeader className="w-full h-full">
				<TableRow className="w-full h-full text-xs">
					<TableHead className="h-0 pb-4 text-center"></TableHead>
					<TableHead className="h-0 pb-4 text-center">Player</TableHead>
					<TableHead className="h-0 pb-4 text-center">Score</TableHead>
					<TableHead className="h-0 pb-4 text-center">Correct Guesses</TableHead>
					<TableHead className="h-0 pb-4 text-center">Good Hints</TableHead>
					<TableHead className="h-0 pb-4 text-center">Bad Hints</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody className="text-center">
				
				{
					sortedScores.map((player, index) => {
						return (<TableRow key={index} className={`${cellColour === "white" ? "hover:bg-gradient-to-r from-black from-10% via-slate-900 via-50% to-black to-90%" : "hover:bg-slate-100/50 dark:hover:bg-slate-800/50"}`}>
						<TableCell className={`absolute -left-2 w-0 font-medium`} style={{ fill: agentColour }}>{player.playerName === guesser ? <AgentIcon className={`aspect-square h-5`}/> : ''}</TableCell>
						<TableCell className="w-24 font-medium">{player.playerName}</TableCell>
						<TableCell className="w-24 font-extrabold">{player.score}</TableCell>
						<TableCell className="w-24">{player.correctGuesses}</TableCell>
						<TableCell className="w-24">{player.goodHints}</TableCell>
						<TableCell className="w-24">{player.badHints}</TableCell>
						</TableRow>)
					})
				}
				
			</TableBody>
		</Table>;
		
		return table;
	}


	const cards = [

		{
			title: "Hint Selection",

			phase: 
				<p>
					<span>{`Come up with a one-word hint to help `}</span>
					<span className="font-bold">{roomDetails?.guesser}</span>
					<span>{` guess their callsign.`}</span>
				</p>,

			content:

				<SubmitHint 
					enterHintState={[enterHint, setEnterHint]} 
					roomDetails={roomDetails} 
					hintState={[hint, setHint]} 
					resultsState={[results, setResults]}
					validateWord={validateWord}
					stemmerWord={stemmerWord}
					singularizeWord={singularizeWord}
					currentIndex={currentIndex}
					setTimeLimitReached={setTimeLimitReached}
					setStartFade={setStartFade}
				/>
				
		},
		{
			title: "Hint Elimination",

			phase: 
				<p>
					<span>{`Decide which hints are too similar or illegal. Hints with `}</span>
					<span className="font-bold">{Math.ceil((isVoted?.length - 1) / 2)}</span>
					<span>{` or more votes will be eliminated.`}</span>
				</p>,

			content: 

				<SelectHint 
					resultsState={[results, setResults]} 
					votedState={[voted, setVoted]}
					submissions={submissions}
					roomDetails={roomDetails} 
					isVoted={isVoted}
					currentIndex={currentIndex}
					setTimeLimitReached={setTimeLimitReached}
					setStartFade={setStartFade}
					scoresState={[scores, setScores]}
					hintArrayState={[hintArray, setHintArray]}
				/>

		},
		{
			title: "Hint Transmission",
			
			phase: 
				<p>
					<span>{`Reveal all approved hints to `}</span>
					<span className="font-bold">{roomDetails?.guesser}</span>
					.
				</p>,		

			content: 
			
				<RevealHint 
					resultsState={[results, setResults]} 
					roomDetails={roomDetails} 
					guessState={[guess, setGuess]}
					submittedState={[submitted, setSubmitted]}
					validateState={[validate, setValidate]}
					validateWord={validateWord}
					stemmerWord={stemmerWord}
					singularizeWord={singularizeWord} 
					currentIndex={currentIndex}
					setTimeLimitReached={setTimeLimitReached}
					setStartFade={setStartFade}
					correctGuessState={[correctGuess, setCorrectGuess]}
					numGuessesState={[remainingGuesses, setRemainingGuesses]}
					scoresState={[scores, setScores]}
					readyNextRoundState={[readyNextRound, setReadyNextRound]}
					menuScoreState={[menuScore, setMenuScore]}
					sortedScoresState={[sortedScores, setSortedScores]}
					generateScoreTable={generateScoreTable}
					encryptedCallsign={encryptedCallsign}
					currentRound={currentRound}
					isLastRoundState={[isLastRound, setIsLastRound]}
					showEndGameState={[showEndGame, setShowEndGame]}
					revealCallsignState={[revealCallsign, setRevealCallsign]}
					prepRevCallsignState={[prepRevCallsign, setPrepRevCallsign]}
					showScoreState={[showScore, setShowScore]}
					tempScoresState={[tempScores, setTempScores]}
				/>

		}
	];

	return (

		<>

			{roomDetails && (

				<div className="relative h-screen w-screen flex flex-col flex-none items-center justify-center overflow-hidden bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%">

					<div className="absolute top-[4%] left-[3%] w-full h-full">

						<div className="flex flex-none flex-row flex-wrap items-center gap-1 w-[13%] h-[2%] overflow-hidden">

							<p className="leading-none text-xs text-slate-400 font-medium mr-1">Round:</p>

							{currentRound <= 10 && (

								<>

									{Array.from({ length: currentRound }, (_, index) => {

										return (
	
											<div key={index} className="aspect-square h-2 rounded-full bg-green-500" />
	
										)
	
									})}
	
									{roomDetails.numRounds < 11 && Array.from({ length: roomDetails.numRounds - currentRound }, (_, index) => {
	
										return (
	
											<div key={index} className="aspect-square h-2 rounded-full bg-green-900/90" />
	
										)
	
									})}


								</>

							) || (

								<p className="leading-none text-xs text-slate-400 font-medium">{currentRound}</p>

							)}

						</div>

					</div>

					<div className="absolute left-[2%] z-[50]">
						<Slider currentIndex={currentIndex} numCards={cards.length-1} cards={cards} />
					</div>

					<div className="flex justify-end ml-auto absolute right-0 top-6 mr-10 gap-4">

						{/* <div className="text-white mt-1 mr-2">
						Score: {
						menuScore && (scores.map(player => player.playerName == playerName ? player.score : ""))
						}
						</div> */}

						{roomDetails.keepScore && (

							<div className="mr-1">
								<Popover>
									<PopoverTrigger asChild>
									<div className="">
										<div className="relative">
											<Button className="justify-right px-3 py-2 font-mono aspect-square mb-1" variant="outline">Score: {scores.map(player => player.playerName === playerName ? player.score : "")}</Button>
										</div>
									</div>
									</PopoverTrigger>
									<PopoverContent className="w-fit h-fit mr-[9.25rem]">
										<div className="text-black mt-1 mr-2">
											{generateScoreTable('black', 'black')}
										</div>
									</PopoverContent>
								</Popover>
							</div>
							
						)}
							
						<div>
							<Popover open={chatExpanded} onOpenChange={setChatExpanded}>
								<PopoverTrigger asChild>
									<div className="">
										<div className="relative">
											<Button className="p-0 aspect-square mb-1" variant="outline"><MessageSquare size={14} /></Button>
											<div className={`absolute -top-1 -right-1 aspect-square w-2.5 rounded-full bg-cyan-500 transition-all duration-500 ${newMessage ? "" : "invisible opacity-5"}`} />
										</div>
									</div>
								</PopoverTrigger>

								<PopoverContent className="w-96 h-[80vh] mr-[5.5rem] p-4">

									<div className="w-full h-[96%]">

										<Chat username={playerName} roomName={roomDetails.roomName} roomID={roomID} />

									</div>

									<h4 className="text-[10px] text-center mt-2">The Stranded Agent will not be able to see these messages.</h4>

								</PopoverContent>

							</Popover>
						</div>

						<div>
							<GameMenu roomDetails={roomDetails} isClosedRoomState={[isClosedRoom, setIsClosedRoom]} sessionUrl={sessionUrl} />
						</div>
						
					</div>

					<div className="absolute top-[4%] flex flex-row gap-8">

						<div className="flex flex-col items-center">
							<Label className="text-xs text-slate-300">Callsign</Label>
							<div className="flex mt-1 py-1 px-4 w-48 justify-center rounded-md bg-amber-400 hover:bg-amber-400/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								
								{playerName !== guesser && (

									<p className={`text-sm text-center`}>{callsign}</p>

								) || revealCallsign[1] && (

									<p className={`text-sm text-center transition-opacity ease-in-out duration-500 ${revealCallsign[2] ? "" : "opacity-0"}`}>{callsign}</p>

								) || (

									<HiddenIcon className={`aspect-square w-5 transition-opacity ease-in-out duration-500 ${revealCallsign[0] ? "opacity-0" : ""}`} />
									// <p className="text-sm text-center">?</p>

								)}
								
							</div>
						</div>

						<div className="flex flex-col items-center">
							<Label className="text-xs text-slate-300">Stranded Agent</Label>
							<div className="flex mt-1 py-1 px-4 w-48 justify-center rounded-md bg-green-500 hover:bg-green-500/80 text-slate-900 dark:bg-slate-950 transition-colors ease-in-out duration-300">
								<p className="text-sm text-center">

									{guesser.length > 20 && (

										`${guesser.substring(0, 20)}...`

									) || (

										guesser

									)}

								</p>
							</div>
						</div>

					</div>

					<div>

						<div className={`
							pointer-events-none absolute z-40 mt-[5vh] h-[75vh] w-[65vw] rounded-3xl border border-solid transition-[box-shadow,_border-color] ease-in-out ${
								(!enterHint || submitted) 
									? "shadow-[inset_0rem_0rem_2rem_0.1rem_#12873b] border-green-800 duration-1000" 
									: fadeBorder 
										? "border-stone-800 duration-1000"
										: !validate 
											? (showError 
												? "border-red-500 shadow-[inset_0rem_0rem_2rem_0.1rem_#991b1b] duration-300" 
												: (startFade || timeLimitReached) 
													? "border-stone-800 duration-300" 
													: "shadow-[inset_0rem_0rem_2rem_0.1rem_#7d7669] border-stone-500 duration-1000"
											) : showEndGame 
												? "shadow-[inset_0rem_0rem_2rem_0.1rem_#f59e0b] border-amber-500 duration-3000"
												: isLastRound
													? "border-stone-800 duration-1000"
													: correctGuess
														? "shadow-[inset_0rem_0rem_2rem_0.1rem_#f59e0b] border-amber-500 duration-3000"
														: "shadow-[inset_0rem_0rem_2rem_0.1rem_#991b1b] border-red-500 duration-3000"
							}
						`} />
						
						<CardStack 
							cards={cards} 
							currentIndex={currentIndex} 
							handleNext={handleNext}
							timeLimitReached={timeLimitReached}
							showErrorState={[showError, setShowError]}
							startFade={startFade}
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
