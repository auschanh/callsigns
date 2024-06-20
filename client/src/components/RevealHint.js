import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from "../components/ui/input";
import Timer from './Timer';
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X, Check, Ellipsis } from "lucide-react";

const RevealHint = ({ resultsState, roomDetails, guessState, submittedState, validateState, validateWord, stemmerWord, singularizeWord, currentIndex, setTimeLimitReached, setStartFade, correctGuessState, numGuessesState, readyNextRoundState }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();
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

    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);
    const scoreBtnRef = useRef(null);
    const nextRoundBtnRef = useRef(null);

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

                }, 1000);

            }, 6000);
        }
        
    }, [submitted]);

    useEffect(() => {

        if (submitted === false && validate === true) {

            setTimeout(() => {

                setShowReadyState(true);

            }, 2000);

        }

    }, [submitted, validate]);

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

                :

                    player

            );

        });

        socket.emit("sendToggle", roomDetails.roomID, readyState);

    }

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className={`h-full flex flex-none flex-col justify-center items-center w-full transition-all ease-in-out duration-500`}>
    
                {submitted && (

                    <div className={`h-full flex flex-none flex-col text-green-600 font-mono text-xs transition-all ease-in-out duration-500 w-full ${validate ? "invisible opacity-5" : ""}`}>

                        { submissionText1 && (
                            <>
                                <p>{`% Encrypting CALLSIGN...`}</p>
                                <p>{`% [REDACTED]`}</p>
                                <p>{`% [REDACTED]`}</p>
                            </>
                        )}
                        { submissionText2 && (
                            <>
                                <p>{`% Signalling friendly agents:${selectedPlayers.map((player) => { return ` ${player}`})}`}</p>
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
                                <p>{`% Sending 1askjgak124aksgjhjk124asfsaj`}</p>
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

                    <div className='h-[40vh] px-24 flex flex-none flex-col justify-center text-xs transition-all ease-in-out duration-500 w-full text-center gap-16'>

                        <div className={`validate font-mono`}>

                            <h2 className={`text-lg mb-2 ${correctGuess ? 'text-green-900' : 'text-red-900'}`}>

                                {`${correctGuess ? '% CALLSIGN ACCEPTED %' : '% FATAL SYSTEM ERROR %'}`}

                            </h2>

                            <h1 className={`text-6xl ${correctGuess ? 'text-green-600' : 'text-red-700'}`}>
                                
                                {`${correctGuess ? 'AUTHENTICATION COMPLETE' : 'FAILED TO AUTHENTICATE'}`}
                                
                            </h1>
        
                        </div>

                        <div 
                            className={`flex flex-none flex-col gap-16 transition-all ease-in-out ${showReadyState ? "" : "opacity-0" }`}
                            style={{ transitionDuration: "2000ms", animationDuration: "2000ms" }}
                        >

                            <div className='flex flex-row flex-none flex-wrap justify-center w-full px-24 gap-4'>

                                {readyNextRound.map((playerObj, index) => {

                                    return (

                                        <Button
                                            key={index}
                                            className="flex px-3 py-2 h-10 rounded-lg items-center cursor-pointer"
                                            variant={`${playerObj.readyNext ? "green" : "grey"}`}
                                            // onClick={e => readyToggle(e, playerObj)}
                                        >
                                            <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                {playerObj.readyNext && (
                                                    <Check className="text-slate-900" size={14} />
                                                ) || (
                                                    <Ellipsis className="text-slate-900" size={14} />
                                                )}
                                            </div>
                                            <p className="text-xs">{playerObj.playerName}</p>
                                        </Button>

                                    )

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

                            <div className={`text-center flex gap-8 mx-auto`}>

                                {roomDetails.keepScore && (

                                    <Button 
                                        ref={scoreBtnRef} 
                                        variant="indigo" 
                                        // className={`w-36 transition-all ease-in-out duration-200`}
                                        className={`w-36`}
                                    >
                                        View Scores
                                    </Button>

                                )}

                                <Button 
                                    ref={nextRoundBtnRef} 
                                    variant={`${ readyNextRound.find((player) => { return (player.playerName === playerName) })?.readyNext ? "grey" : "green" }`}
                                    // className={`w-36 transition-all ease-in-out duration-200`}
                                    className={`w-36`}
                                    // onClick={handleNext}
                                    onClick={toggleReady}
                                >
                                    {`${ readyNextRound.find((player) => { return (player.playerName === playerName) })?.readyNext ? "Ready" : "Ready Up" }`}
                                </Button>
                                
                            </div>

                        </div>

                    </div>

                )}

                {!submitted && !validate && (

                    <div className="flex flex-none flex-col w-full relative items-center py-16 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                        {roomDetails.timeLimit !== 0 && currentIndex === 2 && (

                            <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={2} />

                        )}
                        
                        <Label className="mb-12 text-lg leading-none text-center">Your hints have been revealed!</Label>

                        <div className="flex flex-row flex-wrap justify-center gap-4">

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
                                    {guess === "" ? '...' : guess}
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