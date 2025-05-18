import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import Timer from './Timer';
import AgentIndicator from './AgentIndicator';
import { toast } from "sonner";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { useLobbyContext } from "../contexts/LobbyContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X, Check, Ellipsis } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";
import { ReactComponent as WinnerIcon } from "../assets/noun-crown-6589105.svg";


const RevealHint = ({ resultsState, roomDetails, guessState, submittedState, validateState, validateWord, stemmerWord, singularizeWord, currentIndex, setTimeLimitReached, setStartFade, correctGuessState, numGuessesState, scoresState, readyNextRoundState, menuScoreState, sortedScoresState, generateScoreTable, encryptedCallsign, currentRound, isLastRoundState, showEndGameState, revealCallsignState, prepRevCallsignState, showScoreState, tempScoresState, isDisconnectedGuesser, isDisconnectedTeam, notEnoughPlayers }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser], [nextGuesser, setNextGuesser]] = useGameInfoContext();
    const [[inLobby, setInLobby], regPlayerCount] = useLobbyContext();
    const [readyNextRound, setReadyNextRound] = readyNextRoundState;
    const [results, setResults] = resultsState;
    const [guess, setGuess] = guessState;
    const [correctGuess, setCorrectGuess] = correctGuessState;
    const [remainingGuesses, setRemainingGuesses] = numGuessesState;
    const [submitted, setSubmitted] = submittedState;
    const [validate, setValidate] = validateState;
    const [submissionText1, setSubmissionText1] = useState(false);
    const [submissionText2, setSubmissionText2] = useState(false);
    const [submissionText3, setSubmissionText3] = useState(false);
    const [submissionText4, setSubmissionText4] = useState(false);
    const [submissionText5, setSubmissionText5] = useState(false);
    const [showReadyState, setShowReadyState] = useState(false);
    const [showScore, setShowScore] = showScoreState;
    const [scores, setScores] = scoresState;
    const [sortedScores, setSortedScores] = sortedScoresState;
    const [tempScores, setTempScores] = tempScoresState;
    const [menuScore, setMenuScore] = menuScoreState;
    const [isLastRound, setIsLastRound] = isLastRoundState;
    const [showEndGame, setShowEndGame] = showEndGameState;
    const [revealCallsign, setRevealCallsign] = revealCallsignState;
    const [prepRevCallsign, setPrepRevCallsign] = prepRevCallsignState;
    const [winner, setWinner] = useState([]);

    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);
    const scoreBtnRef = useRef(null);
    const nextRoundBtnRef = useRef(null);

    const navigate = useNavigate();

    const updateGuesserScore = () => {

        setScores(tempScores);

        const sorted = [...tempScores].sort((a,b) => b.score - a.score);

		setSortedScores(sorted);

    }

    useEffect(() => {

        // receive the broadcast signal
        socket.on("receiveGuess", (guess) => {

            // render live guess to all users
            setGuess(guess);

        });

        // cleanup function
        return () => {

            socket.removeAllListeners("receiveGuess");

        }

    }, [socket]);

    useEffect(() => {

        if (submitted === true) {

            setTimeout(() => setSubmissionText1(true), 500);

            setTimeout(() => setSubmissionText2(true), 1000);

            setTimeout(() => setSubmissionText3(true), 2000);

            setTimeout(() => setSubmissionText4(true), 3000);

            setTimeout(() => {

                setValidate(true);
                
                setTimeout(() => {

                    setSubmitted(false);

                    if (correctGuess) {

                        setTimeout(() => {

                            updateGuesserScore();

                        }, 1500);

                    }

                }, 1000);

            }, 6000);
        }

        return () => {

            setSubmissionText1(false);
            setSubmissionText2(false);
            setSubmissionText3(false);
            setSubmissionText4(false);

        }
        
    }, [submitted]);

    useEffect(() => {

        if (prepRevCallsign === true && (submitted === false && validate === true)) {

            setPrepRevCallsign(false);

            if (currentRound !== 11 && currentRound === roomDetails.numRounds) {

                setTimeout(() => {

                    setIsLastRound(true);

                    if (playerName === guesser) {

                        setRevealCallsign([true, false, false]);

                        setTimeout(() => {

                            setRevealCallsign([true, true, false]);

                            setTimeout(() => {

                                setRevealCallsign([true, true, true]);
                    
                            }, 500);
                
                        }, 500);

                    }
    
                }, 3000);

            } else {

                setTimeout(() => {

                    setShowReadyState(true);

                    if (!isDisconnectedGuesser && (playerName === guesser)) {

                        setRevealCallsign([true, false, false]);

                        setTimeout(() => {

                            setRevealCallsign([true, true, false]);

                            setTimeout(() => {

                                setRevealCallsign([true, true, true]);
                    
                            }, 500);
                
                        }, 500);            

                    }
    
                }, 2000);

            }

        }

        return () => {

            setIsLastRound(false);
            setShowReadyState(false);
            // setRevealCallsign([false, false, false]);

        }

    }, [submitted, validate, currentRound, playerName, guesser, prepRevCallsign]);

    // triggers when last slide of last round happens
    useEffect(() => {
        if(isLastRound && validate && !submitted) {
            let topScore = sortedScores[0]["score"];
            let winners = [];

            sortedScores.map(player => {
                if (player && player.score === topScore) {
                    winners.push(player.playerName)
                }
            })
            setWinner(winners);
        }

        return () => {

            setWinner([]);

        }

    }, [isLastRound])


    useEffect(() => {

        if (isLastRound) {

            setTimeout(() => {

                setShowEndGame(true);

            }, 2000);

        }

        return () => {

            setTimeout(() => {

                setShowEndGame(false);

            }, 2000);

        }

    }, [isLastRound]);

    useEffect(() => {

        if (correctGuess === false) {

            setTimeout(() => {

                setCorrectGuess(undefined);

            }, 500);

        }

    }, [correctGuess]);

    const handleChange =  (e) => {
        e.preventDefault();
        const newGuess = e.target.value;
        setGuess(newGuess);
        socket.emit("sendGuess", roomDetails.roomID, newGuess); // send live input of guesser to socket server
    };

    // when guesser submits guess
    // only guesser can see this
    const checkGuess = (e) => {

        e.preventDefault();   

        const checkGuess = guess.toLowerCase().trim(); // cleanup the user input
        const cleanedCallSign = callsign.toLowerCase().trim()
        const stemmedGuess = stemmerWord(checkGuess);

        guessInputRef.current.classList.remove("border-2");
        guessInputRef.current.classList.remove("border-slate-400");
        guessInputRef.current.classList.remove("border-amber-500");
        guessInputRef.current.classList.remove("border-red-500");
        guessValidationRef.current.classList.remove("text-red-500");
        guessInputRef.current.classList.remove("border-green-500");
        guessValidationRef.current.classList.remove("text-green-600");

        guessValidationRef.current.innerText = "";

        guessInputRef.current.classList.add("border-2");

        if (stemmedGuess === "") { // no guess

            guessInputRef.current.classList.add("border-amber-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#ffb300]");
            guessValidationRef.current.classList.add("text-red-500");
            guessValidationRef.current.innerText = "% INVALID: No data received.";

            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#ffb300]");

            }, 500);

        } else if (validateWord(stemmedGuess)) { // not a single word

            guessInputRef.current.classList.add("border-amber-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#ffb300]");
            guessValidationRef.current.classList.add("text-red-500");
            guessValidationRef.current.innerText = "% INVALID: Your guess cannot contain spaces, numbers, or special characters.";

            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#ffb300]");

            }, 500);

        } else if (singularizeWord(stemmedGuess) === singularizeWord(stemmerWord(cleanedCallSign))) {

            // guessInputRef.current.classList.add("border-green-500");
            // guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#22c55e]");
            // guessValidationRef.current.classList.add("text-green-600");
            // guessValidationRef.current.innerText = "% You got the callsign!";

            // setTimeout(() => {

            //     guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#22c55e]");

            // }, 500);

            socket.emit("submitGuess", roomDetails.roomID, true);
            socket.emit("updateScore", roomDetails.roomID, playerName);

        } else if (singularizeWord(stemmedGuess) !== singularizeWord(stemmerWord(cleanedCallSign))) {

            if (remainingGuesses > 1) {

                guessInputRef.current.classList.add("border-red-500");
                guessInputRef.current.classList.add("shadow-[0_0_20px_5px_red]");
                guessValidationRef.current.classList.add("text-red-500");
                guessValidationRef.current.innerText = "% ERROR: Incorrect credentials, please try again.";

                setTimeout(() => {

                    guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_red]");
    
                }, 500);

            } else {

                // guessValidationRef.current.innerText = "% ABORT: Unable to authenticate. Session terminated.";

                guessInputRef.current.classList.add("border-slate-400");

            }

            socket.emit("submitGuess", roomDetails.roomID, false);
            
        } else {

            guessInputRef.current.classList.add("border-slate-400");

        }
    }

    const toggleReady = () => {

        const readyState = readyNextRound.map((player) => {

            return (
            
                player.playerName === playerName ? 

                    ({

                        ...player,
                        readyNext: !player.readyNext

                    })
                    
                : player
            );

        });

        (async () => {

            try {

                await socket.emit("sendToggle", roomDetails.roomID, readyState);

            } catch (error) {

                throw error;

            }

        })();

    }

    const handleReturnLobby = async () => {

        try {

            await socket.emit("returnToLobby", roomDetails.roomID, playerName);

            toast.dismiss();

            if (playerName === roomDetails.host) {

                navigate(`/newhost/${roomDetails.roomID}`);
    
            } else {
    
                navigate(`/lobby/${roomDetails.roomID}`);
    
            }


        } catch (error) {

            throw error;

        }

    }

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className={`h-full flex flex-none flex-col justify-center items-center w-full`}>
    
                {submitted && (

                    <div className={`h-full flex flex-none flex-col text-green-600 font-mono text-xs transition-all ease-in-out duration-500 w-full ${validate ? "invisible opacity-5" : ""}`}>

                        { submissionText1 && (
                            <>
                                <p>{`% Begin encryption...`}</p>
                                <p>{`% [REDACTED]`}</p>
                                <p>{`% [REDACTED]`}</p>
                            </>
                        )}
                        { submissionText2 && (
                            <>
                                <p>{`% Signalling friendly agents:${inLobby.map(({playerName}) => playerName).filter((player) => selectedPlayers.includes(player)).map((player) => { return ` ${player}`})}`}</p>
                                <p>{`% [REDACTED]`}</p>
                                <p>{`% [REDACTED]`}</p>
                            </>
                        )}
                        { submissionText3 && (
                            <>
                                <p>{`% ...`}</p>
                                <p>{`% ...`}</p>
                                <p>{`% ...`}</p>
                                <p>{`% Encrypting callsign: ${guess ? guess : "[NULL]"}`}</p>
                                <p>{`% Transmitting: ${encryptedCallsign}`}</p>
                            </>
                        )}
                        { submissionText4 && (
                            <>
                                <p id="countdown">{`% AUTHENTICATING...`}</p>
                            </>
                        )}
                        {/* { submissionText5 && (
                            <>
                                <p className='text-4xl'>{`${correctGuess ? 'VALID CALLSIGN' : 'INVALID CALLSIGN'}`}</p>
                            </>
                        )} */}

                    </div>

                )}

                {!submitted && validate && (
                    
                    <div className={`h-[40vh] px-20 flex flex-none flex-col justify-center text-xs w-full text-center gap-16 validate`}>
                        
                        <div className="space-y-16">

                            <div
                                className={`font-mono transition-opacity ${showEndGame ? "" : isLastRound ? "opacity-0" : ""}`}
                                style={{ transitionDuration: "2000ms", animationDuration: "2000ms" }}
                            >

                                <h2 className={`text-lg mb-2 text-center ${isDisconnectedGuesser ? 'text-red-900' : showEndGame ? 'text-amber-400/50' : correctGuess ? 'text-green-900' : 'text-red-900'}`}>

                                    {`${isDisconnectedTeam ? '% CONNECTION TERMINATED %' : isDisconnectedGuesser ? '% CONNECTION TERMINATED %' : showEndGame ? '% REPORT BACK TO HQ %' : correctGuess ? '% CALLSIGN ACCEPTED %' : '% FATAL SYSTEM ERROR %'}`}

                                </h2>

                                <h1 className={`text-6xl text-center ${isDisconnectedGuesser ? 'text-red-700' : showEndGame ? 'text-amber-400' : correctGuess ? 'text-green-600' : 'text-red-700'}`}>
                                    
                                    {`${isDisconnectedTeam ? 'TEAM DISCONNECTED' : isDisconnectedGuesser ? 'AGENT DISCONNECTED' : showEndGame ? 'END OF MISSION' : correctGuess ? 'AUTHENTICATION COMPLETE' : 'FAILED TO AUTHENTICATE'}`}
                                    
                                </h1>

                                {/* Change Menu State to reflect scores */}
                                {/* {setMenuScore(true)} */}

                            </div>

                            <div 
                                className={`flex flex-none flex-col w-full h-36 transition-opacity ease-in-out ${isLastRound ? (showEndGame ? "" : "opacity-0") : (showReadyState ? "" : "opacity-0") }`}
                                style={{ transitionDuration: "2000ms", animationDuration: "2000ms" }}
                            >

                                <div className='flex flex-row flex-none flex-wrap justify-center w-full gap-4 mb-8'>

                                    {/* SELECT NEXT GUESSER FROM END ROUND SCREEN */}
                                    

                                    {readyNextRound?.map((playerObj, index) => {

                                        if (playerObj.playerName === roomDetails.guesser && inGame.length >= 3) {

                                            return (

                                                <TooltipProvider key={index}>
                                                    <Tooltip delayDuration={0}>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                className={`flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer ${playerObj.readyNext ? "" : winner.includes(playerObj.playerName) ? "bg-gradient-to-tr from-amber-700 from-30% via-amber-400 via-75% to-amber-600 to-100%" : ""}`}
                                                                variant={`${playerObj.readyNext ? "green" : "grey"}`}
                                                                // onClick={e => readyToggle(e, playerObj)}
                                                            >
                                                                <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                                    { (winner.includes(playerObj.playerName) && !playerObj.readyNext) && (
                                                                        <WinnerIcon className="aspect-square h-[0.9rem] fill-amber-500" /> 
                                                                    ) || (
                                                                        <AgentIcon className="aspect-square h-5" /> 
                                                                    )}
                                                                </div>

                                                                <p className="text-xs">{playerObj.playerName}</p>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent sideOffset={12}>

                                                            {playerObj.playerName === playerName && (

                                                                <p>
                                                                    <span className="font-semibold">You</span>
                                                                    {` are the next Stranded Agent!`}
                                                                </p>

                                                            ) || (
                                                            
                                                                <p>
                                                                    <span className="font-semibold">{playerObj.playerName}</span>
                                                                    {` is the next Stranded Agent!`}
                                                                </p>
                                                            
                                                            )}
                                                            
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            )

                                        } else {

                                            return (
                                                
                                                <Button
                                                    key={index}
                                                    className={`flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer ${playerObj.readyNext ? "" : winner.includes(playerObj.playerName) ? "bg-gradient-to-tr from-amber-700 from-30% via-amber-400 via-75% to-amber-600 to-100%" : ""}`}
                                                    variant={`${playerObj.readyNext ? "green" : "grey"}`}
                                                    // onClick={e => readyToggle(e, playerObj)}
                                                >
                                                    <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                        {playerObj.readyNext && (
                                                            <Check className="text-slate-900" size={14} />
                                                        ) || winner.includes(playerObj.playerName) && (
                                                            <WinnerIcon className="aspect-square h-[0.9rem] fill-amber-500" />
                                                        ) || (
                                                            // <Ellipsis className="text-slate-900" size={14} />
                                                            <p className="text-slate-900 text-xs font-semibold">{playerObj.playerName.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase()}</p>

                                                        )}
                                                    </div>
                                                    <p className="text-xs">{playerObj.playerName}</p>
                                                </Button>

                                            )

                                        }

                                    })}

                                    {/* {Array.from({ length: roomDetails.aiPlayers }, (_, index) => {

                                        return (

                                            <Button
                                                key={index}
                                                className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
                                                variant="green"
                                            >
                                                <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                    <Check className="text-slate-900" size={14} />
                                                </div>
                                                <p className="text-xs">{`Bot ${index + 1}`}</p>
                                            </Button>
                                        )

                                    })} */}

                                </div>

                                <div className={`text-center flex flex-col mx-auto gap-4`}>

                                    <div className="h-4">

                                        {notEnoughPlayers && (
                                            
                                            <h4 className="text-red-500 text-xs">Minimum 3 players to continue</h4>

                                        )}

                                    </div>

                                    <div className="flex gap-6">

                                        {roomDetails.keepScore && (

                                            <Dialog open={showScore} onOpenChange={setShowScore}>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        ref={scoreBtnRef} 
                                                        variant="indigo" 
                                                        className={`w-36`}
                                                        onClick={() => {setShowScore(prev => !prev)}}
                                                    >
                                                        View Scores
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent hideClose={true} className={`flex flex-col h-fit w-[32vw] left-[34vw] border-none bg-black`} style={{marginTop: `calc(25vh - ${(inGame.length - 3) * 27}px)` }}>

                                                    <div className="flex flex-col items-center w-full h-full">

                                                        <div className="flex flex-col w-full h-full px-12 py-8 items-center rounded-lg border shadow-[0rem_0rem_2rem_0.1rem_#4f46e5] border-indigo-600">

                                                            <div className="w-full mb-4">
                                                                <h1 className="text-slate-100 text-xl text-left mb-1">Score Table</h1>
                                                                <div className="w-full bg-indigo-600 h-[0.25rem]"/>
                                                            </div>

                                                            <div>
                                                                
                                                                {generateScoreTable('white', '#94a3b8')}

                                                            </div>

                                                            <div className="w-full h-[1px] bg-[#e5e7eb]" />

                                                            <div className='mt-8 left-0'>
                                                                <Button 
                                                                    ref={scoreBtnRef} 
                                                                    variant="black" 
                                                                    className={`w-36`}
                                                                    onClick={() => {setShowScore(prev => !prev)}}
                                                                >
                                                                    Close
                                                                </Button>
                                                            </div>

                                                        </div>
                                                            
                                                    </div>

                                                </DialogContent>

                                            </Dialog>

                                        )}

                                        <Button 
                                            ref={nextRoundBtnRef} 
                                            variant={`${ notEnoughPlayers ? "red" : readyNextRound.find((player) => { return (player.playerName === playerName) })?.readyNext ? "grey" : "green" }`}
                                            // className={`w-36 transition-all ease-in-out duration-200`}
                                            className={`w-36`}
                                            // onClick={handleNext}
                                            // onClick={showEndGame ? handleReturnLobby : toggleReady}
                                            onClick={notEnoughPlayers ? handleReturnLobby : toggleReady}
                                        >
                                            {`${ notEnoughPlayers ? "Return to Lobby" : readyNextRound.find((player) => { return (player.playerName === playerName) })?.readyNext ? "Ready!" : showEndGame ? "Play Again" : "Ready Up" }`}
                                        </Button>

                                    </div>
                                
                                </div>

                            </div>
                            
                        </div>

                    </div>

                )}

                {!submitted && !validate && (

                    <div className="flex flex-none flex-col w-full relative items-center py-16 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                        {playerName === guesser && (

                            <AgentIndicator />

                        )}

                        {roomDetails.timeLimit !== 0 && currentIndex === 2 && (

                            <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={2} />

                        )}
                        
                        <Label className="mb-12 text-lg leading-none text-center">Your hints have been revealed!</Label>

                        <div className={`flex flex-row flex-wrap justify-center gap-4 ${results.length < 6 ? "w-full" : "sm:w-[80%] 2xl:w-[60%]" }`}>

                            <TooltipProvider>                    

                                {results.some((result) => { return result.hint !== "" }) && (
                                
                                    results.map((result, index) => {

                                        if (result.playerName !== guesser && result.hint !== "") {

                                            return (

                                                <div key={index} className="flex flex-col min-w-36 items-center gap-2">
                                                    <Label className="text-sm">{result.playerName}</Label>
                
                                                    {result.visible && (
                                                    
                                                        <Button 
                                                            variant="green" 
                                                            className="flex p-2 w-full max-w-sm justify-center" 
                                                        >
                                                            {result.hint}
                
                                                        </Button>
                                                    
                                                    ) || playerName !== guesser && (
                
                                                        <Tooltip delayDuration={0}>

                                                            <TooltipTrigger asChild>
                                                                <Button className="flex p-2 w-full max-w-sm justify-center" variant="red">
                                                                    <X size={16} />                                                        
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{result.hint}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                
                                                    ) || (

                                                        <Button className="flex p-2 w-full max-w-sm justify-center" variant="red">
                                                            <X size={16} />                                                        
                                                        </Button>

                                                    )}
                
                                                </div>
                
                                            );

                                        }

                                    })

                                ) || (

                                    <h1 className="mt-6 text-lg text-center font-mono text-red-600">
                                        ERROR: No valid hints were transmitted in time!
                                    </h1>

                                )}

                            </TooltipProvider>

                        </div>

                        {playerName !== guesser && (

                            <>
                                <h1 className="text-lg text-center font-medium leading-none mt-16">

                                    {remainingGuesses === 11 && (

                                        <>Now it's up to <span className="font-bold">{guesser}</span> to figure out their callsign!</>

                                    ) || remainingGuesses === roomDetails.numGuesses && remainingGuesses !== 1 && (

                                        <><span className="font-bold">{guesser}</span> has {remainingGuesses} chances to figure out their callsign:</>

                                    ) || roomDetails.numGuesses === 1 && (

                                        <><span className="font-bold">{guesser}</span> has just 1 chance to figure out their callsign:</>

                                    ) || remainingGuesses > 1 && (

                                        <><span className="font-bold">{guesser}</span> has {remainingGuesses} chances remaining to figure out their callsign:</>

                                    ) || remainingGuesses <= 1 && (

                                        <><span className="font-bold">{guesser}</span> has 1 last chance to figure out their callsign:</>

                                    // ) || remainingGuesses <= 0 && (

                                    //     <><span className="font-bold">{guesser}</span> was unable to authenticate with HQ.</>

                                    )}
                                    
                                </h1>

                                {/* <p className={`text-3xl font-light font-mono mt-10 mb-4 ${correctGuess ? "text-green-600" : "text-slate-800"}`}> */}
                                <p className={`text-3xl font-light font-mono mt-10 mb-4 ${correctGuess === false ? "text-red-500" : "text-slate-800"} transition-colors duration-200`}>
                                    {guess === "" ? '...' : guess.length > 30 ? `${guess.substring(0, 30)}...` : guess}
                                </p>
                            </>

                        ) || (

                            <div className='w-full'>

                                <form
                                    name="submitGuess"
                                    onSubmit={checkGuess}
                                    className="flex flex-col flex-none items-center mt-16 w-full"
                                >

                                    <h1 className="text-lg text-center font-medium leading-none">

                                        {remainingGuesses === 11 && (

                                            <>Now it's up to you to figure out your callsign!</>

                                        ) || remainingGuesses === roomDetails.numGuesses && remainingGuesses !== 1 && (

                                            <>You have {remainingGuesses} chances to figure out your callsign!</>

                                        ) || roomDetails.numGuesses === 1 && (

                                            <>You have just 1 chance to figure out your callsign!</>

                                        ) || remainingGuesses > 1 && (

                                            <>You have {remainingGuesses} chances remaining to figure out your callsign!</>

                                        ) || remainingGuesses <= 1 && (

                                            <>Last chance to figure out your callsign!</>

                                        // ) || remainingGuesses <= 0 && (

                                        //     <>You were unable to authenticate with HQ.</>
            
                                        )}
                                        
                                    </h1>

                                    <div className="flex flex-row justify-center gap-2 w-full mt-8">

                                        <Input
                                            disabled={remainingGuesses < 1}
                                            autoComplete="off"
                                            className="border-slate-400 font-mono placeholder:font-mono placeholder:text-xs w-[35%] transition-all duration-500"
                                            type="text"
                                            id="guess"
                                            name="guess"
                                            tabIndex="0"
                                            value={guess}
                                            placeholder="ENTER CALLSIGN"
                                            onChange={handleChange}
                                            ref={guessInputRef} 
                                        />

                                        <Button 
                                            disabled={remainingGuesses < 1}
                                            htmlFor="guess" 
                                            tabIndex="0" 
                                            className="w-36 font-mono" 
                                            variant="default"
                                            type="submit"
                                        >    
                                            Authenticate
                                        </Button>
                                        
                                    </div>

                                    <p className="mt-8 mb-1 text-sm leading-none font-mono h-4" ref={guessValidationRef}></p>

                                </form>
                            
                            </div>

                        )}

                    </div>

                )}

            </div>
            
        </div>

    );
}

export default RevealHint;