import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import Carousel from '../components/Carousel';

import { Button } from "../components/ui/button";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

const Home = function(props) {

    const location = useLocation();

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

                <Dialog>
                    <DialogTrigger>
                        <Button variant="secondary">How To Play</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>How To Play</DialogTitle>
                        <DialogDescription>
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
                            word. */}
                            <Carousel className="overflow-hidden relative">

                                <div className="w-96 h-96 bg-slate-50"></div>
                                <div className="w-96 h-96 bg-slate-100"></div>
                                <div className="w-96 h-96 bg-slate-200"></div>
                                <div className="w-96 h-96 bg-slate-300"></div>
                                <div className="w-96 h-96 bg-slate-400"></div>

                                {/* <Card>
                                    <CardHeader>
                                        <CardTitle>Card 1</CardTitle>
                                        <CardDescription>Card Description</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Card Content</p>
                                    </CardContent>
                                    <CardFooter>
                                        <p>Card Footer</p>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card 2</CardTitle>
                                        <CardDescription>Card Description</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Card Content</p>
                                    </CardContent>
                                    <CardFooter>
                                        <p>Card Footer</p>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card 3</CardTitle>
                                        <CardDescription>Card Description</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Card Content</p>
                                    </CardContent>
                                    <CardFooter>
                                        <p>Card Footer</p>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card 4</CardTitle>
                                        <CardDescription>Card Description</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Card Content</p>
                                    </CardContent>
                                    <CardFooter>
                                        <p>Card Footer</p>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Card 5</CardTitle>
                                        <CardDescription>Card Description</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p>Card Content</p>
                                    </CardContent>
                                    <CardFooter>
                                        <p>Card Footer</p>
                                    </CardFooter>
                                </Card> */}

                            </Carousel>
                        </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>

            </div>

        </div>
        
    );
}

export default Home;