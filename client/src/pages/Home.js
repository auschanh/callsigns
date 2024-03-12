import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';

import { Button } from "../components/ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "../components/ui/dialog";

const Home = function(props) {

    const location = useLocation();

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">


                <Dialog>
                    <DialogTrigger>Open</DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>





                {/* <Link to="game">

                    <Button>Play</Button>

                </Link>

                <Link to="howToPlay">

                    <Button>How To Play</Button>

                </Link> */}

            </div>

        </div>
        
    );
}

export default Home;