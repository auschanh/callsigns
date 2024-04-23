import React, { useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from "../components/ui/input";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X } from "lucide-react";

const RevealHint = ({ resultsState, roomDetails, guessState, validateWord, stemmerWord, singularizeWord }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting]] = useGameInfoContext();
    const [results, setResults] = resultsState;
    const [guess, setGuess] = guessState;
    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);

    const handleChange =  (e) => {
        e.preventDefault();
        const newGuess = e.target.value;
        setGuess(newGuess);
        // setCorrectGuess(false);
        socket.emit("sendGuess", roomDetails.roomID, playerName, newGuess);
    };

    const checkGuess = (e) => {
        e.preventDefault();        
        const checkGuess = guess.toLowerCase().trim(); // cleanup the user input
        const cleanedCallSign = callsign.toLowerCase().trim()
        const stemmedGuess = stemmerWord(checkGuess);

        if(stemmedGuess === ""){ // no guess
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-red-500");
            guessValidationRef.current.innerText = "Please enter a guess";
        }

        else if(validateWord(stemmedGuess)){ // not a single word
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-red-500");
            guessValidationRef.current.innerText = "Your guess cannot contain spaces, numbers or special characters"
        }
        
        else if(singularizeWord(stemmedGuess) === singularizeWord(stemmerWord(cleanedCallSign))) {
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-green-500");
            guessValidationRef.current.innerText = "You got the callsign!"
        }

        else if(singularizeWord(stemmedGuess) !== singularizeWord(stemmerWord(cleanedCallSign))) {
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-red-500");
            guessValidationRef.current.innerText = "Your guess was incorrect..."
        }
        
        else {
            guessInputRef.current.classList.remove("border-2");
            guessInputRef.current.classList.remove("border-red-500");
            guessInputRef.current.classList.add("border-slate-400");
            guessValidationRef.current.innerText = "";
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
            <div className="flex flex-col items-center w-full py-12 px-24 bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 rounded-lg">
                    <Label className="mb-12 text-lg leading-none">Your hints have been revealed!</Label>
                <div className="flex flex-row flex-wrap justify-center gap-4">
                    <TooltipProvider>                      

                        {results.map((result, index) => {

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
                                    
                                    
                                    ) || (

                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button className="flex p-2 w-full max-w-sm justify-center" variant="red">
                                                    <X size={16} />                                                        
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{result.hint}</p>
                                            </TooltipContent>
                                        </Tooltip>

                                    )}

                                </div>

                            );

                        })}

                    </TooltipProvider>
                </div>

                <h1 className="text-lg text-center font-medium leading-none mt-16">
                    {playerName === roomDetails.guesser 
                    ? "Now its up to you to guess the Callsign:" 
                    : "Now it's up to the stranded agent to figure out their callsign:"}
                    
                </h1>
                <div className="pt-16 items-center justify-center flex flex-col gap-2">

                    <div className={`${guess ?  `block` : 'invisible'} text-4xl mb-4 text-green-600`}>
                        {!guess ? 'callsign' : guess}
                    </div>

                    <Label htmlFor="guess">Guess the word</Label>
                    <div className='flex gap-2'>
                        { playerName === roomDetails.guesser && 
                        (
                        <>
                            <Input
                                id="guess"
                                tabIndex="0"
                                value={guess}
                                placeholder="guess"
                                onChange={handleChange}
                            />
                            <Button variant="green" htmlFor="guess" tabIndex="0" onClick={checkGuess} ref={guessInputRef}>    
                                Guess
                            </Button>
                        </>
                        )}
                       
                    </div>
                    {playerName === roomDetails.guesser && 
                        <p className="mt-4 text-xs h-2 text-red-500" ref={guessValidationRef}></p>
                       }
                </div>
            </div>
        </div>
    );
}

export default RevealHint;