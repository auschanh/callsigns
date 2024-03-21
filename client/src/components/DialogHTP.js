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
import { Check, X, Trash2 } from "lucide-react";

function DialogHTP({ tailwindStyles, variant, triggerName, isPlayOpen }) {

    const [open, setOpen] = useState(false);

    const username = undefined;

    const mysteryWord = "coffee";

    const [currentSlide, setCurrentSlide] = useState(0);

    // Gap in rem between individual carousel slides
    const spaceBetweenSlides = 5;

    const [example, setExample] = useState(["macchiato", false]);

    const hintInputRef = useRef(null);

    const hintValidationRef = useRef(null);

    const [playOpen, setPlayOpen] = isPlayOpen;

    const submissions = [

        {

            playerName: username || "Dave",
            hint: example[0]

        }, {

            playerName: "Amanda",
            hint: "warm"

        }, {

            playerName: "Stephanie",
            hint: "warm"

        }, {

            playerName: "Frank",
            hint: "coffee"

        }

    ];

    const [results, setResults] = useState(

        submissions.map((submission, index) => {

            return index === 0 ? {...submission, toRemove: false, beenRemoved: false, visible: true} : {...submission, toRemove: true, beenRemoved: false, visible: false};

        })

    );

    const [voted, setVoted] = useState(false);

    const handleChange = (event) => {

        setExample([event.target.value, example[1]]);

    }

    const handleSubmit = (event) => {

        event.preventDefault();

        if (example[1]) {

            return;

        }

        if (example[0] === mysteryWord) {

            hintInputRef.current.classList.add("border-2");
            hintInputRef.current.classList.remove("border-slate-200");
            hintInputRef.current.classList.add("border-red-500");
            hintValidationRef.current.innerText = "Your hint cannot be the mystery word!"
            
        } else {

            hintInputRef.current.classList.remove("border-2");
            hintInputRef.current.classList.remove("border-red-500");
            hintInputRef.current.classList.add("border-slate-200");
            hintValidationRef.current.innerText = "";
            
            setExample([example[0], true]);

            setResults(
    
                results.map((result, index) => {
    
                    return index === 0 ? {...result, hint: example[0]} : result;
    
                })
    
            );
    
            console.log(example);

        }
    }

    const changeToRed = (playerName) => {

        setResults(

            results.map((result) => {

                return result.playerName === playerName ? {...result, toRemove: !result.toRemove} : result;

            })
        );

    }

    const handleRemove = () => {

        if (voted) {

            return;

        }

        console.log(results);

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

        console.log(results);

        setResults(

            results.map((result, index) => {

                return index === 0 ? {...result, toRemove: false, beenRemoved: false, visible: true} : {...result, toRemove: false, beenRemoved: false};

            })

        );

        setVoted(false);

    }

    const rules = [{

        content: 
            <div className="flex flex-col w-full items-center mt-32">
                <Label>Mystery Word</Label>
                <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                    <p>{mysteryWord}</p>
                </div>
            </div>,

        footer: 
            <div className="text-center">
                A new mystery word is generated each round.
            </div>

    }, {

        content:
            <div className="flex flex-col w-full items-center mt-[150px]">
                <div className="flex p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                    <p>Alex is the guesser</p>
                </div>
            </div>,

        footer: 
            <div className="text-center">
                Each round will have a new guesser who will not know what the mystery word is.
            </div>

    }, {

        content:
            <div className="mt-14">
                <div className="flex flex-col items-center mb-10">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-8">

                    <form name="exampleForm" onSubmit={handleSubmit} className="flex flex-col items-center w-full">

                        <Label htmlFor="example" className="mb-2">Enter a one-word hint:</Label>

                        <div className="flex flex-row w-full justify-center items-end">

                            <Input
                                className="flex h-10 w-64"
                                type="text" 
                                id="example"
                                name="hint" 
                                value={example[0]}
                                onChange={handleChange}
                                disabled={example[1] ? true : false}
                                ref={hintInputRef}
                            />

                            <Button className="ml-2 w-24" variant={example[1] ? "green" : "default"} type="submit">

                                {example[1] && (

                                    <>
                                        Submitted
                                    </>

                                ) || (

                                    <>
                                        Submit
                                    </>

                                )}

                            </Button>

                        </div>

                        <p className="mt-2 text-xs text-red-500" ref={hintValidationRef}/>

                    </form>

                </div>
            </div>,

        footer:
            <div className="text-center">
                Players must submit just one word to help the guesser determine what the mystery word is.
            </div>

    }, {

        content:
            <div className="w-full">

                <div className="flex flex-col items-center mb-8">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-6">

                    <Label className="mb-4 text-lg">Select the hints that are too similar or illegal:</Label>

                    <div className="flex flex-row w-[95%] justify-center gap-4">

                        {results.map((result, index) => {

                            return (

                                <div key={index} className="flex flex-col w-36 items-center">
                                    <Label className="text-sm">{result.playerName}</Label>
                                    <Button 
                                        onClick={voted ? () => {} : () => changeToRed(result.playerName)} 
                                        variant={!result.toRemove ? "grey" : voted ? "red" : "amber"} 
                                        className={`flex mt-2 p-2 w-full max-w-sm justify-center ${result.beenRemoved ? "line-through" : ""}`} 
                                        disabled={voted ? true : false}
                                    >
                                        {result.hint}
                                    </Button>
                                </div>

                            );

                        })}

                    </div>

                </div>

                <div className="flex flex-row justify-center gap-2">
                    <Button onClick={handleRemove} variant={voted ? "green" : "red"} className="flex flex-row w-44">

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
                    <Button onClick={handleCancel} variant="default" className="flex flex-row w-44">
                        <X size={16} className="mr-2" />
                        Cancel Selection
                    </Button>
                </div>

            </div>,

        footer: 
            <div className="flex flex-col text-center">
                <p>
                    Once all players have submitted their one-word hints, they must then determine if any of their hints are too similar to one another or to the mystery word itself.
                </p>
            </div>

    }, {

        content:
            // defaultValue={["item-1", "item-2"]}
            <Accordion className="flex flex-none flex-col mx-12" type="single" collapsible>
                <AccordionItem className="w-full border-slate-400" value="item-1">
                    <AccordionTrigger>Good hints are usually:</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc ml-4">
                            <li>Not too closely related to the mystery word because other players might have the same idea</li>
                            <li>Not too obscure unless you're sure the guesser can figure it out</li>
                            <li>References that the guesser can pick up on</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem className="w-full border-slate-400" value="item-2">
                    <AccordionTrigger>Hints cannot:</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc ml-4">
                            <li>Be an alternate spelling of the mystery word</li>
                            <li>Be in a different language than the mystery word</li>
                            <li>Be a different word that sounds the same as the mystery word</li>
                            <li>Contain any part of the mystery word</li>
                            <li>Contain any special characters, including hyphens</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>,

        footer:
            <div className="text-center">
                Check out these tips if you need any help coming up with good hints.
                Hints that are either too similar to one another or illegal will not be revealed to the guesser.
            </div>

    }, {

        content:
            <div className="w-full">

                <div className="flex flex-col items-center mb-8">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">{mysteryWord}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-6">

                    <Label className="mb-4 text-lg">Your hints have been revealed!</Label>

                    <div className="flex flex-row w-[95%] justify-center gap-4">

                        <TooltipProvider>                      

                            {results.map((result, index) => {

                                return (

                                    <div key={index} className="flex flex-col w-36 items-center">
                                        <Label className="text-sm">{result.playerName}</Label>

                                        {result.visible && (
                                        
                                            <Button 
                                                variant="greenNoHover" 
                                                className="flex mt-2 p-2 w-full max-w-sm justify-center" 
                                            >
                                                {result.hint}

                                            </Button>
                                        
                                        
                                        ) || (

                                            <Tooltip>
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

                <h1 className="mb-4 text-lg text-center font-medium">Now it's up to the guesser to find the mystery word...</h1>

            </div>,

        footer: 
            <div className="text-center">
                Finally, all of the approved hints will be revealed to the guesser who must then use only these hints to successfully guess the mystery word.
            </div>

    }];

    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className={tailwindStyles} variant={variant}>How To Play</Button>
            </DialogTrigger>
            <DialogContent className="flex flex-col h-[80vh] w-[60vw] p-10 justify-between">
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

                            return (

                                <Card key={index} className="flex-none flex-col w-full h-full bg-slate-200 border-slate-400 overflow-auto" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                    <div className="grid grid-flow-row  grid-rows-12 h-full">
                                        <CardContent className="row-span-8 justify-center mt-8">
                                            {card.content}
                                        </CardContent>
                                        <CardFooter className="flex flex-col row-span-4 mb-12 h-fit mt-8 mx-8">
                                            {card.footer}
                                        </CardFooter>
                                    </div>
                                </Card>

                            )

                        })}
                    
                    </Carousel>

                </div>

                <DialogFooter>

                    <div onClick={() => {setOpen(false); setPlayOpen(true);}}>

                        <DialogPlay triggerName={"Let's Play!"} isOpen={[playOpen, setPlayOpen]} />

                    </div>

                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}

export default DialogHTP;