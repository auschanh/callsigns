import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from "./ui/progress";
import Timer from './Timer';
import { useSocketContext } from "../contexts/SocketContext";
import { useGameInfoContext } from "../contexts/GameInfoContext";
import { Check, Ellipsis } from "lucide-react";

const SubmitHint = ({ enterHintState, roomDetails, hintState, submissionsState, validateWord, stemmerWord, singularizeWord, currentIndex, setTimeLimitReached, setStartFade }) => {

    const [socket, setSocket] = useSocketContext();

    const hintInputRef = useRef(null);

    const hintValidationRef = useRef(null);

    const [playerName, callsign, generatedWords, [selectedPlayers, setSelectedPlayers], [inGame, setInGame], [isPlayerWaiting, setIsPlayerWaiting], [isGameStarted, setIsGameStarted], [guesser, setGuesser]] = useGameInfoContext();

    const [enterHint, setEnterHint] = enterHintState;

    const [hint, setHint] = hintState;

    const [submissions, setSubmissions] = submissionsState;

    const [intro1, setIntro1] = useState(false);

	const [intro2, setIntro2] = useState(false);
	
	const [intro3, setIntro3] = useState(false);

	const [intro4, setIntro4] = useState(false);

	const [intro5, setIntro5] = useState(false);

	const [intro6, setIntro6] = useState(false);

    const [isUndo, setIsUndo] = useState(false);

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

		hintInputRef.current?.focus();

	}, [hint]);

	const handleChange = (event) => {

        setHint([event.target.value, hint[1]]);

    }

	const handleSubmit = async (event) => {

        const checkHint = hint[0].toLowerCase().trim(); // clean up user's input
        const cleanedCallSign = callsign.toLowerCase().trim()
        const stemmedHint = stemmerWord(checkHint);
        event.preventDefault();

        if (hint[1]) {

            return;

        }

        if (hint[0] === "") {

			hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Please enter a hint"

        } else if (singularizeWord(stemmedHint) === singularizeWord(stemmerWord(cleanedCallSign))) {

         hintInputRef.current.classList.add("border-2");
         hintInputRef.current.classList.remove("border-slate-400");
         hintInputRef.current.classList.add("border-red-500");
         hintValidationRef.current.innerText = "Your hint cannot be the callsign!"

		} else if (checkHint.includes(cleanedCallSign)) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot contain the callsign!"
            
       	} else if (validateWord(stemmedHint)) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot contain spaces, numbers or special characters!"
            
       	} else {

            hintInputRef.current.classList.remove("border-2");
            hintInputRef.current.classList.remove("border-red-500");
            hintInputRef.current.classList.add("border-slate-400");
            hintValidationRef.current.innerText = "";

			console.log(hint[0]);
            
            setHint([hint[0], true]);

            try {

                await socket.emit("submitHint", roomDetails.roomID, playerName, hint[0]);
    
            } catch (error) {
    
                throw error;
    
            }
        }
    }

    const handleUndoSubmit = async () => {

        setHint(["", false]);

        try {

            await socket.emit("submitHint", roomDetails.roomID, playerName, "");

        } catch (error) {

            throw error;

        }

    }

    return (

        <>

            <div className={`h-full flex flex-none flex-col text-green-600 font-mono text-xs transition-all ease-in-out duration-500 ${enterHint ? "invisible opacity-5" : "w-full"}`}>

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
                                {playerName === guesser && (

                                    <p>{`% Receiving connection request ...`}</p>

                                ) || (

                                    <p>{`% Connecting to remote terminal: ${roomDetails.guesser} ...`}</p>

                                )}
                                
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

            <div className={`h-full transition-all ease-in-out duration-500 ${enterHint ? "w-full " : "invisible opacity-5"}`}>

                {enterHint && (

                    <div className="flex flex-col flex-none items-center justify-center w-full h-full gap-12">

                        <div className="w-full relative bg-gradient-to-tr from-slate-100 via-slate-300 to-slate-100 border border-solid border-slate-400 py-12 px-24 rounded-lg text-black">

                            {roomDetails.timeLimit !== 0 && currentIndex === 0 && (

                                <Timer timeLimit={roomDetails.timeLimit} setTimeLimitReached={setTimeLimitReached} setStartFade={setStartFade} slideIndex={0} />

                            )}

                            {playerName === guesser && (

                                <div className="mb-8">
                                    <p className="mb-6 text-center">{submissions.filter(vote => vote.hint).length} {submissions.filter(vote => vote.hint).length === 1 ? "Agent has" : "Agents have"} submitted a hint.</p>

                                    <Progress 
                                        value={
                                            ((submissions.filter((vote) => { return vote.hint && playerName === guesser })).length 
                                            / (submissions.length - 1)) * 100
                                        }
                                        max={100}
                                    />

                                </div>
                            
                            ) || (

                                /* render hint component if not guesser */
                                <form
                                    name="exampleForm"
                                    onSubmit={handleSubmit}
                                    className="flex flex-col items-center w-full font-sans pt-2"
                                >

                                    <Label htmlFor="example" className="mb-3">Enter your one-word hint:</Label>

                                    <div className="flex flex-row w-full justify-center items-end">

                                        <Input
                                            autoComplete="off"
                                            className="flex h-10 max-w-64 border border-solid border-slate-400"
                                            type="text" 
                                            id="example"
                                            name="hint" 
                                            value={hint[0]}
                                            onChange={handleChange}
                                            disabled={hint[1]}
                                            ref={hintInputRef}
                                        />

                                        <Button 
                                            className={`ml-2 w-24 ${hint[1] ? "hover:bg-slate-500" : ""}`}
                                            variant={hint[1] ? "green" : "default"} 
                                            type="button"
                                            onClick={hint[1] ? (isUndo ? handleUndoSubmit : (() => {})) : handleSubmit}
                                            onMouseEnter={() => {setIsUndo(true)}}
                                            onMouseLeave={() => {setIsUndo(false)}}
                                        >
                                            {hint[1] ? (isUndo ? "Undo" : "Submitted") : "Submit"}
                                        </Button>

                                    </div>

                                    <p className="mt-4 text-xs h-2 text-red-500" ref={hintValidationRef}></p>

                                </form>

                            )}

                            <div className="flex flex-row flex-none flex-wrap justify-center w-full mt-6 px-24 gap-4">

                                {submissions?.map((submission, index) => {

                                    if (submission.playerName === playerName && playerName !== guesser) {

                                        return (

                                            <Button
                                                key={index}
                                                className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                                variant={`${submission.hint !== "" ? "green" : "grey"}`}
                                            >

                                                <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">

                                                    {submission.hint !== "" && (

                                                        <Check className="text-slate-900" size={14} />

                                                    ) || (

                                                        <Ellipsis className="text-slate-900" size={14} />

                                                    )}

                                                </div>

                                                <p className="text-xs">{submission.playerName}</p>
                                                
                                            </Button>

                                        );

                                    }

                                })}

                                {submissions?.map((submission, index) => {

                                    if (submission.playerName !== playerName && submission.playerName !== guesser) {

                                        return (

                                            <Button
                                                key={index}
                                                className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                                variant={`${submission.hint !== "" ? "green" : "grey"}`}
                                            >
        
                                                <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
        
                                                    {submission.hint !== "" && (
        
                                                        <Check className="text-slate-900" size={14} />
        
                                                    ) || (
        
                                                        <Ellipsis className="text-slate-900" size={14} />
        
                                                    )}
        
                                                </div>
        
                                                <p className="text-xs">{submission.playerName}</p>
                                                
                                            </Button>
        
                                        );

                                    }

                                })}

                                {Array.from({ length: roomDetails.prevAiPlayers }, (_, index) => {

                                    return (

                                        <Button
                                            key={index}
                                            className="flex px-3 py-2 h-10 rounded-lg items-center cursor-auto"
                                            variant="green"
                                        >
                                            <div className="flex aspect-square h-full bg-white rounded-full items-center justify-center mr-3">
                                                <Check className="text-slate-900" size={14} />
                                            </div>
                                            <p className="text-xs">Bot {index + 1}</p>
                                        </Button>

                                    );

                                })}

                            </div>

                        </div>
                        
                    </div>
                        
                )}

            </div>

        </>

    );

}

export default SubmitHint;