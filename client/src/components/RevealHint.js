import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from "../components/ui/input";
import Timer from './Timer';
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X, Check, Ellipsis } from "lucide-react";

const RevealHint = ({ resultsState, roomDetails, handleNext, currentIndexState, guessState, guessCorrectState, validateWord, stemmerWord, singularizeWord, currentIndex, setTimeLimitReached, setStartFade, correctGuessState, numGuessesState }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();
    const [readyNextRound, setReadyNextRound] = useState([])
    const currentIndex = currentIndexState;
    const [results, setResults] = resultsState;
    const [guess, setGuess] = guessState;
    // const [correctGuess, setCorrectGuess] = correctGuessState;
    const [correctGuess, setCorrectGuess] = guessCorrectState;
    const [remainingGuesses, setRemainingGuesses] = numGuessesState;
    const [submitted, setSubmitted] = useState(false);
    const [validate, setValidate] = useState(false);
    const [submissionText1, setSubmissionText1] = useState(false);
    const [submissionText2, setSubmissionText2] = useState(false);
    const [submissionText3, setSubmissionText3] = useState(false);
    const [submissionText4, setSubmissionText4] = useState(false);
    const [submissionText5, setSubmissionText5] = useState(false);

    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);
    const scoreBtnRef = useRef();
    const nextRoundBtnRef = useRef();

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

            guessInputRef.current.classList.add("border-green-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#22c55e]");
            guessValidationRef.current.classList.add("text-green-600");
            guessValidationRef.current.innerText = "% You got the callsign!";

            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#22c55e]");

            }, 500);

            // socket.emit("submitGuess", roomDetails.roomID, playerName, checkGuess, true);

            socket.emit("sendValidGuess", roomDetails.roomID, true);

        } else if (singularizeWord(stemmedGuess) !== singularizeWord(stemmerWord(cleanedCallSign))) {

            guessInputRef.current.classList.add("border-red-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_red]");
            guessValidationRef.current.classList.add("text-red-500");

            if (remainingGuesses > 1) {

                guessValidationRef.current.innerText = "% ERROR: Incorrect credentials, please try again.";

            } else {

                guessValidationRef.current.innerText = "% ABORT: Unable to authenticate. Session terminated.";

            }
            
            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_red]");

            }, 500);

            if (remainingGuesses !== 11) {

                setRemainingGuesses(prev => prev - 1);

                // socket.emit("submitGuess", roomDetails.roomID, playerName, checkGuess, false);

                socket.emit("sendValidGuess", roomDetails.roomID, false);

            }

        } else {

            guessInputRef.current.classList.add("border-slate-400");

        }
    }
    // next steps, implement so all users can see the toggle
    // right now only the guesser can see the toggled buttons
    // make toggle only for that player
    const readyToggle = (e, playerObj) => {
        e.preventDefault();
        setReadyNextRound(prevState => {
            if (Array.isArray(prevState)) {
                return prevState.map(player => 
                    player.playerName === playerObj.playerName ? {...player, readyNext: !player.readyNext, } : player
                )
            } else {
                return prevState;
            }
        });
    };

    // setup ready state for next round
    useEffect(() => {
        const readyForNextRound = [];
        inGame.forEach(player => readyForNextRound.push({
            readyNext: true,
            playerName: player
        }));
        setReadyNextRound(readyForNextRound);
    }, [inGame])


    // render normal page whenever you visit the RevealHint card each round
    useEffect(() => {
        if(currentIndex == 2) {
            setSubmitted(false);
            setValidate(false);
            setSubmissionText1(false);
            setSubmissionText2(false);
            setSubmissionText3(false);
            setSubmissionText4(false);
            setSubmissionText5(false);
        }
    }, [currentIndex])


    useEffect(() => {
        if(submitted === true) {
            setTimeout(() => setSubmissionText1(true), 2500);
            setTimeout(() => setSubmissionText2(true), 3500);
            setTimeout(() => setSubmissionText3(true), 4500);
            setTimeout(() => setSubmissionText4(true), 5500);
            setTimeout(() => {
                setValidate(true);
                setSubmitted(false);
            }, 8500);
        }
        
    }, [submitted])

    // render live guess to all users
    useEffect(() => {

        // receive the broadcast signal
        const handleReceiveGuess = (guess) => {

            setGuess(guess);

        }

        socket.on("receiveGuess", handleReceiveGuess);

        return () => {

            // cleanup function
            socket.removeAllListeners("receiveGuess");

        }

    }, [socket, setGuess])


    // guesser submission for all users
    useEffect(() => {
        const handleReceiveSubmitGuess = (result) => {
            // console.log('user guessed something')
            setCorrectGuess(result);
            setSubmitted(true);
        }

        socket.on("receiveSubmitGuess", handleReceiveSubmitGuess); 

        return () => {
            socket.off("receiveSubmitGuess", handleReceiveSubmitGuess);
        }
    }, [socket, setCorrectGuess])


    return (

        <div className="flex flex-none w-full h-full justify-center items-center">







            {/* <div className={`flex flex-col items-center w-full relative py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg`}> */}

            <div className={`flex flex-col items-center w-full relative py-12 px-24 ${(submitted || validate) ? 'bg-transparent' : 'bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100'} border border-solid border-slate-400 rounded-lg`}>

            
    



                {submitted && (
                    <div className='h-full flex flex-none flex-col text-green-600 font-mono text-base transition-all ease-in-out duration-500 w-full'>
                        { submissionText1 && (
                            <>
                                <p>{`% Encrypting CALLSIGN...`}</p>
                                <p>{`% [REDACTED]`}</p>
                                <p>{`% [REDACTED]`}</p>
                            </>
                        )}
                        { submissionText2 && (
                            <>
                                <p>{`% Signalling friendly agents: ${selectedPlayers}`}</p>
                                <p>{`% [REDACTED]`}</p>
                                <p>{`% [REDACTED]`}</p>
                            </>
                        )}
                        { submissionText3 && (
                            <>
                                <p>{`% Encrypting callsign: ${guess}`}</p>
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
                    <div className='h-full flex flex-none flex-col font-mono text-xs transition-all ease-in-out duration-500 w-full text-center'>
                        <p className={`text-7xl validate ${correctGuess ? 'text-green-600' : 'text-red-600'}`}>{`${correctGuess ? 'VALID CALLSIGN' : 'INVALID CALLSIGN'}`}</p>
                        <div className={`text-center mt-20 flex gap-4 mx-auto`}>
                            <Button ref={scoreBtnRef} 
                            variant="outline" 
                            className={`transition-all ease-in-out duration-500`}>
                                Scores
                            </Button>
                            <Button ref={nextRoundBtnRef} 
                            variant="outline" 
                            className={`transition-all ease-in-out duration-500`}
                            onClick={handleNext}
                            >
                                Next Round
                            </Button>
                            
                        </div>
                        <div className='flex flex-row flex-none flex-wrap mt-6 justify-center w-full px-24 gap-4'>
                        {console.log("readyNextRound: ", readyNextRound)};
                        {readyNextRound.map((playerObj, index) => {
                            console.log("This is playerObj.readyNext ", playerObj.readyNext);
                            console.log("This is playerObj.readyNext flipped ", !playerObj.readyNext);

                                return (
                                    <Button
                                        key={index}
                                        className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                        variant={`${playerObj.readyNext ? "green" : "grey"}`}
                                        onClick={e => readyToggle(e, playerObj)}
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
                        </div>
                        
                    </div>
                 )}

                {!submitted && !validate && (













                    <>

                        {roomDetails.timeLimit !== 0 && currentIndex === 2 && (

                            <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={2} />

                        )}
                        
                        <Label className="mb-12 text-lg leading-none">Your hints have been revealed!</Label>

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

                                    ) || remainingGuesses === roomDetails.numGuesses && remainingGuesses === 1 && (

                                        <><span className="font-bold">{guesser}</span> has just 1 chance to figure out their callsign:</>

                                    ) || remainingGuesses > 1 && (

                                        <><span className="font-bold">{guesser}</span> has {remainingGuesses} chances remaining to figure out their callsign:</>

                                    ) || remainingGuesses === 1 && (

                                        <><span className="font-bold">{guesser}</span> has 1 last chance to figure out their callsign:</>

                                    ) || remainingGuesses <= 0 && (

                                        <><span className="font-bold">{guesser}</span> was unable to authenticate with HQ.</>

                                    )}
                                    
                                </h1>

                                <p className={`text-3xl font-light font-mono mt-10 mb-4 ${correctGuess ? "text-green-600" : "text-slate-800"}`}>
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

                                        ) || remainingGuesses === roomDetails.numGuesses && remainingGuesses === 1 && (

                                            <>You have just 1 chance to figure out your callsign!</>

                                        ) || remainingGuesses > 1 && (

                                            <>You have {remainingGuesses} chances remaining to figure out your callsign!</>

                                        ) || remainingGuesses === 1 && (

                                            <>Last chance to figure out your callsign!</>

                                        ) || remainingGuesses <= 0 && (

                                            <>You were unable to authenticate with HQ.</>
            
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
                                            type="button"
                                            onClick={checkGuess} 
                                            // ref={guessInputRef} 
                                        >    
                                            Authenticate
                                        </Button>
                                        
                                    </div>

                                    <p className="mt-8 mb-1 text-sm leading-none font-mono h-4" ref={guessValidationRef}></p>

                                </form>
                            
                            </div>

                        )}

                    </>

                )}

            </div>
            
        </div>
    );
}

export default RevealHint;