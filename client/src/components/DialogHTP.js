import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import { Button } from "./ui/button";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Check, X, Trash2 } from "lucide-react";

function DialogHTP() {

    // Gap in rem between individual caarousel slides
    const spaceBetweenSlides = 5;

    const [example, setExample] = useState("macchiato");

    const submissions = [

        {

            playerName: "Dave",
            hint: "macchiato"

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

    const [willRemove, setWillRemove] = useState(

        submissions.map((value) => {

            return ({...value, toRemove: false, beenRemoved: false});

        })

    );

    const [voted, setVoted] = useState(false);

    const handleChange = (event) => {

        setExample(event.target.value);

    }

    const handleSubmit = (event) => {

        event.preventDefault();

        console.log(example);

    }

    const changeToRed = (playerName) => {

        setWillRemove(

            willRemove.map((hintObj) => {

                return hintObj.playerName === playerName ? ({...hintObj, toRemove: !hintObj.toRemove}) : hintObj;

            })
        );

    }

    const handleRemove = () => {

        if (voted) {

            return;

        }

        console.log(willRemove);

        setWillRemove(

            willRemove.map((hintObj) => {

                return hintObj.toRemove ? ({...hintObj, beenRemoved: true}) : hintObj;

            })

        );

        setVoted(true);

    }

    const handleCancel = () => {

        console.log(willRemove);

        setWillRemove(

            willRemove.map((hintObj) => {

                return ({

                    ...hintObj, toRemove: false, beenRemoved: false

                });

            })
        );

        setVoted(false);

    }

    const rules = [{

        content: 
            <div className="flex flex-col w-full items-center mt-40">
                <Label>Mystery Word</Label>
                <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                    <p>coffee</p>
                </div>
            </div>,
        footer: "A new mystery word is generated each round."

    }, {

        content:
            <div className="flex flex-col w-full items-center mt-[11.5rem]">
                <div className="flex p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                    <p>Alex is the guesser</p>
                </div>
            </div>,
        footer: "Each round will have a new guesser."

    }, {

        content:
            <div className="mt-24">
                <div className="flex flex-col items-center mb-10">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">coffee</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-8">

                    <form name="exampleForm" onSubmit={handleSubmit} className="flex flex-col items-center">

                        <Label htmlFor="example" className="mb-2">Enter a one-word hint:</Label>

                            <div className="flex flex-row w-96 justify-center items-end">

                                <input
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                                    type="text" 
                                    id="example"
                                    name="username" 
                                    placeholder="Username" 
                                    value={example}
                                    onChange={handleChange}
                                />

                                <Button className="ml-2" type="submit">Submit</Button>

                            </div>

                    </form>
                </div>
            </div>,
        footer:
            <div className="text-center">
                Players must submit just one word to help the guesser determine what the mystery word is.
            </div>

    }, {

        content:
            <div className="w-full mt-6">
                <div className="flex flex-col items-center mb-10">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">coffee</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-10">

                    <Label className="mb-4 text-lg">Select the hints that are too similar or illegal:</Label>

                    <div className="flex flex-row w-[95%] justify-center gap-4">

                        {submissions.map((submission, index) => {

                            return (

                                <div key={index} className="flex flex-col w-36 items-center">
                                    <Label className="text-sm">{submission.playerName}</Label>
                                    <Button onClick={voted ? () => {} : () => changeToRed(submission.playerName)} variant={willRemove[index].toRemove ? "red" : "default"} className={`flex mt-2 p-2 w-full max-w-sm justify-center ${willRemove[index].beenRemoved ? "line-through" : ""}`} disabled={voted ? true : false}>{submission.hint}</Button>
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
                    Hints that are found to be either too similar or illegal will then be removed.
                </p>
            </div>

    }, {

        content: "",
        footer:
            <Accordion className="flex flex-none flex-row w-full" type="single" collapsible>
                <AccordionItem className="w-full" value="item-1">
                    <AccordionTrigger>Hints cannot:</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc ml-4">
                            <li>Be an alternate spelling of the mystery word</li>
                            <li>Be in a different language than the mystery word</li>
                            <li>Be a word that sounds the same</li>
                            <li>Contain any part of the mystery word</li>
                            <li>Contain any hyphens</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

    }, {

        content: "",
        footer:
            <div className="text-center">
                Finally, all of the approved hints will be revealed to the guesser who must then use only these hints to successfully guess the current round's mystery word.
            </div>

    }];

    return (

        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">How To Play</Button>
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

                    <Carousel spaceBetweenSlides={spaceBetweenSlides}>

                        {rules.map((card, index) => {

                            return (

                                <Card key={index} className="flex-none flex-col w-full h-full bg-slate-200 border-slate-400 overflow-auto" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                    <div className="grid grid-flow-row  grid-rows-12 h-full">
                                        <CardContent className="row-span-8 justify-center mt-8">
                                            {card.content}
                                        </CardContent>
                                        <CardFooter className="flex flex-col row-span-4 mb-12 h-fit mt-10 ml-8 mr-8">
                                            {card.footer}
                                        </CardFooter>
                                    </div>
                                </Card>

                            )

                        })}
                    
                    </Carousel>

                </div>

                <DialogFooter>
                    <Link to="game">
                        <Button>Let's Play!</Button>
                    </Link>
                </DialogFooter>

            </DialogContent>

        </Dialog>

    );

}

export default DialogHTP;