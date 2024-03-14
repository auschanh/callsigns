import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import Carousel from '../components/Carousel';
import { Button } from "../components/ui/button";
import { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const Home = function(props) {

    const location = useLocation();

    const spaceBetweenSlides = 5;

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

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

                                {Array.from({ length: 5 }).map((_, index) => {

                                    return (

                                        <Card key={index} className="flex-none w-full h-full bg-slate-200 border-slate-400" style={{ marginRight: `${spaceBetweenSlides}rem` }}>
                                            <CardHeader>
                                                <CardTitle>Card { index + 1 }</CardTitle>
                                                <CardDescription>Card Description</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Card Content</p>
                                            </CardContent>
                                            <CardFooter>
                                                <p>Card Footer</p>
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

            </div>

        </div>
        
    );
}

export default Home;