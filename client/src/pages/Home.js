import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const Home = function(props) {

    return (

        <div className="mt-4 ml-4">

            <h1>Just One</h1>

            <Link to="game">

                <Button btnClass="focus:outline-none text-white bg-green-700 hover:bg-green-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" btnID="play-btn" label="Play" />

            </Link>

            <Link to="howToPlay">

                <Button btnClass="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" btnID="htp-btn" label="How To Play" />

            </Link>

        </div>
        
    );
}

export default Home;