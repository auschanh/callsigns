import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from "../components/ui/input";
import Timer from './Timer';
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X } from "lucide-react";

const RevealHint = ({ resultsState, roomDetails, guessState, validateWord, stemmerWord, singularizeWord, currentIndex, setTimeLimitReached, setStartFade }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();
    const [results, setResults] = resultsState;
    const [guess, setGuess] = guessState;
    const [remainingGuesses, setRemainingGuesses] = useState(roomDetails.numGuesses);
    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);

    const handleChange =  (e) => {
        e.preventDefault();
        const newGuess = e.target.value;
        setGuess(newGuess);
        // setCorrectGuess(false);
        socket.emit("sendGuess", roomDetails.roomID, playerName, newGuess); // send live input of guesser to socket server
    };

    // when guesser submits guess
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

        } else if(validateWord(stemmedGuess)){ // not a single word

            guessInputRef.current.classList.add("border-amber-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#ffb300]");
            guessValidationRef.current.classList.add("text-red-500");
            guessValidationRef.current.innerText = "% INVALID: Your guess cannot contain spaces, numbers, or special characters.";

            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#ffb300]");

            }, 500);

        } else if(singularizeWord(stemmedGuess) === singularizeWord(stemmerWord(cleanedCallSign))) {

            guessInputRef.current.classList.add("border-green-500");
            guessInputRef.current.classList.add("shadow-[0_0_20px_5px_#22c55e]");
            guessValidationRef.current.classList.add("text-green-600");
            guessValidationRef.current.innerText = "% You got the callsign!";

            setTimeout(() => {

                guessInputRef.current.classList.remove("shadow-[0_0_20px_5px_#22c55e]");

            }, 500);

        } else if(singularizeWord(stemmedGuess) !== singularizeWord(stemmerWord(cleanedCallSign))) {

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

            setRemainingGuesses(prev => prev - 1);

        } else {

            guessInputRef.current.classList.add("border-slate-400");

        }
    }

    // when guess changes, update to render for all users
    useEffect(() => {
        // receive the broadcast signal
        const handleReceiveGuess = (playerName, guess) => {
            setGuess(guess);
        }

        socket.on("receiveGuess", handleReceiveGuess); 

        return () => {
            // cleanup function
            socket.off("receiveGuess", handleReceiveGuess);
        }
    }, [socket, setGuess])

    return (

        <div className="flex flex-none w-full h-full justify-center items-center">

            <div className="flex flex-col items-center w-full relative py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">

                {roomDetails.timeLimit !== 0 && currentIndex === 2 && (

                    <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} />

                )}
                
                <Label className="mb-12 text-lg leading-none">Your hints have been revealed!</Label>

                <div className="flex flex-row flex-wrap justify-center gap-4">

                    <TooltipProvider>                    

                        {results.map((result, index) => {

                            if (result.playerName !== guesser) {

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

                        })}

                    </TooltipProvider>

                </div>

                {playerName !== guesser && (

                    <>
                        <h1 className="text-lg text-center font-medium leading-none mt-16">
                            Now it's up to <span className="font-bold">{guesser}</span> to figure out their callsign:
                        </h1>

                        <p className={`text-3xl text-slate-800 font-light font-mono mt-10 mb-4`}>
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

                                {remainingGuesses === roomDetails.numGuesses && remainingGuesses !== 1 && (

                                    <>You have {remainingGuesses} chances to figure out your callsign!</>

                                ) || remainingGuesses === roomDetails.numGuesses && remainingGuesses === 1 && (

                                    <>You have just 1 chance to figure out your callsign!</>

                                ) || remainingGuesses > 1 && (

                                    <>You have {remainingGuesses} chances remaining to figure out your callsign!</>

                                ) || remainingGuesses <= 1 && (

                                    <>Last chance to figure out your callsign!</>

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

            </div>
            
        </div>
    );
}

export default RevealHint;