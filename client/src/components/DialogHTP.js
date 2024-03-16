import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Carousel from './Carousel';
import { Button } from "./ui/button";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { CircleCheck } from "lucide-react";

function DialogHTP() {

    // Gap in rem between individual caarousel slides
    const spaceBetweenSlides = 5;

    const [example, setExample] = useState("macchiato");

    const handleChange = (event) => {

        setExample(event.target.value);

    }

    const handleSubmit = (event) => {

        event.preventDefault();

        console.log(example);

    }

    const rules = [{

        title: undefined,
        description: undefined,
        content: 
            <div className="flex flex-col w-full items-center space-x-2 mb-8">
                <Label>Mystery Word</Label>
                <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                    <p className="flex text-xl text-center">coffee</p>
                </div>
            </div>,
        footer: "A new mystery word is generated each round."

    }, {

        title: undefined,
        description: undefined,
        content:
            <div className="flex h-10 w-full max-w-sm justify-center self-center rounded-md border border-slate-600 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                <p className="flex">Alex is the guesser</p>
            </div>,
        footer: "Each round will have a new guesser."

    }, {

        title: undefined,
        description: undefined,
        content:
            <div>
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
        footer: "Players must submit just one word to help the guesser determine what the mystery word is."

    }, {

        title: undefined,
        description: undefined,
        content:
            <div className="w-full">
                <div className="flex flex-col items-center mb-12">
                    <Label className="text-[0.7rem]">Mystery Word</Label>
                    <div className="flex mt-1 p-1 w-48 justify-center rounded-md border border-slate-600 bg-slate-200 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                        <p className="text-sm text-center">coffee</p>
                    </div>
                </div>

                <div className="flex flex-col w-full items-center mb-1">

                    <Label className="mb-4 text-lg">Here's what you all came up with:</Label>

                    <div className="flex flex-row w-full justify-between">

                        <div className="flex flex-col w-36 items-center mb-8">
                            <Label className="text-sm">Dave</Label>
                            <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                <p className="flex text-xl text-center">macchiato</p>
                            </div>
                        </div>

                        <div className="flex flex-col w-36 items-center mb-8">
                            <Label className="text-sm">Amanda</Label>
                            <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                <p className="flex text-xl text-center">mug</p>
                            </div>
                        </div>

                        <div className="flex flex-col w-36 items-center mb-8">
                            <Label className="text-sm">Stephanie</Label>
                            <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                <p className="flex text-xl text-center">warm</p>
                            </div>
                        </div>

                        <div className="flex flex-col w-36 items-center mb-8">
                            <Label className="text-sm">Frank</Label>
                            <div className="flex mt-2 p-2 w-full max-w-sm justify-center rounded-md border border-slate-600 bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300">
                                <p className="flex text-xl text-center">beans</p>
                            </div>
                        </div>

                    </div>

                </div>

                <Button type="button">Vote to Remove</Button>


            </div>,
        footer: 
            <div className="flex flex-col">
                <p>
                    Once all players have submitted their one-word hints, players must then determine if any of their hints are too similar to one another or to the mystery word itself.
                    Hints that are found to be either too similar or illegal will then be removed.
                </p>

                <Accordion className="mt-4" type="single" collapsible>
                    <AccordionItem value="item-1">
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
            </div>

    }, {

        title: undefined,
        description: undefined,
        content: "",
        footer: "Finally, all of the approved hints will be revealed to the guesser who must then use only these hints to successfully guess the current round's mystery word."

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

                                <Card key={index} className="flex-none w-full h-full bg-slate-200 border-slate-400 overflow-auto" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                    <CardHeader>
                                        <CardTitle>{card.title}</CardTitle>
                                        <CardDescription>{card.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-row justify-center">
                                        {card.content}
                                    </CardContent>
                                    <CardFooter>
                                        {card.footer}
                                    </CardFooter>
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