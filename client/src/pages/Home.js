import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../css/tailwindStylesLiterals';
import Button from '../components/Button';

const Home = function(props) {

    const location = useLocation();

    return (

        <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">

            <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">Just One</h1>

            <div className="flex flex-row w-[35vw] justify-evenly">

                <Link to="game">

                    <Button btnClass={styles.greenButton} btnID="play-btn" label="Play" />

                </Link>

                <Link to="howToPlay" state={ { previousLocation: location } } >

                    <Button btnClass={styles.redButton} btnID="htp-btn" label="How To Play" />

                </Link>

            </div>

        </div>
        
    );
}

export default Home;