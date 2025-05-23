import React, { useEffect, useState, useRef } from 'react';
import Carousel from './Carousel';
import DialogPlay from './DialogPlay';
import { Button } from "./ui/button";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/tooltip";
import { Check, X, Trash2, RotateCcw, User, Trophy } from "lucide-react";
import { ReactComponent as TrophySVG } from "../assets/trophy.svg";
import { ReactComponent as AgentIcon } from "../assets/noun-anonymous-5647770.svg";
import { stemmer } from "stemmer";
import pluralize from "pluralize";

function DialogHTP({ tailwindStyles, isHTPOpen, htpToPlay }) {

    const [open, setOpen] = isHTPOpen;

    const username = undefined;

    const mysteryWord = "Coffee";

    const [currentSlide, setCurrentSlide] = useState(0);

    // Gap in rem between individual carousel slides
    const spaceBetweenSlides = 5;

    const [example, setExample] = useState(["macchiato", false]);

    const [isUndo, setIsUndo] = useState(false);

    const hintInputRef = useRef(null);

    const hintValidationRef = useRef(null);

    const submissions = [

        {

            playerName: username || "You",
            hint: example[0]

        }, {

            playerName: "Stephanie",
            hint: "warm"

        }, {

            playerName: "Frank",
            hint: "warm"

        }, {

            playerName: "Lisa",
            hint: "kaffee"

        }

    ];

    const [results, setResults] = useState(

        submissions.map((submission, index) => {

            return index === 0 ? {...submission, toRemove: false, beenRemoved: false, visible: true} : index === 3 ? {...submission, toRemove: false, beenRemoved: false, visible: false} : {...submission, toRemove: false, beenRemoved: true, visible: false};

        })

    );

    const [voted, setVoted] = useState(false);

    const handleChange = (event) => {

        setExample([event.target.value, example[1]]);

    }

    const [isNoneSelected, setIsNoneSelected] = useState(true);

    useEffect(() => {

        if (results.every(({ toRemove }) => { return toRemove === false })) {

            setIsNoneSelected(true);

        } else {

            setIsNoneSelected(false);

        }

    }, [results]);

    const handleSubmit = (event) => {

        event.preventDefault();

        const checkHint = example[0].toLowerCase().trim(); // clean up user's input
        const cleanedCallSign = mysteryWord.toLowerCase().trim();
        const stemmedHint = stemmerWord(checkHint);

        if (example[1]) {

            return;

        }

        if (example[0] === "") {

			hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Please enter a hint"

        } else if (singularizeWord(stemmedHint) === singularizeWord(stemmerWord(cleanedCallSign))) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot be the callsign"

		} else if (checkHint.includes(cleanedCallSign)) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot contain the callsign"
            
        } else if (validateWord(stemmedHint)) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-400");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot contain spaces, numbers or special characters"
            
        } else {

            hintInputRef.current.classList.remove("border-2");
            hintInputRef.current.classList.add("border-slate-400");
            hintInputRef.current.classList.remove("border-red-500");
            hintValidationRef.current.innerText = "";
            
            setExample([example[0], true]);

            setResults(
    
                results.map((result, index) => {
    
                    return index === 0 ? {...result, hint: example[0]} : result;
    
                })
    
            );
    
            

        }
    }

    const handleUndoSubmit = () => {

        setExample(["", false]);

    }

    const selectToRemove = (playerName) => {

        setResults(

            results.map((result) => {

                return result.playerName === playerName ? {...result, toRemove: !result.toRemove} : result;

            })
        );

    }

    const handleRemove = () => {

        if (voted || isNoneSelected) {

            return;

        }

        

        setResults(

            results.map((result, index) => {

                return !result.toRemove ? result : index === 0 ? {...result, beenRemoved: true, visible: false} : {...result, beenRemoved: true}

            })

        );

        setVoted(true);

    }

    const handleCancel = () => {

        if (!voted) {

            return;

        }

        

        setResults(

            results.map((result, index) => {

                return index === 0 ? {...result, toRemove: false, beenRemoved: false, visible: true} : index === 3 ? {...result, toRemove: false, beenRemoved: false} : result;

            })

        );

        setVoted(false);

        setIsNoneSelected(true);

    }

    const handleClearSelection = () => {

        setResults(

            results.map((result, index) => {

                return index === 1 || index === 2 ? result : {...result, toRemove: false, beenRemoved: false};

            })

        );

        setIsNoneSelected(true);

    }

    const validateWord = (w) => {
		return !/^[a-z]+$/.test(w) // only one word, lowercase and no special chars
	}

	const stemmerWord = (w) => {
		return stemmer(w);
	}

	const singularizeWord = (w) => {
		return pluralize.singular(w);
	}

    const rules = [{

        content: 
            <div className="flex flex-col w-full items-center self-center text-slate-300">
                <Label className="text-base">Callsign</Label>
                <div className="flex mt-1 py-2 px-4 w-72 max-w-sm justify-center rounded-md bg-amber-400 hover:bg-amber-400/80 text-slate-900 text-lg dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950">
                    <p>{mysteryWord}</p>
                </div>
            </div>,

        footer: 
            <div>
                A new callsign is generated each round.
            </div>

    }, {

        content:
            <div className="flex flex-col w-full items-center self-center text-slate-300">
                <Label className="text-base">Stranded Agent</Label>
                <div className="flex mt-1 py-2 px-4 w-72 max-w-sm justify-center rounded-md bg-green-500 hover:bg-green-500/80 text-slate-900 text-lg dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950">
                    <p>Alex</p>
                </div>
            </div>,

        footer: 
            <div>
                Each round will have a new Stranded Agent who will not know what the callsign is.
            </div>

    }, {

        content:
            <div className="flex flex-col w-full items-center mt-6">
                <div className="flex flex-col items-center mb-[10%]">
                    <Label className="text-xs text-slate-300">Callsign</Label>
                    <div className="flex mt-1 py-1 px-4 w-48 justify-center rounded-md bg-amber-400 hover:bg-amber-400/80 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div>

                <div>

                    <form name="exampleForm" onSubmit={handleSubmit} className="flex flex-col items-center w-full">

                        <Label htmlFor="example" className="mb-2 text-slate-200">Enter a one-word hint:</Label>

                        <div className="flex flex-row w-full justify-center items-end">

                            <Input
                                autoComplete="off"
                                className="flex h-10 w-64 ring-offset-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-50 focus-visible:ring-offset-2"
                                type="text" 
                                id="example"
                                name="hint" 
                                value={example[0]}
                                onChange={handleChange}
                                disabled={example[1] ? true : false}
                                ref={hintInputRef}
                            />

                            <Button 
                                className={`ml-2 w-24 ${example[1] ? "hover:bg-red-600" : ""}`}
                                variant={example[1] ? "green" : "dark"} 
                                type="button"
                                onClick={example[1] ? (isUndo ? handleUndoSubmit : (() => {})) : handleSubmit}
                                onMouseEnter={() => {setIsUndo(true)}}
                                onMouseLeave={() => {setIsUndo(false)}}
                            >

                                {example[1] ? (isUndo ? "Undo" : "Submitted") : "Submit"}

                            </Button>

                        </div>

                        <p className="mt-4 text-xs h-2 text-red-500" ref={hintValidationRef}/>

                    </form>

                </div>
            </div>,

        footer:
            <div>
                Players must submit just one word to help the Stranded Agent determine what their callsign is.
            </div>

    }, {

        content:
            <div className="w-full self-center">

                {/* <div className="flex flex-col items-center mb-8">
                    <Label className="text-[0.7rem]">Callsign</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div> */}

                <div className="flex flex-col w-full items-center mb-10">

                    <Label className="mb-8 text-slate-200 text-lg">Select the hints that are too similar or illegal:</Label>

                    <div className="flex flex-row w-[95%] justify-center gap-4">

                        {results.map((result, index) => {

                            return (

                                <div key={index} className="flex flex-col w-36 items-center">
                                    <Label className="text-xs text-slate-300">{result.playerName}</Label>
                                    <Button 
                                        onClick={voted ? () => {} : () => selectToRemove(result.playerName)} 
                                        variant={result.beenRemoved ? "red" : !result.toRemove ? "grey" : voted ? "red" : "amber"} 
                                        className={`flex mt-1 p-2 w-full max-w-sm justify-center ${result.beenRemoved ? "line-through" : ""}`} 
                                        disabled={voted || result.beenRemoved}
                                    >
                                        {result.hint}
                                    </Button>
                                </div>

                            );

                        })}

                    </div>

                </div>

                <div className="flex flex-row justify-center gap-2">

                    <Button 
                        onClick={handleRemove} 
                        variant={voted ? "green" : isNoneSelected ? "disabledRed" : "red"} 
                        className={`flex flex-row w-44 transition-all ease-in-out duration-150 ${ isNoneSelected ? "cursor-not-allowed" : ""}`}
                    >

                        {voted && (

                            <>
                                <Check size={16} className="mr-2" />
                                Vote Recorded
                            </>

                        ) || (

                            <>
                                <Trash2 size={16} className="mr-2" />
                                Vote to Remove
                            </>

                        )}

                    </Button>

                    <Button 
                        onClick={(isNoneSelected && !voted) ? () => {setVoted(true);} : voted ? handleCancel : handleClearSelection} 
                        variant={(isNoneSelected && !voted) ? "green" : voted ? "dark" : "blue"} 
                        className="flex flex-row w-44 transition-all ease-in-out duration-150"
                    >

                        {(isNoneSelected && !voted) && (

                            <>
                                <Check size={16} className="mr-2" />
                                Looks Good!
                            </>

                        ) || voted && (

                            <>
                                <X size={16} className="mr-2" />
                                Cancel Selection
                            </>

                        ) || (

                            <>
                                <RotateCcw size={16} className="mr-2" />
                                Clear Selection
                            </>

                        )}

                    </Button>

                </div>

            </div>,

        footer: 
            <div>
                {/* Once all players have submitted their one-word hints, they must then determine if any of their hints are too similar to one another or to the mystery word itself. */}
                Once all hints are submitted, players must then determine if any of the hints are too similar to one another or to the callsign itself. Identical hints will be removed automatically.
            </div>

    }, {

        content:
            <Accordion className="flex flex-none flex-col mx-12 text-slate-200" type="single" collapsible>
                <AccordionItem className="w-full border-slate-400" value="item-1">
                    <AccordionTrigger>Good hints are usually:</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc ml-4">
                            <li>Not too closely related to the callsign because other members of your team might have the same idea</li>
                            <li>Not too obscure unless you're sure the Stranded Agent can figure it out</li>
                            <li>References that the Stranded Agent can pick up on</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem className="w-full border-slate-400" value="item-2">
                    <AccordionTrigger>Hints cannot:</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc ml-4">
                            <li>Be an alternate spelling of the callsign</li>
                            <li>Be in a different language than the callsign</li>
                            <li>Be a different word that sounds the same as the callsign</li>
                            <li>Contain any part of the callsign</li>
                            <li>Contain any special characters, including hyphens</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>,

        footer:
            <div>
                {/* Check out these tips if you need any help coming up with good hints. */}
                Hints that are either too similar to one another or illegal will not be revealed to the Stranded Agent.
            </div>

    }, {

        content:
            <div className="w-full self-center">

                {/* <div className="flex flex-col items-center mb-8">
                    <Label className="text-[0.7rem]">Callsign</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div> */}

                <div className="flex flex-col w-full items-center mb-10">

                    <Label className="mb-8 text-lg text-slate-200">Your hints have been revealed!</Label>

                    <div className="flex flex-row w-[95%] justify-center gap-4">

                        <TooltipProvider>                      

                            {results.map((result, index) => {

                                return (

                                    <div key={index} className="flex flex-col w-36 items-center">
                                        <Label className="text-xs text-slate-300">{result.playerName}</Label>

                                        {result.visible && (
                                        
                                            <Button 
                                                variant="greenNoHover" 
                                                className="flex mt-2 p-2 w-full max-w-sm justify-center" 
                                            >
                                                {result.hint}

                                            </Button>
                                        
                                        
                                        ) || (

                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <Button className="flex mt-2 p-2 w-full max-w-sm justify-center" variant="redNoHover">
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

                </div>

                <h1 className="text-base text-center font-medium text-slate-200">Now it's up to the Stranded Agent to figure out their callsign...</h1>

            </div>,

        footer: 
            <div>
                Finally, all of the approved hints will be revealed to the Stranded Agent who must then use only these hints to successfully guess their callsign.
            </div>

    }, {
    
        content: 
            <div className="flex flex-row flex-none w-full h-full px-10 py-8 gap-9 text-slate-100 text-sm rounded-2xl bg-gradient-to-tr from-violet-950 from-30% via-purple-900 via-70% to-[#5e2cae] to-100%">
                <div className="h-full flex flex-row flex-none ">
                    {/* <Trophy className="flex flex-col self-top" color="#f1f5f9" size={50} strokeWidth={1} /> */}
                    <TrophySVG className="h-12 fill-slate-50" />
                    <div className="h-full w-[0.1rem] ml-9 bg-slate-50"></div>
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">Scoring</h1>
                    <p className="mt-0 text-sm text-slate-100/70">If your team is keeping score, here's how you can score some points!</p>
                    <div className="mt-8 space-y-8">
                        <div>
                            <div className="flex flex-row flex-none items-center">
                                <div className="flex flex-row flex-none justify-center items-center bg-slate-100 rounded-lg w-8 aspect-square">
                                    <User color="black" size={16}/>
                                </div>
                                <h2 className="italic text-slate-100/80 ml-4">As an agent:</h2>
                            </div>
                            <ul className="list-disc ml-16 text-sm/5">
                                <li><p>You will score 1 point for every submitted hint that does not get eliminated.</p></li>
                            </ul>
                        </div>
                        <div>
                            <div className="flex flex-row flex-none items-center">
                                <div className="flex flex-row flex-none justify-center items-center bg-slate-100 rounded-lg w-8 aspect-square">
                                    <AgentIcon className="w-6 fill-slate-950"/>
                                </div>
                                <h2 className="italic text-slate-100/80 ml-4">As the Stranded Agent:</h2>
                            </div>
                            <ul className="list-disc ml-16 text-sm/5">
                                <li><p>You will score 1 point if you guess your callsign correctly and an additional point for every hint that is either eliminated or not submitted by the other agents.</p></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>,
        footer: ''

    }];

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={tailwindStyles}>How To Play</Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col h-[80vh] top-[10%] w-[60vw] left-[20%] p-10 justify-between">
                <DialogHeader>
                    <DialogTitle>How To Play</DialogTitle>
                    <DialogDescription />
                </DialogHeader>

                {/* <p className="text-teal-500 font-extrabold">Guesser: </p>
                    1. A card is selected with a selection of 5 words <br></br>
                    2. A die is rolled to determine which word is selected
                    <br></br>
                    <br></br>
                    <p className="font-bold">Other Players:</p> 3.Write down a{" "}
                    <span className="font-bold">singular</span> word related to the
                    chosen word for the <p className="text-teal-500">guesser</p> to
                    guess
                    <br></br>
                    4. Reveal the words written down by all players except for the{" "}
                    <p className="text-teal-500">guesser </p>
                    5. Any words that are the same are removed
                    <br></br>
                    <br></br>
                    <p className="text-teal-500 font-extrabold">Guesser: </p>
                    Guesser uses the words given by the other players to guess the
                    word. */
                }

                <div className="max-w-full h-[80%]">

                    <Carousel slideState={[currentSlide, setCurrentSlide]} spaceBetweenSlides={spaceBetweenSlides} handleSubmit={handleSubmit} example={example} handleRemove={handleRemove}>

                        {rules.map((card, index) => {

                            return index !== 6 ? (

                                <Card key={index} className="flex-none flex-col w-full h-full border-slate-400 overflow-auto bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                    <div className="grid grid-flow-row grid-rows-12 h-full">
                                        <CardContent className="grid row-span-8 mt-6 py-0">
                                            {card.content}
                                        </CardContent>
                                        <CardFooter className="flex flex-col bg-slate-50 h-[55%] rounded-lg border border-slate-400 row-span-4 mt-4 mx-12 px-8 py-0 justify-center text-center">
                                        {/* <CardFooter className="flex flex-col bg-slate-50 h-[55%] rounded-lg border border-slate-400 row-span-4 mt-4 mx-12 px-8 py-0 items-start justify-center"> */}
                                            {card.footer}
                                        </CardFooter>
                                    </div>
                                </Card>

                            ) : (

                                <Card key={index} className="flex-none flex-col w-full h-full border-slate-400 overflow-auto bg-gradient-to-tr from-slate-950 from-30% via-slate-800 via-75% to-slate-950 to-100%" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                    <div className="h-[80%]">
                                        <CardContent className="h-full mt-6 py-0">
                                            {card.content}
                                        </CardContent>
                                    </div>
                                </Card>

                            )

                        })}
                    
                    </Carousel>

                </div>

                <DialogFooter>

                    <Button variant="default" onClick={htpToPlay}>Let's Play!</Button>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}

export default DialogHTP;