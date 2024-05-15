import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from "../components/ui/input";
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { X } from "lucide-react";

const RevealHint = ({ resultsState, roomDetails, handleNext, currentIndexState, guessState, guessCorrectState, validateWord, stemmerWord, singularizeWord }) => {

    const [socket, setSocket] = useSocketContext();
    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting]] = useGameInfoContext();
    const currentIndex = currentIndexState;
    const [results, setResults] = resultsState;
    const [guess, setGuess] = guessState;
    const [correctGuess, setCorrectGuess] = guessCorrectState;
    const [submitted, setSubmitted] = useState(false);
    const [validate, setValidate] = useState(false);
    const [submissionText1, setSubmissionText1] = useState(false);
    const [submissionText2, setSubmissionText2] = useState(false);
    const [submissionText3, setSubmissionText3] = useState(false);
    const [submissionText4, setSubmissionText4] = useState(false);
    const [submissionText5, setSubmissionText5] = useState(false);
    // const [countDown, setCountDown] = useState(10);
    const guessInputRef = useRef(null);
    const guessValidationRef = useRef(null);
    const scoreBtnRef = useRef();
    const nextRoundBtnRef = useRef();

    const handleChange =  (e) => {
        e.preventDefault();
        const newGuess = e.target.value;
        setGuess(newGuess);
        // setCorrectGuess(false);
        socket.emit("sendGuess", roomDetails.roomID, playerName, newGuess); // send live input of guesser to socket server
    };

    // when guesser submits guess
    // only guesser can see this
    const checkGuess = (e) => {
        e.preventDefault();        
        const checkGuess = guess.toLowerCase().trim(); // cleanup the user input
        const cleanedCallSign = callsign.toLowerCase().trim()
        const stemmedGuess = stemmerWord(checkGuess);

        // invalid guess
        if(stemmedGuess === ""){ // no guess
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-red-500");
            guessValidationRef.current.innerText = "Please enter a guess";
        }
        // invalid guess
        else if(validateWord(stemmedGuess)){ // not a single word
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-red-500");
            guessValidationRef.current.innerText = "Your guess cannot contain spaces, numbers or special characters"
        }
        
        else if(singularizeWord(stemmedGuess) === singularizeWord(stemmerWord(cleanedCallSign))) {
            socket.emit("submitGuess", roomDetails.roomID, playerName, checkGuess, true);
            guessInputRef.current.classList.add("border-2");
            guessInputRef.current.classList.remove("border-slate-400");
            guessInputRef.current.classList.add("border-green-500");
            guessValidationRef.current.innerText = "You got the callsign!"
        }

        else if(singularizeWord(stemmedGuess) !== singularizeWord(stemmerWord(cleanedCallSign))) {
            socket.emit("submitGuess", roomDetails.roomID, playerName, checkGuess, false);
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


    // useEffect(() => {
    //     if(validate === true) {
    //         setTimeout(() => {
    //             console.log('in validate statement')
    //             scoreBtnRef.current.classList.add('validate');
    //             nextRoundBtnRef.current.classList.add('validate');
    //         }, 2500);
    //     }

    // }, [validate])

    // useEffect(() => {
    //     countDown > 0 && setTimeout(() => setCountDown(countDown - 1), 1000);
    // }, [countDown])


    // render live guess to all users
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
          

            <div className={`flex flex-col items-center w-full py-12 px-24 ${(submitted || validate) ? 'bg-transparent' : 'bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100'} border border-solid border-slate-400 rounded-lg`}>
                  {submitted && (
                    <div className='h-full flex flex-none flex-col text-green-600 font-mono text-xs transition-all ease-in-out duration-500 w-full'>
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
                    </div>
                 )}
                 
                 {!submitted && !validate && (
                    <>
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
                    </>
                 )}
             </div>   
        </div>
    );
}

export default RevealHint;