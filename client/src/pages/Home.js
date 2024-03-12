import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';

import { Button } from "../components/ui/button";

const Home = function(props) {

    const location = useLocation();

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

                <Link to="game">

                    <Button>Play</Button>

                </Link>

                <Link to="howToPlay">

                    <Button>How To Play</Button>

                </Link>

            </div>

        </div>
        
    );
}

export default Home;